import { response } from "express";
import { Users } from "../models/Users.js";
import path from 'path';
import fs, { mkdir } from 'fs';
import moment from 'moment';
import { fileURLToPath } from 'url';
import { UsersAdmins } from "../models/UsersAdmins.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getUsers = async (req, res = response) => {
    try {
        const users = await Users.findAll();
        return res.status(200).json({
            ok: true,
            users,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error al cambiar la contraseña, favor de comunicarte con el administrador.'
        });
    }
}

export const newUser = async (req, res = response) => {

    const password = 'Demo123#'
    const msg = 'Ingresa al siguiente link para confirmar tu cuenta.'
    const contraseña = ` Una vez confirmada tu cuenta, puedes usar la siguiente contraseña para iniciar sesión: <strong>${password}</strong>`
    const link = 'Confirmar cuenta' 

    const {
        complete_name,
        email,
        age,
        sex,
        birthdate,
        branch,
        working_hours,
        description
    } = req.body;

    try {

        let newUserAdmin = await UsersAdmins.findOne({
            where:{
                email: email
            }
        });

        if( newUserAdmin && newUser.status != 0 ){
            return res.status(400).json({
                ok:false,
                msg: `Ya existe una cuenta con el correo ingresado.`
            })
        }

        if( newUserAdmin && newUser.status === 0 ){

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
        const template = getTemplateConfirm(req.body.complete_name_user, token, msg, link, contraseña);

        // Enviar el email
        await sendEmail(req.body.email, 'Bienvenido a InventoriesApp', template);

        await newUser.save()

         // Formatear la fecha utilizando moment
         const formattedBirthdate = moment(birthdate).format('YYYY-MM-DD');

         // Procesar y guardar la imagen
         let profileImage = '';

        if (req.file) {
            const imageDir = path.join(__dirname, '..', '..', 'public', 'profileImages');
            const imageName = `${Date.now()}_${path.extname(req.file.originalname)}`;
            const imagePath = path.join(imageDir, imageName);
        
            fs.writeFileSync(imagePath, req.file.buffer);
            profileImage = `/profileImages/${imageName}`;

            if (profileImage) {
                if (fs.existsSync(imageDir)) {
                    fs.mkdirSync(imageDir, { recursive: true });
                } else {
                    res.status(500).json({
                        ok: false,
                        msg: 'No existe el directorio',
                    });
                    return
                }
            }else{      
                res.status(500).json({
                    ok: false,
                    msg: 'No se ha podido guardar la ruta de la imagen',
                });
                return
            }
        }else{
            res.status(500).json({
                ok: false,
                msg: 'No se encontro ninguna imagen para guardar',
            });
            return
        }
        
        let status = 1;

        const newUser = await Users.create({
            profileImage,
            complete_name,
            age,
            sex,
            birthdate: formattedBirthdate,
            branch,
            working_hours,
            description,
            status: status
        });

        res.status(201).json({
            ok: true,
            msg: 'Registro exitoso',
            name: newUser.complete_name,
        });

    } catch (error) {
        res.status(500).json({
            msg: 'Error al agregar un nuevo usuario',
        });
    }
};

export const editUser = async (req, res = response) => {
    const userId = req.params.id; // Asume que el ID del usuario a editar está en los parámetros de la ruta

    try {
        const existingUser = await Users.findByPk(userId);

        if (!existingUser) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario no encontrado',
            });
        }

        const {
            complete_name,
            age,
            sex,
            birthdate,
            branch,
            working_hours,
            description
        } = req.body;

        // Formatear la fecha utilizando moment
        const formattedBirthdate = moment(birthdate).format('YYYY-MM-DD');

        // Procesar y guardar la imagen si se proporciona
        let profileImage = existingUser.profileImage; // mantener la imagen existente por defecto

        if (req.file) {
            const imageDir = path.join(__dirname, '..', '..', 'public', 'profileImages');
            const imageName = `${Date.now()}_${path.extname(req.file.originalname)}`;
            const imagePath = path.join(imageDir, imageName);

            fs.writeFileSync(imagePath, req.file.buffer);
            profileImage = `/profileImages/${imageName}`;

            if (!fs.existsSync(imageDir)) {
                fs.mkdirSync(imageDir, { recursive: true });
            }
        }

        // Actualizar la información del usuario
        existingUser.profileImage = profileImage;
        existingUser.complete_name = complete_name;
        existingUser.age = age;
        existingUser.sex = sex;
        existingUser.birthdate = formattedBirthdate;
        existingUser.branch = branch;
        existingUser.working_hours = working_hours;
        existingUser.description = description;

        await existingUser.save();

        res.status(200).json({
            ok: true,
            msg: 'Usuario actualizado exitosamente',
            name: existingUser.complete_name,
        });

    } catch (error) {
        res.status(500).json({
            msg: 'Error al editar la información del usuario',
        });
    }
};

export const deleteUser = async (req, res) => {
    const userId = req.params.id; // Asume que el ID del usuario a eliminar está en los parámetros de la ruta
    try {
        const existingUser = await Users.findByPk(userId);

        if (!existingUser) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario no encontrado',
            });
        }

        // Eliminar la imagen si existe
        if (existingUser.profileImage) {
            const imagePath = path.join(__dirname, '..', '..', 'public', existingUser.profileImage.substr(1));
            
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // Eliminar el usuario
        await existingUser.destroy();

        res.status(200).json({
            ok: true,
            msg: 'Usuario eliminado exitosamente',
            name: existingUser.complete_name,
        });

    } catch (error) {
        res.status(500).json({
            msg: 'Error al eliminar el usuario',
        });
    }
};