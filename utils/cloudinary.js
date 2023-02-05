const cloudinary = require('cloudinary')

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key : process.env.CLOUDINARY_APIKEY,
    api_secret : process.env.API_SECRET_KEY
})

const cloudinaryUploadImg = async fileToUpload =>{
try {
    const data = await cloudinary.uploader.upload(fileToUpload,{
        resource_type : "auto" ,
    })
    return {url : data?.secure_url}
} catch (error) {
    return error
}
}

module.exports = cloudinaryUploadImg