import express from "express";
import morgan from "morgan";
import InventoriesRoutes from './routes/inventories.routes.js';
import cors from 'cors'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ultimoSlash = __dirname.lastIndexOf("/")

const url =__dirname.substring(0, ultimoSlash+1);

//Crear el servidor de express
const app = express ();

//Para visualizar las peticiones en cosola que vayan llegando
app.use(morgan('dev'));

//Cors
app.use(cors());

//Para que los response puedan leer los Json
app.use(express.json());
//pp.use(express.static(path.join(url , 'public')));

//Llama a los endPoints
app.use('/api/auth',InventoriesRoutes);

/* app.get('/*', function(req,res) {
    res.sendFile(path.join(url + '/public/index.html'));
}); */


// Directorio Público
app.use( express.static('public'));


export default app;