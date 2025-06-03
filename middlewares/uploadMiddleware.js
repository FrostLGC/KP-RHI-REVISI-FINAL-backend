const multer = require("multer");
const { cloudinary } = require("../config/cloudinary");
const { Readable } = require("stream");

// File filter configuration
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, and WebP images are allowed."
      ),
      false
    );
  }
  cb(null, true);
};

// Multer configuration
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
  },
});

// Cloudinary upload function
const uploadToCloudinary = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const readableStream = new Readable();
    readableStream.push(req.file.buffer);
    readableStream.push(null);

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          upload_preset: "project-management-preset",
          folder: "project-management",
          quality: "auto:good",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(new Error("Failed to upload image to Cloudinary"));
          } else {
            resolve(result);
          }
        }
      );
      readableStream.pipe(uploadStream);
    });

    req.file.cloudinaryUrl = result.secure_url;
    req.file.publicId = result.public_id;
    next();
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Image upload failed",
      error: error.message,
    });
  }
};

module.exports = { upload, uploadToCloudinary };
