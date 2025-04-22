const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// JWT token oluştur
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Kayıt ol
const register = async (req, res) => {
  try {
    // Doğrulama hataları
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, name } = req.body;

    // Kullanıcı adı veya e-posta zaten kayıtlı mı kontrol et
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
      }
      return res.status(400).json({ message: 'Bu kullanıcı adı zaten kullanılıyor' });
    }

    // Yeni kullanıcı oluştur
    const user = new User({
      username,
      email,
      password,
      name
    });

    await user.save();

    // JWT token oluştur
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Kullanıcı başarıyla oluşturuldu',
      token,
      user
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Giriş yap
const login = async (req, res) => {
  try {
    // Doğrulama hataları
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // E-posta ile kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }

    // Şifreyi kontrol et
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }

    // JWT token oluştur
    const token = generateToken(user._id);

    res.json({
      message: 'Giriş başarılı',
      token,
      user
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Kullanıcı bilgilerini getir
const getMe = async (req, res) => {
  try {
    // Kullanıcı bilgisi authenticate middleware'i tarafından eklendi
    const user = req.user;
    res.json(user);
  } catch (error) {
    console.error('Kullanıcı bilgisi alma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

module.exports = {
  register,
  login,
  getMe
}; 