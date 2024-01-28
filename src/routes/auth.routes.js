import { Router } from 'express';
import { check } from 'express-validator';
import { 
       confirmUser,
       changePassword,
       createUser,
       userRecoveryPassword, 
       loginUsuario,
       revalidarToken,
       updatePassword

        } from '../controllers/login.controller.js';

import { validarCampos } from '../middlewares/validar-campos.js';
import { validarJWT } from '../middlewares/validar-jwt.js';

const router = Router();

    router.get(
        '/register/confirm/:token', confirmUser )

    router.get(
        '/changuePassword/:token', changePassword )
    
    router.get('/renew', validarJWT, revalidarToken);

    router.post(
        '/register',
        [
            check('complete_name_user', 'El nombre es obligatorio').not().isEmpty(),
            check('email', 'El email es obligatorio').isEmail(),
            check('password', 'El password debe de ser de entre 8 y 15 caracteres').isLength({ min: 8, max: 15}),
            validarCampos
        ],
        createUser )

    router.post(
        '/recovery/:email', userRecoveryPassword)

    router.post(
        '/login', loginUsuario);

    router.put(
        '/updatePassword/:id',
        [
            check('password', 'El password debe de ser de entre 8 y 15 caracteres').isLength({ min: 8, max: 15}),
            validarCampos
        ],
        updatePassword )

export default router;