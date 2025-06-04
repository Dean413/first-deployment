const express = require("express")
const authMiddleware = require("../middleware/middleware")
const adminMiddleWare = require("../middleware/admin-middleware")
const uploadMiddleware = require("../middleware/upload-middleware")
const { uploadImageController, fetchImages, deleteImageController } = require("../controller/image-controller")
const router = express.Router()

//upload the image
router.post("/upload", authMiddleware, adminMiddleWare, uploadMiddleware.single("image"), uploadImageController)
//get all images
router.get("/fetch", authMiddleware, fetchImages)

//delete image route
router.delete("/:id", authMiddleware, adminMiddleWare, deleteImageController)


module.exports = router

