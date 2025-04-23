# Twitter Clone API

Bu proje, Twitter benzeri bir sosyal medya platformunun backend API'sini içermektedir. Node.js, Express.js ve MongoDB Atlas kullanılarak geliştirilmiştir.

## Özellikler

- Kullanıcı yönetimi (kayıt, giriş, profil güncelleme)
- Tweet oluşturma, silme, listeleme
- Tweet beğenme, retweet etme, kaydetme
- Kullanıcı takip etme/takipten çıkma
- Resim yükleme (profil, kapak, tweet resimleri)
- Hashtag ve trend özelliği
- Arama (kullanıcı ve tweet)
- Merkezi hata yönetimi

## Başlangıç

### Gereksinimler

- Node.js (v14 veya üzeri)
- MongoDB Atlas hesabı
- Docker ve Docker Compose (opsiyonel)

### Kurulum

1. Repoyu klonlayın
```bash
git clone https://github.com/kullanici-adi/twitter-clone-api.git
cd twitter-clone-api
```

2. Bağımlılıkları yükleyin
```bash
npm install
```

3. `.env` dosyasını oluşturun (örnek olarak env.example dosyasını kullanabilirsiniz)
```
PORT=5000
# Yerel geliştirme için
MONGODB_URI=mongodb://localhost:27017/twitter-clone
# Üretim ortamı için kendi MongoDB Atlas bağlantı bilgilerinizi kullanın
# MONGODB_URI=mongodb+srv://kullanici:sifre@cluster.mongodb.net/veritabani-ismi
JWT_SECRET=guclu_bir_sifre_kullanin
NODE_ENV=development
```

4. Uygulamayı başlatın
```bash
npm run dev  # Geliştirme ortamı için
npm start    # Prodüksiyon ortamı için
```

### Docker ile Çalıştırma

Alternatif olarak, Docker ve Docker Compose kullanarak uygulamayı çalıştırabilirsiniz:

1. env.example dosyasını .env olarak kopyalayın veya kendi .env dosyanızı oluşturun:
```bash
cp env.example .env
```

2. Docker Compose ile uygulamayı başlatın:
```bash
docker-compose up
```

Bu komut, hem API uygulamasını hem de MongoDB veritabanını içeren konteynerları başlatacaktır.
API'ye http://localhost:3000 üzerinden erişebilirsiniz.

> Not: Docker Compose ile çalıştırıldığında, `.env` dosyasındaki ortam değişkenleri kullanılır. Eğer farklı bir MongoDB bağlantısı kullanmak isterseniz, `.env` dosyasında `MONGODB_URI` değişkenini değiştirin. Örneğin, MongoDB Atlas kullanmak için kendi bağlantı bilgilerinizi ekleyin.

## API Endpointleri

### Kimlik Doğrulama

- `POST /api/auth/register` - Kayıt ol
- `POST /api/auth/login` - Giriş yap
- `GET /api/auth/me` - Mevcut kullanıcı bilgilerini getir

### Kullanıcı İşlemleri

- `GET /api/users/profile/:username` - Kullanıcı profilini getir
- `POST /api/users/follow/:id` - Kullanıcıyı takip et/takipten çık
- `PUT /api/users/update` - Profil bilgilerini güncelle
- `PUT /api/users/update/profile-picture` - Profil fotoğrafını güncelle
- `PUT /api/users/update/cover-picture` - Kapak fotoğrafını güncelle
- `GET /api/users/followers/:id` - Takipçileri getir
- `GET /api/users/following/:id` - Takip edilenleri getir
- `GET /api/users/search` - Kullanıcı ara

### Tweet İşlemleri

- `POST /api/tweets` - Tweet oluştur
- `DELETE /api/tweets/:id` - Tweet sil
- `GET /api/tweets` - Tweet listesi getir
- `GET /api/tweets/:id` - Tek tweet getir
- `POST /api/tweets/like/:id` - Tweet beğen/beğenisini kaldır
- `POST /api/tweets/retweet/:id` - Tweet retweet et/retweet kaldır
- `POST /api/tweets/bookmark/:id` - Tweet kaydet/kaydı kaldır
- `GET /api/tweets/bookmarks/all` - Kaydedilen tweetleri getir

### Hashtag İşlemleri

- `GET /api/hashtags/tag/:tag` - Belirli bir hashtag ile tweet'leri getir
- `GET /api/hashtags/trends` - Trend olan hashtag'leri getir

## Proje Yapısı

```
twitter-clone-api/
├── node_modules/
├── src/
│   ├── controllers/     # İş mantığını içeren controller'lar
│   ├── middlewares/     # Ara yazılımlar
│   ├── models/          # Veritabanı modelleri
│   ├── routes/          # API rotaları
│   ├── utils/           # Yardımcı fonksiyonlar ve sınıflar
│   └── index.js         # Ana uygulama dosyası
├── uploads/             # Yüklenen medya dosyaları
├── .env                 # Ortam değişkenleri
├── env.example          # Örnek ortam değişkenleri
├── .gitignore           # Git tarafından yok sayılacak dosyalar
├── Dockerfile           # Docker imajı yapılandırması
├── docker-compose.yml   # Docker Compose yapılandırması
├── package.json         # Proje bağımlılıkları
└── README.md            # Proje dokümantasyonu
```

## Dağıtım

Bu API, Render.com üzerinde dağıtılabilir. Bunun için:

1. Render.com'da hesap oluşturun
2. Yeni bir Web Service ekleyin
3. GitHub reposuna bağlanın
4. Dağıtım ayarlarını yapılandırın:
   - Environment: Docker
   - Build Command: `docker build -t twitter-clone-api .`
   - Start Command: `node src/index.js`
   - Ortam değişkenlerini ekleyin:
     - `MONGODB_URI`: MongoDB Atlas bağlantı dizeniz
     - `JWT_SECRET`: JWT token'lar için güvenli bir anahtar
     - `NODE_ENV`: production
     - `PORT`: Render.com tarafından sağlanan port

> Önemli: Hassas bilgilerinizi (MongoDB kullanıcı adı/şifre, JWT anahtarınız) güvende tutmak için bu değerleri daima Render.com'un ortam değişkenleri bölümünden ayarlayın, asla GitHub'a yüklemeyin.

## Teknolojiler

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT (JSON Web Tokens)
- Bcrypt
- Multer (Dosya yükleme)
- Express Validator

## İleri Düzey Özellikler

1. **Bildirim Sistemi**: Kullanıcılar takip edildiğinde, tweetleri beğenildiğinde veya retweet edildiğinde bildirim alabilir.
2. **Kullanıcı Engelleme**: Kullanıcılar diğer kullanıcıları engelleyebilir.
3. **Anket Oluşturma**: Kullanıcılar tweetlerine anket ekleyebilir.
4. **Mesajlaşma Özelliği**: Kullanıcılar arasında özel mesajlaşma sistemi eklenebilir.
5. **Video Yükleme Desteği**: Tweet'lere video yükleme özelliği eklenebilir.

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır - ayrıntılar için [LICENSE](LICENSE) dosyasına bakın. 