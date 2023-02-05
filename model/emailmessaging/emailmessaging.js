const mongoose = require('mongoose')

const emailmessageschema = new mongoose.Schema({
    from:{
        type : String,
        required:true,},
    to:{
        type:String,
        required:true,
    },
    message:{
        type:String,
        required:true
    },
    subject:{
        type:String,
        required:true
    },
    sentBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    isFlagged:{
        type:Boolean,
        default:false
    }    

},{
    timestamps:true
})

const EmailMsg = mongoose.model('EmailMsg',emailmessageschema)

module.exports = EmailMsg