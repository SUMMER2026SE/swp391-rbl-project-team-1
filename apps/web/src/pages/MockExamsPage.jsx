import React, { useState, useEffect } from 'react';
import MockExamCard from '../components/mock-exams/MockExamCard';
import MockExamFilters from '../components/mock-exams/MockExamFilters';
import { mockExamService } from '../services/mockExamService';
import { supabase } from '../lib/supabaseClient';
import { getLocalData } from '../services/mockDb';

export default function MockExamsPage({ currentUser, onSelectExam, navigateTo }) {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    subjectId: 'All',
    year: 'All',
    examType: 'All'
  });

  // Load static or live subject categories
  const loadSubjects = async () => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('exam_subjects')
          .select('*')
          .order('name', { ascending: true });
        if (!error && data && data.length > 0) {
          setSubjects(data);
          return;
        }
      } catch (e) {
        // ignore
      }
    }
    const localSubj = getLocalData('supabase_mock_exam_subjects') || [];
    setSubjects(localSubj);
  };

  const loadExams = async () => {
    setLoading(true);
    try {
      const data = await mockExamService.getMockExams(filters);
      setExams(data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách đề thi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    loadExams();
  }, [filters]);

  const handleStartExam = (examId) => {
    navigateTo(`/mock-exams/${examId}/start`);
  };

  // Stats
  const subjectCounts = {};
  exams.forEach(e => {
    const name = e.exam_subjects?.name || (e.subject_id === 1 ? 'Toán học' : e.subject_id === 2 ? 'Tiếng Anh' : e.subject_id === 3 ? 'Vật lý' : 'Hóa học');
    subjectCounts[name] = (subjectCounts[name] || 0) + 1;
  });

  return (
    <div className="mock-exams-public-page animate-in">
      {/* ── Public Navigation Header (for guests) ── */}
      {!currentUser && (
        <div className="mock-exams-public-nav">
          <div className="mock-exams-nav-inner">
            <button 
              onClick={() => navigateTo('/')}
              className="mock-exams-logo-btn"
            >
              <span className="mock-exams-logo-icon">📚</span>
              <span className="mock-exams-logo-text">EduPath AI</span>
            </button>

            <div className="mock-exams-nav-links">
              <button onClick={() => navigateTo('/')} className="mock-exams-nav-link">
                Trang chủ
              </button>
              <button onClick={() => navigateTo('/mock-exams')} className="mock-exams-nav-link active">
                Thi thử
              </button>
            </div>

            <div className="mock-exams-nav-actions">
              <button 
                onClick={() => navigateTo('/')} 
                className="mock-exams-login-btn"
              >
                Đăng nhập
              </button>
              <button 
                onClick={() => navigateTo('/')} 
                className="mock-exams-signup-btn"
              >
                Đăng ký miễn phí
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mock-exams-content-wrapper">
        {/* ── Hero Banner with Animated Stats ── */}
        <div className="exams-hero-banner">
          <div className="exams-hero-particles">
            <div className="particle p1"></div>
            <div className="particle p2"></div>
            <div className="particle p3"></div>
          </div>
          <div className="exams-hero-inner">
            <span className="badge-pill" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#fff', fontSize: '11px', fontWeight: 'bold', display: 'inline-block', marginBottom: '12px', backdropFilter: 'blur(4px)' }}>
              Học đúng hướng · Thi đúng đích cùng EduPath AI 🎓
            </span>
            <h1 className="exams-hero-title">
              TRUNG TÂM LUYỆN THI THỬ <span className="exams-hero-highlight">QUỐC GIA</span>
            </h1>
            <p className="exams-hero-desc">
              Tổng hợp kho đề thi chính thức từ Bộ GD&ĐT qua các năm (2020–2024) và đề thi thử từ các trường chuyên danh tiếng trên cả nước. Trải nghiệm thi như thật với đồng hồ đếm ngược, chống gian lận và chấm điểm tự động.
            </p>

            {/* Hero counters with enhanced animation */}
            <div className="exams-hero-stats-grid">
              <div className="exams-hero-stat-card">
                <span className="stat-icon">📋</span>
                <span className="stat-number">{exams.length}+</span>
                <span className="stat-label">BỘ ĐỀ THI</span>
              </div>
              <div className="exams-hero-stat-card">
                <span className="stat-icon">🗓️</span>
                <span className="stat-number">5 NĂM</span>
                <span className="stat-label">2020 – 2024</span>
              </div>
              <div className="exams-hero-stat-card">
                <span className="stat-icon">📐</span>
                <span className="stat-number">4 MÔN</span>
                <span className="stat-label">TOÁN · LÝ · HÓA · ANH</span>
              </div>
              <div className="exams-hero-stat-card">
                <span className="stat-icon">🤖</span>
                <span className="stat-number">AI</span>
                <span className="stat-label">CHẤM & PHÂN TÍCH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Quick Summary Cards */}
        <div className="exams-subject-summary-row">
          {subjects.map(sub => (
            <button
              key={sub.id}
              onClick={() => setFilters(f => ({ ...f, subjectId: String(filters.subjectId) === String(sub.id) ? 'All' : sub.id }))}
              className={`exams-subject-card ${String(filters.subjectId) === String(sub.id) ? 'active' : ''}`}
            >
              <span className="subject-card-icon">{sub.icon}</span>
              <span className="subject-card-name">{sub.name}</span>
              <span className="subject-card-count">{subjectCounts[sub.name] || 0} đề</span>
            </button>
          ))}
        </div>

        {/* Filter panel */}
        <MockExamFilters 
          filters={filters} 
          onFilterChange={setFilters} 
          subjects={subjects} 
        />

        {/* Exam Grid */}
        {loading ? (
          <div className="exam-cards-grid">
            {[1, 2, 3, 4, 5, 6].map(idx => (
              <div key={idx} className="exam-skeleton-card">
                <div className="skeleton-header"></div>
                <div className="skeleton-body">
                  <div className="skeleton-line w80"></div>
                  <div className="skeleton-line w60"></div>
                  <div className="skeleton-line w40"></div>
                </div>
              </div>
            ))}
          </div>
        ) : exams.length > 0 ? (
          <>
            <div className="exams-results-bar">
              <span className="results-count">
                🔎 Tìm thấy <strong>{exams.length}</strong> đề thi phù hợp
              </span>
            </div>
            <div className="exam-cards-grid" style={{ marginBottom: '40px' }}>
              {exams.map(exam => (
                <MockExamCard 
                  key={exam.id} 
                  exam={exam} 
                  onSelect={onSelectExam} 
                  onStart={handleStartExam} 
                />
              ))}
            </div>
          </>
        ) : (
          <div className="exams-empty-state">
            <span className="empty-icon">📂</span>
            <h3 className="empty-title">Không tìm thấy đề thi phù hợp</h3>
            <p className="empty-desc">Vui lòng thay đổi từ khóa hoặc điều chỉnh bộ lọc tìm kiếm.</p>
            <button 
              className="btn-primary"
              onClick={() => setFilters({ search: '', subjectId: 'All', year: 'All', examType: 'All' })}
              style={{ marginTop: '12px', background: 'var(--exams-purple)', border: 'none', cursor: 'pointer' }}
            >
              Xóa bộ lọc
            </button>
          </div>
        )}

        {/* CTA Banner for guests */}
        {!currentUser && (
          <div className="exams-cta-banner">
            <div className="cta-content">
              <h3 className="cta-title">🚀 Đăng ký tài khoản miễn phí</h3>
              <p className="cta-desc">Lưu lịch sử làm bài, nhận phân tích kết quả từ AI và theo dõi tiến trình ôn tập.</p>
            </div>
            <button 
              className="cta-btn"
              onClick={() => navigateTo('/')}
            >
              Đăng ký ngay →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
