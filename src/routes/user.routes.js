const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { uploadProfilePicture, uploadCoverPicture, handleUploadError } = require('../middlewares/upload.middleware');

const router = express.Router();

// Kullanıcı profil bilgilerini getir
router.get('/profile/:username', userController.getUserProfile);

// Kullanıcı takip et/takibi bırak
router.post('/follow/:id', authenticate, userController.followUser);

// Kullanıcı profil güncelleme
router.put(
  '/update',
  authenticate,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('İsim 2-50 karakter arası olmalıdır'),
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 160 })
      .withMessage('Biyografi en fazla 160 karakter olmalıdır'),
    body('location')
      .optional()
      .trim()
      .isLength({ max: 30 })
      .withMessage('Konum en fazla 30 karakter olmalıdır'),
    body('website')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Web sitesi en fazla 100 karakter olmalıdır')
  ],
  userController.updateUserProfile
);

// Profil resmi güncelleme
router.put(
  '/update/profile-picture',
  authenticate,
  uploadProfilePicture,
  handleUploadError,
  userController.updateUserProfile
);

// Kapak resmi güncelleme
router.put(
  '/update/cover-picture',
  authenticate,
  uploadCoverPicture,
  handleUploadError,
  userController.updateUserProfile
);

// Takipçi listesini getir
router.get('/followers/:id', userController.getFollowers);

// Takip edilen kullanıcıları getir
router.get('/following/:id', userController.getFollowing);

// Kullanıcı arama
router.get('/search', userController.searchUsers);

module.exports = router; 