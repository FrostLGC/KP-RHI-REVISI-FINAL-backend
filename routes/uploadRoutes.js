const express = require("express");
const router = express.Router();
const {
  upload,
  uploadToCloudinary,
} = require("../middlewares/uploadMiddleware");

// POST /api/upload - Upload image to Cloudinary
router.post("/", upload.single("image"), uploadToCloudinary, (req, res) => {
  try {
    if (!req.file || !req.file.cloudinaryUrl) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded or upload failed",
      });
    }

    res.status(200).json({
      success: true,
      url: req.file.cloudinaryUrl,
      publicId: req.file.publicId,
    });
  } catch (error) {
    console.error("Route handler error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during upload processing",
    });
  }
});

module.exports = router;
