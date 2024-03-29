import { DataTypes } from "sequelize"
import { sequelize } from "../DB/db.js"

export const UsersAdmins = sequelize.define(
    "users_admins_inventories",
    {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        complete_name_user:{
            type: DataTypes.STRING
        },
        sucursal:{
            type: DataTypes.STRING
        },
        email:{
            type: DataTypes.STRING
        },
        password:{
            type: DataTypes.STRING
        },
        code:{
            type: DataTypes.STRING
        },
        status:{
            type: DataTypes.SMALLINT
        },
        token_recovery_password:{
            type: DataTypes.STRING(500)
        }
    },
    {
        timestamps: true,
        schema: 'inventoriesApp',
    },
)