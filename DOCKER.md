# Docker ile Twitter Clone API'sini Çalıştırma

Bu belge, Twitter Clone API uygulamasını Docker kullanarak nasıl çalıştıracağınızı açıklar.

## Gereksinimler

- [Docker](https://docs.docker.com/get-docker/) yüklü olmalı
- [Docker Compose](https://docs.docker.com/compose/install/) yüklü olmalı

## Docker Nedir ve Neden Kullanmalıyız?

Docker, uygulamaları konteynerlar içinde geliştirmenize, göndermenize ve çalıştırmanıza olanak tanıyan bir platformdur. Konteynerlar, uygulamanızı çalıştırmak için gereken her şeyi (kod, çalışma zamanı, sistem araçları, sistem kütüphaneleri vb.) içeren hafif, bağımsız ve yürütülebilir yazılım paketleridir.

### Avantajları:

1. **Tutarlılık**: Uygulamanız her ortamda (geliştirme, test, üretim) aynı şekilde çalışır.
2. **İzolasyon**: Her uygulama kendi konteynerında çalışır, böylece çakışmalar önlenir.
3. **Hızlı Dağıtım**: Uygulamanızı hızlıca farklı ortamlara dağıtabilirsiniz.
4. **Ölçeklenebilirlik**: Uygulamanızı kolayca ölçeklendirebilirsiniz.
5. **Sürüm Kontrolü**: Konteyner imajlarınızın farklı sürümlerini yönetebilirsiniz.

## Proje Yapısı

Projede Docker ile ilgili üç temel dosya bulunur:

1. **Dockerfile**: API uygulaması için konteyner imajını tanımlar.
2. **docker-compose.yml**: API ve MongoDB servislerinin nasıl çalıştırılacağını tanımlar.
3. **.dockerignore**: Docker imajına dahil edilmeyecek dosyaları belirtir.

## Uygulamayı Docker ile Çalıştırma

### 1. Tek Komutla Başlatma

Tüm servisleri (API ve MongoDB) tek bir komutla başlatabilirsiniz:

```bash
docker-compose up
```

Bu komut, hem API hem de MongoDB konteynerlarını başlatır. İlk kez çalıştırdığınızda, Docker gerekli imajları indirecek ve oluşturacaktır.

Arka planda çalıştırmak için:

```bash
docker-compose up -d
```

### 2. Logları Görüntüleme

Servis loglarını görüntülemek için:

```bash
docker-compose logs -f
```

Sadece API servisinin loglarını görmek için:

```bash
docker-compose logs -f app
```

### 3. Servisleri Durdurma

Servisleri durdurmak için:

```bash
docker-compose down
```

Veritabanı verilerini koruyarak durdurmak için:

```bash
docker-compose down --volumes
```

### 4. Yeniden Başlatma

Servisleri yeniden başlatmak için:

```bash
docker-compose restart
```

Sadece API servisini yeniden başlatmak için:

```bash
docker-compose restart app
```

## MongoDB Verileri

MongoDB verileri, `mongodb-data` adlı bir Docker volume'da saklanır. Bu, konteynerları durdurduğunuzda bile verilerin kalıcı olmasını sağlar.

## Uygulama Erişimi

Docker Compose ile çalıştırdığınızda, uygulamaya şu adresten erişebilirsiniz:

- API: http://localhost:5000
- MongoDB: mongodb://localhost:27017

## Ortam Değişkenleri

`docker-compose.yml` dosyasında tanımlanmış ortam değişkenleri:

- PORT=5000
- MONGODB_URI=mongodb://mongodb:27017/twitter-clone
- JWT_SECRET=your_jwt_secret_key
- NODE_ENV=production

Güvenlik için, JWT_SECRET değerini değiştirmeniz önerilir.

## Üretim Ortamına Dağıtım

Uygulamanızı üretim ortamına dağıtmak için:

1. Docker imajını oluşturun:
   ```bash
   docker-compose build
   ```

2. İmajı bir Docker registry'sine gönderin (örn. Docker Hub):
   ```bash
   docker tag twitter-clone-api:latest kullaniciadi/twitter-clone-api:latest
   docker push kullaniciadi/twitter-clone-api:latest
   ```

3. Üretim sunucunuzda `docker-compose.yml` dosyasını kullanarak uygulamayı başlatın.

## Sorun Giderme

### Bağlantı Sorunları

MongoDB'ye bağlanırken sorun yaşıyorsanız, şunları kontrol edin:

- `MONGODB_URI` doğru mu?
- MongoDB konteynerı çalışıyor mu? (`docker-compose ps` komutu ile kontrol edebilirsiniz)

### Konteyner Bilgileri

Çalışan konteynerları görüntülemek için:

```bash
docker-compose ps
```

### Konteyner İçine Girmek

API konteynerının içine bir terminal ile girmek için:

```bash
docker-compose exec app sh
```

MongoDB konteynerına girmek için:

```bash
docker-compose exec mongodb bash
``` 