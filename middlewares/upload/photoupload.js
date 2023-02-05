const multer = require("multer")
const sharp = require("sharp")
const path = require('path')
//storage
const multerStorage = multer.memoryStorage()

//file type checking
const multiFilter = (req,file,cb) =>{
    //check filetype
    if(file.mimetype.startsWith('image')){
        cb(null,true)
    }
    else {
        //rejected file
        cb({
            message : "Unsuppoted File Format"
        },false)
    }
}

const PhotoUpload = multer({
    storage:multerStorage ,
    fileFilter:multiFilter,
    limits:{fileSize:10000000}
})

//Image Resizing
const profilePhotoResize = async (req , res , next ) =>{
    //Check if there is no file
    if(!req.file) return next() ;
    req.file.filename = `user-${Date.now()}-${req.file.originalname}` ;
    await sharp(req.file.buffer)
        .resize(250,250)
        .toFormat('jpeg')
        .jpeg({quality:90})
        .toFile(path.join(`public/images/profile/${req.file.filename}`)) ;

    next() ;
}

//Image Resizing
const postImgResize = async (req , res , next ) =>{
    //Check if there is no file
    if(!req.file) return next() ;
    req.file.filename = `user-${Date.now()}-${req.file.originalname}` ;
    await sharp(req.file.buffer)
        .resize(250,250)
        .toFormat('jpeg')
        .jpeg({quality:90})
        .toFile(path.join(`public/images/posts/${req.file.filename}`)) ;

    next() ;
}

module.exports = {PhotoUpload , profilePhotoResize , postImgResize}