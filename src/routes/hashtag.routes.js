const express = require('express');
const hashtagController = require('../controllers/hashtag.controller');

const router = express.Router();

// Hashtag ile tweet'leri ara
router.get('/tag/:tag', hashtagController.searchByHashtag);

// Trend olan hashtag'leri getir
router.get('/trends', hashtagController.getTrendingHashtags);

module.exports = router; 