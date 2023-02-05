const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../../model/user/User");

const authMiddleware = expressAsyncHandler(async(req,res,next)=>{
    let token ;
    if(req?.headers?.authorization?.startsWith('Bearer')){
        try {
            token = req.headers.authorization.split(' ')[1] ;
            if(token){
                const decoded = jwt.verify(token,process.env.JWT_KEY)
                //find the user by id
                const user = await User.findById(decoded?.id).select('-password') ;
                //attach user to request to object
                req.user = user
                next()
            }
            else {
                throw new Error('There is no token attached to Header.')
            }
        } catch (error) {
            throw new Error('Not Authorized token expired, Login again')
        }    
    }
    else{
        throw new Error('There is no token attached to Header.')
    }


})


module.exports = authMiddleware