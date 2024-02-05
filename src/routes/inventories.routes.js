import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { deleteUser, editUser, getUsers, newUser } from '../controllers/inventories.controller.js';

const router = Router();

// Configuración de Multer
const storage = multer.memoryStorage({
    destination: function (req, file, cb) {
        cb(null, "public/profileImages");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB como ejemplo, ajusta según tus necesidades
});
router.get('/users/', getUsers);

router.post('/addUser', upload.single('profileImage'), newUser);
router.put('/editUser/:id',  upload.single('profileImage'),editUser)
router.delete('/deleteUser/:id', deleteUser)


export default router;