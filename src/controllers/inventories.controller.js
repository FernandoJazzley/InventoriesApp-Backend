import { response } from "express"
import { Users } from "../models/Users.js";

export const getUsers = async( req, res= response) =>{
    try{
        const users = await Users.findAll();
        console.log('Número de usuarios:', users.length);

        return res.status(200).json({
            ok: true,
            users,  // Esto enviará un arreglo con todos los usuarios encontrados
        });
    
    } catch (error){
        res.status(500).json({
            ok: false,
            msg: 'Error al cambiar la contraseña, favor de comunicarte con el administrador.'
        });
    }
}

export const newUser = async (req, res = response) => {

    const {
        profileImage,
        complete_name,
        age,
        sex,
        birthdate,
        branch,
        working_hourus,
        description
    } = req.body

    console.log(req.body)

    try{

        const newUser = new Users(req.body);

        await newUser.save()

        res.status(201).json({
            ok: true,
            msg: 'registro exitoso',
            name: newUser.complete_name,
        });
    } catch (error){
        console.log(error)
        res.status(500).json({
            msg: 'Error al guardar al usuario',
        })
    }
};