const Tweet = require('../models/tweet.model');

// Hashtag ile tweet'leri ara
const searchByHashtag = async (req, res) => {
  try {
    const { tag } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    if (!tag) {
      return res.status(400).json({ message: 'Hashtag parametresi gerekli' });
    }

    // Hashtag'i içeren tweet'leri bul
    const tweets = await Tweet.find({ hashtags: tag.toLowerCase() })
      .populate('user', 'name username profilePicture')
      .populate('replyTo', 'content user')
      .populate('retweetData', 'content user')
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    // Tweet sayısını öğren
    const total = await Tweet.countDocuments({ hashtags: tag.toLowerCase() });

    res.json({
      tag,
      tweets,
      total,
      hasMore: total > Number(skip) + tweets.length
    });
  } catch (error) {
    console.error('Hashtag arama hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Trend olan hashtag'leri getir
const getTrendingHashtags = async (req, res) => {
  try {
    const { days = 1, limit = 10 } = req.query;

    // Son n gün içindeki tweet'leri bul
    const date = new Date();
    date.setDate(date.getDate() - Number(days));

    // Hashtag'leri sayılarına göre grupla
    const result = await Tweet.aggregate([
      { 
        $match: { 
          createdAt: { $gte: date },
          hashtags: { $exists: true, $ne: [] }
        } 
      },
      { $unwind: '$hashtags' },
      { 
        $group: { 
          _id: '$hashtags', 
          count: { $sum: 1 },
          tweets: { $push: '$_id' }
        } 
      },
      { $sort: { count: -1 } },
      { $limit: Number(limit) },
      { 
        $project: { 
          _id: 0,
          tag: '$_id',
          count: 1,
          tweets: { $slice: ['$tweets', 0, 3] } // En fazla 3 örnek tweet ID'si
        } 
      }
    ]);

    res.json({ 
      trends: result,
      period: `Son ${days} gün`
    });
  } catch (error) {
    console.error('Trend getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

module.exports = {
  searchByHashtag,
  getTrendingHashtags
}; 