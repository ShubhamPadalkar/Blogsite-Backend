const User = require("../../model/user/User")
const expressAsyncHandler = require('express-async-handler')
const generateToken = require("../../config/token/generateToken")
const validateMongodbId = require("../../utils/validatMongodbID")
const sgMail = require('@sendgrid/mail')
const crypto = require('crypto')
const cloudinaryUploadImg = require("../../utils/cloudinary")
const fs = require('fs')


sgMail.setApiKey(process.env.SEND_GRID_API)



const userRegister = expressAsyncHandler( async (req,res) =>{
const userExists = await User.findOne({email:req?.body?.email})
if(userExists) throw new Error('User already Exist');
try {

 
        const user = await User.create({
            firstname : req?.body?.firstname,
            lastname : req?.body?.lastname,
            email : req?.body?.email,
            password:req?.body?.password
        }) 
        res.json(user)  
    } catch (error) {
        res.json(error)  
    }
}
)

const loginuserCtrl = expressAsyncHandler(async (req,res)=>{
    const { email , password } = req.body
//check if user exists
    const userFound = await User.findOne({email:email})
//check if password is match
    if(userFound && (await userFound.isPasswordMatched(password))){
        res.json({
            _id :userFound?._id,
            firstName:userFound?.firstname,
            lastName:userFound?.lastname,
            email:userFound?.email,
            profilePhoto : userFound?.profilePhoto,
            isAdmin:userFound?.isAdmin,
            bio:userFound?.bio,
            isAccountVerified : userFound?.isAccountVerified,
            token : generateToken(userFound?._id)
        })
    } else {
        res.status(401)
        throw new Error('Invalid credential')
    }

})

//Get all users
const fetchUserCtrl = expressAsyncHandler(async (req,res)=>{
 
    try{
        const users = await User.find({}).populate('posts')
        res.json(users)
    }
    catch(error){
        res.json(error)
    }
})

//Delete user
const deleteUsersCtrl = expressAsyncHandler(async (req,res)=>{
    const {id} = req.params
    //Check if id is valid
    validateMongodbId(id)
    try {
        const deletedUser = await User.findByIdAndDelete(id)
        res.json(deletedUser)
    } catch (error) {
        res.json(error)
    }
})

//User details
const fetchUserDetails = expressAsyncHandler(async(req,res)=>{
    const {id} = req.params
    validateMongodbId(id)
    try {
        const user = await User.findById(id);
        res.json(user)
    } catch (error) {
        res.json(error)
    }
})

//User Profile
const userProfile = expressAsyncHandler(async (req,res)=>{
    const {id} = req.params
    validateMongodbId(id)
    //1.Login user
    //2.Get the Login user
    const loginUserId = req?.user?._id.toString()
    try {
        const myProfile = await User.findById(id)
        .populate('posts').populate('viewedBy')
        const alreadyViewed = myProfile?.viewedBy?.find(user =>{
            return user?._id?.toString() === loginUserId
        })
        if (alreadyViewed){
            res.json(myProfile)
        }
        else {
            const profile = await User.findByIdAndUpdate(myProfile?._id,{
                $push:{viewedBy : loginUserId},
            }).populate('posts')
            res.json(profile)
        }

    } catch (error) {
        res.json(error)
    }
})

//Update user
const updateUserCtrl = expressAsyncHandler(async(req,res)=>{
    const {_id} = req?.user
    validateMongodbId(_id)
    try {

        const user = await User.findByIdAndUpdate(_id,{
            firstname: req?.body?.firstname,
            lastname : req?.body?.lastname,
            email:req?.body?.email,
            bio : req?.body?.bio
        },{
            new : true , 
            runValidators: true
        })

        res.json(user)
    
    } catch (error) { res.json(error)}
})

//Update password

const updateUserPasswordCtrl = expressAsyncHandler(async(req,res)=>{
    //destructure the login user
    const {_id } = req.user
    const {password} = req.body
    validateMongodbId(_id)

    //Find user by id
    const user = await User.findById(_id)
    if(password) {
        user.password = password ;
        const updatedUser = await user.save()
        res.json(updatedUser)
    }
    res.json(fetchUserCtrl) ;
})

//following

const followingUserCtrl = expressAsyncHandler(async (req,res)=>{
    
    const { followId } = req.body
    const loginUserId = req.user.id

    const targetUser = await User.findById(followId) ;

    const allFollowing = targetUser?.followers?.find(user=>
        user?.toString() === loginUserId.toString()
        );
 
    
    if(allFollowing) throw new Error("You are already following this user")
    
    //1.Find the user you wanr to follow and update its follower
    await User.findByIdAndUpdate(followId,{
        $push:{followers:loginUserId},
        isFollowing : true
    },{new : true})

    //2.Update login user following field
    await User.findByIdAndUpdate(loginUserId,{
        $push:{following:followId},
     
    },{new : true})


    res.json('You have succesfully followed this user')
})

//Unfollowing
const unfollowUserCtrl = expressAsyncHandler(async (req,res)=>{
    const { unFollowId } = req.body
    const loginUserId = req.user.id

    let result = await User.findByIdAndUpdate(unFollowId,{
        $pull:{followers:loginUserId},
        isFollowing: false,
    },{new : true})
 
    await User.findByIdAndUpdate(loginUserId,{
        $pull :{following:unFollowId}
    },{new : true})

    res.json('You have succesfully Unfollowed user')
})

//Block user
const blockuserCtrl = expressAsyncHandler(async (req,res)=>{
    const  id  = req.params.id ;
    validateMongodbId(id) ;
    const user = await User.findByIdAndUpdate(id,{
        isBlocked:true
    },{new : true})

    res.json(user) ;
})

//Block user
const unblockuserCtrl = expressAsyncHandler(async (req,res)=>{
    const  id  = req.params.id ;
    validateMongodbId(id) ;
    const user = await User.findByIdAndUpdate(id,{
        isBlocked:false
    },{new : true})

    res.json(user) ;
})

//Account verification
const generateVerificationTokenCtrl = expressAsyncHandler(async (req,res)=>{
    const loginUserId = req.user.id
    const user = await User.findById(loginUserId) ;
try {
    //Generate Token
    const verificationToken =await user.createAccountVerificationToken() ;
    //save user
    await user.save()
    //Build your message
    const resetURL = `If you were requested to verify your account , verify now within 10 min, otherwise ignore this message 
        <a href="${process.env.REMOTE_SERVER_LINK}/api/users/verify-account/${verificationToken}" >Click to Verify</a>`

    const msg = {
        to: user?.email ,
        from: 'appdemon259@gmail.com' ,
        subject: 'Account Verification' ,
        html: resetURL ,
    }

    await sgMail.send(msg) ;
    res.json(resetURL)
} 
catch (error)
{res.json(error)}    
})

//Account verification
const accountVerificationCtrl = expressAsyncHandler(async (req , res)=>{
    const { token } = req.params
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex') ;

    //find this user by token
    const userFound = await User.findOne({
        accountVerificationToken : hashedToken,
        accountVerificationTokenExpires : {$gt : new Date()}
    }) ;
    if(!userFound){res.send('<h1>Link is Expired</h1>')} ;
    
    //update the proprt true
    userFound.isAccountVerified = true ;
    userFound.accountVerificationToken = undefined ;
    userFound.accountVerificationTokenExpires = undefined ;
    await userFound.save()

    res.send(`<div>
    <h1>Account Verified Successfully</h1>
    <h3>Logout and Login again if not updated </h3>
    </div?
    `)
})

//Forget password token 
const forgetPasswordTokenCtrl = expressAsyncHandler(async (req,res)=>{
    //find the user by email
    const { email } = req.body ;
    const user =await User.findOne({email : email})
    if(!user) throw new Error('User not found')
    try {
        const token = await user.createPasswordResetToken() ;
        console.log(token) ;
        await user.save() ;

        //build your message
        const resetURL = `If you were requested to reset your password , reset now within 10 min, otherwise ignore this message 
        <a href="${process.env.REMOTE_SERVER_LINK}/reset-password/${token}" >Click to Verify</a>`

        const msg = {
        to: email ,
        from: 'appdemon259@gmail.com' ,
        subject: 'Reset Password' ,
        html: resetURL ,}
        const emailMsg = await sgMail.send(msg) ;
        res.json({
            msg : `A verification message is succesfully sent to ${user?.email}.Reset now within
            10 minutes , ${resetURL}`
        }) ;
    } catch (error) {
        res.json(error)
    }
})


//Password reset 

const passwordResetCtrl = expressAsyncHandler(async (req,res)=>{
    const { token , password } = req.body
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    //find this user by token
    const user = await User.findOne({passwordResetToken : hashedToken,
    passwordResetExpires : {$gt : new Date()}
    })

    if(!user) throw new Error("Token expired , try again later") ;

    //Update/change the password
    user.password = password ;
    user.passwordResetToken = undefined ;
    user.passwordResetExpires = undefined ;
    await user.save() ;
    res.json(user) ;
})

//profile photo upload

const profilePhotoUploadCtrl = expressAsyncHandler(async (req,res)=>{
    //Find the login user
    const {_id} = req.user ;

    //Get the path of image 
    const localPath = `public/images/profile/${req.file.filename}`
    const imageUploaded = await cloudinaryUploadImg(localPath)
    const founduser = await User.findByIdAndUpdate(_id,{
        profilePhoto : imageUploaded.url
    },{new:true})

    //remove the save images
    // fs.unlinkSync(localPath)
    res.json(founduser)
})

module.exports = { 
    userRegister , 
    loginuserCtrl, 
    fetchUserCtrl ,
    deleteUsersCtrl,
    fetchUserDetails,
    userProfile,
    updateUserCtrl,
    updateUserPasswordCtrl,
    followingUserCtrl,
    unfollowUserCtrl,
    blockuserCtrl,
    unblockuserCtrl,
    generateVerificationTokenCtrl,
    accountVerificationCtrl,
    forgetPasswordTokenCtrl,
    passwordResetCtrl,
    profilePhotoUploadCtrl
}