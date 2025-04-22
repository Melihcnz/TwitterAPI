const express = require('express');
const { body } = require('express-validator');
const tweetController = require('../controllers/tweet.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { uploadTweetImages, handleUploadError } = require('../middlewares/upload.middleware');

const router = express.Router();

// Tweet oluştur
router.post(
  '/',
  authenticate,
  uploadTweetImages,
  handleUploadError,
  [
    body('content')
      .trim()
      .isLength({ min: 1, max: 280 })
      .withMessage('İçerik 1-280 karakter arası olmalıdır')
  ],
  tweetController.createTweet
);

// Tweet'leri getir
router.get('/', tweetController.getTweets);

// Kaydedilen tweet'leri getir
router.get('/bookmarks/all', authenticate, tweetController.getBookmarkedTweets);

// Tweet beğen
router.post('/like/:id', authenticate, tweetController.likeTweet);

// Tweet retweet
router.post('/retweet/:id', authenticate, tweetController.retweetTweet);

// Tweet kaydet
router.post('/bookmark/:id', authenticate, tweetController.bookmarkTweet);

// Tweet'i sil
router.delete('/:id', authenticate, tweetController.deleteTweet);

// Tek tweet getir
router.get('/:id', tweetController.getTweet);

module.exports = router; 