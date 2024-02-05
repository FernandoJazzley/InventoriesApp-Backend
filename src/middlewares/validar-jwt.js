import { response } from "express"
import  jwt  from "jsonwebtoken";

export const validarJWT = (req, res = response, next) =>{

    // x-token headers
    const token = req.header('x-token');
    
    if(!token){
        return res.status(401).json({
            ok: false,
            msg: 'No hay token en la petición'
        });
    }

    try{
        const {id, name} = jwt.verify(
            token,
            process.env.SECRET_JWT_SEED_LOGIN
        );

        req.id = id;
        req.name = name;

    } catch (error){
        console.log(error)
        return res.status(401).json({
            ok: false,
            msg: 'Token no válido'
        })
    }

    next();
}

export const getTokenData = (token, type) => {
    let data = null;

    let key = ''
    type === 1 ? key = process.env.SECRET_JWT_SEED_RECOVERY : key = process.env.SECRET_JWT_SEED_LOGIN

    console.log(key)

    jwt.verify(token, key, (err, decode) =>{
        if(err) {
            console.log(err)
            console.log('Error al obtener la data del token');    
        } else{
            data = decode;
        }
    });
     return data;
}