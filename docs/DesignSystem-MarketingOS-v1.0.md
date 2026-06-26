# Design System — MarketingOS: Learn by Doing
**Design System Document v1.0**  
**Tanggal:** 27 Juni 2026  
**Dibuat berdasarkan:** PRD MarketingOS v1.2  
**Status:** Draft — Ready for Implementation

---

## 📋 DAFTAR ISI

1. [Design Principles](#1-design-principles)
2. [Foundation — Design Tokens](#2-foundation--design-tokens)
   - 2.1 [Color System](#21-color-system)
   - 2.2 [Typography](#22-typography)
   - 2.3 [Spacing & Layout](#23-spacing--layout)
   - 2.4 [Border & Shadow](#24-border--shadow)
   - 2.5 [Motion & Animation](#25-motion--animation)
3. [Component Library](#3-component-library)
   - 3.1 [Atoms](#31-atoms)
   - 3.2 [Molecules](#32-molecules)
   - 3.3 [Organisms](#33-organisms)
4. [Page Templates](#4-page-templates)
5. [Interaction Patterns](#5-interaction-patterns)
6. [Accessibility Guidelines](#6-accessibility-guidelines)
7. [Implementasi Tailwind CSS](#7-implementasi-tailwind-css)

---

## 1. DESIGN PRINCIPLES

Prinsip desain MarketingOS diturunkan langsung dari nature produk: **platform belajar aktif** yang mendorong eksekusi, bukan sekadar konsumsi konten.

### 1.1 Prinsip Utama

| # | Prinsip | Penjelasan | Implikasi Desain |
|---|---------|------------|-----------------|
| 1 | **Clarity First** | Setiap elemen harus jelas fungsinya tanpa perlu penjelasan tambahan | Label eksplisit, ikon selalu disertai teks, hierarki visual kuat |
| 2 | **Progress is Visible** | User selalu tahu seberapa jauh mereka sudah berjalan | Progress bar di header, persentase di mana-mana, streak selalu terlihat |
| 3 | **Action-Oriented** | CTA harus dominan dan tidak ambigu | Tombol primer menonjol, task area diberi visual emphasis |
| 4 | **Forgiving** | Error tidak menghukum user — selalu ada jalan kembali | Draft tersimpan otomatis, error message membantu, tidak ada data loss |
| 5 | **Mobile-First** | Desain dimulai dari 375px, bukan diperkecil dari desktop | Breakpoint-first approach, touch target min 44px |

### 1.2 Brand Personality

MarketingOS bukan platform korporat yang kaku. Brand personality-nya:

- **Energetik** tapi tidak childish — warna bersih dengan aksen bold
- **Profesional** tapi approachable — typography readable, tone teks bersahabat
- **Fokus** — layout bersih, sedikit distraksi, konten sebagai raja

---

## 2. FOUNDATION — DESIGN TOKENS

### 2.1 Color System

#### Primary Palette — "Marketing Blue"

Warna utama platform. Dipilih untuk asosiasi kepercayaan, profesionalisme, dan fokus.

```
Primary
├── primary-50:  #eff6ff   (background highlight ringan)
├── primary-100: #dbeafe   (hover state ringan)
├── primary-200: #bfdbfe   (border aktif)
├── primary-300: #93c5fd   (icon secondary)
├── primary-400: #60a5fa   (icon primary)
├── primary-500: #3b82f6   (⭐ BASE — tombol, link utama)
├── primary-600: #2563eb   (hover state tombol)
├── primary-700: #1d4ed8   (pressed state)
├── primary-800: #1e40af   (text on light bg)
└── primary-900: #1e3a8a   (dark mode primary)
```

#### Semantic Colors

```
Success (Streak, Modul Selesai, Konfirmasi)
├── success-50:  #f0fdf4
├── success-100: #dcfce7
├── success-500: #22c55e   (⭐ BASE)
├── success-600: #16a34a   (hover)
└── success-700: #15803d   (pressed)

Warning (Re-engagement Banner, Rate Limit Near)
├── warning-50:  #fffbeb
├── warning-100: #fef3c7
├── warning-500: #f59e0b   (⭐ BASE)
├── warning-600: #d97706   (hover)
└── warning-700: #b45309   (pressed)

Danger (Error, Karakter Kurang, Rate Limit)
├── danger-50:   #fef2f2
├── danger-100:  #fee2e2
├── danger-500:  #ef4444   (⭐ BASE)
├── danger-600:  #dc2626   (hover)
└── danger-700:  #b91c1c   (pressed)

Info (Hint, Tooltip, Note)
├── info-50:     #f0f9ff
├── info-100:    #e0f2fe
├── info-500:    #06b6d4   (⭐ BASE)
└── info-600:    #0891b2   (hover)
```

#### Neutral Palette — "Slate"

```
Neutral
├── neutral-0:   #ffffff   (surface utama)
├── neutral-50:  #f8fafc   (background page)
├── neutral-100: #f1f5f9   (background card ringan)
├── neutral-200: #e2e8f0   (border default)
├── neutral-300: #cbd5e1   (border subtle)
├── neutral-400: #94a3b8   (placeholder, icon disabled)
├── neutral-500: #64748b   (text muted / caption)
├── neutral-600: #475569   (text secondary)
├── neutral-700: #334155   (text body)
├── neutral-800: #1e293b   (text heading)
└── neutral-900: #0f172a   (text high contrast)
```

#### Special: Streak & Gamification

```
Streak Fire
├── streak-low:    #f97316   (1–3 hari)
├── streak-mid:    #ef4444   (4–7 hari)
├── streak-high:   #dc2626   (8–14 hari)
└── streak-legend: #7c3aed   (15+ hari — purple legend)

Module Status
├── status-not-started: neutral-200  (abu-abu)
├── status-in-progress: primary-500  (biru)
├── status-completed:   success-500  (hijau)
└── status-locked:      neutral-400  (abu-abu gelap + lock icon)
```

#### Tailwind Config (tailwind.config.ts)

```typescript
colors: {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
}
```

---

### 2.2 Typography

#### Font Stack

```
Heading Font:  Inter (Google Fonts)
Body Font:     Inter (Google Fonts)
Mono Font:     JetBrains Mono (untuk code snippet, jika ada)

Fallback:      -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
```

> **Alasan Inter:** Sangat readable di semua ukuran, mendukung Bahasa Indonesia dengan baik, bebas lisensi, bundle size efisien via `next/font`.

#### Type Scale

```
Display (hero section, onboarding welcome)
├── display-2xl: 4.5rem / 72px  — line-height: 1.1  font-weight: 800
├── display-xl:  3.75rem / 60px — line-height: 1.1  font-weight: 800
└── display-lg:  3rem / 48px   — line-height: 1.15 font-weight: 700

Heading (judul halaman, section header)
├── heading-xl:  2.25rem / 36px — line-height: 1.2  font-weight: 700
├── heading-lg:  1.875rem / 30px — line-height: 1.25 font-weight: 700
├── heading-md:  1.5rem / 24px  — line-height: 1.3  font-weight: 600
├── heading-sm:  1.25rem / 20px — line-height: 1.35 font-weight: 600
└── heading-xs:  1.125rem / 18px — line-height: 1.4  font-weight: 600

Body (konten modul, deskripsi, paragraf)
├── body-xl:  1.125rem / 18px — line-height: 1.75 font-weight: 400
├── body-lg:  1rem / 16px    — line-height: 1.75 font-weight: 400
├── body-md:  0.875rem / 14px — line-height: 1.6  font-weight: 400
└── body-sm:  0.75rem / 12px  — line-height: 1.5  font-weight: 400

Label (tombol, badge, form label)
├── label-lg:  0.875rem / 14px — line-height: 1.4 font-weight: 600
├── label-md:  0.75rem / 12px  — line-height: 1.4 font-weight: 600
└── label-sm:  0.625rem / 10px — line-height: 1.4 font-weight: 700 tracking: 0.05em

Caption (timestamp, hint text, karakter counter)
└── caption:   0.75rem / 12px  — line-height: 1.4 font-weight: 400 color: neutral-500
```

#### Tailwind Typography Classes (Custom)

```typescript
// tailwind.config.ts — extend fontSize
fontSize: {
  'display-2xl': ['4.5rem', { lineHeight: '1.1', fontWeight: '800' }],
  'display-xl':  ['3.75rem', { lineHeight: '1.1', fontWeight: '800' }],
  'heading-xl':  ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }],
  'heading-lg':  ['1.875rem', { lineHeight: '1.25', fontWeight: '700' }],
  'heading-md':  ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
  'heading-sm':  ['1.25rem', { lineHeight: '1.35', fontWeight: '600' }],
  'body-xl':     ['1.125rem', { lineHeight: '1.75', fontWeight: '400' }],
  'body-lg':     ['1rem', { lineHeight: '1.75', fontWeight: '400' }],
  'body-md':     ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }],
  'caption':     ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
}
```

---

### 2.3 Spacing & Layout

#### Spacing Scale (Multiples of 4px base)

```
space-0:   0px
space-0.5: 2px
space-1:   4px
space-1.5: 6px
space-2:   8px
space-3:   12px
space-4:   16px   ← gutter default
space-5:   20px
space-6:   24px   ← padding card
space-8:   32px
space-10:  40px
space-12:  48px
space-16:  64px
space-20:  80px
space-24:  96px
```

#### Layout Grid

```
Mobile (375px–767px)
├── Columns: 4
├── Gutter:  16px
├── Margin:  16px
└── Max content width: 100%

Tablet (768px–1023px)
├── Columns: 8
├── Gutter:  24px
├── Margin:  24px
└── Max content width: 100%

Desktop (1024px–1279px)
├── Columns: 12
├── Gutter:  24px
├── Margin:  32px
└── Max content width: 1024px

Wide (1280px+)
├── Columns: 12
├── Gutter:  32px
├── Margin:  auto
└── Max content width: 1280px
```

#### Container Classes

```css
.container-app    { max-width: 1280px; margin: 0 auto; padding: 0 1rem; }
.container-narrow { max-width: 768px;  margin: 0 auto; padding: 0 1rem; }
.container-form   { max-width: 480px;  margin: 0 auto; padding: 0 1rem; }
```

---

### 2.4 Border & Shadow

#### Border Radius

```
radius-none: 0px
radius-sm:   4px   (badge, chip kecil)
radius-md:   8px   (card, input, tombol)
radius-lg:   12px  (card besar, modal)
radius-xl:   16px  (panel, drawer)
radius-2xl:  24px  (onboarding card)
radius-full: 9999px (avatar, toggle, pill badge)
```

#### Border Width

```
border-0:   0px
border-1:   1px (default — card border, input border)
border-2:   2px (focused input, active state)
border-4:   4px (progress bar track)
```

#### Shadow Scale

```
shadow-xs:   0 1px 2px 0 rgba(0,0,0,0.05)                          (dropdown item hover)
shadow-sm:   0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)  (card default)
shadow-md:   0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1) (card hover)
shadow-lg:   0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1) (modal, dropdown)
shadow-xl:   0 20px 25px -5px rgba(0,0,0,0.1)                      (panel overlay)
shadow-inner: inset 0 2px 4px 0 rgba(0,0,0,0.06)                   (textarea, input focused)
```

---

### 2.5 Motion & Animation

#### Duration

```
duration-instant: 0ms    (state toggle tanpa animasi)
duration-fast:    100ms  (ripple, microinteraction)
duration-normal:  200ms  (hover, focus, fade)
duration-moderate: 300ms (slide, expand, modal open)
duration-slow:    500ms  (progress bar fill, streak counter)
duration-very-slow: 1000ms (onboarding transition)
```

#### Easing

```
ease-default:  cubic-bezier(0.4, 0, 0.2, 1)  (material standard)
ease-in:       cubic-bezier(0.4, 0, 1, 1)     (element leaving)
ease-out:      cubic-bezier(0, 0, 0.2, 1)     (element entering)
ease-bounce:   cubic-bezier(0.34, 1.56, 0.64, 1) (streak increment, badge pop)
ease-spring:   cubic-bezier(0.175, 0.885, 0.32, 1.275) (onboarding step)
```

#### Animation Patterns

```
fade-in:           opacity 0 → 1, duration-normal, ease-out
slide-up:          translateY(8px) → 0 + fade-in, duration-moderate, ease-out
slide-down:        0 → translateY(4px) + fade-out, duration-fast, ease-in
scale-in:          scale(0.95) → 1 + fade-in, duration-normal, ease-spring
streak-pop:        scale(1) → scale(1.2) → scale(1), duration-slow, ease-bounce
progress-fill:     width 0 → target%, duration-slow, ease-out
banner-slide:      translateY(-100%) → 0, duration-moderate, ease-out
```

---

## 3. COMPONENT LIBRARY

### 3.1 Atoms

#### A. Button

Tombol adalah elemen paling kritis di MarketingOS — setiap aksi penting dipicu button.

**Variants**

| Variant | Use Case | Tailwind Base Classes |
|---------|----------|-----------------------|
| `primary` | CTA utama (Submit Task, Tandai Selesai, Login) | `bg-primary-500 hover:bg-primary-600 text-white` |
| `secondary` | Aksi sekunder (Batal, Kembali) | `bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700` |
| `ghost` | Aksi tersier (Lihat Detail, Dismiss) | `bg-transparent hover:bg-neutral-100 text-neutral-600` |
| `danger` | Aksi destruktif (Hapus, Reset) | `bg-danger-500 hover:bg-danger-600 text-white` |
| `success` | Konfirmasi (Tandai Selesai aktif) | `bg-success-500 hover:bg-success-600 text-white` |

**Sizes**

| Size | Height | Padding X | Font Size | Use Case |
|------|--------|-----------|-----------|----------|
| `xs` | 28px | 12px | label-sm | Badge action, compact action |
| `sm` | 36px | 16px | label-md | Form action sekunder |
| `md` | 44px | 20px | label-lg | Default semua aksi |
| `lg` | 52px | 24px | body-lg | CTA utama halaman |
| `xl` | 60px | 32px | body-xl | Onboarding CTA |

**States**

```
default:  bg-primary-500 text-white
hover:    bg-primary-600 shadow-sm
focus:    ring-2 ring-primary-500 ring-offset-2 outline-none
active:   bg-primary-700 scale(0.98)
disabled: bg-neutral-200 text-neutral-400 cursor-not-allowed opacity-60
loading:  bg-primary-500 text-white cursor-wait (+ spinner icon)
```

**Special: Submit Task Button (FR-07)**

```
Kondisi: content.length < 50  → variant=primary disabled=true
Kondisi: content.length >= 50 → variant=primary disabled=false
Transisi: 200ms color change ketika threshold terpenuhi
```

**Anatomy (HTML structure)**

```html
<button class="btn btn-primary btn-md" disabled={!isEnabled}>
  <span class="btn-icon-left">{icon}</span>
  <span class="btn-label">{label}</span>
  <span class="btn-icon-right">{iconRight}</span>
</button>
```

---

#### B. Input / Textarea

**Input Text**

```
States:
├── default: border-neutral-200 bg-white
├── hover:   border-neutral-300
├── focus:   border-primary-500 ring-2 ring-primary-100
├── filled:  border-neutral-300 (tidak berubah)
├── error:   border-danger-500 ring-2 ring-danger-100
├── success: border-success-500
└── disabled: bg-neutral-100 border-neutral-200 text-neutral-400

Sizes:
├── sm: height 36px, text body-md, px-3
├── md: height 44px, text body-lg, px-4  (default)
└── lg: height 52px, text body-xl, px-4
```

**Textarea (Task Submission — FR-07)**

```
Min height:   120px
Resize:       vertical only
Max height:   400px (scrollable setelah ini)
Padding:      16px
Font:         body-lg, line-height 1.75

Character Counter (wajib per FR-07):
├── Position:    bottom-right di bawah textarea
├── Format:      "{current}/{minimum}" atau "{current} karakter"
├── State < 50:  text-danger-500 font-semibold (merah)
├── State >= 50: text-success-600 (hijau)
└── Animation:   color transition 200ms
```

**Form Field Anatomy**

```html
<div class="form-field">
  <label class="form-label">{Label} <span class="required">*</span></label>
  <div class="input-wrapper">
    <span class="input-icon-left">{icon}</span>
    <input class="input-text" />
    <span class="input-icon-right">{icon}</span>
  </div>
  <p class="form-hint">{hint text}</p>
  <p class="form-error">{error message}</p>
</div>
```

---

#### C. Badge / Status Chip

Digunakan untuk status modul, streak, progress indicator kecil.

| Variant | Color | Use Case |
|---------|-------|----------|
| `not-started` | neutral-200 bg + neutral-600 text | Modul belum dimulai |
| `in-progress` | primary-100 bg + primary-700 text | Sedang dipelajari |
| `completed` | success-100 bg + success-700 text | Modul selesai |
| `locked` | neutral-100 bg + neutral-400 text | Modul terkunci (M6-19) |
| `streak` | warning-100 bg + warning-700 text | Streak counter |
| `new` | primary-500 bg + white text | Badge "Baru" |

**Sizes**

```
sm: px-2 py-0.5 text-label-sm radius-sm
md: px-3 py-1   text-label-md radius-md  (default)
lg: px-4 py-1.5 text-label-lg radius-md
```

---

#### D. Avatar

Digunakan di header, profil user.

```
Sizes:
├── xs:  24px  (comment, list item)
├── sm:  32px  (header compact)
├── md:  40px  (default — navbar, card)
├── lg:  64px  (profil page)
└── xl:  96px  (profil edit)

Fallback (tidak ada foto):
└── Inisial nama user, bg-primary-100, text-primary-700
    (contoh: "VH" untuk "Vincent Hartono")
```

---

#### E. Icon

Gunakan library **Lucide React** (konsisten dengan shadcn/ui).

```
Icon sizes:
├── 12px: inline caption icon
├── 16px: label icon, badge icon
├── 20px: default UI icon
├── 24px: navigation icon, feature icon
└── 32px: empty state icon (decorative)

Icon + Label rule:
└── Selalu pasangkan icon dengan teks label untuk aksesibilitas
    Kecuali: icon action yang sudah sangat familiar (close X, chevron)
    dengan aria-label yang jelas.

Critical icons mapping:
├── 🔒 Lock:       modul terkunci (LockIcon)
├── ✅ Check:      modul selesai (CheckCircleIcon)
├── 📖 Book:       sedang dipelajari (BookOpenIcon)
├── 🔥 Flame:      streak aktif (FlameIcon)
├── 🔖 Bookmark:   modul di-bookmark (BookmarkIcon)
├── 🤖 Bot:        AI Coach (BotIcon)
├── 📊 Chart:      progress (BarChart2Icon)
└── 📅 Calendar:   daily log (CalendarIcon)
```

---

#### F. Progress Bar

Digunakan di dashboard dan header modul (FR-09).

```
Variants:
├── linear:  bar horizontal, height 8px, radius-full
└── compact: bar horizontal, height 4px (untuk card)

Anatomy:
<div class="progress-track">    {/* bg-neutral-200, radius-full */}
  <div class="progress-fill"    {/* bg-primary-500, transition width 500ms */}
    style={{ width: `${percent}%` }}
  />
</div>
<span class="progress-label">{percent}%</span>

States:
├── 0%:   bg-neutral-200 (empty)
├── 1–33%: bg-primary-500
├── 34–66%: bg-primary-500
├── 67–99%: bg-primary-600
└── 100%: bg-success-500 + checkmark icon
```

---

#### G. Spinner / Loading

```
Sizes:
├── sm: 16px  (inline tombol loading)
├── md: 24px  (card loading state)
└── lg: 40px  (full page loading)

Behavior:
├── Tombol loading: spinner menggantikan icon, label tetap
├── AI feedback loading: spinner + teks "Menganalisis jawaban Anda..."
└── Page loading:  skeleton components (bukan spinner full page)
```

---

#### H. Divider

```
Horizontal: border-t border-neutral-200 my-6
Vertical:   border-l border-neutral-200 mx-4 (inline elements)
With label: border + text caption di tengah (untuk section break)
```

---

### 3.2 Molecules

#### A. ModuleCard

Komponen terpenting — ditampilkan 19x di halaman daftar modul (FR-03).

```
Layout: horizontal card (mobile: stacked)
Width:  100% (grid responsive)
Height: auto (min 80px)

Anatomy:
┌─────────────────────────────────────────────────┐
│  [Nomor]  [Judul Modul]              [Status]   │
│           [Deskripsi singkat - 1 baris]         │
│  [Progress mini bar jika in-progress]  [Bookmark]│
└─────────────────────────────────────────────────┘

States:
├── not-started: border-neutral-200, nomor bg-neutral-100
├── in-progress: border-primary-200, nomor bg-primary-100, pulse dot
├── completed:   border-success-200, nomor bg-success-100 + check icon
└── locked:      bg-neutral-50, opacity-70, cursor-not-allowed
                 + overlay lock icon + tooltip "Selesaikan Modul 1-5 dulu"

Mobile (< 768px):
└── Full width card, vertical layout, status badge di kanan atas

Desktop (>= 768px):
└── Horizontal card, 1 atau 2 kolom grid
```

---

#### B. ProgressCard (Dashboard Widget)

Digunakan di dashboard untuk menampilkan progress keseluruhan (FR-12).

```
┌────────────────────────────────┐
│ Progress Belajar               │
│ ████████░░░░░░░░  42%          │
│ 8 dari 19 modul selesai        │
└────────────────────────────────┘

Variants:
├── full:    dengan detail list modul terakhir
└── compact: hanya progress bar + persentase (untuk header)
```

---

#### C. StreakCard (Dashboard Widget)

Menampilkan streak harian (FR-11, FR-14).

```
┌────────────────────────────────┐
│ 🔥 Streak Belajar              │
│    7 Hari Berturut-turut       │
│ ●●●●●●●○  (dots 7 hari)       │
│ Terakhir log: Hari ini          │
└────────────────────────────────┘

Streak visual:
├── 0 hari:   🔥 abu-abu (belum mulai)
├── 1–3 hari: 🔥 orange  (streak-low)
├── 4–7 hari: 🔥 merah   (streak-mid)
├── 8–14 hari:🔥 merah   (streak-high) + badge "On Fire!"
└── 15+ hari: 🔥 ungu    (streak-legend) + badge "Legendaris!"

Animation:
└── Saat streak bertambah: angka pop dengan ease-bounce
```

---

#### D. TaskSubmissionForm

Form pengerjaan task per modul (FR-07).

```
┌────────────────────────────────────────────┐
│ ✍️ Task: [Judul Task]                       │
│ ─────────────────────────────────────────── │
│ [Deskripsi task]                            │
│                                             │
│ Panduan:                                    │
│ • [Poin 1]                                  │
│ • [Poin 2]                                  │
│                                             │
│ Rubrik Penilaian: [collapsible]             │
│ ─────────────────────────────────────────── │
│ Jawaban Anda:                               │
│ ┌─────────────────────────────────────────┐ │
│ │ [Textarea min 120px]                    │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│                         [32 / 50 karakter]  │
│                                             │
│                      [Simpan Draft] [Submit]│
└────────────────────────────────────────────┘

Counter behavior (FR-07):
├── < 50 char: counter merah, Submit disabled
└── >= 50 char: counter hijau, Submit enabled
```

---

#### E. AIFeedbackCard

Menampilkan feedback dari Gemini AI (FR-13, v1.1).

```
┌────────────────────────────────────────────┐
│ 🤖 Feedback AI Coach                        │
│ ─────────────────────────────────────────── │
│ Skor: ████████░░  80/100                   │
│                                             │
│ [Feedback text dari Gemini]                 │
│                                             │
│ Poin Kuat:  [list]                          │
│ Saran:      [list]                          │
└────────────────────────────────────────────┘

States:
├── loading:    skeleton + "Menganalisis jawaban Anda... (< 10 detik)"
├── success:    full feedback card
├── error/timeout: banner warning kuning
│              "Feedback AI sedang tidak tersedia. Submission Anda tetap tersimpan."
└── rate-limit: banner warning + countdown timer
               "Batas penggunaan AI tercapai. Coba lagi dalam [X] menit."
```

---

#### F. ReEngagementBanner (FR-18)

Banner yang muncul jika user tidak aktif > 2 hari.

```
┌────────────────────────────────────────────────────┐
│ 👋 Selamat datang kembali!                    [✕]  │
│ Lanjutkan: [Nama Modul Terakhir] →                 │
└────────────────────────────────────────────────────┘

Style:
├── Background: warning-50
├── Border-left: 4px solid warning-500
├── Position: top of dashboard, below header
├── Animation: slideDown 300ms ease-out
└── Dismiss: slide up 200ms ease-in, tersimpan di localStorage
```

---

#### G. DailyLogForm (FR-10)

Form untuk daily log / catatan refleksi.

```
┌────────────────────────────────────────────┐
│ 📝 Catatan Hari Ini                         │
│ [Rabu, 27 Juni 2026]                        │
│ ─────────────────────────────────────────── │
│ ┌─────────────────────────────────────────┐ │
│ │ Apa yang kamu pelajari hari ini?        │ │
│ │ [Textarea - placeholder text]           │ │
│ └─────────────────────────────────────────┘ │
│                              [Simpan Log]   │
└────────────────────────────────────────────┘

States:
├── kosong (log baru):     placeholder visible, Simpan primary
├── sudah ada log hari ini: prefilled, label "Edit Log Hari Ini"
└── saving:                 tombol loading state
```

---

#### H. OnboardingStepIndicator (FR-17)

Indikator langkah dalam guided onboarding 3-step.

```
[● ─── ○ ─── ○]   Step 1 dari 3
 1       2     3

Anatomy:
├── Step dots: circle 24px
│   ├── completed: bg-primary-500 + check icon
│   ├── current:   bg-primary-500 border-2 border-primary-200 ring
│   └── upcoming:  bg-neutral-200
├── Connector line: 2px neutral-200 (completed: primary-500)
└── Step label: caption di bawah dot (opsional)
```

---

#### I. Toast Notification

Feedback singkat untuk aksi (submit berhasil, error, dsb.).

```
Variants:
├── success: bg-success-50 border-success-500 icon CheckCircle
├── error:   bg-danger-50  border-danger-500  icon XCircle
├── warning: bg-warning-50 border-warning-500 icon AlertTriangle
└── info:    bg-info-50    border-info-500    icon Info

Position: top-right (desktop), top-center (mobile)
Duration:  4000ms auto-dismiss (error: 6000ms, permanent jika ada action)
Animation: slideDown on enter, slideUp on exit
Width:     320px (desktop), 100% - 32px (mobile)
```

---

#### J. EmptyState

Ditampilkan saat belum ada data (riwayat submission kosong, bookmark kosong, dsb.).

```
┌────────────────────────────────┐
│                                │
│     [Icon 48px — muted]        │
│     [Judul 1-3 kata]           │
│     [Deskripsi 1-2 kalimat]    │
│     [CTA Button — opsional]    │
│                                │
└────────────────────────────────┘
```

---

### 3.3 Organisms

#### A. AppHeader / Navbar

Navigasi utama yang persisten di semua halaman authenticated.

```
Desktop (>= 1024px) — Sidebar Layout:
┌──────────┬─────────────────────────────────────┐
│          │  [Page Title]          [User Avatar] │
│  SIDEBAR │                                      │
│          │  [Content Area]                      │
│          │                                      │
└──────────┴─────────────────────────────────────┘

Mobile (< 1024px) — Bottom Nav Layout:
┌──────────────────────────────────────┐
│  [Logo]                [Avatar]  [≡] │
│                                      │
│  [Content Area]                      │
│                                      │
├──────────────────────────────────────┤
│  [🏠]  [📚]  [✍️]  [📅]  [👤]        │
│  Home Modul  Task  Log  Profil       │
└──────────────────────────────────────┘

Sidebar items:
├── 🏠  Dashboard
├── 📚  Modul Belajar
├── ✍️   Task Saya
├── 📅  Daily Log
├── 🔖  Bookmark
├── ⚙️   Pengaturan
└── 🚪  Logout

Persistent elements di header:
├── Progress % (compact progress bar)
├── 🔥 Streak counter
└── User avatar
```

---

#### B. ModuleList (Halaman Daftar Modul — FR-03)

```
Layout:
├── Desktop: 2 kolom grid ModuleCard
└── Mobile:  1 kolom stacked

Header section:
├── Judul: "19 Modul Marketing"
├── Sub: "Progress: X/19 selesai"
└── Progress bar keseluruhan

Filter/Sort (opsional, post-MVP):
└── Semua | Sedang Dipelajari | Selesai | Tersimpan

Modul 1–5 (Sequential):
└── Label: "Wajib Berurutan — Selesaikan urut dari Modul 1"
    Visual: grouped section dengan label sequential

Modul 6–19 (Bebas setelah M5):
└── Label: "Bebas Pilih Setelah Modul 5 Selesai"
    Visual: locked overlay + tooltip jika M5 belum selesai
```

---

#### C. ModuleDetail (Halaman Detail Modul)

```
Layout: Single column, max-width 768px, centered

Structure:
┌────────────────────────────────────────────┐
│ ← Kembali ke Daftar Modul                  │
│ ────────────────────────────────────────── │
│ Modul X dari 19                             │
│ # [Judul Modul]                             │
│ Status: [Badge]  Bookmark: [Toggle Icon]   │
│ ────────────────────────────────────────── │
│                                             │
│ [KONTEN MODUL — rich text markdown]         │
│ (sanitized via DOMPurify)                   │
│                                             │
│ Key Takeaway:                               │
│ ┌─────────────────────────────────────────┐ │
│ │ 💡 [Key takeaway text]                  │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ════════════════════════════════════════   │
│ ✍️  TASK PRAKTEK                             │
│ [TaskSubmissionForm]                        │
│                                             │
│ 📋 Riwayat Submission  (FR-08)             │
│ [SubmissionHistoryList]                     │
│                                             │
│ ════════════════════════════════════════   │
│             [Tandai Selesai]               │
│   (disabled jika belum ada submission)     │
└────────────────────────────────────────────┘
```

---

#### D. Dashboard Page (FR-12)

```
Layout: 12-col grid (desktop), stacked (mobile)

┌──────────────────────────────────────────────────┐
│  [ReEngagementBanner — conditional]              │
├──────────────────────────────────────────────────┤
│                                                  │
│  Halo, [Nama User]! 👋                          │
│  Lanjutkan belajarmu hari ini.                  │
│                                                  │
│  ┌────────────────┐  ┌────────────────┐         │
│  │  ProgressCard  │  │   StreakCard   │         │
│  │   8/19 (42%)   │  │   🔥 7 Hari    │         │
│  └────────────────┘  └────────────────┘         │
│                                                  │
│  Lanjutkan Belajar:                              │
│  ┌────────────────────────────────────────────┐ │
│  │  [ModuleCard — modul terakhir diakses]     │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  Modul Berikutnya:                               │
│  [ModuleCard] [ModuleCard] [ModuleCard]         │
│                                                  │
│  Daily Log Hari Ini:                             │
│  [DailyLogForm — compact]                        │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

#### E. Auth Pages (Login, Register, Reset Password)

```
Layout: centered card, max-width 480px

Register (FR-01):
┌────────────────────────────────────┐
│      [Logo MarketingOS]            │
│   Mulai Belajar Marketing          │
│                                    │
│  Nama Lengkap   [________________] │
│  Email          [________________] │
│  Password       [________________] │
│                 [Tampilkan ▼]      │
│                                    │
│        [Daftar Sekarang]           │
│                                    │
│  Sudah punya akun? Login →         │
└────────────────────────────────────┘

Login (FR-02):
┌────────────────────────────────────┐
│      [Logo MarketingOS]            │
│   Selamat Datang Kembali           │
│                                    │
│  Email          [________________] │
│  Password       [________________] │
│  Lupa password? →                  │
│                                    │
│          [Masuk]                   │
│                                    │
│  Belum punya akun? Daftar →        │
└────────────────────────────────────┘

Reset Password (FR-16):
└── 2 halaman: (1) Request email, (2) Form password baru
```

---

#### F. OnboardingFlow (FR-17)

```
Layout: fullscreen modal / dedicated page, centered

Step 1 — Pilih Tujuan Belajar:
┌──────────────────────────────────────────────────┐
│  [StepIndicator: ● ─── ○ ─── ○]                │
│                                                  │
│  Apa tujuan utamamu belajar marketing?           │
│                                                  │
│  ┌───────────────┐  ┌───────────────┐           │
│  │ 🏪 Promosi    │  │ 💼 Karir      │           │
│  │    Bisnis     │  │    Marketing  │           │
│  └───────────────┘  └───────────────┘           │
│  ┌───────────────┐  ┌───────────────┐           │
│  │ 🎓 Belajar    │  │ 🚀 Mulai      │           │
│  │    Skill Baru │  │    Freelance  │           │
│  └───────────────┘  └───────────────┘           │
│                                                  │
│                              [Lanjut →]          │
└──────────────────────────────────────────────────┘

Step 2 — Estimasi Waktu:
└── Slider atau pilihan: 15 mnt / 30 mnt / 1 jam / > 1 jam per hari

Step 3 — Preview Roadmap:
└── Tampilkan visual 19 modul + CTA "Mulai dari Modul 1!"

Choice cards:
├── default: border-neutral-200 bg-white
└── selected: border-primary-500 bg-primary-50 ring-2 ring-primary-200
```

---

## 4. PAGE TEMPLATES

### 4.1 Template: Authenticated App Shell

```
┌─────────────────────────────────────────────────────┐
│  [Sidebar 240px — desktop only]  [Main Content]     │
│  ┌──────────────┐                ┌────────────────┐ │
│  │ Logo         │                │ Page Header    │ │
│  │──────────────│                │                │ │
│  │ ● Dashboard  │                │ [Page Content] │ │
│  │ ○ Modul      │                │                │ │
│  │ ○ Task       │                │                │ │
│  │ ○ Daily Log  │                │                │ │
│  │ ○ Bookmark   │                │                │ │
│  │──────────────│                │                │ │
│  │ [User Card]  │                │                │ │
│  │ 🔥 7  42%    │                └────────────────┘ │
│  └──────────────┘                                   │
└─────────────────────────────────────────────────────┘
```

### 4.2 Template: Auth Pages

```
Centered layout, full-height, gradient background ringan
bg: neutral-50 dengan subtle pattern atau gradient primary-50 → white
Card: white, shadow-lg, radius-2xl, max-w-[480px]
```

### 4.3 Template: Content-Heavy (Modul Detail)

```
Narrowed reading column (max-w-[768px])
Generous vertical rhythm (space-8 antar section)
Typography: body-xl (18px) untuk readability konten panjang
```

---

## 5. INTERACTION PATTERNS

### 5.1 Form Validation Pattern

```
Strategy: Validate on blur + on submit (bukan on type, kecuali character counter)

Error display:
├── Inline: di bawah field yang error
├── Toast:  untuk error submit level
└── Bahasa: spesifik dan actionable (bukan "Terjadi kesalahan")

Examples:
├── Email sudah terdaftar → "Email ini sudah digunakan. Coba login atau gunakan email lain."
├── Password kurang → "Password minimal 8 karakter"
└── Task kurang char → counter merah real-time (tidak perlu error msg terpisah)
```

### 5.2 Loading & Skeleton Pattern

```
Gunakan skeleton loaders (bukan spinner) untuk:
├── ModuleList loading
├── Dashboard widget loading
└── Submission history loading

Gunakan spinner untuk:
├── Button submit (inline)
└── AI feedback loading (dengan teks estimasi waktu)

Skeleton anatomy:
└── bg-neutral-200 animate-pulse rounded (sesuai shape konten)
```

### 5.3 Optimistic UI Pattern

```
Task submission:
1. Klik Submit → UI langsung tampilkan "Submission tersimpan" (optimistic)
2. API call berjalan di background
3. Jika gagal → revert + tampilkan error toast + kembalikan form

Modul marked as complete:
1. Klik Tandai Selesai → status langsung berubah ke "selesai" (optimistic)
2. Progress bar langsung update
3. Jika gagal → revert + error toast
```

### 5.4 Error Recovery Pattern

```
Berdasarkan FR section 5.4 (Edge Cases):

Network error saat submit:
└── Draft tetap di form + error toast + tombol retry

Gemini timeout:
└── Banner warning kuning, submission tetap valid, tombol "Coba AI lagi"

Rate limit (429):
└── Banner merah + countdown X menit, fungsi lain tetap jalan

Session expired:
└── Redirect /login + toast "Sesi habis, silakan login kembali"
    + setelah login redirect kembali ke halaman sebelumnya
```

### 5.5 Mobile Touch Patterns

```
Touch targets: min 44px × 44px (sesuai WCAG)
Tap feedback: scale(0.97) 100ms pada mobile tap
Swipe gestures: opsional (bukan primary navigation)
Bottom navigation: gunakan untuk 5 menu utama di mobile

Keyboard handling:
├── Hindari CLS saat keyboard mobile muncul
└── Form scroll ke field yang error otomatis
```

---

## 6. ACCESSIBILITY GUIDELINES

### 6.1 Color Contrast

```
Text body on white bg:   neutral-700 (#334155) — ratio 7.8:1 ✅ AAA
Text heading on white:   neutral-800 (#1e293b) — ratio 11.9:1 ✅ AAA
Primary button text:     white on primary-500  — ratio 4.6:1 ✅ AA
Disabled text:           neutral-400 on white  — ratio 3.1:1 (intentional, disabled)
Error text:              danger-600 on white   — ratio 5.9:1 ✅ AA
Placeholder text:        neutral-400 on white  — ratio 3.1:1 (acceptable for placeholder)
```

### 6.2 Keyboard Navigation

```
Tab order: logis mengikuti reading order
Focus visible: ring-2 ring-primary-500 ring-offset-2 pada semua interactive elements
Skip link: "Langsung ke konten utama" di paling atas (screen reader / keyboard)
Modal: focus trap saat modal terbuka, kembalikan focus saat close
```

### 6.3 ARIA Labels

```
Icon-only buttons: aria-label wajib
Progress bar: role="progressbar" aria-valuenow aria-valuemin aria-valuemax
Status badges: aria-label="Status: Selesai"
Karakter counter: aria-live="polite" untuk screen reader
Loading states: aria-busy="true" aria-label="Memuat..."
```

### 6.4 Semantic HTML

```
Heading hierarchy: h1 (page title) → h2 (section) → h3 (sub-section)
Lists: ul/ol untuk daftar modul, submission history
Forms: label for + id pada setiap input
Buttons: <button> bukan <div> atau <a> untuk action
Links: <a> dengan href yang bermakna (bukan "#")
```

---

## 7. IMPLEMENTASI TAILWIND CSS

### 7.1 Konfigurasi (tailwind.config.ts)

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        neutral: {
          0:   '#ffffff',
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'display-2xl': ['4.5rem',  { lineHeight: '1.1',  fontWeight: '800' }],
        'display-xl':  ['3.75rem', { lineHeight: '1.1',  fontWeight: '800' }],
        'display-lg':  ['3rem',    { lineHeight: '1.15', fontWeight: '700' }],
        'heading-xl':  ['2.25rem', { lineHeight: '1.2',  fontWeight: '700' }],
        'heading-lg':  ['1.875rem',{ lineHeight: '1.25', fontWeight: '700' }],
        'heading-md':  ['1.5rem',  { lineHeight: '1.3',  fontWeight: '600' }],
        'heading-sm':  ['1.25rem', { lineHeight: '1.35', fontWeight: '600' }],
        'heading-xs':  ['1.125rem',{ lineHeight: '1.4',  fontWeight: '600' }],
        'body-xl':     ['1.125rem',{ lineHeight: '1.75', fontWeight: '400' }],
        'body-lg':     ['1rem',    { lineHeight: '1.75', fontWeight: '400' }],
        'body-md':     ['0.875rem',{ lineHeight: '1.6',  fontWeight: '400' }],
        'body-sm':     ['0.75rem', { lineHeight: '1.5',  fontWeight: '400' }],
        'label-lg':    ['0.875rem',{ lineHeight: '1.4',  fontWeight: '600' }],
        'label-md':    ['0.75rem', { lineHeight: '1.4',  fontWeight: '600' }],
        'label-sm':    ['0.625rem',{ lineHeight: '1.4',  fontWeight: '700', letterSpacing: '0.05em' }],
        'caption':     ['0.75rem', { lineHeight: '1.4',  fontWeight: '400' }],
      },
      borderRadius: {
        'none': '0px',
        'sm':   '4px',
        'md':   '8px',
        'lg':   '12px',
        'xl':   '16px',
        '2xl':  '24px',
        'full': '9999px',
      },
      boxShadow: {
        'xs':    '0 1px 2px 0 rgba(0,0,0,0.05)',
        'sm':    '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
        'md':    '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
        'lg':    '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
        'xl':    '0 20px 25px -5px rgba(0,0,0,0.1)',
        'inner': 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
      },
      transitionDuration: {
        'instant':   '0ms',
        'fast':      '100ms',
        'normal':    '200ms',
        'moderate':  '300ms',
        'slow':      '500ms',
        'very-slow': '1000ms',
      },
      transitionTimingFunction: {
        'default': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce':  'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spring':  'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'streak-pop': {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.4' },
        },
      },
      animation: {
        'fade-in':    'fade-in 200ms ease-out',
        'slide-up':   'slide-up 300ms ease-out',
        'slide-down': 'slide-down 300ms ease-out',
        'scale-in':   'scale-in 200ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'streak-pop': 'streak-pop 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-dot':  'pulse-dot 1.5s ease-in-out infinite',
      },
      maxWidth: {
        'app':    '1280px',
        'narrow': '768px',
        'form':   '480px',
      },
    },
  },
  plugins: [],
}

export default config
```

### 7.2 CSS Custom Properties (globals.css)

```css
@layer base {
  :root {
    /* Semantic color aliases */
    --color-bg-page:     theme('colors.neutral.50');
    --color-bg-surface:  theme('colors.neutral.0');
    --color-bg-subtle:   theme('colors.neutral.100');
    --color-border:      theme('colors.neutral.200');
    --color-text-body:   theme('colors.neutral.700');
    --color-text-muted:  theme('colors.neutral.500');
    --color-text-heading:theme('colors.neutral.800');
    
    /* Sidebar */
    --sidebar-width: 240px;
    
    /* Transitions */
    --transition-default: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }
}

@layer components {
  /* Button base */
  .btn {
    @apply inline-flex items-center justify-center gap-2 font-semibold
           rounded-md transition-all duration-normal
           focus:outline-none focus:ring-2 focus:ring-offset-2
           disabled:opacity-60 disabled:cursor-not-allowed;
  }
  .btn-primary  { @apply bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500; }
  .btn-secondary{ @apply bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 focus:ring-primary-500; }
  .btn-ghost    { @apply bg-transparent text-neutral-600 hover:bg-neutral-100 focus:ring-primary-500; }
  .btn-danger   { @apply bg-danger-500 text-white hover:bg-danger-600 focus:ring-danger-500; }
  .btn-success  { @apply bg-success-500 text-white hover:bg-success-600 focus:ring-success-500; }
  .btn-xs { @apply h-7 px-3 text-label-sm; }
  .btn-sm { @apply h-9 px-4 text-label-md; }
  .btn-md { @apply h-11 px-5 text-label-lg; }
  .btn-lg { @apply h-13 px-6 text-body-lg; }
  .btn-xl { @apply h-15 px-8 text-body-xl; }

  /* Input */
  .input-text {
    @apply w-full rounded-md border border-neutral-200 bg-white px-4 text-body-lg
           text-neutral-800 placeholder:text-neutral-400
           focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100
           disabled:bg-neutral-100 disabled:text-neutral-400
           transition-colors duration-normal;
  }
  .input-error { @apply border-danger-500 ring-2 ring-danger-100; }
  
  /* Card */
  .card {
    @apply bg-white rounded-lg border border-neutral-200 shadow-sm;
  }
  .card-hover {
    @apply hover:shadow-md hover:border-neutral-300 transition-all duration-normal;
  }

  /* Badge */
  .badge {
    @apply inline-flex items-center gap-1 rounded-md px-3 py-1 text-label-md font-semibold;
  }
  .badge-not-started { @apply bg-neutral-100 text-neutral-600; }
  .badge-in-progress { @apply bg-primary-100 text-primary-700; }
  .badge-completed   { @apply bg-success-100 text-success-700; }
  .badge-locked      { @apply bg-neutral-100 text-neutral-400; }
  .badge-streak      { @apply bg-warning-100 text-warning-700; }
}
```

### 7.3 shadcn/ui Component Mapping

```
shadcn/ui components yang dipakai:
├── Button        → base Button (dikustomisasi dengan variants di atas)
├── Input         → base Input (dikustomisasi)
├── Textarea      → base Textarea + character counter custom
├── Badge         → base Badge (dikustomisasi per status)
├── Progress      → base Progress (dikustomisasi warna)
├── Toast         → Toaster + useToast hook
├── Dialog/Modal  → Dialog (untuk onboarding, konfirmasi)
├── Tooltip       → Tooltip (untuk locked module hint)
├── Sheet         → Sheet (untuk mobile sidebar)
├── Separator     → Separator
├── Avatar        → Avatar + AvatarFallback
├── Skeleton      → Skeleton (loading states)
└── Scroll Area   → ScrollArea (sidebar nav)
```

---

## 8. KOMPONEN PRIORITAS DEVELOPMENT

Urutan implementasi berdasarkan dependencies dan flow MVP:

### Sprint 1 — Foundation
1. `tailwind.config.ts` — tokens lengkap
2. `globals.css` — base styles + component classes
3. `Button` — semua variants & sizes
4. `Input`, `Textarea` dengan character counter
5. `Badge` — semua module status variants
6. `Toast` — semua variants
7. `Spinner` + `Skeleton`

### Sprint 2 — Auth & Onboarding
1. `AuthCard` — wrapper halaman auth
2. `LoginForm` (email, password, remember)
3. `RegisterForm` (nama, email, password)
4. `ResetPasswordForm` (email request + new password)
5. `OnboardingStepIndicator`
6. `OnboardingChoiceCard` (pilihan tujuan belajar)

### Sprint 3 — Core Learning
1. `AppShell` — sidebar + layout
2. `ModuleCard` — semua states (locked, in-progress, completed)
3. `ModuleList` — dengan grouping sequential/free
4. `ModuleContent` — rich text rendering area
5. `TaskSubmissionForm` — dengan character counter & draft
6. `MarkCompleteButton` — disabled/enabled logic

### Sprint 4 — Progress & Dashboard
1. `ProgressCard` — circular + linear
2. `StreakCard` — dengan animasi pop
3. `DashboardPage` — layout assembling
4. `ReEngagementBanner` — conditional show/dismiss
5. `DailyLogForm`
6. `BookmarkToggle` (icon button)

### Sprint 5 — v1.1 (Post-MVP)
1. `AIFeedbackCard` — semua states (loading, success, error)
2. `AIChatInterface` — input + response area
3. `RateLimitBanner` — dengan countdown
4. `QuizCard` — pilihan ganda
5. `QuizResult` — skor + penjelasan

---

*Design System ini mengacu pada PRD MarketingOS v1.2 dan dirancang untuk implementasi dengan Next.js 14, TypeScript, Tailwind CSS, dan shadcn/ui.*

*Dokumen berikutnya yang direkomendasikan: (1) Figma Component Library, (2) Storybook Documentation, (3) API Contract untuk setiap komponen.*

**— End of Document — Design System MarketingOS v1.0 —**
