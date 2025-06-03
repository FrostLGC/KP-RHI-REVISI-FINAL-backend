const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateProfilePhoto, // Add this import
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const {
  upload,
  uploadToCloudinary,
} = require("../middlewares/uploadMiddleware");

const router = express.Router();

// auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.put(
  "/profile/photo",
  protect,
  upload.single("image"),
  uploadToCloudinary,
  updateProfilePhoto // Use the imported function directly
);

// router.post(
//   "/upload-image",
//   upload.single("image"),
//   uploadToCloudinary,
//   (req, res) => {
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }
//     const imageUrl = req.file.cloudinaryUrl;
//     res.status(200).json({ imageUrl });
//   }
// );

module.exports = router;
