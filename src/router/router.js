const express=require('express')
const { registerUser, loginUser } = require('../controller/user')
const { retrieveData, storeData, updateData, deleteData } = require('../controller/data')
const { decryptToken } = require('../middleware/decryptToken')
const router=express.Router()
//User
router.post('/register',registerUser)
router.post('/token',loginUser)
//Data
router.get('/retrieveData/:key',decryptToken,retrieveData)
router.post('/storeData',decryptToken,storeData)
router.put('/updateData/:key',decryptToken,updateData)
router.delete('/deleteData/:key',decryptToken,deleteData)
module.exports={router}