const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const roleVerification = require('../middlewares/roleVerification');
const {
  getUsers,
  getUserById,
  updateUserPosition,
  updateUserProfilePhoto,
  updateUserRole,
  deleteUser,
} = require('../controllers/userController');

const router = express.Router();

// user management routes
router.get('/', protect, getUsers);
router.get('/:id', protect, getUserById);
router.put(
  '/:id/position',
  protect,
  roleVerification.superadminOnly,
  updateUserPosition
);
router.put(
  '/:id/profile-photo',
  protect,
  updateUserProfilePhoto
);
router.put(
  '/:id/role',
  protect,
  roleVerification.superadminOnly,
  updateUserRole
);
router.delete(
  '/:id',
  protect,
  roleVerification.superadminOnly,
  deleteUser
);

module.exports = router;
