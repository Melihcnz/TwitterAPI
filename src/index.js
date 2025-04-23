const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const { globalErrorHandler, AppError } = require('./utils/errorHandler');

// Ortam değişkenlerini yükle
dotenv.config();

// Route dosyaları
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const tweetRoutes = require('./routes/tweet.routes');
const hashtagRoutes = require('./routes/hashtag.routes');

// Express uygulamasını başlat
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware'ler
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// Geliştirme ortamında loglama
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Statik dosyalar için klasör
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tweets', tweetRoutes);
app.use('/api/hashtags', hashtagRoutes);

// Ana sayfa rotası
app.get('/', (req, res) => {
  res.json({ 
    message: 'Twitter Clone API çalışıyor!',
    env: {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT,
      mongoDbConnected: mongoose.connection.readyState === 1
    } 
  });
});

// Sağlık kontrolü endpoint'i
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'UP',
    timestamp: new Date(),
    mongoDbConnected: mongoose.connection.readyState === 1
  });
});

// 404 hatası için
app.all('*', (req, res, next) => {
  next(new AppError(`${req.originalUrl} yolu bulunamadı!`, 404));
});

// Global hata işleyici
app.use(globalErrorHandler);

// MongoDB bağlantısı
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Atlas\'a başarıyla bağlandı');
    
    // Sunucuyu başlat
    app.listen(PORT, () => {
      console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
    });
  })
  .catch((err) => {
    console.error('MongoDB bağlantı hatası:', err.message);
    process.exit(1);
  });

// Öngörülemeyen hataları yakala
process.on('unhandledRejection', (err) => {
  console.error('Yakalanmayan Promise hatası:', err);
  process.exit(1);
}); 