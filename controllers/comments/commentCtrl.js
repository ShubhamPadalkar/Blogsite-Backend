const expressAsyncHandler = require("express-async-handler");
const Comment = require("../../model/comment/Comment");
const validateMongodbId = require("../../utils/validatMongodbID");

//Create new comments
const createCommentCtrl = expressAsyncHandler(async(req,res)=>{
    //1.Get the user
    const user = req.user
    //2.Get the post id
    const {postId , description} = req.body
    try {
        const comment = await Comment.create({
            post:postId,
            user,
            description:description
        })
        res.json(comment)
    } catch (error) {
        res.json(error)
    }
    
})

//Fetch all comments
const fetchAllCommentsCtrl = expressAsyncHandler(async(req,res)=>{
    try {
        const comments = await Comment.find({}).sort('-created')
        res.json(comments)
    } catch (error) {
        res.json(error)
    }
})

//Fetch single comment 
const fetchSingleCommentCtrl = expressAsyncHandler(async(req,res)=>{
    const {id} = req.params
    validateMongodbId(id)
    try {
        const comment = await Comment.findById(id)
        res.json(comment) 
    } catch (error) {
        res.json(error)
    }
})

//Update comments
const updateCommentCtrl = expressAsyncHandler(async (req,res)=>{
    const { id } = req.params
    validateMongodbId(id)
    try {
        const comment = await Comment.findByIdAndUpdate(id,{
        post:req?.body?.postId,
        user:req?.user,
        description:req?.body?.description
        },{new:true,runValidators:true})
        res.json(comment)
    } catch (error) {
        res.json(error)
    }
}) 

//delete comment
const deleteCommentCtrl = expressAsyncHandler(async(req,res)=>{
    const  { id }  = req.params
    validateMongodbId(id)
    try {
        const comments = await Comment.findByIdAndDelete(id)
        res.json(comments)
    } catch (error) {
        res.json(error)
    }
})


module.exports = {
    createCommentCtrl,
    fetchAllCommentsCtrl,
    fetchSingleCommentCtrl,
    updateCommentCtrl,
    deleteCommentCtrl
}