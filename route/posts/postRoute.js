const express = require('express')
const { createPostCtrl , 
        fetchPostsCtrl ,
        fetchPostCtrl,
        updatePostsCtrl,
        deletePostCtrl,
        toggleAddLikeToPostCtrl,
        toggleAddDislikesToPostCtrl} = require('../../controllers/posts/postCtrl')
const authMiddleware = require('../../middlewares/auth/authMiddleware')
const { PhotoUpload, postImgResize } = require('../../middlewares/upload/photoupload')



const postRoute = express.Router()

postRoute.post('/',
authMiddleware,
PhotoUpload.single('image'),
postImgResize ,
createPostCtrl)

postRoute.get('/',fetchPostsCtrl)
postRoute.put('/likes',authMiddleware,toggleAddLikeToPostCtrl)
postRoute.put('/dislikes',authMiddleware,toggleAddDislikesToPostCtrl)
postRoute.get('/:id',fetchPostCtrl)
postRoute.put('/:id',authMiddleware ,updatePostsCtrl)
postRoute.delete('/:id',deletePostCtrl)


module.exports = postRoute 