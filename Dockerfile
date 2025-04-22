# Resmi Node.js imajını kullan
FROM node:18-alpine

# Çalışma dizini oluştur
WORKDIR /app

# package.json ve package-lock.json dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Uygulama kodunu kopyala
COPY . .

# uploads dizinini oluştur (eğer yoksa)
RUN mkdir -p uploads

# Uygulamanın çalışacağı portu belirt
EXPOSE 5000

# Uygulamayı başlat
CMD ["npm", "start"] 