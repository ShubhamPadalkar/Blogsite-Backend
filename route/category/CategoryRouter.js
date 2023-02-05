const express = require('express')
const { 
    createCategoryCtrl, 
    fetchallCategories, 
    fetchsingleCategories, 
    updateSingleCategory, 
    deleteCategory} = require('../../controllers/Category/categoryCtrl')
const authMiddleware = require('../../middlewares/auth/authMiddleware')

const categoryRouter = express.Router()


categoryRouter.post('/',authMiddleware,createCategoryCtrl)
categoryRouter.get('/',fetchallCategories)
categoryRouter.get('/:id',authMiddleware,fetchsingleCategories)
categoryRouter.put('/:id',authMiddleware,updateSingleCategory)
categoryRouter.delete('/:id',authMiddleware,deleteCategory)






module.exports = categoryRouter