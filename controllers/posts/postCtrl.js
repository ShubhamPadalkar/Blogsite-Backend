const expressAsyncHandler = require("express-async-handler");
const Filter = require("bad-words")
const Post = require("../../model/post/Post");
const validateMongodbId = require("../../utils/validatMongodbID");
const User = require('../../model/user/User')
const cloudinaryUploadImg = require('../../utils/cloudinary');
const fs = require('fs');


const createPostCtrl = expressAsyncHandler(async (req,res)=>{
    
    const {_id} = req.user
    //validateMongodbId(req.body.user)
    //Check for badwords
    let filter = new Filter()
    const isProfane = filter.isProfane(req.body.title)
    const isProfane2 = filter.isProfane(req.body.description )

    //Block user
    if(isProfane || isProfane2){

        const user = await User.findByIdAndUpdate(_id,{
            isBlocked:true
        })
    
        throw new Error('Creating post Failed! Because you used profane word and you have been Blocked!')
    }

    const localPath = `public/images/posts/${req.file.filename}`
    const imageUploaded = await cloudinaryUploadImg(localPath)

    try {
        const post = await Post.create({...req.body,
            image:imageUploaded?.url,
            user:_id,
        })
        //Remove uploaded images
        //fs.unlinkSync(localPath)
        res.json(post)
    } catch (error) {
        res.json(error)
    }
})

// Fetch all post

const fetchPostsCtrl = expressAsyncHandler(async(req,res)=>{
    const hasCategory = req.query.category
    try {
        if(hasCategory){
        const posts = await Post.find({ category : hasCategory })
                        .populate("user").populate("comments")
            res.json(posts)               
        }
        else {
            const posts = await Post.find({}).populate("user").populate("comments")
            res.json(posts)
        }
        
    } catch (error) {
        res.json(error)
    }
})

//Fetch single post 
const fetchPostCtrl = expressAsyncHandler(async(req,res)=>{
    const { id } = req.params
    validateMongodbId(id)
    try {
    const post = await Post.findById(id).populate("user")
            .populate("dislikes").populate("likes").populate("comments")
    //Update number of views
    await Post.findByIdAndUpdate(id , {
        $inc:{numViews : 1}
    },{new:true})
    res.json(post)
    } catch (error) {
    res.json(error) 
    }
})

const updatePostsCtrl = expressAsyncHandler(async (req,res)=>{
    const {id} = req.params
    validateMongodbId(id)
    try {
        const post = await Post.findByIdAndUpdate(id , {...req.body},{new:true})
        res.json(post)
    } catch (error) {
        res.json(error)
    }
})

const deletePostCtrl = expressAsyncHandler(async (req,res) => {
    const {id} = req.params
    validateMongodbId(id)
    try {
        const post = await Post.findByIdAndDelete(id);
        res.json(post)
    } catch (error) {
        res.json(error)
    }
})

const toggleAddLikeToPostCtrl = expressAsyncHandler(async (req,res)=>{
    //1.find the post to be liked
    const {postId} = req.body
    const post = await Post.findById(postId)
    //2.find the login user
    const loginUserId = req?.user?._id
    //3.find if this user has liked this post
    const isLiked = post?.isLiked
    //4.check if this user has disliked this post
    const aleradyDisliked = post?.dislikes?.find(userId =>
        userId?.toString() === loginUserId?.toString())
    //5.Remove the user from dislikes
    if(aleradyDisliked){
        const post = await Post.findByIdAndUpdate(postId,{
            $pull:{ dislikes : loginUserId },
            isDisliked:false
        },{new:true})
        res.json(post)
    }
    //6.remove the user if liked the post
    if(isLiked){
        const post = await Post.findByIdAndUpdate(postId,{
            $pull:{ likes : loginUserId },
            isLiked:false
        },{new:true})
        res.json(post)    
    }
    else {
        const post =await Post.findByIdAndUpdate(postId,{
            $push:{likes:loginUserId},
            isLiked : true
        },{new:true})

        res.json(post)
    }
    
})

//Dislikes
const toggleAddDislikesToPostCtrl = expressAsyncHandler(async(req,res)=>{
   //1.find the post to be liked
   const {postId} = req.body
   const post = await Post.findById(postId)
   //2.find the login user
   const loginUserId = req?.user?._id
   //3.find if this user has liked this post
   const isDisliked = post?.isDisliked
   //4.check if this user has disliked this post
   const aleradyliked = post?.likes?.find(userId =>
       userId?.toString() === loginUserId?.toString())
   //5.Remove the user from dislikes
   if(aleradyliked){
       const post = await Post.findOneAndUpdate(postId,{
           $pull:{ likes : loginUserId },
           isLiked:false
       },{new:true})
       res.json(post)
   }
   //6.remove the user if liked the post
   if(isDisliked){
       const post = await Post.findByIdAndUpdate(postId,{
           $pull:{ dislikes : loginUserId },
           isDisliked:false
       },{new:true})
       res.json(post)    
   }
   else {
       const post =await Post.findByIdAndUpdate(postId,{
           $push:{dislikes:loginUserId},
           isDisliked : true
       },{new:true})
       res.json(post)
   }
})

module.exports = {
    createPostCtrl,
    fetchPostsCtrl,
    fetchPostCtrl,
    updatePostsCtrl,
    deletePostCtrl,
    toggleAddLikeToPostCtrl,
    toggleAddDislikesToPostCtrl
}