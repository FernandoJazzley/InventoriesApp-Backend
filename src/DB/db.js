import dotenv from 'dotenv'
import { Sequelize } from 'sequelize';
dotenv.config();

export const sequelize = new Sequelize(process.env.BD_CNN_INVENTORIES, {
    dialectOptions: {
      ssl: false,
    },
  });

try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}


