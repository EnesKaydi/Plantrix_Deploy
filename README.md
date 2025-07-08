# To-Do Web App 1.0

Hiyerarşik yapıda organize edilebilen, interaktif to-do yönetim web uygulaması.

## 🚀 Özellikler

- ✅ **Hiyerarşik Görev Yapısı**: Çok seviyeli görev organizasyonu
- 🎯 **Drag & Drop**: Görevleri sürükle-bırak ile taşıma
- ✔️ **Tamamlama Durumu**: Sağ tık ile görev tamamlama
- 📝 **Rich Text Editor**: Metin ve resim ekleme
- 🖨️ **Yazdırma**: Görev içeriğini yazdırma
- 💾 **Otomatik Kaydetme**: Real-time içerik kaydetme
- 📱 **Responsive Design**: Mobil uyumlu tasarım

## 🛠 Teknolojiler

- **Frontend**: Next.js 14 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**: Radix UI
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React

## 📋 Kurulum

1. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

2. **Geliştirme sunucusunu başlatın:**
   ```bash
   npm run dev
   ```

3. **Tarayıcıda açın:**
   ```
   http://localhost:3000
   ```

## 🎨 Kullanım

### Görev Ekleme
- **Sayfa Ekle**: Yeni ana başlık oluşturma
- **Alt Sayfa Ekle**: Seçili görevin altına alt başlık ekleme

### Görev Yönetimi
- **Tıklama**: Görev seçimi
- **Sağ Tık**: Tamamlama durumu değiştirme
- **Drag & Drop**: Görev taşıma

### İçerik Düzenleme
- **Metin**: Otomatik kaydedilen metin editörü
- **Resim**: Drag & drop ile resim yükleme
- **Yazdırma**: Seçili görevin içeriğini yazdırma

## 📁 Proje Yapısı

```
src/
├── app/                 # Next.js App Router
├── components/          # React bileşenleri
├── lib/                 # Utility fonksiyonları
├── store/               # Zustand state management
├── styles/              # CSS stilleri
└── types/               # TypeScript type tanımları
```

## 🎯 Özellik Detayları

### Hiyerarşi Yapısı
- **Level 1**: Ana başlıklar (*)
- **Level 2**: Alt başlıklar (**)
- **Level 3**: İkinci derece alt başlıklar (***)
- **Level N**: Sınırsız derinlik

### Görev Durumları
- 🔵 **Seçili**: Mavi vurgu
- 🟢 **Tamamlanan**: Yeşil çerçeve
- ⚪ **Normal**: Varsayılan görünüm

## 🚧 Gelecek Özellikler

- 🔐 Kullanıcı girişi
- 🗄️ Neon Database entegrasyonu
- 👥 Çoklu kullanıcı desteği
- 📊 İstatistikler ve raporlar
- 🔄 Real-time collaboration
- 📤 Export/Import

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**Geliştirici**: To-Do Web App 1.0 Team  
**Versiyon**: 1.0.0  
**Son Güncelleme**: 2024 