const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Add to cloudinary.js
const extractPublicId = (url) => {
  const matches = url.match(/\/upload\/.*\/([^/]+)\.(jpg|png|jpeg)/i);
  return matches ? `project-management/${matches[1]}` : null;
};

module.exports = { cloudinary, extractPublicId };