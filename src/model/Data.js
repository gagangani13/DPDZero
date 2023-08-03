const sequelize = require("../database/database");
const {STRING}=require('sequelize')
module.exports.Data=sequelize.define('Data',{
    key:{
        type:STRING,
        primaryKey:true,
    },
    value:{
        type:STRING,
        allowNull:false
    }
})