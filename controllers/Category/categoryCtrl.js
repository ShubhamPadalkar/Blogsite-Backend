const expressAsyncHandler = require('express-async-handler')
const Category = require('../../model/category/category')


const createCategoryCtrl = expressAsyncHandler(async(req,res)=>{
    try {
        const category = await Category.create({
            user:req.user._id ,
            title:req.body.title,
        })
        res.json(category)
    } catch (error) {
        res.json(error)
    }

})

const fetchallCategories = expressAsyncHandler(async(req,res)=>{
    try {
        const category = await Category.find({})
        .populate("user")
        .sort('_createdAt')
        res.json(category)
    } catch (error) {
        res.json(error)
    }
})

const fetchsingleCategories = expressAsyncHandler(async(req,res)=>{
    const { id } = req.params
    try {
        const category = await Category.findById(id)
        .populate("user")
        .sort('_createdAt')
        res.json(category)
    } catch (error) {
        res.json(error)
    }
})

const updateSingleCategory = expressAsyncHandler(async(req,res)=>{
    const { id } = req.params
    try {
        const category = await Category.findByIdAndUpdate(id,{
            title:req?.body?.title
        },{
            new:true,
            runValidators:true
        })
        .populate("user")
        .sort('_createdAt')
        res.json(category)
    } catch (error) {
        res.json(error)
    }
})

const deleteCategory = expressAsyncHandler(async(req,res)=>{
    const { id } = req.params
    try {
        const category = await Category.findByIdAndDelete(id)
        res.json(category)
    } catch (error) {
        res.json(error)
    }
})




module.exports = {
    createCategoryCtrl,
    fetchallCategories,
    fetchsingleCategories,
    updateSingleCategory,
    deleteCategory
}