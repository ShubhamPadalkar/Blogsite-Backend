const express = require('express')
const { 
    createCommentCtrl,
    fetchAllCommentsCtrl,
    fetchSingleCommentCtrl, 
    updateCommentCtrl,
    deleteCommentCtrl

} = require('../../controllers/comments/commentCtrl')
const authMiddleware = require('../../middlewares/auth/authMiddleware')


const commentRouter = express.Router()


commentRouter.post('/',authMiddleware,createCommentCtrl)
commentRouter.get('/',authMiddleware,fetchAllCommentsCtrl)
commentRouter.get('/:id',authMiddleware,fetchSingleCommentCtrl)
commentRouter.put('/:id',authMiddleware,updateCommentCtrl)
commentRouter.delete('/:id',authMiddleware,deleteCommentCtrl)





module.exports = commentRouter