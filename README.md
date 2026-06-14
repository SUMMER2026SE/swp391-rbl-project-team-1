# 🔧 Nhật ký thay đổi — EduPath AI

## 2026-06-05

### Kết nối khoá học với cơ sở dữ liệu, tạm thời làm chức năng thanh toán pha kè, sửa luôn cái đăng xuất là chưa lưu dữ liệu (này chưa hoàn thiện lắm còn 1 số chưa lưu), Ở dưới là phần dã sửa:


### ✅ Fix: Thanh toán Demo không mở được khóa học

**Nguyên nhân:** `CourseMall.jsx` kiểm tra `currentUser.enrollments[]` để xác định khóa học "Đã sở hữu", nhưng `handlePaymentSuccess` trong `App.jsx` chỉ cập nhật `unlockedCourses` mà bỏ quên `enrollments`.

**File đã sửa:** `apps/web/src/App.jsx` — `handlePaymentSuccess()`

```js
// Sau fix: cập nhật đồng thời cả hai field
setCurrentUser({
  ...currentUser,
  unlockedCourses: [...activeUnlocked, courseId],
  enrollments: [...activeEnrollments, { courseId, paidAt: new Date().toISOString() }]
});
```

---

### ✅ Tính năng: Lưu dữ liệu vào PostgreSQL (không mất sau đăng xuất)

**Vấn đề:** Toàn bộ dữ liệu chỉ lưu trong `localStorage`, khi đăng xuất và đăng nhập lại thì mất (enrollments, hồ sơ cá nhân).

#### Backend — Thêm 2 API mới

**`apps/api/src/controllers/payment.ts`**
- Thêm `createDemoEnrollment()` — tạo bản ghi `Enrollment` thật trong PostgreSQL khi nhấn "Kích hoạt Demo"
- `transactionId` dạng `DEMO_{studentId}_{courseId}_{timestamp}` để tránh trùng

**`apps/api/src/controllers/auth.ts`**
- Sửa `login()` — trả về kèm `enrollments[]` của student để frontend load ngay khi đăng nhập
- Thêm `updateProfile()` — cập nhật `fullName`, `avatarUrl`, `subjectGroup` vào DB

**`apps/api/src/index.ts`**
- Đăng ký route `POST /enrollments/demo`
- Đăng ký route `PATCH /auth/profile`

#### Frontend — Kết nối với API

**`apps/web/src/api.js`**
- Thêm `api.demoEnroll(courseId)` — gọi `POST /enrollments/demo`
- Thêm `api.updateProfile(payload)` — gọi `PATCH /auth/profile`

**`apps/web/src/components/AuthPage.jsx`**
- Sửa `mapBackendUser()` — giữ lại `enrollments[]` và `unlockedCourses[]` từ API response thay vì reset về `[]`

**`apps/web/src/App.jsx`**
- `handleAuthSuccess()` — map `enrollments` từ DB vào `currentUser` khi đăng nhập
- `handlePaymentSuccess()` — gọi `api.demoEnroll()` sau khi cập nhật UI (optimistic update)
- `handleSaveProfile()` — gọi `api.updateProfile()` khi lưu hồ sơ cá nhân
- Tất cả có `try/catch` graceful fallback — nếu API lỗi thì UI vẫn hoạt động bình thường


