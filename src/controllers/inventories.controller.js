import { response } from "express";
import { Users } from "../models/Users.js";
import path from 'path';
import fs, { mkdir } from 'fs';
import moment from 'moment';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getUsers = async (req, res = response) => {
    try {
        const users = await Users.findAll();
        console.log('Número de usuarios:', users.length);

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
    const {
        complete_name,
        age,
        sex,
        birthdate,
        branch,
        working_hours,
        description
    } = req.body;

    try {

         // Formatear la fecha utilizando moment
         const formattedBirthdate = moment(birthdate).format('YYYY-MM-DD');

         // Procesar y guardar la imagen
         let profileImage = '';

        if (req.file) {
            const imageDir = path.join(__dirname, '..', '..', 'public', 'profileImages');
            const imageName = `${Date.now()}_${path.extname(req.file.originalname)}`;
            const imagePath = path.join(imageDir, imageName);
            console.log('2')

        
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
        console.log(error);
        res.status(500).json({
            msg: 'Error al agregar un nuevo usuario',
        });
    }
};