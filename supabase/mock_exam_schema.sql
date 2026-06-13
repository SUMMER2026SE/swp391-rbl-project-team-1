-- Supabase Database Schema for mock exams (THPT Quốc Gia Exam Preparation)

-- 1. Create exam_subjects table
CREATE TABLE IF NOT EXISTS public.exam_subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- e.g. 'Toán học', 'Vật lý'
    slug VARCHAR(100) NOT NULL UNIQUE, -- e.g. 'toan', 'ly'
    icon VARCHAR(100),                 -- Icon name/class
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create mock_exams table
CREATE TABLE IF NOT EXISTS public.mock_exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id INT REFERENCES public.exam_subjects(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    year INT NOT NULL,                 -- e.g. 2024
    exam_code VARCHAR(50),             -- Mã đề (e.g. '101')
    exam_type VARCHAR(50) NOT NULL,    -- 'official', 'mock', 'internal'
    source VARCHAR(100) NOT NULL,      -- 'Bộ GD&ĐT', 'Thi thử', 'Nội bộ'
    duration_minutes INT NOT NULL DEFAULT 90,
    total_questions INT NOT NULL DEFAULT 50,
    description TEXT,
    pdf_url VARCHAR(500),
    official_answer_key_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'published' NOT NULL, -- 'draft', 'published'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create mock_exam_questions table
CREATE TABLE IF NOT EXISTS public.mock_exam_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.mock_exams(id) ON DELETE CASCADE,
    question_number INT NOT NULL,
    question_text TEXT NOT NULL,
    question_image_url VARCHAR(500),
    question_type VARCHAR(50) DEFAULT 'multiple_choice_single' NOT NULL, -- 'multiple_choice_single', 'essay'
    difficulty VARCHAR(50) DEFAULT 'Trung bình' NOT NULL, -- 'Dễ', 'Trung bình', 'Khó'
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create mock_exam_options table
CREATE TABLE IF NOT EXISTS public.mock_exam_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.mock_exam_questions(id) ON DELETE CASCADE,
    option_label VARCHAR(10) NOT NULL, -- A, B, C, D
    option_text TEXT NOT NULL,
    option_image_url VARCHAR(500),
    is_correct BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create mock_exam_attempts table
CREATE TABLE IF NOT EXISTS public.mock_exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES public.mock_exams(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INT NOT NULL DEFAULT 0,
    score NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
    correct_count INT DEFAULT 0 NOT NULL,
    wrong_count INT DEFAULT 0 NOT NULL,
    blank_count INT DEFAULT 0 NOT NULL,
    status VARCHAR(50) DEFAULT 'in_progress' NOT NULL -- 'in_progress', 'completed'
);

-- 6. Create mock_exam_answers table
CREATE TABLE IF NOT EXISTS public.mock_exam_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.mock_exam_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.mock_exam_questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES public.mock_exam_options(id) ON DELETE SET NULL,
    selected_option_label VARCHAR(10), -- A, B, C, D
    is_correct BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create mock_exam_results table
CREATE TABLE IF NOT EXISTS public.mock_exam_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES public.mock_exams(id) ON DELETE CASCADE,
    attempt_id UUID NOT NULL REFERENCES public.mock_exam_attempts(id) ON DELETE CASCADE,
    score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    correct_count INT NOT NULL DEFAULT 0,
    wrong_count INT NOT NULL DEFAULT 0,
    blank_count INT NOT NULL DEFAULT 0,
    total_questions INT NOT NULL DEFAULT 50,
    percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    rank_label VARCHAR(50) NOT NULL, -- 'Xuất sắc', 'Giỏi', 'Khá', 'Trung bình', 'Cần cải thiện'
    ai_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Create mock_exam_bookmarks table
CREATE TABLE IF NOT EXISTS public.mock_exam_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.mock_exam_questions(id) ON DELETE CASCADE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_bookmark UNIQUE (user_id, question_id)
);

-- 9. Add Indexes for Query Optimization
CREATE INDEX IF NOT EXISTS idx_mock_exams_subject ON public.mock_exams(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_exam ON public.mock_exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_options_question ON public.mock_exam_options(question_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON public.mock_exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_exam ON public.mock_exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_answers_attempt ON public.mock_exam_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_results_user ON public.mock_exam_results(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.mock_exam_bookmarks(user_id);

-- 10. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.exam_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_exam_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_exam_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_exam_bookmarks ENABLE ROW LEVEL SECURITY;

-- 11. Create RLS Policies

-- Public Read / Admin Manage policies for Static Exam Data
CREATE POLICY "Allow public read access to subjects" 
    ON public.exam_subjects FOR SELECT USING (true);

CREATE POLICY "Allow public read access to published mock exams" 
    ON public.mock_exams FOR SELECT USING (status = 'published');

CREATE POLICY "Allow public read access to questions" 
    ON public.mock_exam_questions FOR SELECT USING (true);

CREATE POLICY "Allow public read access to options" 
    ON public.mock_exam_options FOR SELECT USING (true);

-- User Own Read/Write policies for attempts, answers, results and bookmarks
CREATE POLICY "Allow users to manage their own attempts" 
    ON public.mock_exam_attempts FOR ALL 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to manage their own answers" 
    ON public.mock_exam_answers FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.mock_exam_attempts 
            WHERE id = attempt_id AND user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.mock_exam_attempts 
            WHERE id = attempt_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Allow users to view their own results" 
    ON public.mock_exam_results FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own results" 
    ON public.mock_exam_results FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to manage their own bookmarks" 
    ON public.mock_exam_bookmarks FOR ALL 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);
