# Panduan Penggunaan

## Alur 6 Step

1. **Upload** - Drag PDF RPS & Nilai, atau klik "Gunakan Sample Data"
2. **Metadata** - Cek hasil parser regex, edit jika salah
3. **Bobot** - Atur persentase, pastikan total 100%
4. **Pemetaan** - Sesuaikan Sub-CPMK -> CPMK -> CPL
5. **Capaian** - Lihat tabel, 3 grafik, simpulan 6 kalimat, isi TTD, sahkan
6. **Riwayat** - Lihat semua pengukuran, export CSV

## Format PDF yang Didukung

RPS harus mengandung kata kunci:
- MATA KULIAH / MK
- KODE MK / KODE
- PROGRAM STUDI / PRODI
- SKS, SEMESTER, TAHUN AKADEMIK, DOSEN PENGAMPU, KELAS

Nilai harus mengandung:
- NIM: xxxxxx Nama: xxx Tugas:xx UTS:xx UAS:xx Hadir:xx%

Jika format beda, parser akan fallback ke sample dan tetap bisa diedit manual di Step 2 & 4.

## Rumus Nilai

Skor Akhir = Tugas*%tugas + UTS*%uts + UAS*%uas + Presensi*%presensi
Huruf: >=85 A, >=80 A-, >=75 B+, >=70 B, >=65 B-, >=60 C+, >=50 C, <50 D

## Tips Deploy

- GitHub Pages gratis dan cukup untuk demo akreditasi
- Untuk data permanen lintas device, aktifkan Supabase (lihat README)
- File build di /dist bisa langsung di-zip dan upload ke hosting cPanel (public_html)
