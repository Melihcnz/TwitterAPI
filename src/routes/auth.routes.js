const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// Kayıt ol
router.post(
  '/register',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage('Kullanıcı adı 3-20 karakter arası olmalıdır')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir'),
    body('email')
      .isEmail()
      .withMessage('Geçerli bir e-posta adresi giriniz')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Şifre en az 6 karakter olmalıdır'),
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('İsim 2-50 karakter arası olmalıdır')
  ],
  authController.register
);

// Giriş yap
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Geçerli bir e-posta adresi giriniz')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Şifre gereklidir')
  ],
  authController.login
);

// Kullanıcı bilgilerini getir
router.get('/me', authenticate, authController.getMe);

module.exports = router; 