-- Supabase Schema untuk Sistem CPL
-- Jalankan di SQL Editor Supabase

create table if not exists cpl_measurements (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  tanggal_pengukuran date default current_date,
  tahun_akademik text,
  semester text,
  fakultas text,
  prodi text,
  matkul text,
  kode_mk text,
  sks text,
  kelas text,
  dosen_pengampu text,
  bobot jsonb, -- {tugas, uts, uas, presensi, usePresensi}
  mapping jsonb, -- array SubMap
  metadata jsonb,
  students_avg numeric,
  cpl_scores jsonb, -- {CPL01: 82.5, ...}
  sub_scores jsonb,
  summary text,
  status text check (status in ('Draft','Disahkan')) default 'Draft',
  ttd jsonb,
  user_id uuid references auth.users(id) -- opsional
);

-- RLS
alter table cpl_measurements enable row level security;

create policy "Public read" on cpl_measurements for select using (true);
create policy "Public insert" on cpl_measurements for insert with check (true);
create policy "Public update" on cpl_measurements for update using (true);

-- Index
create index idx_cpl_tahun on cpl_measurements(tahun_akademik);
create index idx_cpl_matkul on cpl_measurements(matkul);
