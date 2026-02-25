# PelangganPro Chrome Extension

Chrome Extension untuk integrasi WhatsApp Web dengan PelangganPro CRM.

## 🚀 Fitur

- **Sidebar CRM** di sebelah kanan WhatsApp Web
- **Lihat Data Kontak**: Nama, tags, informasi lengkap
- **Pipeline & Deal**: Stage aktif dan nilai deal
- **Catatan**: Tambah dan lihat 5 catatan terbaru
- **Ubah Stage**: Pindahkan deal ke stage lain
- **Assign Agent**: Tugaskan kontak ke sales/agent
- **Reminder**: Buat task/reminder untuk follow up

## 📁 Struktur Folder

```
extension/
├── src/
│   ├── background/          # Service worker
│   ├── content/             # Content script (injected ke WA Web)
│   │   ├── components/      # React/Preact components
│   │   ├── detectors/       # Phone detection logic
│   │   └── hooks/           # Custom hooks
│   ├── api/                 # API client
│   ├── storage/             # Chrome storage wrapper
│   ├── utils/               # Utilities
│   └── types/               # TypeScript types
├── dist/                    # Build output
├── manifest.json            # Extension manifest
└── popup.html               # Extension popup
```

## 🛠️ Development

### Install Dependencies

```bash
cd extension
npm install
```

### Build

```bash
# Production build
npm run build

# Watch mode (development)
npm run build:watch
```

### Load Extension di Chrome

1. Buka Chrome → `chrome://extensions/`
2. Aktifkan **Developer mode** (toggle di kanan atas)
3. Click **"Load unpacked"**
4. Pilih folder `extension/dist`
5. Extension akan muncul di toolbar

## 🔧 Konfigurasi

### Environment Variables

Extension menggunakan API endpoint dari CRM. Default: `http://localhost:3000`

Untuk production, ubah di `src/api/crm-client.ts`:

```typescript
private baseUrl = 'https://api.pelangganpro.com';
```

## 📡 API Endpoints

Extension menggunakan endpoint berikut:

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/extension/contact?phone={phone}` | GET | Ambil data kontak |
| `/api/extension/note` | POST | Tambah catatan |
| `/api/extension/stage` | PATCH | Update pipeline stage |
| `/api/extension/assign` | POST | Assign kontak ke agent |
| `/api/extension/reminder` | POST | Buat reminder/task |

## 🔐 Autentikasi

Extension mengambil auth token dari CRM Web App melalui `postMessage`. 

Flow:
1. User login ke CRM Web
2. CRM mengirim token ke Extension via `postMessage`
3. Extension menyimpan token di Chrome Storage
4. Extension menggunakan token untuk API calls

## 🐛 Debugging

### Content Script
1. Buka WhatsApp Web
2. Open DevTools (F12)
3. Pilih tab **Console**
4. Filter: `[PelangganPro]`

### Background Script
1. Buka `chrome://extensions/`
2. Find PelangganPro extension
3. Click **"service worker"** link
4. DevTools akan terbuka

### Extension Popup
1. Click icon extension di toolbar
2. Right-click → **Inspect** popup

## 📝 Release Checklist

- [ ] Update version di `manifest.json`
- [ ] Build production: `npm run build`
- [ ] Test di WhatsApp Web
- [ ] Test semua fitur (notes, stage, assign, reminder)
- [ ] Test autentikasi flow
- [ ] Package untuk Chrome Web Store

## 📦 Chrome Web Store

Untuk submit ke Chrome Web Store:

1. Build production: `npm run build`
2. Zip folder `dist/`
3. Upload ke [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
4. Isi detail: deskripsi, screenshots, icon
5. Submit for review

## 🤝 Contributing

1. Fork repository
2. Buat branch: `git checkout -b feature/nama-fitur`
3. Commit: `git commit -am 'Add fitur'`
4. Push: `git push origin feature/nama-fitur`
5. Buat Pull Request

## 📄 License

MIT License - PelangganPro Team
