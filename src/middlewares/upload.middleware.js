const multer = require('multer');
const path = require('path');

// Yüklenen dosyaların saklanacağı yer ve adlandırma kuralları
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    // Dosya adı: [timestamp]-[random-string].[uzantı]
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(file.originalname);
    cb(null, uniqueSuffix + fileExt);
  }
});

// Dosya filtreleme (sadece görüntü dosyalarına izin ver)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Geçersiz dosya türü. Sadece JPEG, PNG, GIF ve WEBP dosyaları kabul edilir.'), false);
  }
};

// Multer yapılandırması
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Tweet resmi yükleme (en fazla 4 resim)
const uploadTweetImages = upload.array('images', 4);

// Profil resmi yükleme (tek resim)
const uploadProfilePicture = upload.single('profilePicture');

// Kapak resmi yükleme (tek resim)
const uploadCoverPicture = upload.single('coverPicture');

// Hata işleme middleware'i
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Dosya boyutu çok büyük. En fazla 5MB olabilir.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Çok fazla dosya. En fazla 4 dosya yükleyebilirsiniz.' });
    }
    return res.status(400).json({ message: `Yükleme hatası: ${err.message}` });
  }
  
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  
  next();
};

module.exports = {
  uploadTweetImages,
  uploadProfilePicture,
  uploadCoverPicture,
  handleUploadError
}; 