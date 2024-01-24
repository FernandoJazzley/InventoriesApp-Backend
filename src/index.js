import app from './app.js';
import dotenv from 'dotenv'
import { sequelize } from './DB/db.js';
dotenv.config();
//import { Users } from './models/Users.js';

async function main(){    
    try {
        await sequelize.sync({ force: true })
        //Escuchar las peticiones
        app.listen( process.env.PORT, () =>{
            console.log(`Servidor corriendo en puerto ${ process.env.PORT }`)
        } )
    } catch (error){
        console.log('Unable to connect to the database:', error)
    }
}
main();