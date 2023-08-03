const jwt=require('jsonwebtoken')
require('dotenv').config()
module.exports.decryptToken=async(req,res,next)=>{
    try {
        const tokenId=req.header('Authorization')
        const decode=jwt.verify(tokenId,process.env.JWT_SECRET)
        req.userId=decode.user_id
        next()  
    } catch (error) {
        res.send({
            status: "error",
            code:"INVALID_TOKEN",
            message: "Invalid access token provided",
          })
    }
}