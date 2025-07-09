# To-Do Web App 1.0 - Ürün Gereksinimleri Dökümanı (PRD)

## 🎯 Proje Özeti
Hiyerarşik yapıda organize edilebilen, interaktif to-do yönetim web uygulaması. Kullanıcılar çok seviyeli görev listeleri oluşturabilir, içerik ekleyebilir ve görevlerini esnek bir şekilde yönetebilir.

## 🛠 Teknik Gereksinimler

### Temel Teknolojiler
- **Frontend**: Next.js 14+ with TypeScript
- **Database**: Neon Database (PostgreSQL)
- **Styling**: Tailwind CSS
- **State Management**: Zustand veya React Context
- **UI Components**: Radix UI veya Shadcn/ui
- **Drag & Drop**: @dnd-kit/core
- **File Upload**: Next.js built-in file upload

### Geliştirme Ortamı
- **IDE**: WebStorm
- **OS**: macOS
- **Package Manager**: npm/yarn

## 🎨 UI/UX Gereksinimleri

### Layout Yapısı
```
┌─────────────────────────────────────────────────────────┐
│                    Header                               │
├───────────────────┬─────────────────────────────────────┤
│                   │                                     │
│   Sol Panel       │        Sağ Panel                   │
│   (30% width)     │        (70% width)                 │
│                   │                                     │
│   📝 Görev        │   📄 İçerik Editörü               │
│   Hiyerarşisi     │                                     │
│                   │   🔧 Araç Çubuğu                  │
│                   │   📝 Metin/Resim Alanı            │
│                   │                                     │
└───────────────────┴─────────────────────────────────────┘
```

## 🔧 Fonksiyonel Gereksinimler

### 1. Sol Panel - Görev Hiyerarşisi

#### 1.1 Hiyerarşik Yapı
- **Başlık** (Level 1)
  - **Alt Başlık** (Level 2)
    - **İkinci Derece Alt Başlık** (Level 3 **Üçüncü Derece Alt Başlık** (Level 4)
        - ... (sınırsız derinlik)

#### 1.2 Görev İşlemleri
- ✅ **Görev Ekleme**: Her seviyede yeni görev/başlık ekleme
- 🗑️ **Görev Silme**: Herhangi bir görevi silme (alt görevler ile birlikte)
- 📝 **Görev Düzenleme**: Başlık metni düzenleme
- 🎯 **Görev Seçme**: Tıklayarak görev seçimi
- ✔️ **Tamamlama İşaretleme**: Sağ tık menüsü ile tamamlandı işaretleme

#### 1.3 Drag & Drop Özelliği
- 📍 **Taşıma**: Görevleri farklı seviyeler arasında taşıma
- 🔄 **Yeniden Sıralama**: Aynı seviyedeki görevleri sıralama
- 📂 **Hiyerarşi Değişikliği**: Görevleri farklı ebeveyn görevlerin altına taşıma

#### 1.4 Görsel Geri Bildirim
- 🟢 **Tamamlanan Görevler**: Yeşil çerçeve/arka plan
- 🔵 **Seçili Görev**: Mavi vurgu
- 👆 **Hover Efekti**: Üzerine gelme animasyonu

### 2. Sağ Panel - İçerik Editörü

#### 2.1 Araç Çubuğu (Üst Kısım)
```
[📄 Sayfa Ekle] [➕ Alt Sayfa Ekle] [🗑️ Sil] [🖨️ Yazdır]
```

**İkon İşlevleri:**
1. **📄 Sayfa Ekle**: Yeni ana başlık oluşturma (Level 1)
2. **➕ Alt Sayfa Ekle**: Seçili görevin altına alt başlık ekleme
3. **🗑️ Sil**: Seçili görevi ve alt görevlerini silme
4. **🖨️ Yazdır**: Seçili görevin içeriğini yazdırma

#### 2.2 İçerik Editörü
- **📝 Rich Text Editor**: Metin formatlama özellikleri
- **🖼️ Resim Upload**: Drag & drop ile resim yükleme
- **💾 Otomatik Kaydetme**: Real-time kaydetme
- **📱 Responsive Design**: Mobil uyumlu tasarım

## 🗄️ Database Schema

### Tables

#### 1. tasks
```sql
id: UUID (Primary Key)
title: VARCHAR(255) NOT NULL
content: TEXT
parent_id: UUID (Foreign Key - self reference)
level: INTEGER NOT NULL
order_index: INTEGER NOT NULL
is_completed: BOOLEAN DEFAULT FALSE
created_at: TIMESTAMP DEFAULT NOW()
updated_at: TIMESTAMP DEFAULT NOW()
user_id: UUID (Foreign Key - future feature)
```

#### 2. task_attachments
```sql
id: UUID (Primary Key)
task_id: UUID (Foreign Key)
file_name: VARCHAR(255)
file_path: VARCHAR(500)
file_type: VARCHAR(50)
file_size: INTEGER
created_at: TIMESTAMP DEFAULT NOW()
```

## 🎨 UI Bileşenleri

### 1. Sol Panel Bileşenleri
- `TaskTreeView`: Ana hiyerarşi bileşeni
- `TaskNode`: Tekil görev bileşeni
- `TaskNodeActions`: Sağ tık menüsü
- `DragDropProvider`: Drag & drop wrapper

### 2. Sağ Panel Bileşenleri
- `TaskEditor`: İçerik editörü container
- `ToolBar`: Üst araç çubuğu
- `RichTextEditor`: Metin editörü
- `ImageUploader`: Resim yükleme bileşeni
- `PrintView`: Yazdırma önizleme

### 3. Ortak Bileşenler
- `Layout`: Ana sayfa layout'u
- `ContextMenu`: Sağ tık menüsü
- `Modal`: Dialog bileşenleri
- `LoadingSpinner`: Yükleme animasyonu

## 🔒 Güvenlik Gereksinimleri

- ✅ SQL Injection koruması (Prepared Statements)
- ✅ File upload güvenliği (dosya türü kontrolü)
- ✅ XSS koruması (input sanitization)
- ✅ CSRF koruması
- ✅ Rate limiting (API endpoint'leri için)

## 📱 Responsive Design

- **Desktop**: ≥ 1024px - Tam özellik seti
- **Tablet**: 768px - 1023px - Collapsible sol panel
- **Mobile**: < 768px - Tab-based navigation

## 🚀 Performans Gereksinimleri

- ⚡ İlk sayfa yükleme: < 3 saniye
- 🔄 Görev işlemleri: < 500ms
- 💾 Otomatik kaydetme: 2 saniye delay
- 📊 Görev sayısı limiti: 10,000 görev/kullanıcı

## 🧪 Test Gereksinimleri

### Unit Tests
- Görev CRUD işlemleri
- Drag & drop functionality
- Hiyerarşi mantığı

### Integration Tests
- Database işlemleri
- File upload process
- Print functionality

### E2E Tests
- Tam kullanıcı workflow'u
- Cross-browser compatibility

## 📋 Geliştirme Aşamaları

### Phase 1: Temel Yapı (1-2 hafta)
- [ ] Next.js + TypeScript kurulumu
- [ ] Neon Database bağlantısı
- [ ] Temel UI layout'u
- [ ] Task CRUD işlemleri

### Phase 2: Hiyerarşi ve Drag & Drop (1 hafta)
- [ ] Hierarchical task structure
- [ ] Drag & drop implementation
- [ ] Görev taşıma mantığı

### Phase 3: İçerik Editörü (1 hafta)
- [ ] Rich text editor entegrasyonu
- [ ] Image upload functionality
- [ ] Otomatik kaydetme

### Phase 4: Gelişmiş Özellikler (1 hafta)
- [ ] Print functionality
- [ ] Tamamlanma durumu yönetimi
- [ ] UI/UX iyileştirmeleri

### Phase 5: Test ve Optimizasyon (1 hafta)
- [ ] Test yazımı
- [ ] Performance optimizasyonu
- [ ] Bug fixes

## 🎯 Success Metrics

- ✅ Görev oluşturma/düzenleme başarı oranı: %99+
- ⚡ Ortalama görev işlem süresi: < 1 saniye
- 👥 Kullanıcı memnuniyeti: 4.5+/5
- 🐛 Critical bug sayısı: 0

## 📚 Future Features (v2.0)

- 🔐 Kullanıcı authentikasyonu
- 👥 Multi-user collaboration
- 📊 Analytics ve raporlama
- 📱 Mobile app
- 🔄 Real-time collaboration
- 🎨 Theme customization
- 📤 Export/Import functionality

## Tamamlananlar

- **Arayüz (UI/UX)**
  - Ana ekran, %30 sol panel (görev ağacı) ve %70 sağ panel (içerik) olarak bölünecektir.
  - Tasarım, modern ve kullanıcı dostu bir estetiğe sahip olacaktır.
- **Sol Panel - Görev Ağacı**
  - Kullanıcılar, sürükle-bırak yöntemiyle görevleri ve başlıkları yeniden sıralayabilir.
  - Sağ tık menüsü ile bir görevi "tamamlandı" olarak işaretleme. Tamamlanan görevler yeşil bir çerçeve ile belirtilir.
  - Sınırsız derinlikte alt başlık (nested tasks) oluşturulabilme.
- **Sağ Panel - Görev İçeriği**
  - Üst kısımda "Sayfa Ekle", "Alt Sayfa Ekle", "Sil" ve "Yazdır" butonları içeren bir araç çubuğu.
  - Seçili görevin içeriğini düzenlemek için bir metin editörü.
  - Görev içeriğine resim ekleme ve düzenleme imkanı (çoklu resim desteği dahil).
- **Modülerlik ve Genişletilebilirlik**
  - Gelecekte eklenebilecek yeni özellikler (örn. etiketleme, tarih atama) için genişletilebilir bir kod yapısı.
  - Bileşenlerin (sol panel, sağ panel, editör) kendi içlerinde kapalı ve yeniden kullanılabilir olması.

---

**Notlar:** Projenin başlangıç aşaması için veritabanı veya backend entegrasyonu olmayacaktır. Tüm veriler, tarayıcının local state'inde yönetilecektir.

---

**Son Güncelleme**: 2024
**Versiyon**: 1.0
**Durum**: Geliştirme Aşamasında 