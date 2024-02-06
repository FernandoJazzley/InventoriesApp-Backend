import { DataTypes } from "sequelize"
import { sequelize } from "../DB/db.js"

export const Users = sequelize.define(
    "users",
    {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        profileImage:{
            type: DataTypes.STRING
        },
        complete_name:{
            type: DataTypes.STRING
        },
        email:{
            type: DataTypes.STRING
        },
        age:{
            type: DataTypes.STRING
        },
        sex:{
            type: DataTypes.STRING
        },
        birthdate:{
            type: DataTypes.DATE
        },
        branch:{
            type: DataTypes.STRING
        },
        working_hours: { 
            type: DataTypes.STRING
        },
        description:{
            type: DataTypes.STRING
        },
        status:{
            type: DataTypes.SMALLINT
        },
    },
    {
        timestamps: true,
        schema: 'inventoriesApp',
    },
)