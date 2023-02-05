const express = require('express')
const { sendEmailMsgcCtrl } = require('../../controllers/emailMsg/emailMsgCtrl')
const authMiddleware = require('../../middlewares/auth/authMiddleware')


const emailMsgRouter = express.Router()


emailMsgRouter.post('/',authMiddleware,sendEmailMsgcCtrl)



module.exports = emailMsgRouter