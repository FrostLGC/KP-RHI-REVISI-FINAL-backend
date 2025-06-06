const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { cloudinary, extractPublicId } = require("../config/cloudinary");

// Define this once at the top
const DEFAULT_PROFILE_IMAGE =
  "https://res.cloudinary.com/dpehq6hqg/image/upload/v1748965541/rmxfq5klt633rfqqtwke_msqbse.jpg";

// mengenerate jwt token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc Register a new user
// @route POST /api/auth/register
// @access Public

const registerUser = async (req, res) => {
    try {
    const { name, email, password, profileImageUrl, AdminInviteToken, position } =
    req.body;

    // check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    // determine user role based on AdminInviteToken
    let role = "user";
    if (
      AdminInviteToken &&
      AdminInviteToken == process.env.ADMIN_INVITE_TOKEN
    ) {
      role = "admin";
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      profileImageUrl:
        profileImageUrl && profileImageUrl.trim() !== ""
          ? profileImageUrl
          : "https://res.cloudinary.com/dpehq6hqg/image/upload/v1748965541/rmxfq5klt633rfqqtwke_msqbse.jpg",
      role,
      position,
    });

    // mengembalikan data user dengan token jwt
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      role: user.role,
      position: user.position,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Login user
// @route POST /api/auth/login
// @access Public

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // mengembalikan data user dengan token jwt
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      role: user.role,
      position: user.position,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Get user profile
// @route GET /api/auth/profile
// @access Private required jwt

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Update user profile
// @route PUT /api/auth/profile
// @access Private required jwt


const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete old Cloudinary image only if it's not the default and is a custom upload
    if (
      req.body.profileImageUrl &&
      user.profileImageUrl &&
      user.profileImageUrl !== DEFAULT_PROFILE_IMAGE &&
      user.profileImageUrl.includes("cloudinary")
    ) {
      const publicId = extractPublicId(user.profileImageUrl);
      if (publicId) await cloudinary.uploader.destroy(publicId);
    }

    // Update user
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.position = req.body.position || user.position;
    user.profileImageUrl = req.body.profileImageUrl || user.profileImageUrl; // Changed from req.file?.cloudinaryUrl

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profileImageUrl: updatedUser.profileImageUrl,
      role: updatedUser.role,
      position: updatedUser.position,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!req.file?.cloudinaryUrl) {
      return res.status(400).json({ message: "No image provided" });
    }

    // Check if current image is not the default before deleting
    const DEFAULT_PROFILE_IMAGE =
      "https://res.cloudinary.com/dpehq6hqg/image/upload/v1748965541/rmxfq5klt633rfqqtwke_msqbse.jpg";

    if (
      user.profileImageUrl &&
      user.profileImageUrl !== DEFAULT_PROFILE_IMAGE &&
      user.profileImageUrl.includes("cloudinary")
    ) {
      const publicId = extractPublicId(user.profileImageUrl);
      if (publicId) await cloudinary.uploader.destroy(publicId);
    }

    user.profileImageUrl = req.file.cloudinaryUrl;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      role: user.role,
      position: user.position,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating profile photo",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateProfilePhoto,
};
