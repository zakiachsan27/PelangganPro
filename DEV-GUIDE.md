# PelangganPro Development Guide

## Prerequisites

- Node.js 18+
- npm or pnpm
- Chrome browser (for extension testing)

## Port Usage

| Port | Service |
|------|---------|
| 3000 | Next.js Dashboard |

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. Run Dashboard (Port 3000)

```bash
npm run dev
```

Dashboard akan tersedia di: http://localhost:3000

### 4. Build & Run Extension

```bash
cd extension
npm install
npm run build
```

Lalu load extension di Chrome:
1. Buka `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Pilih folder `extension/dist`

## Troubleshooting

### Port 3000 sudah digunakan

```bash
# Kill proses di port 3000
npm run kill

# Atau manual
npx kill-port 3000
```

### Cache issue

```bash
npm run clean
npm install
npm run dev
```

### Extension tidak update

1. Rebuild: `cd extension && npm run build`
2. Klik reload icon di chrome://extensions/

## Development Workflow

1. **Dashboard**: `npm run dev` (terminal 1)
2. **Extension**: Edit file, `npm run build`, reload di Chrome
3. **Supabase**: Pastikan service running dan RLS policies sudah di-setup

## Project Structure

```
pelangganpro/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React Components
│   ├── lib/              # Utilities
│   └── types/            # TypeScript types
├── extension/            # Chrome Extension
│   ├── src/
│   └── dist/             # Build output
└── public/               # Static assets
```

## Notes

- Jangan jalankan multiple instance Next.js (akan conflict port 3000)
- Extension menggunakan Preact untuk ukuran kecil
- WhatsApp Web integration ada di extension content script
