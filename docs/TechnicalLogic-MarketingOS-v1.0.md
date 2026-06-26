# Technical Logic — MarketingOS: Learn by Doing
**Technical Logic Document v1.1 — Payment Manual Transfer**
**Tanggal:** 27 Juni 2026
**Dibuat berdasarkan:** PRD MarketingOS v1.4
**Status:** Draft — Ready for Implementation

---

## 📋 DAFTAR ISI

1. [Auth & Session Logic](#1-auth--session-logic)
2. [Module Access Control Logic](#2-module-access-control-logic)
3. [Task Submission Logic](#3-task-submission-logic)
4. [Progress Calculation Logic](#4-progress-calculation-logic)
5. [Streak Calculation Logic](#5-streak-calculation-logic)
6. [Daily Log Logic](#6-daily-log-logic)
7. [Onboarding Logic](#7-onboarding-logic)
8. [Re-engagement Banner Logic](#8-re-engagement-banner-logic)
9. [Bookmark Logic](#9-bookmark-logic)
10. [AI Coach Logic (v1.1)](#10-ai-coach-logic-v11)
11. [Rate Limiting Logic](#11-rate-limiting-logic)
12. [Error Handling Logic](#12-error-handling-logic)
13. [Database Trigger Logic](#13-database-trigger-logic)
14. [Middleware Logic](#14-middleware-logic)
15. [API Route Contracts](#15-api-route-contracts)
16. [RLS (Row Level Security) Policies](#16-rls-row-level-security-policies)
17. [Database Index Strategy](#17-database-index-strategy)
18. [Migration File Order](#18-migration-file-order)
19. [Subscription Logic](#19-subscription-logic)
    - 19.5 Checkout Flow — Manual Bank Transfer
    - 19.6 Upload Bukti Transfer
    - 19.7 Admin Verification Flow
    - 19.8 Subscription Expiry Check
    - 19.9 Trial Logic
    - 19.10 API Route Contracts — Subscription
    - 19.11 Database Schema — Subscription Tables
    - 19.12 Subscription UI States
    - 19.13 Security Considerations

---

## 1. AUTH & SESSION LOGIC

### 1.1 Register Flow

**Sumber:** FR-01, Sequence 7.1, BR-05 (indirect), NFR-03

```
FUNCTION register(name, email, password):

  // Step 1: Client-side validation (Zod)
  IF email tidak sesuai format RFC 5322:
    RETURN error "Format email tidak valid"
  IF password.length < 8:
    RETURN error "Password minimal 8 karakter"
  IF name.trim().length === 0:
    RETURN error "Nama tidak boleh kosong"

  // Step 2: Call Supabase Auth
  CALL supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }
  })

  // Step 3: Handle response
  IF error.code === 'email_address_already_in_use':
    RETURN error "Email ini sudah terdaftar. Silakan login atau gunakan email lain."
  IF error lain:
    RETURN error "Gagal mendaftar. Coba beberapa saat lagi."

  // Step 4: Supabase otomatis kirim email verifikasi
  // DB Trigger otomatis buat record di public.users (lihat section 13)

  RETURN success "Cek email Anda untuk verifikasi akun"
```

**Acceptance criteria mapping (FR-01):**
- ✅ Email valid format → Zod `z.string().email()`
- ✅ Password min 8 char → Zod `z.string().min(8)`
- ✅ Error spesifik jika email sudah ada → handle `email_address_already_in_use`
- ✅ Email verifikasi < 60 detik → ditangani Supabase (tidak perlu logic tambahan)

---

### 1.2 Login Flow

**Sumber:** FR-02, Sequence 7.1, SEC-C02, NFR-03

```
FUNCTION login(email, password):

  // Step 1: Client-side validation
  IF email kosong OR password kosong:
    RETURN error inline per field

  // Step 2: Call Supabase Auth
  CALL supabase.auth.signInWithPassword({ email, password })

  // Step 3: Handle response
  IF error (credentials salah):
    RETURN error "Email atau password salah"
    // PENTING: Tidak boleh membedakan mana yang salah (security)

  // Step 4: Session tersimpan di HttpOnly Cookie
  // Dilakukan otomatis oleh createServerClient (@supabase/ssr)
  // Cookie: HttpOnly, Secure, SameSite=Lax, MaxAge: 7 hari

  // Step 5: Cek onboarding status
  FETCH user.onboarding_completed FROM public.users WHERE id = session.user.id

  IF onboarding_completed === false:
    REDIRECT ke /welcome  (onboarding flow)
  ELSE:
    REDIRECT ke /dashboard
```

---

### 1.3 Logout Flow

**Sumber:** FR (UC-03), NFR-03

```
FUNCTION logout():
  CALL supabase.auth.signOut()
  // Supabase otomatis invalidate cookie
  REDIRECT ke /login
```

---

### 1.4 Reset Password Flow

**Sumber:** FR-16 (NEW v1.2, BA-C01)

```
// Halaman 1: Request reset link
FUNCTION requestPasswordReset(email):
  IF email kosong atau tidak valid:
    RETURN error "Masukkan email yang valid"

  CALL supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${BASE_URL}/reset-password/confirm`
  })

  // PENTING: Selalu tampilkan pesan sukses meski email tidak terdaftar
  // (mencegah user enumeration attack)
  RETURN success "Jika email terdaftar, link reset telah dikirim (berlaku 24 jam)"


// Halaman 2: Set password baru (dari link email)
FUNCTION confirmPasswordReset(newPassword):
  // Supabase otomatis ambil token dari URL hash

  IF newPassword.length < 8:
    RETURN error "Password baru minimal 8 karakter"
  IF newPassword === oldPassword: // optional check
    RETURN warning "Password baru sama dengan yang lama"

  CALL supabase.auth.updateUser({ password: newPassword })

  IF error 'token_expired' OR 'invalid_token':
    RETURN error "Link reset sudah kadaluarsa. Minta link baru."

  // Supabase otomatis invalidate SEMUA session aktif setelah password diganti
  REDIRECT ke /login dengan pesan "Password berhasil diubah. Silakan login kembali."
```

**Acceptance criteria mapping (FR-16):**
- ✅ Link reset < 60 detik → ditangani Supabase
- ✅ Link expired setelah 24 jam → Supabase default, handle `token_expired`
- ✅ Validasi min 8 karakter → Zod + check sebelum call
- ✅ Semua session di-invalidate → otomatis oleh Supabase `updateUser`

---

### 1.5 Session Validation (Middleware)

```
// Setiap request ke route protected:
FUNCTION validateSession(request):
  session = await supabase.auth.getSession()

  IF session === null OR session.expires_at < now():
    REDIRECT ke /login?next={current_path}
    // Setelah login, redirect kembali ke halaman yang dituju
```

---

## 2. MODULE ACCESS CONTROL LOGIC

**Sumber:** BR-04, FR-03, FR-04, PM-M01

### 2.1 Aturan Akses Modul

```
FUNCTION canAccessModule(user_id, module_order_number):

  // Modul 1–5: Sequential wajib
  IF module_order_number <= 5:
    IF module_order_number === 1:
      RETURN true  // Modul 1 selalu bisa diakses

    // Cek apakah modul sebelumnya sudah selesai
    prev_status = getModuleStatus(user_id, module_order_number - 1)
    IF prev_status === 'completed':
      RETURN true
    ELSE:
      RETURN false, reason: "Selesaikan Modul {module_order_number - 1} terlebih dahulu"

  // Modul 6–19: Bebas setelah Modul 5 selesai
  IF module_order_number >= 6:
    module5_status = getModuleStatus(user_id, 5)
    IF module5_status === 'completed':
      RETURN true
    ELSE:
      RETURN false, reason: "Selesaikan Modul 1–5 terlebih dahulu"
```

### 2.2 Module Status Transition

**Sumber:** BR-02, FR-03, FR-05

```
Status yang valid: 'not_started' | 'in_progress' | 'completed'

Transisi yang diizinkan:
  not_started  → in_progress  (trigger: user pertama kali membuka halaman modul)
  in_progress  → completed    (trigger: user klik "Tandai Selesai" SETELAH ada submission)
  completed    → completed    (immutable — tidak bisa kembali ke status sebelumnya)

FUNCTION updateModuleStatus(user_id, module_id, new_status):
  current_status = getModuleStatus(user_id, module_id)

  // Guard: tidak boleh downgrade status
  IF current_status === 'completed':
    RETURN // abaikan, sudah selesai

  // Trigger status 'in_progress' saat halaman modul pertama kali dibuka (BR-02)
  IF new_status === 'in_progress' AND current_status === 'not_started':
    UPSERT user_progress SET status = 'in_progress', started_at = now()
    WHERE user_id = user_id AND module_id = module_id

  // Tandai selesai — hanya boleh jika ada task submission
  IF new_status === 'completed':
    has_submission = checkHasSubmission(user_id, module_id)
    IF NOT has_submission:
      RETURN error "Kerjakan task terlebih dahulu sebelum menandai selesai"
    UPSERT user_progress SET
      status = 'completed',
      completed_at = now()
    WHERE user_id = user_id AND module_id = module_id
```

### 2.3 Lock State Display Logic

```
FUNCTION getModuleDisplayState(user_id, modules[]):
  FOR each module IN modules:
    can_access = canAccessModule(user_id, module.order_number)
    status     = getModuleStatus(user_id, module.id)

    IF NOT can_access:
      module.display_state = 'locked'
      module.lock_reason   = (module.order_number <= 5)
                             ? "Selesaikan Modul {order-1} dulu"
                             : "Selesaikan Modul 1–5 dulu"
    ELSE:
      module.display_state = status  // 'not_started' | 'in_progress' | 'completed'

  RETURN modules
```

---

## 3. TASK SUBMISSION LOGIC

**Sumber:** FR-07, FR-08, BR-01, BR-05, Sequence 7.2

### 3.1 Submit Task

```
FUNCTION submitTask(user_id, task_id, content):

  // Step 1: Server-side validation (Zod)
  content_trimmed = content.trim()

  IF content_trimmed.length < 50:
    RETURN HTTP 400, error "Jawaban minimal 50 karakter (saat ini: {length} karakter)"

  // Step 2: Ambil task untuk dapat module_id
  task = SELECT * FROM tasks WHERE id = task_id
  IF NOT task:
    RETURN HTTP 404, error "Task tidak ditemukan"

  // Step 3: Simpan submission
  submission = INSERT INTO task_submissions (
    user_id,
    task_id,
    content: content_trimmed,
    submitted_at: now()
  ) RETURNING id

  // Step 4: Update last_active_at user
  UPDATE users SET last_active_at = now() WHERE id = user_id

  RETURN HTTP 200, {
    success: true,
    submission_id: submission.id
  }

  // Catatan: AI feedback adalah proses terpisah, tidak memblokir response ini


// Client-side: Character counter logic
FUNCTION getCounterState(content):
  length = content.length
  IF length < 50:
    RETURN { color: 'danger', text: `${length} / 50 karakter`, submitEnabled: false }
  ELSE:
    RETURN { color: 'success', text: `${length} karakter`, submitEnabled: true }
```

### 3.2 Get Submission History

**Sumber:** FR-08

```
FUNCTION getSubmissionHistory(user_id, task_id):
  submissions = SELECT
    id,
    content,
    submitted_at,
    ai_feedback,
    score
  FROM task_submissions
  WHERE user_id = user_id AND task_id = task_id
  ORDER BY submitted_at DESC

  // Format preview: 100 karakter pertama
  FOR each s IN submissions:
    s.preview = s.content.substring(0, 100) + (s.content.length > 100 ? '...' : '')

  RETURN submissions
```

### 3.3 Mark Module Complete

**Sumber:** FR-05, BR-01

```
FUNCTION markModuleComplete(user_id, module_id):

  // Cek ada submission untuk module ini
  task    = SELECT id FROM tasks WHERE module_id = module_id LIMIT 1
  has_sub = SELECT COUNT(*) FROM task_submissions
            WHERE user_id = user_id AND task_id = task.id

  IF has_sub === 0:
    RETURN HTTP 400, error "Kerjakan dan submit task terlebih dahulu"

  // Update status
  UPSERT user_progress SET
    status       = 'completed',
    completed_at = now()
  WHERE user_id = user_id AND module_id = module_id

  RETURN HTTP 200, { success: true }
```

---

## 4. PROGRESS CALCULATION LOGIC

**Sumber:** FR-09, FR-12

```
FUNCTION calculateOverallProgress(user_id):
  TOTAL_MODULES = 19

  completed_count = SELECT COUNT(*) FROM user_progress
                    WHERE user_id = user_id AND status = 'completed'

  percentage = Math.round((completed_count / TOTAL_MODULES) * 100)

  RETURN {
    completed: completed_count,
    total:     TOTAL_MODULES,
    percentage: percentage    // sudah dibulatkan ke integer
  }

// Acceptance criteria FR-09:
// ✅ (jumlah selesai / 19) × 100, dibulatkan → Math.round
// ✅ Real-time update → revalidatePath('/dashboard') setelah markComplete
// ✅ Tampil di dashboard dan header modul
```

---

## 5. STREAK CALCULATION LOGIC

**Sumber:** FR-11, BR-03, QA-C02, Glossary

### 5.1 Aturan Streak

```
Streak = jumlah hari berturut-turut user membuat daily log
Timezone: WIB (UTC+7) — semua kalkulasi menggunakan DATE dalam WIB
Reset ke 1 (bukan 0) jika tidak ada log kemarin
Kalkulasi: dilakukan REAL-TIME saat user menyimpan daily log (bukan scheduled job)
```

### 5.2 Streak Calculation Function

```
FUNCTION calculateStreak(user_id):

  // Ambil tanggal hari ini dalam WIB
  today_WIB     = toWIBDate(new Date())   // FORMAT: 'YYYY-MM-DD'
  yesterday_WIB = subDays(today_WIB, 1)

  // Cek apakah ada log kemarin
  log_yesterday = SELECT id FROM daily_logs
                  WHERE user_id = user_id
                    AND log_date = yesterday_WIB
                  LIMIT 1

  IF log_yesterday EXISTS:
    // Lanjutkan streak
    current_streak = SELECT streak_count FROM users WHERE id = user_id
    new_streak = current_streak + 1
  ELSE:
    // Reset ke 1 (hari ini adalah hari pertama lagi)
    new_streak = 1

  UPDATE users SET
    streak_count   = new_streak,
    last_active_at = now()
  WHERE id = user_id

  RETURN new_streak


// Helper: Konversi ke DATE dalam WIB
FUNCTION toWIBDate(utcDate):
  // UTC+7 = tambah 7 jam, ambil bagian DATE saja
  wib_datetime = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000)
  RETURN wib_datetime.toISOString().split('T')[0]  // 'YYYY-MM-DD'
```

### 5.3 Streak Edge Cases

```
Case 1: User buat log hari ini lagi (update log yang sama)
  → Streak TIDAK berubah (sudah dihitung saat log pertama hari ini)
  → Cek: ada log hari ini? IF yes → skip recalculate streak

Case 2: User baru pertama kali buat log
  → new_streak = 1

Case 3: User buat log, lalu ganti timezone device
  → Platform selalu pakai WIB server-side, bukan client timezone
  → Field log_date disimpan sebagai DATE (bukan timestamp) dalam WIB

Case 4: User buat log tengah malam WIB (23:59)
  → toWIBDate() akan return tanggal yang benar untuk WIB
  → log_date = TODAY (WIB), bukan UTC yang mungkin sudah besok
```

---

## 6. DAILY LOG LOGIC

**Sumber:** FR-10, FR-11, Sequence 7.4

```
FUNCTION saveDailyLog(user_id, note):

  today_WIB = toWIBDate(new Date())

  // UPSERT: satu log per hari per user (ON CONFLICT UPDATE)
  log = UPSERT INTO daily_logs (
    user_id,
    log_date: today_WIB,
    note:     note.trim()
  )
  ON CONFLICT (user_id, log_date)
  DO UPDATE SET note = EXCLUDED.note, updated_at = now()

  // Cek apakah ini log pertama hari ini atau edit log yang sudah ada
  is_new_log = (created_at === updated_at)   // log baru = created = updated

  IF is_new_log:
    // Kalkulasi ulang streak hanya untuk log baru (bukan edit)
    new_streak = calculateStreak(user_id)
  ELSE:
    new_streak = SELECT streak_count FROM users WHERE id = user_id

  RETURN {
    log_date:  today_WIB,
    streak:    new_streak,
    is_new:    is_new_log
  }


FUNCTION getTodayLog(user_id):
  today_WIB = toWIBDate(new Date())
  RETURN SELECT * FROM daily_logs
         WHERE user_id = user_id AND log_date = today_WIB
         LIMIT 1
  // Jika null → form kosong; jika ada → form prefilled mode edit
```

---

## 7. ONBOARDING LOGIC

**Sumber:** FR-17, PM-C01, Sequence 5.1

```
FUNCTION handlePostLoginRedirect(user_id):
  user = SELECT onboarding_completed FROM users WHERE id = user_id

  IF user.onboarding_completed === false:
    REDIRECT ke /welcome         // guided onboarding
  ELSE:
    REDIRECT ke /dashboard


// Step 1: Pilih tujuan belajar
FUNCTION saveOnboardingStep1(user_id, learning_goal):
  // learning_goal: 'bisnis' | 'karir' | 'skill_baru' | 'freelance'
  UPDATE users SET learning_goal = learning_goal WHERE id = user_id
  RETURN { next_step: 2 }


// Step 2: Estimasi waktu per hari
FUNCTION saveOnboardingStep2(user_id, daily_minutes):
  // daily_minutes: 15 | 30 | 60 | 90
  UPDATE users SET daily_minutes_target = daily_minutes WHERE id = user_id
  RETURN { next_step: 3 }


// Step 3: Konfirmasi + selesai
FUNCTION completeOnboarding(user_id):
  UPDATE users SET onboarding_completed = true WHERE id = user_id
  RETURN { redirect: '/dashboard' }
  // Modul 1 akan otomatis direkomendasikan di dashboard


// Guard: Jika user mencoba akses /welcome setelah onboarding selesai
FUNCTION onboardingGuard(user_id):
  user = SELECT onboarding_completed FROM users WHERE id = user_id
  IF user.onboarding_completed === true:
    REDIRECT ke /dashboard
```

**Acceptance criteria mapping (FR-17):**
- ✅ Muncul hanya SEKALI (flag `onboarding_completed`) → UPDATE to true di step 3
- ✅ 3 langkah (tujuan, waktu, roadmap preview) → 3 step functions di atas
- ✅ Data tersimpan di profil user → `learning_goal` + `daily_minutes_target` di tabel `users`

---

## 8. RE-ENGAGEMENT BANNER LOGIC

**Sumber:** FR-18, PM-C02

```
FUNCTION shouldShowReEngagementBanner(user_id):

  user = SELECT last_active_at FROM users WHERE id = user_id

  IF user.last_active_at IS NULL:
    RETURN false    // user baru, tidak perlu banner

  days_inactive = dateDiffInDays(now(), user.last_active_at)  // dalam WIB

  IF days_inactive > 2:
    // Ambil modul terakhir diakses
    last_module = SELECT m.title, m.slug
                  FROM user_progress up
                  JOIN modules m ON m.id = up.module_id
                  WHERE up.user_id = user_id
                  ORDER BY up.started_at DESC
                  LIMIT 1

    RETURN {
      show:         true,
      message:      `Selamat datang kembali! Lanjutkan: ${last_module.title}`,
      module_slug:  last_module.slug,
      days_inactive: days_inactive
    }

  RETURN { show: false }


// Dismiss logic (client-side)
FUNCTION dismissBanner():
  // Simpan di localStorage (tidak perlu DB — dismiss bersifat session/lokal)
  localStorage.setItem('banner_dismissed_at', new Date().toISOString())
  // Banner tidak muncul lagi sampai besok atau page refresh setelah kembali aktif
```

---

## 9. BOOKMARK LOGIC

**Sumber:** FR-19, PM-M04

```
FUNCTION toggleBookmark(user_id, module_id):

  // is_bookmarked ada di user_progress sebagai field boolean
  current = SELECT is_bookmarked FROM user_progress
            WHERE user_id = user_id AND module_id = module_id

  IF current IS NULL:
    // Belum ada record progress → buat record baru dengan is_bookmarked = true
    INSERT INTO user_progress (user_id, module_id, status, is_bookmarked)
    VALUES (user_id, module_id, 'not_started', true)
    RETURN { is_bookmarked: true }

  new_value = NOT current.is_bookmarked
  UPDATE user_progress SET is_bookmarked = new_value
  WHERE user_id = user_id AND module_id = module_id

  RETURN { is_bookmarked: new_value }


FUNCTION getBookmarkedModules(user_id):
  RETURN SELECT m.*
         FROM user_progress up
         JOIN modules m ON m.id = up.module_id
         WHERE up.user_id = user_id AND up.is_bookmarked = true
         ORDER BY m.order_number ASC
```

---

## 10. AI COACH LOGIC (v1.1)

**Sumber:** FR-13, FR-14, BR-06, NFR-08, Sequence 7.3

### 10.1 AI Feedback untuk Task Submission

```
FUNCTION requestAIFeedback(user_id, submission_id):

  // Rate limit check sudah dilakukan di Edge Middleware (lihat section 11)

  // Ambil data yang diperlukan
  submission = SELECT ts.content, t.description, t.rubric, m.title, m.content_markdown
               FROM task_submissions ts
               JOIN tasks t ON t.id = ts.task_id
               JOIN modules m ON m.id = t.module_id
               WHERE ts.id = submission_id AND ts.user_id = user_id

  IF NOT submission:
    RETURN HTTP 404, error "Submission tidak ditemukan"

  // Bangun prompt
  prompt = buildFeedbackPrompt({
    module_title:  submission.module_title,
    task_desc:     submission.task_description,
    rubric:        submission.rubric,
    user_answer:   submission.content
  })

  // Log usage (sebelum call ke Gemini)
  INSERT INTO ai_usage_log (user_id, endpoint: '/api/ai/feedback', created_at: now())

  // Call Gemini dengan timeout 10 detik
  TRY WITH TIMEOUT 10000ms:
    response = await gemini.generateContent(prompt)
    feedback = response.text()

    // Simpan feedback ke DB
    UPDATE task_submissions SET
      ai_feedback = feedback,
      score       = extractScore(feedback)   // parse skor dari teks Gemini
    WHERE id = submission_id

    RETURN HTTP 200, { ai_feedback: feedback, score: score }

  CATCH timeout OR error:
    // Log error di server (tidak expose ke client)
    console.error('Gemini error:', error)

    RETURN HTTP 200, {
      submission_id: submission_id,
      ai_feedback:   null,
      error:         'ai_unavailable'
    }
    // PENTING: Submission tetap valid. Response 200 bukan 500.


// Template prompt Gemini (lib/gemini/prompts.ts)
FUNCTION buildFeedbackPrompt({ module_title, task_desc, rubric, user_answer }):
  RETURN `
    Kamu adalah AI Coach untuk platform belajar marketing "MarketingOS".
    
    Modul: ${module_title}
    Task: ${task_desc}
    Rubrik Penilaian: ${rubric}
    
    Jawaban Pengguna:
    "${user_answer}"
    
    Berikan feedback dalam Bahasa Indonesia dengan format:
    1. Skor: [angka 0-100]
    2. Poin Kuat: [2-3 poin positif]
    3. Saran Perbaikan: [2-3 saran konkret]
    4. Ringkasan: [1 paragraf motivasi]
    
    Fokus pada kualitas penerapan konsep marketing, bukan tata bahasa.
  `
```

### 10.2 AI Chat (Tanya Jawab per Modul)

```
FUNCTION aiChat(user_id, module_id, user_question):

  // Validasi panjang input (FR-14)
  IF user_question.length > 500:
    RETURN HTTP 400, error "Pertanyaan maksimal 500 karakter"
  IF user_question.trim().length === 0:
    RETURN HTTP 400, error "Pertanyaan tidak boleh kosong"

  // Ambil konteks modul
  module = SELECT title, content_markdown FROM modules WHERE id = module_id

  // Ambil 100 kata pertama konten sebagai konteks (FR-14)
  context_words = module.content_markdown
    .replace(/[#*`]/g, '')         // strip markdown symbols
    .split(/\s+/)
    .slice(0, 100)
    .join(' ')

  // Bangun prompt dengan konteks
  prompt = buildChatPrompt({
    module_title: module.title,
    context:      context_words,
    question:     user_question
  })

  // Log usage
  INSERT INTO ai_usage_log (user_id, endpoint: '/api/ai/chat', created_at: now())

  TRY WITH TIMEOUT 10000ms:
    response = await gemini.generateContent(prompt)
    RETURN HTTP 200, { answer: response.text() }

  CATCH timeout OR error:
    RETURN HTTP 200, { answer: null, error: 'ai_unavailable' }
```

---

## 11. RATE LIMITING LOGIC

**Sumber:** NFR-08, BR-06, SEC-C01, Sequence 7.3

```
// Diimplementasikan di middleware.ts (Vercel Edge Middleware)

FUNCTION aiRateLimitMiddleware(request, user_id):
  LIMIT     = 10      // request per jam
  WINDOW    = 3600    // 1 jam dalam detik

  // Hitung request dalam 1 jam terakhir
  one_hour_ago = new Date(now() - WINDOW * 1000)

  count = SELECT COUNT(*) FROM ai_usage_log
          WHERE user_id = user_id
            AND created_at >= one_hour_ago
            AND endpoint IN ('/api/ai/feedback', '/api/ai/chat')

  IF count >= LIMIT:
    // Hitung kapan slot tersedia
    oldest_in_window = SELECT MIN(created_at) FROM ai_usage_log
                       WHERE user_id = user_id
                         AND created_at >= one_hour_ago

    next_available_at = oldest_in_window + WINDOW seconds
    minutes_left      = Math.ceil((next_available_at - now()) / 60000)

    RETURN HTTP 429, {
      error:   'rate_limit_exceeded',
      message: `Batas penggunaan AI tercapai. Coba lagi dalam ${minutes_left} menit.`,
      retry_after_minutes: minutes_left
    }

  // Lanjut ke API Route
  RETURN next()
```

---

## 12. ERROR HANDLING LOGIC

**Sumber:** FR section 5.4, Sequence 7.5, SA-C02

### 12.1 Kategori Error & Response

```
// Konvensi response error semua API:
{
  error:     string,          // error code machine-readable
  message:   string,          // pesan user-readable (Bahasa Indonesia)
  retryable: boolean,         // apakah client boleh retry
  data?:     object           // data tambahan (opsional)
}

Error codes:
VALIDATION_ERROR    → HTTP 400  retryable: false
NOT_FOUND           → HTTP 404  retryable: false
UNAUTHORIZED        → HTTP 401  retryable: false (redirect /login)
FORBIDDEN           → HTTP 403  retryable: false
RATE_LIMITED        → HTTP 429  retryable: true  (dengan retry_after_minutes)
SUBMISSION_FAILED   → HTTP 500  retryable: true
AI_UNAVAILABLE      → HTTP 200  retryable: true  (submission masih valid)
INTERNAL_ERROR      → HTTP 500  retryable: true
```

### 12.2 Client-Side Error Handling

```
FUNCTION handleAPIError(error, context):

  // Network error (tidak ada koneksi)
  IF error instanceof NetworkError OR error.status === 0:
    showToast('error', 'Tidak ada koneksi internet. Pastikan Anda online.')
    IF context === 'task_submit':
      // Jaga draft tetap di form (tidak clear)
      preserveDraftInForm()

  // Session expired
  IF error.status === 401:
    saveCurrentPath()
    redirect('/login?message=session_expired')

  // Rate limit
  IF error.status === 429:
    showBanner('rate_limit', error.data.message)  // countdown dari retry_after_minutes

  // Server error (bisa retry)
  IF error.status >= 500 AND error.retryable:
    showToast('error', error.message + ' Coba lagi.')
    IF context === 'task_submit':
      enableRetryButton()

  // Validation (tidak perlu toast — sudah ada inline error)
  IF error.status === 400:
    displayInlineErrors(error.errors)
```

### 12.3 Gemini API Error Handling

```
// Semua error Gemini ditangani di API Route (tidak sampai ke client sebagai error)
// Client hanya tahu: feedback tersedia atau tidak tersedia

FUNCTION handleGeminiError(error, submission_id):

  error_types = {
    'TIMEOUT':         'Request Gemini melebihi 10 detik',
    'QUOTA_EXCEEDED':  'Gemini free tier quota habis',
    'INVALID_KEY':     'API key tidak valid',
    'SAFETY_BLOCKED':  'Konten diblokir Gemini safety filter',
    '503':             'Gemini service tidak tersedia',
  }

  // Log di server (tidak expose detail ke client)
  console.error(`[Gemini Error] submission_id=${submission_id}`, error)

  // Response ke client selalu format yang sama
  RETURN {
    submission_id: submission_id,
    ai_feedback:   null,
    error:         'ai_unavailable',
    // submission tetap valid, modul bisa ditandai selesai
  }
```

---

## 13. DATABASE TRIGGER LOGIC

**Sumber:** SA-C01, Sequence 7.1, section 14 roadmap

### 13.1 Trigger: Auto-create public.users saat Register

```sql
-- File: supabase/migrations/20260627000002_create_triggers.sql

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    name,
    email,
    onboarding_completed,
    streak_count,
    last_active_at,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'name',
    NEW.email,
    false,
    0,
    now(),
    now(),
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Alasan pakai trigger (bukan direct insert dari frontend):**
- Tidak bisa di-bypass dari client
- Single responsibility — DB yang bertanggung jawab atas konsistensi data
- Sesuai rekomendasi SA-C01 PRD v1.2

---

## 14. MIDDLEWARE LOGIC

**Sumber:** NFR-03, NFR-08, SEC-C01, SEC-C02

```typescript
// middleware.ts

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Auth Guard — protect semua route dashboard
  if (pathname.startsWith('/(dashboard)') || pathname.startsWith('/dashboard')) {
    const session = await getSupabaseSession(request)
    if (!session) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // 2. Redirect jika sudah login mencoba akses auth pages
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    const session = await getSupabaseSession(request)
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // 3. Rate limit — hanya untuk AI endpoints
  if (pathname.startsWith('/api/ai/')) {
    const session = await getSupabaseSession(request)
    if (!session) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const rateLimitResult = await checkAIRateLimit(session.user.id)
    if (!rateLimitResult.allowed) {
      return NextResponse.json({
        error:   'rate_limit_exceeded',
        message: `Batas penggunaan AI tercapai. Coba lagi dalam ${rateLimitResult.minutes_left} menit.`,
        retry_after_minutes: rateLimitResult.minutes_left
      }, { status: 429 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
```

---

## 15. API ROUTE CONTRACTS

Semua endpoint Next.js App Router (`app/api/...`).

### 15.1 Auth Routes (via Supabase SSR)

```
GET/POST  /api/auth/[...supabase]
  → Ditangani otomatis oleh @supabase/ssr (refresh token, session sync)
  → Tidak perlu custom logic
```

### 15.2 Task Routes

```
POST /api/tasks/submit
  Request:
    Body: { task_id: string, content: string }
    Auth: session cookie required

  Response 200:
    { success: true, submission_id: string }

  Response 400:
    { error: 'VALIDATION_ERROR', message: 'Jawaban minimal 50 karakter' }

  Response 404:
    { error: 'NOT_FOUND', message: 'Task tidak ditemukan' }

  Response 401:
    { error: 'UNAUTHORIZED' }


GET /api/tasks/submissions?task_id={id}
  Response 200:
    {
      submissions: [
        {
          id: string,
          content: string,
          preview: string,          // 100 char pertama
          submitted_at: string,     // ISO timestamp
          ai_feedback: string|null,
          score: number|null
        }
      ]
    }
```

### 15.3 Progress Routes

```
GET /api/progress
  Response 200:
    {
      completed: number,
      total: 19,
      percentage: number,           // 0–100, integer
      modules: [
        {
          id: string,
          order_number: number,
          title: string,
          status: 'not_started' | 'in_progress' | 'completed',
          is_bookmarked: boolean
        }
      ]
    }


POST /api/progress/complete
  Request:
    Body: { module_id: string }

  Response 200:
    { success: true, new_percentage: number }

  Response 400:
    { error: 'NO_SUBMISSION', message: 'Kerjakan task terlebih dahulu' }
```

### 15.4 Daily Log Routes

```
GET /api/daily-log
  → Ambil log hari ini (DATE WIB)
  Response 200:
    {
      log: { id, note, log_date } | null,
      streak_count: number
    }


POST /api/daily-log
  Request:
    Body: { note: string }

  Response 200:
    {
      log_date:    string,          // 'YYYY-MM-DD'
      streak:      number,
      is_new_log:  boolean
    }
```

### 15.5 Bookmark Routes

```
POST /api/bookmarks/toggle
  Request:
    Body: { module_id: string }

  Response 200:
    { is_bookmarked: boolean }


GET /api/bookmarks
  Response 200:
    {
      modules: [
        { id, order_number, title, slug, status }
      ]
    }
```

### 15.6 AI Routes (v1.1)

```
POST /api/ai/feedback
  Request:
    Body: { submission_id: string }
  Auth: session + rate limit check (middleware)

  Response 200 (success):
    { ai_feedback: string, score: number }

  Response 200 (ai down):
    { ai_feedback: null, error: 'ai_unavailable', submission_id: string }

  Response 429:
    { error: 'rate_limit_exceeded', message: string, retry_after_minutes: number }


POST /api/ai/chat
  Request:
    Body: { module_id: string, question: string }
  Auth: session + rate limit check (middleware)

  Response 200:
    { answer: string }

  Response 400:
    { error: 'VALIDATION_ERROR', message: 'Pertanyaan maksimal 500 karakter' }

  Response 200 (ai down):
    { answer: null, error: 'ai_unavailable' }
```

---

## 16. RLS (ROW LEVEL SECURITY) POLICIES

**Sumber:** NFR-03, NFR-06

```sql
-- File: supabase/migrations/20260627000003_add_rls_policies.sql

-- Aktifkan RLS di semua tabel
ALTER TABLE public.users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_log    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs      ENABLE ROW LEVEL SECURITY;

-- users: hanya bisa baca/update record sendiri
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- user_progress: CRUD hanya milik sendiri
CREATE POLICY "progress_all_own" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id);

-- task_submissions: CRUD hanya milik sendiri
CREATE POLICY "submissions_all_own" ON public.task_submissions
  FOR ALL USING (auth.uid() = user_id);

-- daily_logs: CRUD hanya milik sendiri
CREATE POLICY "daily_logs_all_own" ON public.daily_logs
  FOR ALL USING (auth.uid() = user_id);

-- modules & tasks: semua user bisa baca (content publik)
CREATE POLICY "modules_select_all" ON public.modules
  FOR SELECT USING (is_published = true);

CREATE POLICY "tasks_select_all" ON public.tasks
  FOR SELECT USING (true);

-- ai_usage_log: user hanya bisa baca milik sendiri (insert via server-side only)
CREATE POLICY "ai_log_select_own" ON public.ai_usage_log
  FOR SELECT USING (auth.uid() = user_id);
```

---

## 17. DATABASE INDEX STRATEGY

**Sumber:** SA-M01, ERD section 8

```sql
-- File: supabase/migrations/20260627000004_create_indexes.sql

-- user_progress: query paling sering — status modul per user
CREATE UNIQUE INDEX idx_user_progress_user_module
  ON user_progress (user_id, module_id);

-- task_submissions: riwayat submission per user per task
CREATE INDEX idx_task_submissions_user_task
  ON task_submissions (user_id, task_id);

-- daily_logs: cek streak — log kemarin
CREATE UNIQUE INDEX idx_daily_logs_user_date
  ON daily_logs (user_id, log_date);
-- UNIQUE mencegah duplikasi log per hari per user

-- ai_usage_log: rate limiting — COUNT dalam 1 jam
CREATE INDEX idx_ai_usage_log_user_time
  ON ai_usage_log (user_id, created_at DESC);

-- modules: sort by order
CREATE INDEX idx_modules_order ON modules (order_number ASC);

-- audit_logs: query trail per user
CREATE INDEX idx_audit_logs_user_time
  ON audit_logs (user_id, created_at DESC);
```

---

## 18. MIGRATION FILE ORDER

**Sumber:** SA-M04, section 14 PRD

```
supabase/migrations/
├── 20260627000001_initial_schema.sql
│   └── CREATE TABLE: users, modules, tasks, user_progress,
│       task_submissions, daily_logs, quiz_questions, quiz_attempts,
│       ai_usage_log, audit_logs
│
├── 20260627000002_create_triggers.sql
│   └── handle_new_user() trigger on auth.users INSERT
│
├── 20260627000003_add_rls_policies.sql
│   └── ENABLE RLS + semua policies per tabel
│
├── 20260627000004_create_indexes.sql
│   └── Semua index wajib (lihat section 17)
│
└── 20260627000005_add_subscription_tables.sql
    └── CREATE TABLE: subscriptions, subscription_orders, payment_proofs
        ALTER TABLE users ADD COLUMN current_plan
        ENABLE RLS + policies subscription tables
        CREATE INDEX subscription + payment_proofs indexes
        [v1.4] Tidak ada snap_token/midtrans_tx_id — flow manual transfer
```

---

---

## 19. SUBSCRIPTION LOGIC

**Sumber:** Business Model Hypothesis (PRD Appendix B), FR-20 s/d FR-25 (NEW), BR-07 s/d BR-11 (NEW)

### 19.1 Subscription Plans

```
Plan tiers yang tersedia:
├── FREE     — akses Modul 1–5 + semua fitur dasar (tanpa AI Coach)
├── PRO      — akses semua 19 modul + AI Coach (Rp 99.000/bulan)
└── LIFETIME — akses seumur hidup semua konten (Rp 399.000 one-time)

Catatan: Subscription BARU AKTIF setelah MVP success criteria terpenuhi
(≥ 50 MAU, completion rate ≥ 3 modul, streak rata-rata ≥ 5 hari)
Semua user existing saat launch tetap FREE (grandfather policy).
```

### 19.2 Plan Access Rules (Business Rules)

```
BR-07: User FREE hanya bisa membuka Modul 1–5
  → Modul 6–19 tampil dengan overlay "Upgrade ke PRO" bukan "locked" biasa

BR-08: User PRO / LIFETIME bisa akses semua 19 modul (tetap tunduk BR-04 sequential)
  → Sequential rule (M1→M5) tetap berlaku meski sudah PRO

BR-09: AI Coach (FR-13, FR-14) hanya tersedia untuk PRO / LIFETIME
  → Tombol AI Coach tidak tampil / disabled untuk user FREE
  → Bukan error — tampilkan prompt upgrade yang ramah

BR-10: Trial PRO 7 hari gratis untuk user baru yang register setelah fitur subscription aktif
  → Setelah 7 hari tanpa subscribe → otomatis downgrade ke FREE
  → Modul 6–19 yang sedang in_progress → status dibekukan (tidak hilang)

BR-11: Subscription PRO bersifat monthly recurring, batal kapan saja
  → Akses PRO aktif sampai akhir periode yang sudah dibayar
  → Setelah expired → downgrade ke FREE, progress tetap tersimpan
```

### 19.3 Subscription State Machine

```
States: 'free' | 'trial' | 'pro' | 'lifetime' | 'expired'

Transisi yang valid:
  free     → trial    (register baru, otomatis — jika fitur aktif)
  free     → pro      (user melakukan pembayaran bulanan)
  free     → lifetime (user melakukan one-time purchase)
  trial    → pro      (user subscribe sebelum trial habis)
  trial    → free     (trial 7 hari habis, tidak subscribe)
  pro      → free     (subscription expired / tidak diperbarui)
  pro      → lifetime (user upgrade dari bulanan ke lifetime)
  lifetime → lifetime (immutable — tidak bisa downgrade)
  expired  → pro      (user subscribe ulang)
  expired  → free     (alias expired setelah grace period)

FUNCTION getSubscriptionState(user_id):
  sub = SELECT * FROM subscriptions
        WHERE user_id = user_id
        ORDER BY created_at DESC
        LIMIT 1

  IF sub IS NULL:
    RETURN 'free'

  IF sub.plan = 'lifetime':
    RETURN 'lifetime'

  IF sub.plan = 'trial':
    IF now() <= sub.trial_ends_at:
      RETURN 'trial'
    ELSE:
      RETURN 'free'   // trial expired

  IF sub.plan = 'pro':
    IF now() <= sub.current_period_end:
      RETURN 'pro'
    ELSE:
      RETURN 'expired'   // belum bayar lagi, dalam grace period atau sudah lewat

  RETURN 'free'
```

### 19.4 Module Access dengan Subscription Check

```
// Extend canAccessModule() dari section 2.1 dengan subscription check

FUNCTION canAccessModule(user_id, module_order_number):

  sub_state = getSubscriptionState(user_id)

  // Subscription gate: Modul 6–19 butuh PRO atau LIFETIME
  IF module_order_number >= 6:
    IF sub_state NOT IN ('pro', 'trial', 'lifetime'):
      RETURN {
        allowed: false,
        reason:  'subscription_required',
        cta:     'Upgrade ke PRO untuk akses semua 19 modul'
      }

  // Sequential gate (tetap berlaku setelah subscription check)
  IF module_order_number <= 5:
    IF module_order_number === 1:
      RETURN { allowed: true }
    prev_status = getModuleStatus(user_id, module_order_number - 1)
    IF prev_status !== 'completed':
      RETURN { allowed: false, reason: 'prerequisite_not_met' }

  IF module_order_number >= 6:
    module5_status = getModuleStatus(user_id, 5)
    IF module5_status !== 'completed':
      RETURN { allowed: false, reason: 'prerequisite_not_met' }

  RETURN { allowed: true }


// Display state: bedakan 'locked' (sequential) vs 'upgrade_required' (subscription)
FUNCTION getModuleDisplayState(user_id, modules[]):
  FOR each module IN modules:
    access = canAccessModule(user_id, module.order_number)

    IF NOT access.allowed:
      IF access.reason === 'subscription_required':
        module.display_state = 'upgrade_required'   // overlay khusus upgrade
        module.cta           = access.cta
      ELSE:
        module.display_state = 'locked'             // lock sequential biasa
    ELSE:
      module.display_state = getModuleStatus(user_id, module.id)

  RETURN modules
```

### 19.5 Checkout Flow — Manual Bank Transfer

**[UPDATE v1.4]** Tidak menggunakan payment gateway. User melakukan transfer manual ke rekening admin, lalu mengupload bukti transfer.

```
// Konfigurasi rekening tujuan (disimpan di env var atau DB config)
BANK_TRANSFER_CONFIG = {
  bank_name:       'BCA',                    // atau Bank lain pilihan admin
  account_number:  '1234567890',             // nomor rekening admin
  account_name:    'Vincent Edy Hartono',    // nama pemilik rekening
  payment_expiry_hours: 24                   // batas waktu transfer
}

PRICE_MAP = {
  pro_monthly: 99000,    // Rp 99.000/bulan
  lifetime:    399000    // Rp 399.000 one-time
}

PLAN_DISPLAY_NAMES = {
  pro_monthly: 'MarketingOS PRO (1 Bulan)',
  lifetime:    'MarketingOS Lifetime Access'
}


FUNCTION initiateCheckout(user_id, plan):

  // Validasi plan
  IF plan NOT IN ('pro_monthly', 'lifetime'):
    RETURN HTTP 400, error "Plan tidak valid"

  // Cek apakah sudah ada pending order untuk user ini (cegah order ganda)
  existing_pending = SELECT id FROM subscription_orders
                    WHERE user_id = user_id AND status = 'pending_payment'
                    ORDER BY created_at DESC LIMIT 1

  IF existing_pending:
    // Kembalikan order yang sudah ada daripada buat baru
    order = SELECT * FROM subscription_orders WHERE id = existing_pending.id
    RETURN buildCheckoutResponse(order)

  // Buat order baru
  order_id    = generateOrderId()   // format: MOS-{timestamp}-{user_id_prefix_6char}
  amount      = PRICE_MAP[plan]
  expires_at  = addHours(now(), BANK_TRANSFER_CONFIG.payment_expiry_hours)

  INSERT INTO subscription_orders (
    id:          order_id,
    user_id:     user_id,
    plan:        plan,
    amount:      amount,
    status:      'pending_payment',
    bank_name:   BANK_TRANSFER_CONFIG.bank_name,
    bank_account: BANK_TRANSFER_CONFIG.account_number,
    expires_at:  expires_at,
    created_at:  now()
  )

  RETURN {
    order_id:        order_id,
    plan:            plan,
    plan_name:       PLAN_DISPLAY_NAMES[plan],
    amount:          amount,
    amount_formatted: 'Rp ' + formatNumber(amount),   // "Rp 99.000"
    bank_name:       BANK_TRANSFER_CONFIG.bank_name,
    account_number:  BANK_TRANSFER_CONFIG.account_number,
    account_name:    BANK_TRANSFER_CONFIG.account_name,
    expires_at:      expires_at,
    upload_url:      `/subscription/upload-proof?order_id=${order_id}`
  }

FUNCTION buildCheckoutResponse(order):
  RETURN {
    order_id:        order.id,
    plan:            order.plan,
    plan_name:       PLAN_DISPLAY_NAMES[order.plan],
    amount:          order.amount,
    amount_formatted: 'Rp ' + formatNumber(order.amount),
    bank_name:       order.bank_name,
    account_number:  order.bank_account,
    account_name:    BANK_TRANSFER_CONFIG.account_name,
    expires_at:      order.expires_at,
    upload_url:      `/subscription/upload-proof?order_id=${order.id}`
  }
```

### 19.6 Upload Bukti Transfer

**[NEW v1.4]** User mengupload screenshot/foto bukti transfer setelah melakukan pembayaran.

```
// POST /api/subscription/upload-proof (multipart/form-data)

ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024   // 5MB

FUNCTION uploadPaymentProof(user_id, order_id, file):

  // Step 1: Validasi order milik user dan masih valid
  order = SELECT * FROM subscription_orders
          WHERE id = order_id AND user_id = user_id
  IF NOT order:
    RETURN HTTP 404, error "Order tidak ditemukan"

  IF order.status NOT IN ('pending_payment', 'proof_rejected'):
    RETURN HTTP 400, error "Order ini tidak bisa diupload buktinya (status: ${order.status})"

  IF now() > order.expires_at:
    UPDATE subscription_orders SET status = 'expired' WHERE id = order_id
    RETURN HTTP 400, error "Order sudah kadaluarsa. Buat order baru untuk melanjutkan pembayaran."

  // Step 2: Validasi file
  IF file.size > MAX_FILE_SIZE_BYTES:
    RETURN HTTP 400, error "Ukuran file maksimal 5MB"

  IF file.mimetype NOT IN ALLOWED_MIME_TYPES:
    RETURN HTTP 400, error "Format file harus JPG, PNG, WebP, atau PDF"

  // Step 3: Sanitasi nama file & buat path storage
  safe_filename = sanitizeFilename(file.originalname)  // strip karakter berbahaya
  extension     = getExtension(file.mimetype)          // '.jpg', '.png', '.pdf'
  storage_path  = `${order_id}/${user_id}_${Date.now()}${extension}`
  // Contoh: "MOS-1719000000000-abc123/abc123_1719000100000.jpg"

  // Step 4: Upload ke Supabase Storage (bucket: payment-proofs, private)
  upload_result = await supabase.storage
    .from('payment-proofs')
    .upload(storage_path, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    })

  IF upload_result.error:
    RETURN HTTP 500, error "Gagal mengupload file. Coba lagi."

  // Step 5: Buat record payment_proof
  proof = INSERT INTO payment_proofs (
    order_id:    order_id,
    user_id:     user_id,
    file_url:    storage_path,   // path di Supabase Storage (bukan public URL)
    file_name:   safe_filename,
    status:      'pending_verification',
    uploaded_at: now(),
    created_at:  now()
  ) RETURNING id

  // Step 6: Update status order
  UPDATE subscription_orders SET
    status:     'waiting_verification',
    updated_at: now()
  WHERE id = order_id

  RETURN HTTP 200, {
    proof_id:   proof.id,
    status:     'waiting_verification',
    message:    'Bukti transfer berhasil diunggah. Verifikasi dalam 1×24 jam kerja.',
    uploaded_at: proof.uploaded_at
  }


// Helper: Generate secure signed URL untuk admin melihat bukti
FUNCTION getProofSignedUrl(storage_path):
  result = await supabase.storage
    .from('payment-proofs')
    .createSignedUrl(storage_path, 3600)   // valid 1 jam
  RETURN result.data.signedUrl
```

### 19.7 Admin Verification Flow

**[NEW v1.4]** Admin memverifikasi bukti transfer dan mengaktifkan subscription secara manual.

```
// Endpoint ini hanya bisa dipanggil dengan Supabase service_role key (admin only)
// Di MVP: admin menjalankan ini via Supabase Studio (SQL Editor) atau
//         halaman admin sederhana yang dilindungi API key di header

FUNCTION adminVerifyProof(admin_user_id, proof_id, action, rejection_reason?):

  // action: 'approve' | 'reject'
  proof = SELECT pp.*, so.user_id, so.plan, so.amount
          FROM payment_proofs pp
          JOIN subscription_orders so ON so.id = pp.order_id
          WHERE pp.id = proof_id

  IF NOT proof:
    RETURN HTTP 404, error "Bukti transfer tidak ditemukan"

  IF proof.status !== 'pending_verification':
    RETURN HTTP 400, error "Bukti ini sudah diproses (status: ${proof.status})"

  IF action === 'approve':
    // Tandai proof sebagai verified
    UPDATE payment_proofs SET
      status:      'verified',
      verified_by: admin_user_id,
      verified_at: now()
    WHERE id = proof_id

    // Aktifkan subscription
    activateSubscription(proof.user_id, proof.plan, proof.order_id)

    RETURN HTTP 200, { message: "Subscription berhasil diaktifkan" }

  IF action === 'reject':
    IF NOT rejection_reason OR rejection_reason.trim() === '':
      RETURN HTTP 400, error "Alasan penolakan wajib diisi"

    UPDATE payment_proofs SET
      status:           'rejected',
      verified_by:      admin_user_id,
      verified_at:      now(),
      rejection_reason: rejection_reason
    WHERE id = proof_id

    // Update order kembali ke proof_rejected agar user bisa upload ulang
    UPDATE subscription_orders SET
      status:     'proof_rejected',
      updated_at: now()
    WHERE id = proof.order_id

    RETURN HTTP 200, { message: "Bukti transfer ditolak" }


FUNCTION activateSubscription(user_id, plan, order_id):

  IF plan === 'pro_monthly':
    period_start = now()
    period_end   = addMonths(now(), 1)

    UPSERT subscriptions (
      user_id:              user_id,
      plan:                 'pro',
      status:               'active',
      current_period_start: period_start,
      current_period_end:   period_end,
      order_id:             order_id,
      activated_at:         now()
    )

  IF plan === 'lifetime':
    UPSERT subscriptions (
      user_id:      user_id,
      plan:         'lifetime',
      status:       'active',
      order_id:     order_id,
      activated_at: now()
      // Tidak ada period_end untuk lifetime
    )

  UPDATE subscription_orders SET
    status:     'paid',
    updated_at: now()
  WHERE id = order_id

  // Update user plan cache (untuk cek cepat tanpa JOIN)
  UPDATE users SET
    current_plan: (plan === 'pro_monthly' ? 'pro' : 'lifetime'),
    updated_at:   now()
  WHERE id = user_id


// Idempotency guard: cek sebelum proses ulang
FUNCTION isAlreadyActivated(order_id):
  order = SELECT status FROM subscription_orders WHERE id = order_id
  RETURN order.status === 'paid'
  // Jika sudah 'paid' → skip, return 200 tanpa proses ulang
```

### 19.8 Subscription Expiry Check

```
// Dijalankan saat user membuka aplikasi (bukan scheduled job di MVP)
// Cukup dicek di getSubscriptionState() setiap request ke dashboard

FUNCTION checkAndExpireSubscription(user_id):
  sub = SELECT * FROM subscriptions
        WHERE user_id = user_id AND plan = 'pro' AND status = 'active'
        ORDER BY created_at DESC LIMIT 1

  IF sub AND now() > sub.current_period_end:
    UPDATE subscriptions SET status = 'expired' WHERE id = sub.id
    UPDATE users SET current_plan = 'free' WHERE id = user_id

    // Bekukan progress modul 6–19 yang sedang in_progress
    // (tidak dihapus — tetap tersimpan jika user subscribe lagi)
    // Status tetap 'in_progress', hanya akses yang di-gate

    RETURN 'expired'

  RETURN sub?.plan ?? 'free'
```

### 19.9 Trial Logic

```
FUNCTION activateTrial(user_id):
  // Hanya untuk user yang register setelah fitur subscription aktif

  existing = SELECT id FROM subscriptions WHERE user_id = user_id
  IF existing:
    RETURN // sudah pernah punya subscription, tidak dapat trial lagi

  INSERT INTO subscriptions (
    user_id:        user_id,
    plan:           'trial',
    status:         'active',
    trial_ends_at:  addDays(now(), 7),
    activated_at:   now()
  )

  UPDATE users SET current_plan = 'trial' WHERE id = user_id


FUNCTION isTrialExpired(user_id):
  sub = SELECT trial_ends_at FROM subscriptions
        WHERE user_id = user_id AND plan = 'trial'
        LIMIT 1

  IF NOT sub:
    RETURN false

  IF now() > sub.trial_ends_at:
    UPDATE subscriptions SET status = 'expired' WHERE user_id = user_id AND plan = 'trial'
    UPDATE users SET current_plan = 'free' WHERE id = user_id
    RETURN true

  RETURN false
```

### 19.10 API Route Contracts — Subscription

**[UPDATE v1.4]** Endpoint Midtrans webhook dihapus. Diganti dengan upload bukti dan verifikasi admin.

```
GET /api/subscription
  Auth: session required
  Response 200:
    {
      plan:               'free' | 'trial' | 'pro' | 'lifetime' | 'expired',
      current_period_end: string | null,    // ISO timestamp, null jika free/lifetime
      trial_ends_at:      string | null,    // ISO timestamp, null jika bukan trial
      days_remaining:     number | null,    // hitung dari period_end atau trial_ends_at
      pending_order?: {                     // jika ada order yang belum selesai
        order_id:   string,
        status:     'pending_payment' | 'waiting_verification' | 'proof_rejected',
        expires_at: string | null
      }
    }


POST /api/subscription/checkout
  Auth: session required
  Request:
    Body: { plan: 'pro_monthly' | 'lifetime' }
  Response 200:
    {
      order_id:         string,
      plan:             string,
      plan_name:        string,
      amount:           number,
      amount_formatted: string,              // "Rp 99.000"
      bank_name:        string,
      account_number:   string,
      account_name:     string,
      expires_at:       string,              // ISO timestamp, 24 jam dari now
      upload_url:       string               // "/subscription/upload-proof?order_id=..."
    }
  Response 400:
    { error: 'INVALID_PLAN', message: 'Plan tidak valid' }


POST /api/subscription/upload-proof
  Auth: session required
  Request:
    Content-Type: multipart/form-data
    Fields:
      order_id: string
      file:     File (JPG/PNG/WebP/PDF, maks 5MB)
  Response 200:
    {
      proof_id:    string,
      status:      'waiting_verification',
      message:     'Bukti transfer berhasil diunggah. Verifikasi dalam 1×24 jam kerja.',
      uploaded_at: string
    }
  Response 400:
    { error: 'VALIDATION_ERROR', message: string }
    // "Ukuran file maksimal 5MB"
    // "Format file harus JPG, PNG, WebP, atau PDF"
    // "Order sudah kadaluarsa. Buat order baru."
  Response 404:
    { error: 'NOT_FOUND', message: 'Order tidak ditemukan' }


GET /api/subscription/orders
  Auth: session required
  Response 200:
    {
      orders: [
        {
          id:         string,
          plan:       string,
          plan_name:  string,
          amount:     number,
          status:     'pending_payment' | 'waiting_verification' | 'proof_rejected' | 'paid' | 'expired',
          created_at: string,
          expires_at: string | null,
          proof?: {
            status:           'pending_verification' | 'verified' | 'rejected',
            uploaded_at:      string,
            rejection_reason: string | null
          }
        }
      ]
    }


// ADMIN ONLY — dipanggil dengan service_role key atau dari halaman admin
POST /api/admin/subscription/verify
  Auth: Supabase service_role (BUKAN session user biasa)
  Request:
    Body: {
      proof_id:          string,
      action:            'approve' | 'reject',
      rejection_reason?: string   // wajib jika action = 'reject'
    }
  Response 200:
    { message: string }
  Response 400:
    { error: string }
```

### 19.11 Database Schema — Subscription Tables

**[UPDATE v1.4]** Hapus kolom `midtrans_tx_id` dan `snap_token` dari `subscription_orders`. Tambah tabel `payment_proofs` dan kolom yang sesuai flow manual transfer.

```sql
-- Tambahkan ke migration: 20260627000005_add_subscription_tables.sql

-- Tabel utama subscription
CREATE TABLE public.subscriptions (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan                 text NOT NULL CHECK (plan IN ('trial', 'pro', 'lifetime')),
  status               text NOT NULL CHECK (status IN ('active', 'expired', 'refunded', 'cancelled')),
  current_period_start timestamptz,
  current_period_end   timestamptz,
  trial_ends_at        timestamptz,
  order_id             text,                    -- FK ke subscription_orders (set setelah order dibuat)
  activated_at         timestamptz NOT NULL DEFAULT now(),
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- Tabel order / transaksi (manual bank transfer)
CREATE TABLE public.subscription_orders (
  id            text PRIMARY KEY,               -- format: MOS-{ts}-{prefix}
  user_id       uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan          text NOT NULL,                  -- 'pro_monthly' | 'lifetime'
  amount        integer NOT NULL,               -- dalam Rupiah (99000, 399000)
  status        text NOT NULL DEFAULT 'pending_payment'
                  CHECK (status IN (
                    'pending_payment',          -- order dibuat, menunggu transfer
                    'waiting_verification',     -- bukti transfer sudah diupload
                    'proof_rejected',           -- bukti ditolak admin, user bisa upload ulang
                    'paid',                     -- admin approve, subscription aktif
                    'expired'                   -- 24 jam berlalu tanpa pembayaran
                  )),
  bank_name     text NOT NULL,                  -- nama bank tujuan transfer
  bank_account  text NOT NULL,                  -- nomor rekening tujuan transfer
  expires_at    timestamptz NOT NULL,           -- batas waktu transfer (24 jam dari created)
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Tabel bukti transfer
CREATE TABLE public.payment_proofs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         text NOT NULL REFERENCES subscription_orders(id) ON DELETE CASCADE,
  user_id          uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  file_url         text NOT NULL,               -- path di Supabase Storage (bukan public URL)
  file_name        text NOT NULL,               -- nama file asli (sudah disanitasi)
  status           text NOT NULL DEFAULT 'pending_verification'
                     CHECK (status IN ('pending_verification', 'verified', 'rejected')),
  verified_by      uuid REFERENCES public.users(id),   -- user_id admin yang memverifikasi
  verified_at      timestamptz,
  rejection_reason text,                        -- wajib diisi jika status = 'rejected'
  uploaded_at      timestamptz NOT NULL DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Tambah kolom current_plan di users (cache untuk cek cepat)
ALTER TABLE public.users
  ADD COLUMN current_plan text NOT NULL DEFAULT 'free'
    CHECK (current_plan IN ('free', 'trial', 'pro', 'lifetime'));

-- Index
CREATE INDEX idx_subscriptions_user ON subscriptions (user_id, created_at DESC);
CREATE INDEX idx_subscriptions_status ON subscriptions (status, current_period_end);
CREATE INDEX idx_subscription_orders_user ON subscription_orders (user_id, created_at DESC);
CREATE INDEX idx_subscription_orders_status ON subscription_orders (status, expires_at);
CREATE INDEX idx_payment_proofs_order ON payment_proofs (order_id);
CREATE INDEX idx_payment_proofs_pending ON payment_proofs (status, uploaded_at DESC)
  WHERE status = 'pending_verification';        -- partial index untuk antrian admin

-- RLS
ALTER TABLE public.subscriptions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_proofs      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "orders_select_own" ON public.subscription_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "proofs_select_own" ON public.payment_proofs
  FOR SELECT USING (auth.uid() = user_id);

-- User bisa INSERT payment_proof untuk ordernya sendiri
CREATE POLICY "proofs_insert_own" ON public.payment_proofs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert/Update subscriptions dan subscription_orders hanya via service_role (server-side admin)
-- Tidak ada policy INSERT/UPDATE untuk user biasa pada kedua tabel tersebut
```

### 19.12 Subscription UI States

**[UPDATE v1.4]** Tambah states untuk pending payment flow.

```
State: FREE (Modul 6–19 terkunci)
├── ModuleCard modul 6–19: overlay "PRO" badge + tombol "Upgrade"
├── AI Coach button: hidden atau disabled dengan tooltip "Fitur PRO"
└── Dashboard: banner soft CTA "Buka semua 19 modul — mulai dari Rp 99.000/bln"

State: PENDING_PAYMENT (order dibuat, belum transfer)
├── Banner: "Selesaikan pembayaran — transfer Rp XX.000 ke rekening [bank] [nomor]"
├── Countdown timer sampai expires_at
├── Tombol "Upload Bukti Transfer" tersedia
└── Tombol "Batalkan Order" tersedia

State: WAITING_VERIFICATION (bukti sudah diupload)
├── Banner: "Bukti transfer sedang diverifikasi. Estimasi 1×24 jam kerja."
├── Status badge: "Menunggu Verifikasi"
└── Tombol upload tidak aktif (sudah diupload)

State: PROOF_REJECTED (bukti ditolak admin)
├── Banner warning: "Bukti transfer ditolak: [alasan penolakan]"
├── Tombol "Upload Ulang Bukti Transfer"
└── User bisa upload bukti yang baru

State: TRIAL (7 hari)
├── Banner countdown: "Trial PRO berakhir dalam X hari. Subscribe sekarang →"
├── Akses penuh semua modul + AI Coach
└── Menjelang hari ke-7: banner lebih mencolok (warning-500)

State: PRO (aktif)
├── Badge "PRO" di profil / sidebar
├── Tidak ada banner CTA upgrade
└── Akses penuh semua modul + AI Coach

State: LIFETIME
├── Badge "Lifetime" di profil / sidebar
└── Tidak ada banner apapun — experience bersih

State: EXPIRED (PRO habis)
├── Toast saat login: "Subscription PRO kamu telah berakhir."
├── Modul 6–19 kembali terkunci (overlay upgrade)
└── Progress & submission tetap tersimpan — tidak hilang
```

### 19.13 Security Considerations

**[UPDATE v1.4]** Security focus bergeser dari webhook verification ke file upload security dan admin authorization.

```
1. File upload validation WAJIB — validasi tipe dan ukuran di server-side
   ✅ Cek MIME type (bukan hanya ekstensi) menggunakan library 'file-type'
   ✅ Maksimal 5MB per file
   ✅ Sanitasi nama file — strip karakter berbahaya, hanya izinkan [a-zA-Z0-9._-]
   Reason: tanpa ini, attacker bisa upload file berbahaya atau sangat besar

2. Supabase Storage bucket 'payment-proofs' WAJIB private
   ✅ Tidak ada policy SELECT publik di bucket ini
   ✅ Akses file hanya via createSignedUrl() dengan expiry pendek (maks 1 jam)
   Reason: bukti transfer mengandung data keuangan sensitif user

3. Aktivasi subscription hanya via service_role — tidak ada endpoint self-activate
   ✅ POST /api/admin/subscription/verify hanya bisa dipanggil dengan SUPABASE_SERVICE_ROLE_KEY
   ✅ SUPABASE_SERVICE_ROLE_KEY hanya di server-side env var, tidak pernah ke client
   Reason: tanpa ini, user bisa bypass verifikasi dan aktifkan subscription sendiri

4. Order ID unik per transaksi — cegah order manipulation
   Format: MOS-{timestamp_ms}-{6_char_user_id_prefix}
   ✅ User hanya bisa upload bukti untuk order miliknya sendiri (RLS + server-side check)

5. Idempotency guard di activateSubscription
   IF order.status === 'paid' → skip, return 200 tanpa proses ulang
   Reason: mencegah admin tidak sengaja meng-approve dua kali

6. Order expiry enforcement
   ✅ Saat upload, server cek: IF now() > order.expires_at → tolak upload, suruh buat order baru
   ✅ Expired orders tidak bisa diaktifkan meskipun ada bukti terupload

7. Storage path tidak boleh predictable
   Path: {order_id}/{user_id}_{timestamp}{ext}
   Reason: mencegah user menebak path file milik user lain (defense in depth)

8. Grace period 1×24 jam setelah expired sebelum akses benar-benar dicabut
   Reason: toleransi jika user terlambat bayar karena masalah teknis
```

---

*Dokumen ini adalah referensi teknis implementasi yang diturunkan langsung dari PRD MarketingOS v1.4. Setiap logic memiliki referensi ke FR/BR/NFR asal.*

*Perubahan v1.1: Payment flow diganti dari Midtrans automated gateway ke manual bank transfer + upload bukti transfer. Section 19.5–19.7 sepenuhnya ditulis ulang. Section 19.9–19.13 diupdate menyesuaikan DB schema dan security model baru.*

*Dokumen berikutnya yang direkomendasikan: (1) API Endpoint Specification detail (OpenAPI/Swagger), (2) Test Case & Scenario per FR, (3) Migration SQL files implementasi.*

**— End of Document — Technical Logic MarketingOS v1.1 —**
