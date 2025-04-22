const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Kullanıcının kimliğini doğrulama
const authenticate = async (req, res, next) => {
  try {
    // Token'ı al
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Yetkilendirme gerekli' });
    }
    
    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Kullanıcıyı bul
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Request nesnesine kullanıcıyı ekle
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Geçersiz token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Oturum süresi doldu, lütfen tekrar giriş yapın' });
    }
    
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

module.exports = { authenticate }; 