# 🎓 Sistem Pengukuran Capaian Pembelajaran Lulusan (CPL) & Portofolio

SPA statis berkinerja tinggi berbasis **React + Tailwind CSS + pdfjs-dist + Chart.js + vis-network** untuk mengukur ketercapaian CPL/CPMK/Sub-CPMK langsung dari dataset **RPS PDF & Nilai PDF**.

> Deploy 100% statis di GitHub Pages / Vercel / Netlify / hosting kampus. Data PDF diproses client-side (localStorage), riwayat disimpan di Supabase / Firebase.

![Stack](https://img.shields.io/badge/React-18-61DAFB?style=flat-square) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square) ![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square) ![License](https://img.shields.io/badge/License-MIT-emerald?style=flat-square)

## ✨ Fitur Lengkap (6 Step Wizard)

### 1. Upload Dataset (Client-Side Storage)
- 2 dropzone: RPS PDF & Nilai Kelas PDF
- Ekstraksi teks langsung di browser pakai `pdfjs-dist` (tidak upload server)
- Simpan `cpl_rps_text` & `cpl_nilai_text` di localStorage
- Indikator sukses + preview
- Tombol **Gunakan Sample Data**

### 2. Generate Metadata Otomatis
Parser regex tangguh:
```
PROGRAM STUDI: ..., MATA KULIAH: ..., KODE MK: ..., SKS: ..., SEMESTER: ..., TAHUN AKADEMIK: ..., DOSEN PENGAMPU: ..., KELAS: ...
```
Auto-fill + editable manual.

### 3. Pembobotan Asesmen
- Tugas/Kuis/Keaktifan, UTS, UAS, Presensi (opsional)
- Validasi total = 100% (merah + lock jika tidak valid)
- Doughnut Chart preview

### 4. Hubungan Sub-CPMK → CPMK → CPL
- Ekstrak matriks dari RPS: `Sub-CPMK 1.1 Bobot 15% -> CPMK1 -> CPL01 CPL02`
- Tabel editable: tambah/hapus, dropdown CPMK, checkbox CPL01-CPL06
- Σ Bobot auto

### 5. Ketercapaian & Visualisasi
- **Tabel Mahasiswa:** No, Nama, NIM, Σ Skor, Huruf (A, B+, B, dst), progress Sub-CPMK, rata-rata kelas
- **3 Grafik:**
  1. Radar Chart - Target 80% vs Realisasi CPL
  2. Bar Chart - Sub-CPMK & CPMK + garis threshold 70%
  3. Network Graph - vis-network physics (MK ↔ CPL ↔ Semester) dragable
- **Simpulan Otomatis 6 Kalimat** (jumlah mhs & rata-rata, CPL tertinggi, CPL terendah, Sub-CPMK optimal, Sub-CPMK di bawah target, rekomendasi)
- **Lembar Pengesahan A4** - Kop surat, metadata, tabel, 3 grafik (canvas toDataURL), simpulan, blok TTD Dosen & Kaprodi (nama/NIP/tgl editable), export via html2pdf.js

### 6. Riwayat Pengukuran (Remote)
- Simulasi Supabase via `cpl_history` localStorage
- Kolom: Tanggal, TA/Smt, MK, Kelas, Dosen, Avg CPL, Status (Draft/Disahkan)
- Lihat, Hapus, Export CSV, Cetak Ulang PDF
- Fungsi `saveToSupabase()` siap ganti endpoint

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/username/sistem-cpl-portfolio.git
cd sistem-cpl-portfolio

# 2. Install
npm install

# 3. Dev
npm run dev  # http://localhost:5173

# 4. Build
npm run build  # output di /dist
```

## 📦 Deploy ke GitHub Pages (Auto)

Repo ini sudah include workflow `.github/workflows/deploy.yml`.

1. Buat repo baru di GitHub (Public)
2. Push:
```bash
git init
git add .
git commit -m "feat: initial CPL system"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```
3. Di GitHub → Settings → Pages → Source: **GitHub Actions**
4. Setiap push ke `main` akan auto deploy! URL: `https://USERNAME.github.io/REPO/`

Alternatif deploy manual:
```bash
npm run deploy
```

## 🔌 Integrasi Supabase

1. Buat project di supabase.com
2. Jalankan `supabase/schema.sql` di SQL Editor
3. Buat `.env.local`:
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```
4. Di `src/App.tsx` ganti `saveToSupabase()`:
```ts
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

async function saveToSupabase(payload){
  const { data, error } = await supabase.from('cpl_measurements').insert(payload)
  if(error) console.error(error)
  return data
}
```

Lihat `supabase/schema.sql` untuk struktur tabel lengkap + RLS.

## 📁 Struktur Repo

```
.
├── src/
│   ├── App.tsx          # Logic utama 6 step + parser + chart + network
│   ├── main.tsx         # Entry React
│   └── index.css        # Tailwind directives
├── public/
│   └── favicon.svg
├── sample_data/
│   ├── sample_rps_text.txt
│   └── sample_nilai_text.txt
├── supabase/
│   └── schema.sql
├── .github/workflows/deploy.yml
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🎨 UI/UX
- Emerald / Dark Slate Green akademik
- Card rounded-2xl, Badge Status Hijau/Kuning, Tab responsive
- Font Inter + JetBrains Mono
- Toast, Progress Stepper, Mobile bottom nav

## 📄 Lisensi
MIT - Bebas pakai untuk akademik.

## 👨‍🏫 Author
Yudi Krisno Wicaksono - Teknik Informatika
Dibuat untuk kebutuhan akreditasi LAM INFOKOM & MBKM.

---
> Tip: Gunakan Sample Data dulu untuk demo ke Kaprodi, baru upload PDF asli RPS & Nilai.
