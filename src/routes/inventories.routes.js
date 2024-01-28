import { Router } from 'express';
import { 
     getUsers, 
     newUser
        } from '../controllers/inventories.controller.js';


const router = Router();

    router.get(
        '/users/', getUsers )

    router.post(
        '/addUser',newUser )

export default router;