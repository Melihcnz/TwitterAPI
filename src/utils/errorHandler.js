// Özel hata sınıfı
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Operasyonel hataları yakala (try-catch bloklarını kısaltmak için)
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Global hata işleyicisi
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Geliştirme ortamında detaylı hata
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } 
  // Prodüksiyon ortamında sadece gerekli bilgiler
  else {
    // Operasyonel hata ise kullanıcıya göster
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } 
    // Programatik hata ise genel mesaj göster
    else {
      console.error('HATA 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Bir şeyler yanlış gitti!'
      });
    }
  }
};

// MongoDB Hata İşleyicileri
const handleCastErrorDB = (err) => {
  const message = `Geçersiz ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `${value} değeri zaten kullanılıyor. Lütfen başka bir değer kullanın!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Geçersiz veri girişi. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Geçersiz token. Lütfen tekrar giriş yapın!', 401);

const handleJWTExpiredError = () => new AppError('Token süresi doldu. Lütfen tekrar giriş yapın!', 401);

module.exports = {
  AppError,
  catchAsync,
  globalErrorHandler,
  handleCastErrorDB,
  handleDuplicateFieldsDB,
  handleValidationErrorDB,
  handleJWTError,
  handleJWTExpiredError
}; 