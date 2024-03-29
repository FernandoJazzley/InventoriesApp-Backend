import express from "express";
import morgan from "morgan";
import AuthRoutes from './routes/auth.routes.js';
import InventoriresRoutes from './routes/inventories.routes.js';
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
app.use(express.urlencoded({ extended: true }));

// Directorio Público
/* const publicPath = path.join(url, 'public');
app.use(express.static(publicPath));
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
}); */

app.use( express.static('public'));

//Llama a los endPoints
app.use('/api/auth',AuthRoutes);
app.use('/api/inventories', InventoriresRoutes)

export default app;