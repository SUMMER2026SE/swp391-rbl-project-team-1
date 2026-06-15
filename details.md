# EduPath AI — Full Technical Documentation

> **Project:** SWP391 Nhóm 1 — EduPath AI Learning Platform  
> **Stack:** Node.js + Express + Prisma + PostgreSQL (Supabase) + React + Vite  
> **Architecture:** Monorepo (pnpm workspaces) — `apps/api` (backend) + `apps/web` (frontend)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack](#2-tech-stack)
3. [Database Schema](#3-database-schema)
4. [API Routes Reference](#4-api-routes-reference)
5. [Authentication System](#5-authentication-system)
6. [OTP Registration Flow](#6-otp-registration-flow)
7. [Google OAuth Flow](#7-google-oauth-flow)
8. [Role System & Permissions](#8-role-system--permissions)
9. [Role Change Request Flow](#9-role-change-request-flow)
10. [Payment System](#10-payment-system)
11. [Course System](#11-course-system)
12. [Exam & Testing System](#12-exam--testing-system)
13. [AI Features](#13-ai-features)
14. [Security & Validation](#14-security--validation)
15. [Frontend Components](#15-frontend-components)
16. [State Management](#16-state-management)
17. [Environment Variables](#17-environment-variables)
18. [Local Development Setup](#18-local-development-setup)

---

## 1. Architecture Overview

```
SWP391_NHOM1_EDUCATION/
├── apps/
│   ├── api/                  # Express.js REST API (port 4000)
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Database models
│   │   │   ├── seed.ts               # Seed data
│   │   │   └── migrations/           # SQL migration history
│   │   └── src/
│   │       ├── controllers/          # Route handler functions
│   │       │   ├── auth.ts           # Auth, OTP, Google OAuth, role change
│   │       │   ├── course.ts         # Course CRUD
│   │       │   ├── exam.ts           # Exam attempts and scoring
│   │       │   ├── payment.ts        # VNPay + SePay webhooks
│   │       │   ├── ai.ts             # AI tutor, roadmap, question gen
│   │       │   └── chatbot.ts        # OpenRouter proxy
│   │       ├── middleware/
│   │       │   └── auth.ts           # JWT verification middleware
│   │       ├── lib/
│   │       │   ├── prisma.ts         # Prisma client singleton
│   │       │   ├── socket.ts         # Socket.io initialization
│   │       │   ├── mailer.ts         # Nodemailer Gmail SMTP
│   │       │   ├── rate-limiter.ts   # In-memory OTP rate limiting
│   │       │   └── disposable-domains.ts  # Disposable email blocklist
│   │       └── index.ts              # Express app, route registration
│   └── web/                  # React + Vite frontend (port 5173)
│       └── src/
│           ├── components/           # React components
│           ├── assets/               # Static images
│           ├── App.jsx               # Root component, global state
│           ├── api.js                # API client functions
│           ├── main.jsx              # App entry, GoogleOAuthProvider
│           └── index.css             # Global styles
├── package.json              # Root workspace config
├── pnpm-workspace.yaml       # pnpm workspace definition
└── vercel.json               # Vercel deployment routing
```

**Request flow:**

```
Browser (React) → api.js (fetch) → Express index.ts → authenticateJWT → requireRole → Controller → Prisma → PostgreSQL (Supabase)
```

**Real-time:** Socket.io is initialized on the HTTP server for future use (forum notifications, live chat).

---

## 2. Tech Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 24.x | Runtime |
| Express.js | 4.19.x | HTTP framework |
| TypeScript | 5.4.x | Type safety |
| tsx | 4.11.x | TS execution in dev (`tsx watch`) |
| Prisma ORM | 5.22.x | Database access layer |
| PostgreSQL | 15.x (Supabase) | Primary database |
| bcrypt | 5.1.x | Password & OTP hashing |
| jsonwebtoken | 9.0.x | JWT access/refresh/temp tokens |
| nodemailer | 6.9.x | Gmail SMTP email sending |
| socket.io | 4.7.x | WebSocket server |
| multer | 1.4.x | File upload handling |
| dotenv | 16.4.x | Environment variable loading |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.x | UI framework |
| Vite | 8.x | Build tool + dev server |
| @react-oauth/google | latest | Google OAuth login |
| Recharts | latest | Charts (progress, revenue) |
| Socket.io-client | latest | WebSocket client |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Supabase | Managed PostgreSQL with connection pooling (pgBouncer port 6543) |
| Vercel | Frontend + API deployment |
| OpenRouter | AI API gateway (Google Gemini 2.5 Flash) |
| SePay | Bank transfer webhook automation |
| VNPay | Payment gateway (sandbox) |
| Gmail SMTP | Transactional email via nodemailer |

---

## 3. Database Schema

### Enums

```prisma
enum Role          { GUEST  STUDENT  TEACHER  ADMIN }
enum Difficulty    { EASY  MEDIUM  HARD }
enum OtpPurpose    { REGISTRATION  PASSWORD_RESET  EMAIL_CHANGE }
enum RequestStatus { PENDING  APPROVED  REJECTED }
```

### Models

#### User
Central identity record. Each user has exactly one role sub-profile (Student, Teacher, or Admin).

| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | Auto-increment |
| email | String (unique) | Login identifier |
| passwordHash | String | bcrypt hash (cost factor 12) |
| fullName | String | Display name |
| avatarUrl | String? | Profile picture URL |
| role | Role | GUEST / STUDENT / TEACHER / ADMIN |
| isActive | Boolean | Ban flag (false = blocked) |
| isPro | Boolean | PRO membership flag |
| googleId | String? (unique) | Linked Google account sub ID |
| emailVerified | Boolean | Set true after OTP verification |
| onboardingComplete | Boolean | Set true after role selection |
| createdAt | DateTime | Account creation timestamp |
| updatedAt | DateTime | Last update timestamp |

#### Student
One-to-one with User (userId is both FK and PK).

| Field | Type | Description |
|-------|------|-------------|
| userId | Int (PK, FK → User) | |
| subjectGroup | String | Khối thi: A00, A01, B00, C00, D01, etc. |
| enrollments | Enrollment[] | Purchased courses |
| testAttempts | TestAttempt[] | Exam history |
| roadmap | Roadmap? | Adaptive study plan |
| chatMessages | ChatMessage[] | AI tutor history |
| reviews | Review[] | Course reviews |

#### Teacher
One-to-one with User.

| Field | Type | Description |
|-------|------|-------------|
| userId | Int (PK, FK → User) | |
| isApproved | Boolean | Admin approval required before login |
| bio | String | Teacher biography |
| courses | Course[] | Created courses |

#### Course

| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | |
| title | String | Course name |
| description | String? | Full description |
| subject | String | Subject (Toán, Lý, Hóa, etc.) |
| subjectGroup | String? | Exam group filter |
| price | Float | 0 = free, >0 = paid (VND) |
| thumbnailUrl | String? | Cover image |
| isPublished | Boolean | Published flag (teacher controls) |
| isApproved | Boolean | Admin approval flag |
| teacherId | Int (FK → Teacher) | |
| lessons | Lesson[] | Ordered lesson list |
| enrollments | Enrollment[] | Purchases |
| reviews | Review[] | Student reviews |

#### Lesson

| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | |
| courseId | Int (FK → Course) | |
| title | String | Lesson name |
| order | Int | Display order |
| videoUrl | String? | Video link |
| content | String? | Text/markdown content |
| duration | Int? | Duration in minutes |
| documents | Document[] | Attached materials |

#### Enrollment
Records a paid or free course access grant.

| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | |
| studentId | Int (FK → Student) | |
| courseId | Int (FK → Course) | |
| paidAt | DateTime | Payment confirmed timestamp |
| transactionId | String (unique) | VNPay/SePay transaction reference |

#### Question

| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | |
| content | String | Question text |
| options | Json | `["A. ...", "B. ...", "C. ...", "D. ..."]` |
| correctAnswer | String | Correct option letter ("A", "B", "C", or "D") |
| explanation | String? | Answer explanation |
| subject | String | Subject category |
| topic | String | Specific topic for weak-point tracking |
| difficulty | Difficulty | EASY / MEDIUM / HARD |
| createdBy | Int | User ID of creator |

#### Exam

| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | |
| title | String | Exam name |
| subject | String | Subject |
| subjectGroup | String? | Target exam group |
| duration | Int | Duration in minutes |
| isPublic | Boolean | Visibility |
| createdBy | Int | User ID |
| examQuestions | ExamQuestion[] | Ordered question list |
| attempts | TestAttempt[] | All student attempts |

#### ExamQuestion
Composite PK — maps questions to exams with ordering.

| Field | Type | Description |
|-------|------|-------------|
| examId | Int (PK, FK → Exam) | |
| questionId | Int (PK, FK → Question) | |
| order | Int | Question display order |

#### TestAttempt

| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | |
| studentId | Int (FK → Student) | |
| examId | Int (FK → Exam) | |
| score | Float? | Score 0–10 |
| startedAt | DateTime | Attempt start time |
| submittedAt | DateTime? | Submission time |
| aiFeedback | Json? | `{ assessment, knowledgeGaps[], advice, encouragement }` |
| attemptAnswers | TestAttemptAnswer[] | Per-question answers |

#### TestAttemptAnswer

| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | |
| attemptId | Int (FK → TestAttempt) | |
| questionId | Int (FK → Question) | |
| selectedAnswer | String | "A" / "B" / "C" / "D" |
| isCorrect | Boolean | Computed at submission |

#### Roadmap
One-to-one with Student. Upserted after each exam submission.

| Field | Type | Description |
|-------|------|-------------|
| studentId | Int (PK, FK → Student) | |
| content | Json | Weekly plan JSON (see AI section) |
| generatedAt | DateTime | Last regeneration timestamp |

#### OtpVerification
Persisted OTP records — replaces insecure in-memory store.

| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | |
| email | String | Target email (lowercase) |
| otpHash | String | bcrypt hash of 6-digit OTP |
| purpose | OtpPurpose | REGISTRATION / PASSWORD_RESET / EMAIL_CHANGE |
| payload | Json? | Registration data encrypted in record |
| attempts | Int | Failed attempt counter |
| maxAttempts | Int | Default 5 — locked after this |
| expiresAt | DateTime | 10 minutes from creation |
| isUsed | Boolean | Invalidated after use or expiry |

Index: `(email, purpose)` for fast lookup.

#### RoleChangeRequest

| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | |
| userId | Int (FK → User, CASCADE) | |
| currentRole | Role | Role at time of request |
| requestedRole | Role | Desired role |
| reason | String? | User-provided reason |
| status | RequestStatus | PENDING / APPROVED / REJECTED |
| reviewedBy | Int? | Admin user ID |
| reviewedAt | DateTime? | Review timestamp |
| createdAt | DateTime | |

Index: `(userId, status)`.

---

## 4. API Routes Reference

Base URL (local): `http://localhost:4000`  
Base URL (production): `/api` (Vercel strips prefix)

### Auth Routes

| Method | Path | Auth | Body / Params | Response |
|--------|------|------|---------------|----------|
| POST | `/login` | No | `{ email, password }` | `{ accessToken, refreshToken, user }` |
| POST | `/logout` | No | — | `{ success: true }` |
| POST | `/auth/send-otp` | No | `{ email, fullName, password, role, subjectGroup, bio, phone }` | `{ message, expiresInMinutes, cooldownSeconds }` |
| POST | `/auth/resend-otp` | No | `{ email }` | `{ message, expiresInMinutes, cooldownSeconds }` |
| POST | `/auth/verify-otp-register` | No | `{ email, otp }` | `{ accessToken, refreshToken, user }` |
| POST | `/auth/google` | No | `{ email, fullName, googleId, avatarUrl }` | Existing: `{ tokens, user }` · New: `{ tempToken, googleProfile }` |
| POST | `/auth/google/complete-onboarding` | No | `{ tempToken, role, subjectGroup }` | `{ accessToken, refreshToken, user }` |
| POST | `/auth/change-password` | JWT | `{ oldPassword, newPassword }` | `{ success: true }` |
| POST | `/auth/role-change-request` | JWT | `{ requestedRole, reason }` | `{ requestId, message }` |

### Admin Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/role-change-requests` | JWT + ADMIN | List all PENDING role change requests |
| POST | `/admin/role-change-requests/:id/review` | JWT + ADMIN | Body: `{ action: "approve" \| "reject" }` |

### Course Routes

| Method | Path | Auth | Query Params | Description |
|--------|------|------|--------------|-------------|
| GET | `/courses` | No | `subject`, `subjectGroup`, `free` | List approved + published courses |
| GET | `/courses/:id` | No | — | Course detail with lessons and reviews |
| GET | `/courses/:id/stats` | No | — | `{ enrollmentCount, averageRating }` |
| POST | `/courses` | JWT + TEACHER/ADMIN | `{ title, description, subject, subjectGroup, price, thumbnailUrl }` | Create course (pending approval) |

### Exam Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/exams` | No | List public exams with question count |
| POST | `/exams/:id/attempts` | JWT + STUDENT | Start a new exam attempt |
| POST | `/exams/:id/attempts/:attemptId/submit` | JWT + STUDENT | Submit answers, get score + AI feedback |

Submit body: `{ answers: { [questionId]: "A" \| "B" \| "C" \| "D" } }`

### Payment Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/enrollments` | JWT + STUDENT | Body: `{ courseId }` — returns VNPay checkout URL |
| GET | `/enrollments/webhook` | No | VNPay IPN callback — verifies HMAC-SHA512 signature |
| GET | `/enrollments/status` | JWT + STUDENT | Query: `?courseId=X` — check if student enrolled |
| POST | `/enrollments/sepay-webhook` | No | SePay bank transfer webhook |
| GET | `/users/pro-status` | JWT + STUDENT | Returns `{ isPro: boolean }` |

### AI Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/ai/chat` | JWT + STUDENT | Body: `{ message, history }` — SSE streaming response |
| POST | `/ai/roadmap/refresh` | JWT + STUDENT | Recalculate adaptive study roadmap from exam history |
| POST | `/ai/generate-questions` | JWT + TEACHER/ADMIN | Body: `{ subject, topic, count, difficulty }` — AI question generation |

### Public Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/chatbot` | No | Body: `{ message, history }` — OpenRouter AI proxy |
| GET | `/` | No | Health check |

---

## 5. Authentication System

### JWT Token Architecture

Three token types are used:

| Token | Secret Env | Expiry | Purpose |
|-------|-----------|--------|---------|
| `accessToken` | `JWT_SECRET` | 15 minutes | API request authentication |
| `refreshToken` | `JWT_REFRESH_SECRET` | 7 days | Silent access token renewal |
| `tempToken` | `JWT_TEMP_SECRET` | 10 minutes | Google OAuth onboarding session |

**Access token payload:**
```json
{ "id": 1, "email": "user@example.com", "fullName": "Nguyen Van A", "role": "STUDENT" }
```

**Refresh token payload:**
```json
{ "id": 1 }
```

**Temp token payload (Google onboarding):**
```json
{ "type": "google_onboarding", "email": "...", "fullName": "...", "googleId": "...", "avatarUrl": "..." }
```

### JWT Middleware (`middleware/auth.ts`)

```
Request → Extract "Authorization: Bearer <token>" header
        → jwt.verify(token, JWT_SECRET)
        → Attach decoded user to req.user
        → next()
```

If token missing or invalid → `401 Unauthorized`

### requireRole Middleware

```typescript
requireRole(['ADMIN'])           // Only admins
requireRole(['TEACHER', 'ADMIN']) // Teachers or admins
requireRole(['STUDENT'])          // Only students
```

If user role not in allowed list → `403 Forbidden`

### Login Flow

```
POST /login { email, password }
  → prisma.user.findUnique({ where: { email }, include: { student, teacher } })
  → If not found → 404
  → If isActive=false → 403 "Tài khoản bị khóa"
  → bcrypt.compare(password, passwordHash)
  → If TEACHER and !isApproved → 403 "Chờ duyệt hồ sơ"
  → signTokens() → return { accessToken, refreshToken, user }
```

### Frontend Token Storage

```javascript
// Save on login/register
localStorage.setItem('access_token', data.accessToken)
localStorage.setItem('refresh_token', data.refreshToken)

// Attach to every request
Authorization: `Bearer ${localStorage.getItem('access_token')}`
```

---

## 6. OTP Registration Flow

### Step 1 — Send OTP (`POST /auth/send-otp`)

Validation chain (short-circuit on first failure):
1. Required fields: `email`, `fullName`, `password`
2. **Password strength** — must satisfy ALL:
   - Min 6 characters
   - At least 1 uppercase letter
   - At least 1 lowercase letter
   - At least 1 digit (0–9)
   - At least 1 special character (`!@#$%^&*` etc.)
3. **Email format** — regex validation
4. **Disposable email** — blocked domains list (100+ providers: mailinator.com, tempmail.com, guerrillamail.com, etc.)
5. **Rate limit** — max 3 OTP sends per email per hour
6. **Resend cooldown** — 60 second minimum between requests
7. **Duplicate check** — email must not exist in users table

If all pass:
```
generateOTP() → 6-digit string (Math.random)
bcrypt.hash(otp, 10) → otpHash
prisma.otpVerification.updateMany({ isUsed: true })   // invalidate old OTPs
prisma.otpVerification.create({ email, otpHash, purpose: REGISTRATION, payload: {...}, expiresAt: now+10m })
recordOtpSend(email)
recordResendCooldown(email)
sendOTPEmail(email, fullName, otp)  → Nodemailer
```

Response:
```json
{
  "success": true,
  "data": {
    "message": "Đã gửi mã OTP...",
    "expiresInMinutes": 10,
    "cooldownSeconds": 60,
    "devOtp": "123456"   // only if SMTP not configured
  }
}
```

### Step 2 — Verify OTP (`POST /auth/verify-otp-register`)

```
prisma.otpVerification.findFirst({ email, purpose: REGISTRATION, isUsed: false }, orderBy createdAt desc)
→ If not found → 400 "Yêu cầu OTP trước"
→ If now > expiresAt → mark isUsed=true, 400 "Hết hạn"
→ If attempts >= maxAttempts → mark isUsed=true, 429 "Vượt quá lần thử"
→ bcrypt.compare(otp, record.otpHash)
→ If mismatch → increment attempts, return remainingAttempts, 400
→ If match:
    Extract payload (fullName, password, role, subjectGroup, bio)
    bcrypt.hash(password, 12)
    prisma.$transaction:
      user.create({ email, passwordHash, fullName, role, isActive: true, emailVerified: true })
      student.create OR teacher.create (based on role)
      otpVerification.update({ isUsed: true })
    signTokens() → return { accessToken, refreshToken, user }
```

### Rate Limiter Design

In-memory `Map` with auto-cleanup every 10 minutes.

```
OTP Send Limit:  email → [timestamp1, timestamp2, timestamp3]  (max 3 per 3600s window)
Resend Cooldown: email → lastResendTimestamp                    (60s minimum gap)
```

---

## 7. Google OAuth Flow

### New User Path

```
1. Browser: useGoogleLogin() → Google consent screen → tokenResponse.access_token
2. Browser: fetch Google userinfo API → { email, name, sub, picture }
3. POST /auth/google { email, fullName, googleId: sub, avatarUrl: picture }
4. Backend: prisma.user.findFirst({ OR: [{ googleId }, { email }] })
   → Not found → issue tempToken (JWT, 10m)
   → Return { isNewUser: true, needsRoleSelection: true, tempToken, googleProfile }
5. Frontend: show role selection screen
6. POST /auth/google/complete-onboarding { tempToken, role, subjectGroup }
7. Backend: jwt.verify(tempToken, JWT_TEMP_SECRET)
   → Confirm type === 'google_onboarding'
   → Race condition check: user doesn't exist yet
   → bcrypt.hash(googleId + Date.now(), 12) → random password hash
   → prisma.$transaction: user.create + student/teacher.create
   → signTokens() → { accessToken, refreshToken, user }
```

### Existing User Path

```
POST /auth/google → user found →
  If !user.googleId → link googleId to account
  If !user.isActive → 403
  If TEACHER && !isApproved → 403
  → signTokens() → { isNewUser: false, tokens, user }
```

---

## 8. Role System & Permissions

### Role Hierarchy

```
GUEST → STUDENT / TEACHER (via registration)
STUDENT ↔ TEACHER (via role change request, admin approval)
ADMIN (assigned directly in DB)
```

### Access Matrix

| Feature | GUEST | STUDENT | TEACHER | ADMIN |
|---------|-------|---------|---------|-------|
| Landing page | ✅ | ✅ | ✅ | ✅ |
| Chatbot (public) | ✅ | ✅ | ✅ | ✅ |
| Browse courses | ✅ | ✅ | ✅ | ✅ |
| Take exams | ❌ | ✅ | ❌ | ❌ |
| Enroll in courses | ❌ | ✅ | ❌ | ❌ |
| AI tutor chat | ❌ | ✅ | ❌ | ❌ |
| Study roadmap | ❌ | ✅ | ❌ | ❌ |
| Forum | ❌ | ✅ | ✅ | ✅ |
| Create courses | ❌ | ❌ | ✅ | ✅ |
| Create questions | ❌ | ❌ | ✅ | ✅ |
| Approve courses | ❌ | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ✅ |
| Review role requests | ❌ | ❌ | ❌ | ✅ |

### Teacher Approval

New teachers (OTP or Google signup) get `isApproved = false` by default. Login is blocked until an admin approves via `AdminDashboard` → User Management → Approve Teacher. On approval, `teacher.isApproved` is set to `true`.

---

## 9. Role Change Request Flow

Users can request to switch between STUDENT and TEACHER roles.

```
1. POST /auth/role-change-request { requestedRole: "TEACHER", reason: "Tôi là giáo viên..." }
   → Check: role !== requestedRole
   → Check: no existing PENDING request
   → prisma.roleChangeRequest.create({ userId, currentRole, requestedRole, reason, status: PENDING })

2. Admin sees request in dashboard: GET /admin/role-change-requests

3. POST /admin/role-change-requests/:id/review { action: "approve" | "reject" }
   If APPROVE:
     prisma.$transaction:
       roleChangeRequest.update({ status: APPROVED, reviewedBy, reviewedAt })
       user.update({ role: requestedRole })
       Delete old profile (student.delete OR teacher.delete)
       Create new profile (teacher.create with isApproved=false OR student.create)
     sendRoleChangeNotification(email, name, 'APPROVED', newRole)
   If REJECT:
     roleChangeRequest.update({ status: REJECTED, reviewedBy, reviewedAt })
     sendRoleChangeNotification(email, name, 'REJECTED')
```

---

## 10. Payment System

### VietQR + SePay (Primary Payment)

Bank: **ACB — Account 18657431 — THUAN VAN TRAN**

#### Course Purchase

1. **Frontend** generates transfer code: `EP{studentId}C{courseId}`
2. **Frontend** builds VietQR URL:
   ```
   https://img.vietqr.io/image/ACB-18657431-compact.png?amount={price}&addInfo=EP{studentId}C{courseId}
   ```
3. Student scans QR → transfers exact amount with transfer note
4. **SePay** detects transaction → `POST /enrollments/sepay-webhook`
5. **Backend** verifies `Authorization: Bearer {SEPAY_WEBHOOK_KEY}` header
6. Parses transfer content matching pattern `EP(\d+)C(\d+)`:
   ```
   studentId = match[1]
   courseId  = match[2]
   ```
7. Creates enrollment:
   ```typescript
   prisma.enrollment.create({
     data: { studentId, courseId, paidAt: now, transactionId: sepay_transaction_id }
   })
   ```
8. **Frontend** polls `GET /enrollments/status?courseId=X` every 3 seconds → detects enrollment → unlocks course

#### PRO Membership Upgrade

Transfer code: `UP{studentId}P{planId}`

Plans:
| planId | Name | Price | Duration |
|--------|------|-------|----------|
| 1 | Monthly | 199,000 VND | 30 days |
| 2 | 6-Month | 499,000 VND | 180 days |
| 3 | Yearly | 799,000 VND | 365 days |

SePay webhook parses `UP(\d+)P(\d+)` → sets `user.isPro = true` on the student's user record.

### VNPay (Alternative)

`POST /enrollments { courseId }` → Returns checkout URL for VNPay sandbox.

- Amount: `price * 100` (VNPay uses smallest currency unit)
- HMAC-SHA512 signature over sorted query params with `VNPAY_HASH_SECRET`
- Sandbox URL: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
- IPN callback: `GET /enrollments/webhook` — verifies signature, creates enrollment on `vnp_ResponseCode === "00"`

---

## 11. Course System

### Course Lifecycle

```
Teacher creates course (isPublished=false, isApproved=false)
  → Admin reviews in AdminDashboard → Approve/Reject
  → isApproved=true + teacher sets isPublished=true
  → Course visible on GET /courses and CourseMall
```

### GET /courses Query Filters

| Param | Effect |
|-------|--------|
| `subject=Toán` | Filter by subject name |
| `subjectGroup=A01` | Filter by exam group |
| `free=true` | Only price=0 courses |

Response includes: teacher name, lesson count, enrollment count, average rating.

### GET /courses/:id Response Structure

```json
{
  "id": 1,
  "title": "...",
  "lessons": [{ "id", "title", "order", "duration", "videoUrl", "content", "documents": [] }],
  "teacher": { "userId", "isApproved", "user": { "fullName", "avatarUrl" } },
  "reviews": [{ "id", "rating", "comment", "student": { "user": { "fullName" } } }],
  "_count": { "enrollments": 42 }
}
```

---

## 12. Exam & Testing System

### Starting an Attempt

```
POST /exams/:id/attempts
→ prisma.testAttempt.create({ studentId, examId, startedAt: now })
→ Returns attempt ID
```

### Submitting an Attempt

```
POST /exams/:id/attempts/:attemptId/submit
Body: { answers: { "1": "A", "2": "C", ... } }

→ Load exam questions with correct answers
→ For each answer:
    isCorrect = selectedAnswer === question.correctAnswer
→ score = (correctCount / totalQuestions) * 10
→ Aggregate by topic: { topicName: { correct, total } }
→ Weak topics = topics where (correct/total) < 0.6
→ AI feedback (pre-populated):
    { assessment, knowledgeGaps: [weakTopics], advice, encouragement }
→ prisma.$transaction:
    attemptAnswers.createMany(...)
    testAttempt.update({ score, submittedAt, aiFeedback })
→ Return { score, correctCount, totalQuestions, weakTopics, aiFeedback }
```

### Frontend Test Simulator

- 30-minute countdown (auto-submit at 0:00)
- Question navigation panel (jump to any question)
- Answer tracking per question
- Review mode after submission

---

## 13. AI Features

### Chatbot (`POST /chatbot` — public, no auth)

Proxies to **OpenRouter API** (model: `google/gemini-2.5-flash` or `OPENROUTER_MODEL` env).

System prompt (Vietnamese):
> EduBot — EduPath AI, chuyên gia tư vấn THPTQG, trả lời bằng tiếng Việt, thân thiện, ngắn gọn, hỗ trợ học sinh chọn ngành, ôn tập, giải đáp thắc mắc.

Request to OpenRouter:
```json
{
  "model": "google/gemini-2.5-flash",
  "messages": [{ "role": "system", "content": "..." }, ...history, { "role": "user", "content": message }],
  "temperature": 0.7,
  "max_tokens": 1500
}
```

### AI Tutor Chat (`POST /ai/chat`)

Server-Sent Events (SSE) streaming endpoint.  
Auth: JWT + STUDENT role required.

Response format:
```
Content-Type: text/event-stream
data: {"content": "chunk..."}\n\n
data: [DONE]\n\n
```

### Adaptive Roadmap (`POST /ai/roadmap/refresh`)

```
→ Load all student's testAttempts with attemptAnswers + questions
→ Group answers by topic
→ Calculate accuracy per topic: (correct / total) * 100
→ weakTopics = topics with accuracy < 60
→ strongTopics = topics with accuracy >= 80
→ Build roadmap JSON:
    {
      weeklyPlan: [
        { week: 1, focus: "...", dailyTasks: ["..."], targetScore: 7 },
        ...4 weeks
      ],
      priorityTopics: [weakTopics...],
      recommendedCourses: [courseIds based on weak subjects],
      motivationalMessage: "..."
    }
→ prisma.roadmap.upsert({ studentId, content: roadmapJSON, generatedAt: now })
```

### AI Question Generator (`POST /ai/generate-questions`)

Auth: JWT + TEACHER/ADMIN.  
Currently returns a set of sample questions as placeholder while full AI integration is developed.

---

## 14. Security & Validation

### Password Requirements (enforced at registration & password change)

- Minimum 6 characters
- At least 1 uppercase letter (A–Z)
- At least 1 lowercase letter (a–z)
- At least 1 digit (0–9)
- At least 1 special character (`!@#$%^&*()_+-=[]{};':"\\|,.<>/?`)

### Email Security

1. **Format validation** — RFC-compliant regex
2. **Disposable email blocklist** — 100+ domains blocked (mailinator, tempmail, guerrillamail, yopmail, 10minutemail, throwam, etc.)
3. **Uniqueness** — Prisma unique constraint on `user.email`

### OTP Security

| Property | Value |
|----------|-------|
| Length | 6 digits |
| Storage | bcrypt hash (cost 10) in DB |
| TTL | 10 minutes |
| Max attempts | 5 (then locked, must resend) |
| Rate limit | 3 sends per hour per email |
| Cooldown | 60 seconds between resends |
| Invalidation | Previous OTPs marked `isUsed=true` on new send |

### JWT Security

- Short-lived access tokens (15 min) minimize exposure window
- Separate secrets for access, refresh, and temp tokens
- Temp token has `type: "google_onboarding"` claim to prevent token reuse across endpoints

### CORS

Currently `origin: '*'` for development. Should be restricted to production domain before launch.

### Payment Webhook Security

- **SePay**: `Authorization: Bearer {SEPAY_WEBHOOK_KEY}` header check
- **VNPay**: HMAC-SHA512 signature verification over all `vnp_` params (excluding `vnp_SecureHash`)

---

## 15. Frontend Components

### App.jsx — Root Component

Manages all global state and renders the correct view based on `role` and `activeTab`.

**Authentication gate:**
```javascript
if (!currentUser) → render <LandingPage> with <AuthPage>
if (currentUser.role === 'ADMIN') → render <AdminDashboard>
if (currentUser.role === 'TEACHER') → render <TeacherDashboard>
if (currentUser.role === 'STUDENT') → render student tabs
```

### AuthPage.jsx

Modes: `login` | `signup` | `signup_otp` | `forgot` | `reset_password` | `google_role_select`

**Sub-components:**
- `OtpDigitInput` — 6-cell OTP input, auto-advances on digit entry, supports paste
- `PasswordStrengthMeter` — Live indicator (5 rules, color-coded: red → orange → green)
- `useCountdown(seconds)` — React hook returning `[timeLeft, reset]`

**mapBackendUser(backendUser):** Normalizes API user format to local state format including `subjectGroup` from nested `student` object.

### LandingPage.jsx

Public homepage for unauthenticated visitors. Sections:
1. **Hero** — headline, subtitle, Login/Register CTA buttons
2. **Subjects** — 6 subject tiles (Toán, Lý, Anh, Hóa, Sinh, Văn)
3. **Stats** — 5 years, 100% teachers 8.0+, 42,500+ students, 90% target achievement
4. **Features** — AI diagnosis, personalized roadmap, weakness practice, progress tracking
5. **Featured Courses** — Course cards with price, teacher, duration
6. **Leaderboard** — Top 5 students (target score, actual score, streak)
7. **Forum Preview** — Recent discussion posts
8. **Testimonials** — Student success stories
9. **FAQ** — 5 common questions with expandable answers

### CheckoutModal.jsx

3-step payment flow for course purchase:
1. **QR Code display** — VietQR image + transfer details
2. **Processing** — Polling `/enrollments/status` every 3 seconds
3. **Success** — Unlock confirmation + course access button

### UpgradeModal.jsx

3-step PRO upgrade:
1. **Plan selection** — Monthly (199k), 6-Month (499k), Yearly (799k)
2. **QR Code display** — Same VietQR format with `UP{studentId}P{planId}`
3. **Success** — PRO badge activation

### ChatbotWidget.jsx

Floating chat widget (fixed bottom-right):
- Welcome tooltip auto-hides after 8 seconds
- Expands to full chat window on click
- Sends messages via `api.chatbot(message, history)`
- Displays loading dots during API call

### AdminDashboard.jsx

Tabs:
- **logs** — Real-time system activity log
- **users** — User list, ban/unban toggle, teacher approval
- **courses** — Approve/reject pending courses
- **announcements** — Broadcast notifications to all users
- **finance** — Revenue chart (Recharts `AreaChart`)
- **ai-config** — Sliders for AI algorithm weights (difficulty, weakness focus, roadmap depth)

### TeacherDashboard.jsx

Tabs:
- **courses** — Create course form + my courses list (sends to admin approval queue)
- **questions** — 8-field question form (content, subject, topic, difficulty, 4 options, correct answer)
- **stats** — Class performance overview

### Sidebar.jsx

Role-aware navigation:
- Student: Home, Learning Path, Course Store, Online Exams, Forum, AI Q&A, Document Library, Settings
- Teacher: Course Management, Forum, Question Bank, Class Statistics
- Admin: System Logs, User Management, Course Approvals, Announcements, Finance Stats, AI Config

PRO upgrade button is shown for non-PRO students.

### Forum.jsx

- Subject filter (7 options including "All")
- Search by post title
- Create new post (title + content + subject)
- Like toggle (tracked by user ID array)
- Threaded comments per post

### CourseMall.jsx

- Subject filter tabs
- Title/teacher name search
- Unlocked courses displayed first
- Lock/unlock badge system
- Checkout triggers `onCheckoutCourse(course)` → opens `CheckoutModal`

---

## 16. State Management

All global state lives in `App.jsx` and is passed as props. State is persisted to `localStorage` to survive page refreshes.

### Key State Variables

| State | Type | Persistence | Description |
|-------|------|-------------|-------------|
| `currentUser` | Object\|null | localStorage | Logged-in user profile |
| `role` | String | localStorage | Current role shorthand |
| `theme` | String | localStorage | 'light' \| 'dark' |
| `activeTab` | String | localStorage | Current view |
| `usersList` | Array | localStorage | Mock user directory |
| `courses` | Array | localStorage | Course catalog |
| `questionBank` | Array | localStorage | Question database |
| `submissions` | Array | localStorage | Student exam results |
| `notifications` | Array | localStorage | App notifications |
| `systemLogs` | Array | localStorage | Admin activity log |
| `courseApprovals` | Array | localStorage | Pending course submissions |
| `forumPosts` | Array | localStorage | Discussion posts |

### Data Flow

```
Backend API ←→ api.js ←→ App.jsx state ←→ Component props ←→ UI
                              ↕
                         localStorage
```

---

## 17. Environment Variables

### Backend (`apps/api/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | API server port | `4000` |
| `DATABASE_URL` | Supabase pooled connection (pgBouncer) | `postgresql://...?pgbouncer=true` |
| `DIRECT_URL` | Supabase direct connection (for migrations) | `postgresql://...:5432/...` |
| `JWT_SECRET` | Access token signing secret | strong random string |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | different strong string |
| `JWT_TEMP_SECRET` | Google onboarding temp token secret | another strong string |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `VNPAY_TMN_CODE` | VNPay merchant code | `EDUPATH123` |
| `VNPAY_HASH_SECRET` | VNPay HMAC secret | strong string |
| `SEPAY_BANK_ID` | SePay bank identifier | `ACB` |
| `SEPAY_ACCOUNT_NO` | Bank account number | `18657431` |
| `SEPAY_ACCOUNT_NAME` | Account holder name | `THUAN VAN TRAN` |
| `SEPAY_WEBHOOK_KEY` | SePay webhook auth token | strong string |
| `OPENROUTER_API_KEY` | OpenRouter API key | `sk-or-v1-...` |
| `OPENROUTER_MODEL` | AI model ID | `google/gemini-2.5-flash` |
| `SMTP_USER` | Gmail address for OTP emails | `your@gmail.com` |
| `SMTP_PASS` | Gmail App Password (16 chars) | from Google Account settings |

### Frontend (`apps/web/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | API base URL | `http://localhost:4000` (auto-detected) |

---

## 18. Local Development Setup

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Git

### Steps

```bash
# 1. Clone
git clone https://github.com/Tranvanthuan1805/SWP391_NHOM1_EDUCATION
cd SWP391_NHOM1_EDUCATION

# 2. Install dependencies
pnpm install

# 3. Create API environment file
# Copy the .env template to apps/api/.env and fill in values

# 4. Generate Prisma client
pnpm prisma:generate

# 5. Apply database migrations (first time or after schema changes)
cd apps/api
npx prisma migrate deploy   # production DB
# OR for local DB:
npx prisma db push

# 6. Start both servers (separate terminals)
pnpm dev:api    # → http://localhost:4000
pnpm dev:web    # → http://localhost:5173
```

### Google OAuth Local Setup

The Google OAuth Client ID `156123260442-...` requires authorized origins.  
Add these in [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials):

**Authorized JavaScript origins:**
```
http://localhost:5173
http://localhost:5174
```

**Authorized redirect URIs:**
```
http://localhost:5173
```

### Gmail SMTP Setup for OTP Emails

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account → Security → App Passwords
3. Create an App Password for "Mail"
4. Use the 16-character password as `SMTP_PASS` in `.env`

If SMTP is not configured, OTP codes are printed to the API console (development fallback).

---

*Generated: 2026-06-07 | EduPath AI — SWP391 Nhóm 1*
