# PelangganPro Chrome Extension - Status Report

## 📋 Overview
Project: Chrome Extension untuk integrasi WhatsApp Web dengan PelangganPro CRM
Tujuan: Menampilkan sidebar CRM di WhatsApp Web saat user membuka chat

---

## ✅ Yang Sudah Berhasil

### 1. Backend API (Next.js)
**File:** `src/app/api/extension/`
- `contact/route.ts` - GET /api/extension/contact?phone=628xxx
- `note/route.ts` - POST /api/extension/note
- `stage/route.ts` - PATCH /api/extension/stage
- `assign/route.ts` - POST /api/extension/assign
- `reminder/route.ts` - POST /api/extension/reminder
- `login/route.ts` - POST /api/extension/login (untuk extension auth)

### 2. Extension Structure
**Folder:** `extension/`
```
extension/
├── manifest.json (MV3)
├── popup.html + popup.tsx (Login UI)
├── src/
│   ├── background/background.ts (Service worker)
│   ├── content/
│   │   ├── content-script.tsx (Main injection)
│   │   ├── components/ (Sidebar, ContactCard, NotesList, dll)
│   │   └── detectors/chat-observer.ts (Phone detection)
│   ├── api/crm-client.ts (API calls)
│   ├── storage/auth-storage.ts (Chrome storage wrapper)
│   └── types/index.ts
```

### 3. CRM Integration
- Auth bridge component (sudah dihapus karena tidak reliable)
- Settings page untuk extension

---

## 🔴 Masalah Utama: Authentication Flow

### Arsitektur Target (sudah diimplementasi tapi TIDAK BERFUNGSI):

```
┌─────────────────────────────────────────────────────────────┐
│                     FLOW YANG DIINGINKAN                     │
└─────────────────────────────────────────────────────────────┘

1. User click icon extension di toolbar Chrome
   ↓
2. Popup muncul dengan form login
   ↓
3. User masukkan email & password
   ↓
4. Popup fetch ke POST /api/extension/login
   ↓
5. Backend return JWT token
   ↓
6. Popup simpan token ke chrome.storage.local (via background script)
   ↓
7. User buka WhatsApp Web
   ↓
8. Content script inject sidebar
   ↓
9. Content script ambil token dari chrome.storage.local
   ↓
10. Content script fetch API dengan Authorization: Bearer <token>
   ↓
11. Sidebar tampilkan data kontak
```

### Masalah yang Terjadi:

**Error:**
```
Uncaught TypeError: Cannot read properties of undefined (reading 'local')
```

**Lokasi:** `extension/src/storage/auth-storage.ts`

**Penyebab:** Content script di WhatsApp Web (web.whatsapp.com) tidak bisa akses `chrome.storage.local` meskipun sudah:
- Tambah permission "storage" di manifest
- Gunakan background script sebagai bridge
- Kirim message dari content script ke background

**Log yang muncul:**
```
[PelangganPro Sidebar] Auth check: Found    ← Token ada
GET http://localhost:3000/api/extension/contact?phone=628... 403 (Forbidden)   ← Tapi API reject
```

---

## 🔧 Code Penting

### 1. Manifest (MV3)
```json
{
  "manifest_version": 3,
  "permissions": ["storage", "activeTab"],
  "host_permissions": [
    "https://web.whatsapp.com/*",
    "http://localhost:3000/*"
  ],
  "background": { "service_worker": "background.js" },
  "content_scripts": [{
    "matches": ["https://web.whatsapp.com/*"],
    "js": ["content.js"],
    "run_at": "document_idle"
  }],
  "action": { "default_popup": "popup.html" }
}
```

### 2. Background Script
```typescript
const AUTH_KEY = 'pelangganpro_auth';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_AUTH') {
    chrome.storage.local.get(AUTH_KEY)
      .then((result) => sendResponse({ success: true, data: result[AUTH_KEY] }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // Async
  }
  // ... STORE_AUTH, CLEAR_AUTH
});
```

### 3. Auth Storage (Content Script)
```typescript
export const authStorage = {
  async getAuth(): Promise<AuthData | null> {
    const response = await chrome.runtime.sendMessage({ type: 'GET_AUTH' });
    // ERROR: chrome.runtime.sendMessage kadang tidak respond
    // atau chrome.storage tidak accessible
  }
};
```

### 4. API Client
```typescript
class CRMClient {
  private async getHeaders(): Promise<Record<string, string>> {
    const token = await authStorage.getValidToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
}
```

---

## ✅ Yang Sudah Dicoba (Tidak Berhasil)

1. **Direct chrome.storage.local access** dari content script → Undefined
2. **Background script bridge** → Message tidak terkirim/balasan tidak diterima
3. **chrome.storage.sync** → Sama saja
4. **Window.postMessage** dari CRM ke WhatsApp → Cross-origin blocked
5. **Cookies** → Extension tidak bisa akses cookies WhatsApp Web
6. **localStorage sharing** → Same-origin policy

---

## 🎯 Yang Dibutuhkan

Solusi authentication flow yang **reliable** antara:
- Extension Popup (tempat user login)
- Content Script (tempat sidebar di-render)

Tanpa menggunakan:
- postMessage cross-origin (tidak bisa)
- Cookies (tidak bisa)
- localStorage sharing (tidak bisa)

---

## 📁 File-file Penting

### Backend:
- `src/app/api/extension/contact/route.ts` - Get contact by phone
- `src/app/api/extension/login/route.ts` - Login untuk extension
- `src/middleware.ts` - CORS handling

### Extension:
- `extension/manifest.json`
- `extension/src/popup/popup.tsx` - Login UI
- `extension/src/content/content-script.tsx` - Main injection
- `extension/src/content/components/Sidebar.tsx` - Sidebar UI
- `extension/src/storage/auth-storage.ts` - Auth storage (PROBLEMATIC)
- `extension/src/api/crm-client.ts` - API client
- `extension/src/background/background.ts` - Service worker

---

## 🚀 Cara Test Saat Ini

1. Build extension:
   ```bash
   cd extension
   npm install
   npm run build
   ```

2. Load extension di Chrome:
   - chrome://extensions/
   - Developer mode ON
   - Load unpacked → pilih folder `extension/dist`

3. Jalankan CRM:
   ```bash
   npm run dev
   ```

4. Test:
   - Click icon PelangganPro di toolbar → Login
   - Buka WhatsApp Web
   - Click chat
   - Lihat error di console

---

## 💡 Alternatif Solusi (Belum Dicoba)

### 1. Bookmarklet Approach
User copy-paste JavaScript ke console WhatsApp Web:
```javascript
// Fetch dari CRM dengan token yang di-hardcode atau di-input manual
fetch('http://localhost:3000/api/extension/contact?phone=628...', {
  headers: { 'Authorization': 'Bearer TOKEN_DISINI' }
})
```

### 2. Tampermonkey/Userscript
Sama seperti bookmarklet tapi auto-run via Tampermonkey extension.

### 3. Simpler Auth Flow
- User login di CRM web (biasa)
- Generate "Extension Token" di dashboard
- User copy-paste token ke extension popup
- Extension simpan token dan pakai untuk API calls

---

**Status:** STUCK di authentication flow antara popup dan content script.
