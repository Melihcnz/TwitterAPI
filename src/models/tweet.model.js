const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      maxlength: 280,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    images: [
      {
        type: String
      }
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    retweets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet'
      }
    ],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tweet',
      default: null
    },
    retweetData: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tweet',
      default: null
    },
    isRetweet: {
      type: Boolean,
      default: false
    },
    isReply: {
      type: Boolean,
      default: false
    },
    hashtags: [
      {
        type: String,
        trim: true
      }
    ]
  },
  { timestamps: true }
);

// Tweet oluşturulduğunda hashtag'leri ayıklayan middleware
tweetSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    // Hashtag'leri ayıkla (#kelime)
    const hashtagRegex = /#(\w+)/g;
    const hashtags = [];
    let match;
    
    while ((match = hashtagRegex.exec(this.content)) !== null) {
      hashtags.push(match[1].toLowerCase());
    }
    
    // Benzersiz hashtag'leri sakla
    this.hashtags = [...new Set(hashtags)];
  }
  
  next();
});

const Tweet = mongoose.model('Tweet', tweetSchema);

module.exports = Tweet; 