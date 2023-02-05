const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    firstname:{
        required:[true,'First Name is required'],
        type : String,
    },
    lastname:{
        required:[true,'Last Name is required'],
        type : String,
    },
    profilePhoto : {
        type : String,
        default : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
    },
    email:{
        type:String,
        required:[true,"Email is required"]
    },
    bio:{
        type:String
    },
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    postCount:{
        type:Number,
        default:0
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    isAdmin:{
        type : Boolean,
        default:false
    },
    role:{
        type:String,
        enum:['Admin','Guest','Blogger'],

    },
    isFollowing:{
        type: Boolean,
        default:false,
    },
    isUnFollowing:{
        type: Boolean,
        default:false,
    },
    isAccountVerified:{
        type: Boolean,
        default:false,
    },
    accountVerificationToken:String,
    accountVerificationTokenExpires :Date,
    
    viewedBy : {
        type:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref : "User" , 
            }
        ],
    } ,
    followers : {
        type:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref : "User" , 
            }
        ],
    },
    following : {
        type:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref : "User" , 
            }
        ],
    },
    passwordChangeAt : Date,
    passwordResetToken:String,
    passwordResetExpires : Date,

    active:{type:Boolean,default:false} 
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
    timestamps:true,

}
)

//Virtual method to populate created post
userSchema.virtual('posts',{
    ref:'Post',
    foreignField:'user',
    localField:'_id'
})


//Hash password

userSchema.pre('save',async function(next){
    console.log(this.isModified("password"))
    if(!this.isModified("password")){
        return next()
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt)
    next()
})

//match password 
userSchema.methods.isPasswordMatched = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password) ;
}
//Verify Account
userSchema.methods.createAccountVerificationToken = async function(){
    //Create a token
    const verificationToken = crypto.randomBytes(32).toString("hex") ;
    this.accountVerificationToken = crypto.createHash('sha256').update(verificationToken).digest("hex") ;

    this.accountVerificationTokenExpires = Date.now() + 30 * 60 * 1000 ; //10 Min

    return verificationToken ; 
}

//Password forget or reset password
userSchema.methods.createPasswordResetToken = async function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    this.passwordResetExpires = Date.now() + 30 * 60 * 1000 //10 min
    return resetToken
}

//Compile schema into model
const User = mongoose.model("User",userSchema);

module.exports = User