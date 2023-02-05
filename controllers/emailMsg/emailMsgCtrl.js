const expressAsyncHandler = require('express-async-handler')
const sgMail = require('@sendgrid/mail')
const EmailMsg = require('../../model/emailmessaging/emailmessaging')
const Filter = require('bad-words')

const sendEmailMsgcCtrl = expressAsyncHandler(async(req,res)=>{
    const { to, subject , message } = req.body
    //get the message
    const emailMessage = subject + ' ' + message
    //Prevent profanity or bad words
    const filter = new Filter()

    const isProfane = filter.isProfane(emailMessage)
    if(isProfane){
        throw new Error('EMail sent failed because contain profane word')
    }
    try { 
        //Build up message
        const msg = {
            to, 
            subject , 
            text : message,
            from : process.env.SEND_GRID_MAIL
        };
        //send message
        await sgMail.send(msg)
        await EmailMsg.create({
            sentBy:req?.user?._id,
            from :req?.user?.email,
            to , message ,
            subject,
        })
        res.json('Mail send')
    } catch (error) {
        res.json(error)
    }
}) 

module.exports = {
    sendEmailMsgcCtrl
}