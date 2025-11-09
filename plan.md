# Rencana Proyek — MIS GS v2

## Rencana Terstruktur

### Sudah dikerjakan
- NextAuth Google OAuth: API route App Router, halaman login, redirect `/` → `/login`, redirect pasca-login ke `/dashboard`.
- Dashboard + sidebar shadcn/ui (sidebar-07), avatar Google di header & sidebar, tombol toggle tema (light/dark).
- Sidebar menu: Dashboard {Main, KPI}, Master Data {District, ICS}, Report {Monthly → MT, Weekly → Kampar/Rokan Hulu/Siak/Pelalawan}.
- Perbaikan hydration mismatch: Collapsible pakai `defaultOpen`, render nav & dropdown setelah mount, Tooltip hanya saat sidebar collapsed (non-mobile).
- Integrasi Google Sheets (service account), env var kompatibel, pembacaan sheet District & ICS, mapping field ICS (termasuk Registered Farmer), urutan kolom sesuai sheet, sembunyikan kolom tertentu.
- DataTable generik: pagination, multi-filter (District/ICS/isKPI), column visibility, badge untuk isKPI.
- Halaman master: `/master/district` dan `/master/ics` (server fetch + client table).
- Sentralisasi menu: `lib/menu.ts` (+ `filterMenuByPermissions`), model modul/izin: `lib/module.ts`, model user/role/permission: `lib/user.ts`; `AppSidebar` memfilter menu berdasarkan `session.user.permissions` (fallback `*`).

### Akan dikerjakan (Short term)
- NextAuth callbacks: isi `session.user.permissions` berdasarkan roles + overrides (dari sheet Security).
- Integrasi sheet Security (`email`) untuk allowlist, roles, module permissions.
- Middleware/guard rute: gunakan `routeToModule` + `matchPermission` untuk proteksi halaman.
- Buat halaman placeholder untuk Report: `/report/monthly/mt` dan weekly (Kampar, Rokan Hulu, Siak, Pelalawan).
- Loading & error states terpadu untuk tabel; selaraskan fitur filter District seperti ICS.
- Verifikasi lintas halaman: tidak ada hydration warning di `/dashboard`, `/master/*`, `/report/*`.

### Akan dikerjakan (Mid term)
- Tambah Master Data lain: Farmer, Parcel, Training, BMP, NKT, K3 (server fetch + table + filter).
- Dashboard KPI: definisi metrik, agregasi, dan visualisasi; finalisasi pilihan chart library.
- Caching & ISR terukur per halaman data; opsi revalidate on demand.
- Komponen `AccessDenied` dan alur redirect ketika tidak punya izin.

### Akan dikerjakan (Long term)
- UI manajemen role/permission; audit log akses; konfigurasi modul per organisasi.
- Optimasi performa: streaming, memoization, pengurangan bundle, image optimization.
- CI/CD + pengujian (unit, e2e) minimal untuk auth, guard, dan table.

### Nice to have
- Export CSV/XLSX dari tabel.
- Saved filters & advanced filters (rentang tanggal, District/ICS, dsb.).
- Breadcrumb & pencarian terintegrasi, halaman profil user.
- Lokalisasi/i18n dan preferensi tema tersinkron cookie.

---

## Ringkasan
- Framework: Next.js + TypeScript (App Router), deploy di Vercel.
- UI: Tailwind CSS + shadcn/ui (pattern sidebar-07).
- Data: Google Sheets (multi-spreadsheet) sebagai sumber data utama.
- Autentikasi: Google OAuth; Otorisasi: allowlist email dari sheet Security (status=active) + role (admin/user) + module.
- Fokus awal: Landing/Dashboard dengan sidebar; halaman Detail & Master Data (Farmer, Parcel, Training, BMP, NKT, K3).

---

## Sumber Data
- Security: https://docs.google.com/spreadsheets/d/1smS6lOz8dGlzWq-ZlZxafU3-y8Ss4ugTlOFHib762L8
  - Sheet: `email`
    - Kolom: `id`, `status`("active"|"not-active"), `name`, `email`, `role`("admin"|"user"), `notes`, `module` (list modul yang diizinkan)
- Master Data: https://docs.google.com/spreadsheets/d/1UoHRQpBWy0_QxxJ88tWxDNDbXNkQEsKYx3l1NqOt6og
  - Sheet & Kolom:
    - `District`: `DistrictCode`, `DistrictName`
    - `ICS`: `DistrictCode`, `DistrictName`, `ICSCode`, `ICSName`, `ICSAbrv`, `3FID`, `isKPI`
    - `Farmer`: `ICSCode`, `Status`, `Name`, `FarmerID`
    - `Parcel`: `ICSCode`, `Status`, `FarmerID`, `ParcelID`, `Luas`
    - `Training`: `ICSCode`, `FarmerID`, `BMP`, `PNC`, `NKT`, `MK`, `K3`, `GEDSI`

Catatan:
- Spreadsheet harus dibagikan ke service account (email) agar bisa dibaca via Google Sheets API.
- Pastikan konsistensi nama sheet & kolom (case-sensitive) untuk menghindari error mapping.

---

## Arsitektur Aplikasi
- Next.js (App Router) + TypeScript.
- Data layer: Google Sheets API (service account) di server (server-only), tanpa expose kredensial ke client.
- Caching & revalidasi: ISR/`revalidate` per endpoint (mis. 300 detik). Opsi revalidate on demand via webhook (opsional).
- Mapping data: fungsi adapter per sheet yang mengubah row mentah → tipe terstruktur (number, boolean, enum).
- Error & loading states: komponen khusus untuk UX yang baik.

Struktur direktori (awal):
- `app/(dashboard)/layout.tsx` → layout utama + sidebar (shadcn `sidebar-07`).
- `app/(dashboard)/dashboard/page.tsx` → ringkasan/landing dashboard.
- `app/(dashboard)/dashboard/main-data/page.tsx`
- `app/(dashboard)/dashboard/kpi/page.tsx`
- `app/(dashboard)/detail/[module]/page.tsx` → farmer/parcel/training/bmp/nkt/k3
- `app/(dashboard)/master/[module]/page.tsx` → farmer/parcel/training/bmp/nkt/k3
- `components/` → Sidebar, DataTable, KPI Card, Chart, Breadcrumb, AccessDenied, dll.
- `lib/google-sheets.ts` → helper Google Sheets.
- `lib/auth.ts` → konfigurasi NextAuth/Auth.js.
- `types/` → tipe data: District, ICS, Farmer, Parcel, Training, User, Role.

---

## Navigasi & Halaman
- Sidebar (kiri) — shadcn/ui `sidebar-07`:
  - Main Dashboard
    - Main Data
    - KPI
  - Detail Dashboard
    - Farmer
    - Parcel
    - Training
    - BMP
    - NKT
    - K3
  - Master Data
    - Farmer
    - Parcel
    - Training
    - BMP
    - NKT
    - K3

Rute yang diusulkan:
- `/` → redirect ke `/dashboard`
- `/dashboard` → ringkasan
- `/dashboard/main-data`
- `/dashboard/kpi`
- `/detail/farmer`, `/detail/parcel`, `/detail/training`, `/detail/bmp`, `/detail/nkt`, `/detail/k3`
- `/master/farmer`, `/master/parcel`, `/master/training`, `/master/bmp`, `/master/nkt`, `/master/k3`

Komponen utama:
- Sidebar (shadcn)
- DataTable (shadcn table + filter + pagination)
- KPI Cards (ringkas metrik utama)
- Charts (opsi: `chart.js` via `react-chartjs-2` atau `recharts`) — dikonfirmasi
- Form/Filter (opsional)

---

## Keamanan & Akses
- Autentikasi: Google OAuth (Auth.js/NextAuth.js).
- Otorisasi: baca sheet `Security/email`.
  - Hanya `status = "active"` yang boleh masuk.
  - `role` → admin/user; disimpan di token/session untuk kontrol fitur.
  - `module` → pembatasan akses per modul (Detail/Master tertentu).
- Proteksi rute: middleware + server component guard.

---

## Variabel Lingkungan
- `AUTH_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (OAuth)
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY` (gunakan format multiline aman)
- `SHEET_SECURITY_ID = 1smS6lOz8dGlzWq-ZlZxafU3-y8Ss4ugTlOFHib762L8`
- `SHEET_MASTERDATA_ID = 1UoHRQpBWy0_QxxJ88tWxDNDbXNkQEsKYx3l1NqOt6og`
- `DATA_REVALIDATE_SECONDS` (mis. `300`)

---

## Langkah Implementasi
1) Bootstrap proyek
   - `create-next-app` (TypeScript, App Router, ESLint, Tailwind)
   - Tambah shadcn/ui dan jalankan `npx shadcn@latest add sidebar-07`
2) Autentikasi & Otorisasi
   - Konfigurasi Google OAuth (Auth.js/NextAuth.js)
   - Implementasi allowlist dari sheet Security (`status`, `role`, `module`)
3) Integrasi Google Sheets
   - Aktifkan API & buat service account; bagikan spreadsheet ke email service account
   - `lib/google-sheets.ts` dengan helper: getRowsBySheet(sheetName), parser per sheet
   - Caching: `fetchCache`/`revalidate` di route/loader
4) UI & Halaman
   - Layout + Sidebar
   - Page: Dashboard (Main Data, KPI)
   - Page: Detail (Farmer, Parcel, Training, BMP, NKT, K3)
   - Page: Master (Farmer, Parcel, Training, BMP, NKT, K3)
   - Komponen DataTable + filter
5) Deploy ke Vercel
   - Set env vars di Vercel
   - Tes end-to-end (auth, akses modul, load data, cache)

---

## Milestone & Estimasi
- M1: Setup proyek + UI skeleton (sidebar, layout) — 0.5 hari
- M2: Auth + Otorisasi (allowlist) — 0.5 hari
- M3: Integrasi Master Data (read-only, tabel, filter) — 1 hari
- M4: Dashboard & KPI (ringkasan metrik awal) — 1 hari
- M5: QA, polish, deploy — 0.5 hari

Total awal: ±3.5 hari (dapat berubah sesuai kompleksitas KPI & filter).

---

## Definisi Sukses (Acceptance Criteria)
- Login hanya untuk email `active` pada sheet Security; role & module diterapkan.
- Data Master tampil di tabel dengan pencarian/filter dasar.
- Dashboard memuat ringkasan metrik (KPI awal) tanpa error.
- Aplikasi ter-deploy di Vercel dengan environment lengkap dan akses stabil ke Google Sheets.

---

## Pertanyaan Terbuka
- Charting library preferensi? (`chart.js` vs `recharts`)
- Detail definisi KPI (metrik apa saja + rumus)
- Format `module` pada sheet Security (mis. CSV "farmer,parcel" atau per baris terpisah?)
- Apakah butuh export (CSV/XLSX) dan role mana yang boleh?
- Kebutuhan filter lanjutan (by District/ICS, rentang tanggal untuk Training, dsb.)
