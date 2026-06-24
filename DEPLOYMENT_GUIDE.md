# Deployment Guide - MartPOS

## 1. Deploy Database di Supabase

### Langkah-langkah:
1. Login ke [Supabase.com](https://supabase.com)
2. Klik "New Project"
3. Beri nama project: `martpos`
4. Pilih region yang terdekat dengan Anda
5. Set database password (catat password ini!)
6. Klik "Create new project"
7. Tunggu beberapa menit hingga project siap

### Setelah Database Dibuat:
1. Buka project Supabase yang baru dibuat
2. Masuk ke tab "Settings" → "Database"
3. Catat "Connection string" dan "Connection pooling"
4. Masuk ke tab "Project Settings" → "API"
5. Catat:
   - Project URL
   - anon key
   - service_role key

### Import Database Schema:
1. Buka Supabase SQL Editor
2. Klik "New Query"
3. Copy dan paste isi file `database_postgres.sql`
4. Klik "Run" untuk eksekusi schema
5. Semua tabel, views, triggers, dan sample data akan dibuat otomatis

---

## 2. Deploy Backend di Vercel

### Langkah-langkah:
1. Login ke [Vercel.com](https://vercel.com)
2. Klik "Add New Project"
3. Import repository GitHub martpos
4. Di "Root Directory", masukkan: `backend`
5. Klik "Configure"

### Konfigurasi Build:
- **Framework Preset**: Other
- **Build Command**: `npm install`
- **Output Directory**: `.` (root)
- **Install Command**: `npm install`

### Konfigurasi Environment Variables:
1. Scroll ke "Environment Variables"
2. Tambahkan variabel berikut (ambil dari Supabase):

```bash
DB_TYPE=postgres
DB_HOST=<host dari Supabase, contoh: db.xxx.supabase.co>
DB_USER=postgres
DB_PASSWORD=<password database Supabase>
DB_NAME=postgres
DB_PORT=5432
DB_SSL=true
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=<anon key dari Supabase>
SUPABASE_SERVICE_ROLE_KEY=<service_role key dari Supabase>
PORT=5000
NODE_ENV=production
```

3. Klik "Deploy"
4. Catat URL backend yang diberikan Vercel

---

## 3. Hubungkan Database

### Test Koneksi:
1. Setelah backend deploy, klik URL backend (contoh: `https://martpos-backend.vercel.app`)
2. Test endpoint: `https://your-backend-url.vercel.app/api/test`
3. Test database: `https://your-backend-url.vercel.app/api/db-test`

### Import Schema (Opsional):
Jika schema belum terimport:
1. Buka Supabase SQL Editor
2. Copy-paste isi file `database_postgres.sql`
3. Klik "Run" untuk eksekusi

---

## 4. Deploy Frontend ke Vercel

### Langkah-langkah:
1. Login ke [Vercel.com](https://vercel.com)
2. Klik "Add New Project"
3. Import repository GitHub martpos
4. Di "Root Directory", masukkan: `frontend`
5. Klik "Configure"

### Konfigurasi Build:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Environment Variables:
1. Scroll ke "Environment Variables"
2. Tambahkan:
```bash
VITE_API_URL=https://your-backend-url.vercel.app/api
```
3. Ganti `your-backend-url` dengan URL backend Vercel Anda

### Deploy:
1. Klik "Deploy"
2. Tunggu proses build selesai
3. Frontend akan live di URL Vercel

---

## 5. Verifikasi Deployment

### Test Backend:
```bash
curl https://your-backend-url.vercel.app/api/test
```

### Test Database:
```bash
curl https://your-backend-url.vercel.app/api/db-test
```

### Test Frontend:
1. Buka URL Vercel
2. Coba login dengan kredensial default:
   - Username: `admin`
   - Password: `admin` (hash di database)

---

## Troubleshooting

### Backend Gagal Connect ke Database:
- Pastikan environment variables sudah benar
- Cek connection string dari Supabase
- Pastikan DB_SSL=true untuk koneksi Supabase
- Restart backend service di Vercel

### Supabase Connection Issues:
- Pastikan password database benar
- Cek apakah project Supabase sudah aktif
- Gunakan connection string dengan SSL
- Pastikan IP address tidak diblokir (Supabase biasanya allow all)

### Schema Import Gagal:
- Gunakan file `database_postgres.sql` (bukan `database.sql`)
- Pastikan SQL Editor Supabase aktif
- Cek error message di SQL Editor
- Jalankan schema dalam beberapa bagian jika terlalu besar

### Frontend Tidak Bisa Akses API:
- Pastikan `VITE_API_URL` sudah di-set di Vercel
- Cek CORS configuration di backend
- Verify backend URL benar

### Database Schema Belum Terimport:
- Buka Supabase SQL Editor
- Copy-paste isi file `database_postgres.sql`
- Klik "Run" untuk eksekusi

---

## Catatan Penting

- Supabase menyediakan PostgreSQL dengan dashboard yang user-friendly
- Backend sudah mendukung PostgreSQL dengan library `pg`
- Vercel akan otomatis rebuild saat push ke GitHub
- Pastikan GitHub repo sudah terhubung ke Vercel
- URL backend Vercel bisa dilihat di dashboard Vercel
- Supabase menyediakan free tier dengan limit yang cukup untuk development

---

## Keuntungan Menggunakan Supabase

- **Free Tier**: 500MB database storage, 1GB bandwidth per bulan
- **Dashboard**: SQL Editor, table viewer, dan authentication built-in
- **Real-time**: WebSocket support untuk real-time features
- **API**: Otomatis generate REST API dan GraphQL
- **Security**: Row Level Security (RLS) untuk data protection
- **Easy Import**: SQL Editor untuk import schema dengan mudah
