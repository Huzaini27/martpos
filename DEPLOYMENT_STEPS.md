# Deployment Steps - MartPOS

## Step 1: Setup Supabase Database

### 1.1 Buat Project Supabase
1. Buka [https://supabase.com](https://supabase.com)
2. Login dengan GitHub atau email
3. Klik "New Project"
4. Isi form:
   - **Name**: `martpos`
   - **Database Password**: Buat password yang kuat dan CATAT!
   - **Region**: Pilih region terdekat (Singapore untuk Indonesia)
5. Klik "Create new project"
6. Tunggu 2-3 menit hingga project siap

### 1.2 Import Database Schema
1. Buka project Supabase yang baru dibuat
2. Di sidebar kiri, klik "SQL Editor"
3. Klik "New Query"
4. Buka file `database_postgres.sql` dari project Anda
5. Copy seluruh isi file tersebut
6. Paste ke SQL Editor Supabase
7. Klik "Run" (atau tekan Ctrl+Enter)
8. Tunggu hingga semua tabel, views, dan triggers dibuat
9. Anda akan melihat pesan "Success" di bawah

### 1.3 Catat Kredensial Supabase
1. Di Supabase dashboard, klik "Settings" → "API"
2. Catat informasi berikut:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJ...`
   - **service_role key**: `eyJ...`
3. Klik "Settings" → "Database"
4. Catat:
   - **Connection string**: `postgresql://postgres.xxx:[password]@aws-xxx...`
   - **Host**: `db.xxx.supabase.co`
   - **Password**: (password yang Anda set saat buat project)

---

## Step 2: Deploy Backend ke Vercel

### 2.1 Import Repository ke Vercel
1. Buka [https://vercel.com](https://vercel.com)
2. Login dengan GitHub
3. Klik "Add New Project"
4. Pilih repository `Huzaini27/martpos`
5. Klik "Import"

### 2.2 Konfigurasi Backend
1. Di halaman konfigurasi project:
   - **Project Name**: `martpos-backend`
   - **Root Directory**: `backend`
   - **Framework Preset**: `Other`
   - **Build Command**: `npm install`
   - **Output Directory**: `.`
   - **Install Command**: `npm install`

### 2.3 Set Environment Variables
1. Scroll ke bagian "Environment Variables"
2. Klik "Add New" dan tambahkan variabel berikut:

```bash
DB_TYPE=postgres
DB_HOST=db.your-project.supabase.co
DB_USER=postgres.your-project
DB_PASSWORD=your-database-password
DB_NAME=postgres
DB_PORT=5432
DB_SSL=true
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=5000
NODE_ENV=production
```

3. Ganti nilai placeholder dengan kredensial dari Step 1.3
4. Klik "Add" untuk setiap variabel
5. Klik "Deploy"

### 2.4 Tunggu Deployment Selesai
1. Vercel akan build dan deploy backend
2. Tunggu 1-2 menit
3. Setelah selesai, catat URL backend:
   - Contoh: `https://martpos-backend.vercel.app`

---

## Step 3: Deploy Frontend ke Vercel

### 3.1 Import Repository untuk Frontend
1. Di Vercel dashboard, klik "Add New Project"
2. Pilih repository `Huzaini27/martpos` lagi
3. Klik "Import"

### 3.2 Konfigurasi Frontend
1. Di halaman konfigurasi:
   - **Project Name**: `martpos-frontend`
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 Set Environment Variables
1. Scroll ke "Environment Variables"
2. Tambahkan variabel:

```bash
VITE_API_URL=https://martpos-backend.vercel.app/api
```

3. Ganti `martpos-backend.vercel.app` dengan URL backend dari Step 2.4
4. Klik "Add"
5. Klik "Deploy"

### 3.4 Tunggu Deployment Selesai
1. Vercel akan build frontend React
2. Tunggu 1-2 menit
3. Setelah selesai, catat URL frontend

---

## Step 4: Verifikasi Deployment

### 4.1 Test Backend
1. Buka browser dan akses:
   - `https://martpos-backend.vercel.app/api/test`
2. Harus muncul: `{"message":"Backend berjalan"}`

### 4.2 Test Database Connection
1. Akses:
   - `https://martpos-backend.vercel.app/api/db-test`
2. Harus muncul pesan sukses dengan nama database

### 4.3 Test Frontend
1. Buka URL frontend Vercel
2. Coba login dengan kredensial default:
   - Username: `admin`
   - Password: `admin`

---

## Step 5: Troubleshooting

### Jika Backend Error
- Cek Vercel deployment logs untuk error message
- Pastikan environment variables benar
- Restart deployment di Vercel

### Jika Database Connection Gagal
- Pastikan DB_SSL=true
- Cek password database
- Pastikan project Supabase sudah aktif

### Jika Frontend Tidak Bisa Akses API
- Pastikan VITE_API_URL benar
- Cek CORS configuration di backend
- Test backend endpoint langsung

---

## Catatan Penting

- **Jangan commit kredensial asli ke GitHub**
- Gunakan environment variables di Vercel
- Supabase free tier: 500MB database, 1GB bandwidth/bulan
- Vercel free tier: unlimited deployments, 100GB bandwidth/bulan
- Kedua platform akan auto-rebuild saat push ke GitHub

---

## Next Steps Setelah Deployment

1. Ganti password default admin di database
2. Setup Row Level Security (RLS) di Supabase untuk keamanan
3. Configure custom domain jika diperlukan
4. Setup monitoring dan error tracking
5. Backup database secara berkala
