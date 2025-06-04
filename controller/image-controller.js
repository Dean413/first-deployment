const image = require("../model/image")
const { uploadToCloudinary } = require("../helpers/cloudinary-helpers")
const fs = require("fs")
const cloudinar = require("../config/cloudinary")

const uploadImageController = async (req, res) =>{
    try {

        //check if file is missing in req object
        if(!req.file){
            return res.status(400).json({
                sucess: false,
                message: "file is required, please upload an image"
            })
        }
        //upload to cloudinary
        const {url, publicId} = await uploadToCloudinary(req.file.path)

        //store image url and public id along with the uploaded user id in the database
        const newlyUploadedImage = new image({
            url,
            publicId,
            uploadedBy: req.userInfo.userId
        })

        await newlyUploadedImage.save()

        fs.unlinkSync(req.file.path)

        res.status(201).json({
            success: true,
            message: "image uploaded successfully",
            image: newlyUploadedImage
        })
        
    } catch (e) {
        console.log(e)
        res.status(500).json({
            success: false, 
            message: "something went wrong! please try agin "
        })
        
    }
}

const fetchImages = async (req,res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit)  || 5;
        const skip = (page -1) * limit;

        const sortBy = req.query.sortBy || "createdAt"
        const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
        const totalImages = await image.countDocuments()
        const totalPages = Math.ceil(totalImages/limit)
        
        const sortObj = {}
        sortObj[sortBy] = sortOrder;
        const images = await image.find().sort(sortObj).skip(skip).limit(limit);

        if(images){
            res.status(200).json({
                success: true,
                currentPage: page,
                totalPages : totalPages,
                totalImages : totalImages,
                data: images    
            })
        }
        
    } catch (e) {
        console.log(e)
         res.status(500).json({
            success: false, 
            message: "something went wrong! please try agin "
        })
        
    }
}

const deleteImageController = async(req,res)=>{
    try {
        const getCurrentIdOfImageToBeDeleted = req.params.id;
        const userid = req.userInfo.userId; 
        const getimage = await image.findById(getCurrentIdOfImageToBeDeleted)
        
        if(!getimage){
            return res.status(404).json({
                success: false,
                message: "image not found"
            })
        }

        //check if image was uploaded by user trying to delete the image
        if(getimage.uploadedBy.toString() !== userid){
            return res.status(403).json({
                success: false,
                message: "you are not authorized to delete this image because you have not uploaded it"
            })
        }

        //delete image from cloudinary storage
        await cloudinar.uploader.destroy(getimage.publicId);

        //delete image from mongodb database
        await image.findByIdAndDelete( getCurrentIdOfImageToBeDeleted)

        res.status(200).json({
            success: true,
            message: "image deleted successfully"
        })

    } catch (e) {
        console.log(e)
         res.status(500).json({
            success: false, 
            message: "something went wrong! please try again "
        })
    }

}
module.exports = {uploadImageController, fetchImages, deleteImageController}