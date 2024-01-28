import { UsersAdmins } from "../models/UsersAdmins.js"
import { response } from "express"
import bcrypt  from "bcryptjs"
import { generarJWT } from '../helpers/jwt.js'
import { v4 as uuidv4} from "uuid"
import { getTemplateChangePassword, getTemplateConfirm, sendEmail } from "../helpers/mail.js"
import { getTokenData } from "../middlewares/validar-jwt.js"
import dotenv from 'dotenv'
dotenv.config();

export const loginUsuario = async(req, res = response) =>{

    const {email, password} = req.body

    try{ 
        let authUser = await UsersAdmins.findOne({
            where:{
                email: email,
            },
        });

        if ( !authUser ) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario y/o contraseña incorrectos'
            });
        }

        if( authUser.status === 0 ){
            return res.status(400).json({
                ok: false,
                msg: 'No puedes iniciar sesión, favor de hablar con el administrador'
            });
        }

        if( authUser.status === 2 ){
            return res.status(400).json({
                ok: false,
                msg: 'Lo sentimos, debe recuperar sú contraseña para poder iniciar sesión'
            });
        }

        //Confirmar los passwords
        const validPassword = bcrypt.compareSync( password, authUser.password );

        if( !validPassword ){
            return res.status(400).json({
                ok: false,
                msg: 'Usuario y/o contraseña incorrectos'
            });
        }

        // Generar nuestro JWT
        const token = await generarJWT( authUser.id, authUser.complete_name_user, 1);

        res.status(201).json({
            ok: true,
            id: authUser.id,
            user: authUser.email,
            name: authUser.complete_name_user,
            token
        })
        

    } catch (error){
        res.status(500).json({
            ok: false,
            msg: 'Error al iniciar sesión, favor de comunicarte con el administrador.'
        });
    }
};

export const confirmUser = async (req, res = response) => {

    try{
        //Obtener el token

        const { token } = req.params;

        //Verificar la data

        const data = await getTokenData(token, 1);

        if (data === null){
            return res.status(400).json({
                success: false,
                msg: 'Este link expiró, favor de comunicarse con su administrador para generar un nuevo link de confirmación :).'
            });
        }

        const { email, code } = data;

        //Verificar existencia del ususario

        let user = await UsersAdmins.findOne({
            where:{
                email: email
            }
        });

        if (user.status === 1){
            return res.status(400).json({
                success: false,
                msg: 'El link ya ha sido utilizado'
            });
        }

        if (user === null) {
            return res.status(400).json({
                ok:false,
                msg: `Usuario no existe`
            })
        }

        //Verificar el código

        if( code ==! user.code){
            return res.redirect('../../public/error.html');
        }

        //Actualizar usuario
        user.status = '1';
        await user.save();

        // Redireccionar a la confirmación

        return res.redirect(`https://${process.env.HOST}:${process.env.PORTP}/confirm.html`);

    } catch (error){
        console.log(error)
        return res.status(500).json({
            success: false,
            msg: 'Error al confirmar usuario, favor de comunicarte con el administrador.'
        })
    }
};

export const createUser = async (req, res = response, resp = response) => {


    const msg = 'Ingresa al siguiente link para confirmar tu cuenta.'
    const link = 'Confirmar cuenta'

    const {
        email,
        password,
    } = req.body

    try{

        let newUser = await UsersAdmins.findOne({
            where:{
                email: email
            }
        });

        if( newUser && newUser.status != 0 ){
            return res.status(400).json({
                ok:false,
                msg: `Ya existe una cuenta con el correo ingresado.`
            })
        }

        if( newUser && newUser.status === 0 ){

            return res.status(400).json({
                ok:false,
                msg: `Revisa la bandeja de entrada de tu correo para validar tu cuenta.`
            })
        }

        // Generar el código
        const code = uuidv4();
    
        req.body.code = code;

        newUser = new UsersAdmins(req.body);

        //Encriptar contraseña
        const salt = bcrypt.genSaltSync();
        newUser.password = bcrypt.hashSync(password, salt)

       //Generar JWT
        const token = await generarJWT( newUser.id, newUser.complete_name_user, newUser.email, code, 0);
    
        //Obtener un template
        const template = getTemplateConfirm(req.body.complete_name_user, token, msg, link);

        // Enviar el email
        await sendEmail(req.body.email, 'Bienvenido a NotiCASA', template);

        await newUser.save()

        

        res.status(201).json({
            ok: true,
            msg: 'registro exitoso',
            email: newUser.email,
        });
    } catch (error){
        res.status(500).json({
            msg: 'Error al crear al usuario, favor de comunicarte con el administrador.',
        })
    }
};

export const userRecoveryPassword = async (req, res = response) => {

    console.log('pasa')

    const msg = 'Para recuperar tu cuenta ingresa al siguiente Link, el cual tiene un tiempo de vida de 5 min, despues de eso tendras que volver a realizar el proceso.'
    const link = 'Recuperar contraseña'

    const {email} = req.params

    try {
        const user = await UsersAdmins.findOne({
            where:{
                email
            },
        });
        
        if ( !user ){
            return res.status(400).json({
                ok:false,
                msg: 'Tu búsqueda no dio resultados, favor de verificar la información'
            })
        }

        if( user.status === 0 ){
            return res.status(403).json({
                ok:false,
                msg: 'Lo siento, no puedes recuperar tus credenciales, favor de comunicarte con el administrador.'
            })
        }

        //Generar JWT
        const tokenRecoveryPassword = await generarJWT( user.id, user.complete_name_user, user.email, user.code, 2);

        //Obtener un template
        const template = getTemplateChangePassword(user.complete_name_user, tokenRecoveryPassword, msg, link);

        // Enviar el email
        await sendEmail(email, 'Recuperación de cuenta', template, );
        
        user.token_recovery_password = tokenRecoveryPassword
        user.status = 2;
        
        await user.save();

        res.status(201).json({
            ok:true,
            msg: `Revisa tu correo ingresado, hemos enviado un link para la recuperación de tu contraseña`
        });

    } catch(error){
        res.status(500).json({
            success: false,
            msg: 'Error al recuperar la contraseña, favor de comunicarte con el administrador.'
        })
    }
};

export const changePassword = async (req, res = response) => {

    try{
        //Obtener el token

        const { token } = req.params;

        //Verificar la data
        const data = await getTokenData(token);

        if (data === null){
            return res.status(400).json({
                success: false,
                msg: 'Lo sentimos, el link ha expirado.'
            });
        }

        const { email, code } = data;

        //Verificar existencia del ususario
        let user = await UsersAdmins.findOne({
            where:{
                email: email
            }
        });

        if (user === null) {
            return res.status(400).json({
                ok:false,
                msg: `Usuario no existe.`
            })
        }

        if ( user.status === 1 ) {
            return res.status(400).json({
                ok:false,
                msg: `Este link ya ha sido utilizado.`
            })
        }

        //Verificar el código

        if( code ==! user.code){
            return res.redirect('../../public/error.html');
        }
        

        // Redireccionar a la página para cambiar la contraseña

        return res.redirect(`http://${process.env.HOST}:${process.env.PORTP}/#/auth/updatePassword/:${code}`);

    } catch (error){
        return res.status(500).json({
            success: false,
            msg: 'Error al cambiar las credenciales, favor de comunicarte con el administrador.'
        })
    }
};

export const updatePassword = async(req, res = response) =>{

    const {id} = req.params

    const code = id.substring(1,100)

    const {
        password
    } = req.body

    try{ 
        let user = await UsersAdmins.findOne({
            where:{
                code: code,
            },
        });

        if ( !user ) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no fue encontrado'
            });
        }

        //Verificar la data

        const data = await getTokenData(user.token_recovery_password);

        if (data === null){
            return res.status(400).json({
                success: false,
                msg: 'Lo sentimos este link ha expirado'
            });
        }

        //Encriptar contraseña
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(password, salt)

        user.status = 1

        user.token_recovery_password = null

        await user.save();

        return res.status(200).json({
            ok: true,
            msg: 'Las credenciales se han cambiado con éxito, ya puedes iniciar sesión.'
        });

    } catch (error){
        res.status(500).json({
            ok: false,
            msg: 'Error al cambiar la contraseña, favor de comunicarte con el administrador.'
        });
    }
};

export const revalidarToken = async (req, res = response) =>{

    const {id, name} = req

    const token = await generarJWT( id, name );

    res.json({
        ok: true,
        id,
        name,
        token
    })
};
