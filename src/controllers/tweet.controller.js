const Tweet = require('../models/tweet.model');
const User = require('../models/user.model');
const { validationResult } = require('express-validator');

// Tweet oluştur
const createTweet = async (req, res) => {
  try {
    // Doğrulama hataları
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, replyTo, retweetData } = req.body;
    const userId = req.user._id;

    // Tweet nesnesini oluştur
    const tweetData = {
      content,
      user: userId,
    };

    // Resim yüklendi mi?
    if (req.files && req.files.length > 0) {
      tweetData.images = req.files.map(file => file.filename);
    }

    // Yanıt tweet'i mi?
    if (replyTo) {
      const originalTweet = await Tweet.findById(replyTo);
      if (!originalTweet) {
        return res.status(404).json({ message: 'Yanıtlamak istediğiniz tweet bulunamadı' });
      }
      
      tweetData.replyTo = replyTo;
      tweetData.isReply = true;
    }

    // Retweet mi?
    if (retweetData) {
      const originalTweet = await Tweet.findById(retweetData);
      if (!originalTweet) {
        return res.status(404).json({ message: 'Retweet etmek istediğiniz tweet bulunamadı' });
      }
      
      tweetData.retweetData = retweetData;
      tweetData.isRetweet = true;
    }

    // Tweet'i kaydet
    const tweet = new Tweet(tweetData);
    await tweet.save();

    // Tweet'i kullanıcı bilgisiyle doldurup döndür
    const populatedTweet = await Tweet.findById(tweet._id)
      .populate('user', 'name username profilePicture')
      .populate('replyTo', 'content user')
      .populate('retweetData', 'content user');

    // Yanıt ise orijinal tweet'in replies alanına ekle
    if (replyTo) {
      await Tweet.findByIdAndUpdate(replyTo, {
        $push: { replies: tweet._id }
      });
    }

    res.status(201).json({
      message: 'Tweet başarıyla oluşturuldu',
      tweet: populatedTweet
    });
  } catch (error) {
    console.error('Tweet oluşturma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Tweet'i sil
const deleteTweet = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Tweet'i bul
    const tweet = await Tweet.findById(id);
    
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet bulunamadı' });
    }

    // Tweet'in sahibi mi kontrol et
    if (tweet.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Bu tweet\'i silme yetkiniz yok' });
    }

    // Yanıt ise, orijinal tweet'ten kaldır
    if (tweet.replyTo) {
      await Tweet.findByIdAndUpdate(tweet.replyTo, {
        $pull: { replies: tweet._id }
      });
    }

    // Tweet'i sil
    await Tweet.findByIdAndDelete(id);

    res.json({ message: 'Tweet başarıyla silindi' });
  } catch (error) {
    console.error('Tweet silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Tweet'leri getir
const getTweets = async (req, res) => {
  try {
    const { limit = 20, skip = 0, userId, following } = req.query;

    let query = {};

    // Belirli bir kullanıcının tweet'lerini getir
    if (userId) {
      query.user = userId;
    }

    // Takip edilen kullanıcıların tweet'lerini getir
    if (following === 'true' && req.user) {
      const user = await User.findById(req.user._id);
      query.user = { $in: [...user.following, req.user._id] };
    }

    // Tweet'leri getir ve doldur
    const tweets = await Tweet.find(query)
      .populate('user', 'name username profilePicture')
      .populate('replyTo', 'content user')
      .populate('retweetData', 'content user')
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    // Tweet sayısını öğren
    const total = await Tweet.countDocuments(query);

    res.json({
      tweets,
      total,
      hasMore: total > Number(skip) + tweets.length
    });
  } catch (error) {
    console.error('Tweet getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Tek tweet getir
const getTweet = async (req, res) => {
  try {
    const { id } = req.params;

    // Tweet'i bul ve doldur
    const tweet = await Tweet.findById(id)
      .populate('user', 'name username profilePicture bio')
      .populate({
        path: 'replyTo',
        populate: { path: 'user', select: 'name username profilePicture' }
      })
      .populate({
        path: 'retweetData',
        populate: { path: 'user', select: 'name username profilePicture' }
      });
    
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet bulunamadı' });
    }

    // Tweet'in yanıtlarını getir
    const replies = await Tweet.find({ replyTo: id })
      .populate('user', 'name username profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      tweet,
      replies
    });
  } catch (error) {
    console.error('Tweet getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Tweet beğen
const likeTweet = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Tweet'i bul
    const tweet = await Tweet.findById(id);
    
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet bulunamadı' });
    }

    const isLiked = tweet.likes.includes(userId);
    const option = isLiked ? '$pull' : '$addToSet';

    // Tweet'i güncelle
    const updatedTweet = await Tweet.findByIdAndUpdate(
      id,
      { [option]: { likes: userId } },
      { new: true }
    ).populate('user', 'name username profilePicture');

    res.json({
      message: isLiked ? 'Tweet beğenisi kaldırıldı' : 'Tweet beğenildi',
      tweet: updatedTweet
    });
  } catch (error) {
    console.error('Tweet beğenme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Tweet retweet
const retweetTweet = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { quoteContent } = req.body; // Quote tweet için içerik

    // Tweet'i bul
    const originalTweet = await Tweet.findById(id);
    
    if (!originalTweet) {
      return res.status(404).json({ message: 'Tweet bulunamadı' });
    }

    // Kullanıcı daha önce retweet yapmış mı?
    const isRetweeted = originalTweet.retweets.includes(userId);
    
    if (isRetweeted) {
      // Retweet'i kaldır
      await Tweet.findByIdAndUpdate(
        id,
        { $pull: { retweets: userId } },
        { new: true }
      );

      // Kullanıcının yaptığı retweet'i bul ve sil
      await Tweet.findOneAndDelete({
        user: userId,
        retweetData: id,
        isRetweet: true
      });

      return res.json({
        message: 'Retweet kaldırıldı',
        tweet: originalTweet
      });
    }

    // Yeni retweet tweet'i oluştur
    const retweetData = {
      user: userId,
      retweetData: id,
      isRetweet: true,
      content: quoteContent || originalTweet.content // Quote varsa quote'u, yoksa orijinal içeriği kullan
    };

    const retweet = new Tweet(retweetData);
    await retweet.save();

    // Orijinal tweet'e retweet'i ekle
    await Tweet.findByIdAndUpdate(
      id,
      { $addToSet: { retweets: userId } },
      { new: true }
    );

    // Retweet'i populate edip döndür
    const populatedRetweet = await Tweet.findById(retweet._id)
      .populate('user', 'name username profilePicture')
      .populate({
        path: 'retweetData',
        populate: {
          path: 'user',
          select: 'name username profilePicture'
        }
      });

    res.json({
      message: quoteContent ? 'Quote tweet oluşturuldu' : 'Tweet retweetlendi',
      tweet: populatedRetweet
    });

  } catch (error) {
    console.error('Retweet hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Tweet kaydet
const bookmarkTweet = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Tweet'i bul
    const tweet = await Tweet.findById(id);
    
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet bulunamadı' });
    }

    const isBookmarked = tweet.bookmarks.includes(userId);
    const option = isBookmarked ? '$pull' : '$addToSet';

    // Tweet'i güncelle
    const updatedTweet = await Tweet.findByIdAndUpdate(
      id,
      { [option]: { bookmarks: userId } },
      { new: true }
    );

    res.json({
      message: isBookmarked ? 'Tweet kaydı kaldırıldı' : 'Tweet kaydedildi',
      isBookmarked: !isBookmarked
    });
  } catch (error) {
    console.error('Tweet kaydetme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Kaydedilen tweet'leri getir
const getBookmarkedTweets = async (req, res) => {
  try {
    const userId = req.user._id;

    // Kullanıcının kaydettiği tweet'leri getir
    const tweets = await Tweet.find({ bookmarks: userId })
      .populate('user', 'name username profilePicture')
      .populate('replyTo', 'content user')
      .populate('retweetData', 'content user')
      .sort({ createdAt: -1 });

    res.json({ tweets });
  } catch (error) {
    console.error('Kaydedilen tweet getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

module.exports = {
  createTweet,
  deleteTweet,
  getTweets,
  getTweet,
  likeTweet,
  retweetTweet,
  bookmarkTweet,
  getBookmarkedTweets
}; 