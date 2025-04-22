const User = require('../models/user.model');
const Tweet = require('../models/tweet.model');
const { validationResult } = require('express-validator');

// Kullanıcı profil bilgilerini getir
const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    // Kullanıcıyı bul
    const user = await User.findOne({ username })
      .select('-password')
      .populate('followers', 'name username profilePicture')
      .populate('following', 'name username profilePicture');
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Kullanıcının tweet sayısını hesapla
    const tweetCount = await Tweet.countDocuments({ user: user._id });

    res.json({
      user,
      tweetCount
    });
  } catch (error) {
    console.error('Kullanıcı profili getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Kullanıcı takip et/takibi bırak
const followUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Kendisini takip etmeye çalışıyor mu?
    if (id === userId.toString()) {
      return res.status(400).json({ message: 'Kendinizi takip edemezsiniz' });
    }

    // Takip edilecek kullanıcıyı bul
    const userToFollow = await User.findById(id);
    
    if (!userToFollow) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Şu anki kullanıcıyı bul
    const currentUser = await User.findById(userId);

    // Zaten takip ediyor mu?
    const isFollowing = currentUser.following.includes(id);
    
    if (isFollowing) {
      // Takibi bırak
      await User.findByIdAndUpdate(userId, {
        $pull: { following: id }
      });
      
      await User.findByIdAndUpdate(id, {
        $pull: { followers: userId }
      });
      
      res.json({ message: 'Kullanıcı takibi bırakıldı' });
    } else {
      // Takip et
      await User.findByIdAndUpdate(userId, {
        $addToSet: { following: id }
      });
      
      await User.findByIdAndUpdate(id, {
        $addToSet: { followers: userId }
      });
      
      res.json({ message: 'Kullanıcı takip edildi' });
    }
  } catch (error) {
    console.error('Kullanıcı takip hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Kullanıcı profil güncelleme
const updateUserProfile = async (req, res) => {
  try {
    // Doğrulama hataları
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user._id;
    const { name, bio, location, website } = req.body;

    // Güncellenecek alanları belirle
    const updateData = {};
    
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;

    // Profil resmi güncelleme
    if (req.file && req.file.fieldname === 'profilePicture') {
      updateData.profilePicture = req.file.filename;
    }

    // Kapak resmi güncelleme
    if (req.file && req.file.fieldname === 'coverPicture') {
      updateData.coverPicture = req.file.filename;
    }

    // Kullanıcıyı güncelle
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profil başarıyla güncellendi',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Takipçi listesini getir
const getFollowers = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate('followers', 'name username profilePicture bio');
      
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    res.json({ followers: user.followers });
  } catch (error) {
    console.error('Takipçi getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Takip edilen kullanıcıları getir
const getFollowing = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate('following', 'name username profilePicture bio');
      
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    res.json({ following: user.following });
  } catch (error) {
    console.error('Takip edilenleri getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Kullanıcı arama
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Arama sorgusu gerekli' });
    }

    // Kullanıcıları ara (isim ve kullanıcı adına göre)
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } }
      ]
    })
    .select('name username profilePicture bio')
    .limit(20);

    res.json({ users });
  } catch (error) {
    console.error('Kullanıcı arama hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

module.exports = {
  getUserProfile,
  followUser,
  updateUserProfile,
  getFollowers,
  getFollowing,
  searchUsers
}; 