-- Course Schema for Supabase (PostgreSQL)
-- This file defines the 13 tables needed for the rebuilt Course module of EduPath AI.

-- 1. Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- e.g. Toán học, Vật lý, Tiếng Anh
    code VARCHAR(50) NOT NULL UNIQUE, -- e.g. toan, ly, anh
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Teacher Profiles Table
CREATE TABLE IF NOT EXISTS public.teacher_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE, -- references central User table ID if applicable
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    subject_id INT REFERENCES public.subjects(id) ON DELETE SET NULL,
    subject VARCHAR(100) NOT NULL, -- Keep text version for simple queries
    subject_group VARCHAR(50) NOT NULL, -- e.g. A01, B00, D01
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    original_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_percent INT DEFAULT 0,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    student_count INT DEFAULT 0,
    lesson_count INT DEFAULT 0,
    duration VARCHAR(50) DEFAULT '0 giờ',
    badge VARCHAR(50), -- e.g. Best seller, New, Hot, Recommended
    teacher_profile_id INT REFERENCES public.teacher_profiles(id) ON DELETE SET NULL,
    teacher_name VARCHAR(255) NOT NULL, -- Keep text version for compatibility
    teacher_avatar VARCHAR(255),
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Chapters Table
CREATE TABLE IF NOT EXISTS public.chapters (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    "order" INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Lessons Table
CREATE TABLE IF NOT EXISTS public.lessons (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    chapter_id INT REFERENCES public.chapters(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    "order" INT NOT NULL,
    video_url VARCHAR(500),
    content TEXT,
    duration VARCHAR(50) DEFAULT '00:00',
    is_preview BOOLEAN DEFAULT FALSE, -- Allows non-paying students/guests to preview this lesson
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Course Materials Table
CREATE TABLE IF NOT EXISTS public.course_materials (
    id SERIAL PRIMARY KEY,
    lesson_id INT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- e.g. PDF, Slide, Word, Excel, ZIP
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'completed', -- e.g. pending, completed, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Course Enrollments Table
CREATE TABLE IF NOT EXISTS public.course_enrollments (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    payment_id INT REFERENCES public.payments(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'active', -- e.g. active, suspended
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_student_course UNIQUE (student_id, course_id)
);

-- 9. Lesson Progress Table
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    lesson_id INT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_student_lesson_progress UNIQUE (student_id, lesson_id)
);

-- 10. Course Reviews Table
CREATE TABLE IF NOT EXISTS public.course_reviews (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    student_id INT NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    student_avatar VARCHAR(255),
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Course Discussions Table
CREATE TABLE IF NOT EXISTS public.course_discussions (
    id SERIAL PRIMARY KEY,
    lesson_id INT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    user_id INT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_avatar VARCHAR(255),
    content TEXT NOT NULL,
    parent_id INT REFERENCES public.course_discussions(id) ON DELETE CASCADE, -- For nested comments
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Teacher Messages Table
CREATE TABLE IF NOT EXISTS public.teacher_messages (
    id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. AI Chat Messages Table
CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    lesson_id INT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- user or assistant
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
