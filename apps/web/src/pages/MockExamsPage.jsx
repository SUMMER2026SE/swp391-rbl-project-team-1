import React, { useState, useEffect } from 'react';
import MockExamCard from '../components/mock-exams/MockExamCard';
import MockExamFilters from '../components/mock-exams/MockExamFilters';
import { mockExamService } from '../services/mockExamService';
import { supabase } from '../lib/supabaseClient';
import { getLocalData } from '../services/mockDb';
import { 
  HiBookOpen, 
  HiClipboardList, 
  HiAcademicCap, 
  HiOutlineFolderOpen, 
  HiSearch, 
  HiCheckCircle 
} from 'react-icons/hi';
import { FaCalculator, FaGlobe, FaAtom, FaFlask, FaRobot } from 'react-icons/fa';

const SUBJECT_GRADIENTS = {
  1: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
  2: 'linear-gradient(135deg, #e17055 0%, #fdcb6e 100%)',
  3: 'linear-gradient(135deg, #0984e3 0%, #74b9ff 100%)',
  4: 'linear-gradient(135deg, #00b894 0%, #55efc4 100%)',
};

const SUBJECT_ICONS = {
  1: FaCalculator,
  2: FaGlobe,
  3: FaAtom,
  4: FaFlask
};

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

  useEffect(() => { loadSubjects(); }, []);
  useEffect(() => { loadExams(); }, [filters]);

  const handleStartExam = (examId) => {
    navigateTo(`/mock-exams/${examId}/start`);
  };

  const subjectCounts = {};
  exams.forEach(e => {
    const name = e.exam_subjects?.name || (
      e.subject_id === 1 ? 'Toán học' :
      e.subject_id === 2 ? 'Tiếng Anh' :
      e.subject_id === 3 ? 'Vật lý' : 'Hóa học'
    );
    subjectCounts[name] = (subjectCounts[name] || 0) + 1;
  });

  const hasActiveFilters =
    filters.search || filters.subjectId !== 'All' || filters.year !== 'All' || filters.examType !== 'All';

  const activeSubjectName = subjects.find(s => String(s.id) === String(filters.subjectId))?.name;

  return (
    <div className="mock-exams-public-page animate-in">
      {/* ── Public Navigation Header ── */}
      {/* Public Navigation Header is now rendered globally by App.jsx to avoid duplication and maintain consistency */}

      <div className="mock-exams-content-wrapper">

        {/* ══════════════════════════════════════
            HERO BANNER — two-column layout
        ══════════════════════════════════════ */}
        <div className="exams-hero-banner">
          <div className="exams-hero-particles">
            <div className="particle p1"></div>
            <div className="particle p2"></div>
            <div className="particle p3"></div>
          </div>

          <div className="exams-hero-inner hero-two-col">
            {/* Left: content + search */}
            <div className="hero-content-col">
              <span className="hero-eyebrow-badge">
                ✦ Kỳ thi THPT Quốc Gia · Cập nhật 2024
              </span>

              <h1 className="exams-hero-title">
                TRUNG TÂM LUYỆN THI THỬ{' '}
                <span className="exams-hero-highlight">QUỐC GIA</span>
              </h1>

              <p className="exams-hero-desc">
                Kho đề thi chính thức từ Bộ GD&amp;ĐT (2020–2024) và đề thi thử từ các trường chuyên danh tiếng. Trải nghiệm thi như thật với đồng hồ đếm ngược, máy tính ảo và chấm điểm AI tức thì.
              </p>

              {/* Embedded hero search */}
              <div className="hero-search-row">
                <div className="hero-search-wrap">
                  <HiSearch className="hero-search-icon" />
                  <input
                    type="text"
                    className="hero-search-input"
                    placeholder="Tìm tên đề thi, môn học, năm học..."
                    value={filters.search}
                    onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                  />
                </div>
                <button
                  className="hero-search-btn"
                  onClick={() => loadExams()}
                >
                  Tìm đề ngay
                </button>
              </div>

              <div className="hero-feature-pills">
                <span className="hfp"><HiCheckCircle style={{ marginRight: '6px', color: '#55efc4' }} /> Hoàn toàn miễn phí</span>
                <span className="hfp"><HiCheckCircle style={{ marginRight: '6px', color: '#55efc4' }} /> AI chấm &amp; phân tích</span>
                <span className="hfp"><HiCheckCircle style={{ marginRight: '6px', color: '#55efc4' }} /> Chống gian lận</span>
                <span className="hfp"><HiCheckCircle style={{ marginRight: '6px', color: '#55efc4' }} /> 4 môn chính</span>
              </div>
            </div>

            {/* Right: floating stat cards */}
            <div className="hero-stats-col">
              <div className="hero-stat-float">
                <div className="hstat-icon-box purple">
                  <HiClipboardList style={{ color: '#a894ff' }} />
                </div>
                <div className="hstat-info">
                  <span className="hstat-num">{exams.length || 20}+</span>
                  <span className="hstat-title">Bộ đề thi</span>
                  <span className="hstat-desc">Chính thức từ Bộ GD&amp;ĐT</span>
                </div>
              </div>
              <div className="hero-stat-float">
                <div className="hstat-icon-box blue">
                  <HiAcademicCap style={{ color: '#74b9ff' }} />
                </div>
                <div className="hstat-info">
                  <span className="hstat-num">4</span>
                  <span className="hstat-title">Môn học</span>
                  <span className="hstat-desc">Toán · Lý · Hóa · Anh</span>
                </div>
              </div>
              <div className="hero-stat-float">
                <div className="hstat-icon-box green">
                  <FaRobot style={{ color: '#55efc4' }} />
                </div>
                <div className="hstat-info">
                  <span className="hstat-num">AI</span>
                  <span className="hstat-title">Chấm &amp; Phân tích</span>
                  <span className="hstat-desc">Phản hồi thông minh tức thì</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            SUBJECT CARDS — gradient per subject
        ══════════════════════════════════════ */}
        <div className="exams-subject-summary-row" style={{ gridTemplateColumns: `repeat(${subjects.length || 4}, 1fr)` }}>
          {subjects.map((sub, idx) => {
            const grad = SUBJECT_GRADIENTS[sub.id] || `linear-gradient(135deg, #6c5ce7, #a29bfe)`;
            const isActive = String(filters.subjectId) === String(sub.id);
            const SubIcon = SUBJECT_ICONS[sub.id] || HiBookOpen;
            return (
              <button
                key={sub.id}
                onClick={() => setFilters(f => ({ ...f, subjectId: isActive ? 'All' : sub.id }))}
                className={`exams-subject-card-v2 ${isActive ? 'active' : ''}`}
                style={{ background: grad }}
              >
                <SubIcon className="subject-v2-icon" style={{ display: 'block', margin: '0 auto 8px auto', color: '#fff', fontSize: '28px' }} />
                <span className="subject-v2-name">{sub.name}</span>
                <span className="subject-v2-count">{subjectCounts[sub.name] || 0} đề</span>
              </button>
            );
          })}
        </div>

        {/* Filter panel */}
        <MockExamFilters
          filters={filters}
          onFilterChange={setFilters}
          subjects={subjects}
        />

        {/* ══════════════════════════════════════
            RESULTS BAR v2
        ══════════════════════════════════════ */}
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
            <div className="exams-results-bar-v2">
              <span className="results-count-v2">
                Tìm thấy <strong>{exams.length}</strong> đề thi phù hợp
              </span>

              {hasActiveFilters && (
                <div className="results-active-filters">
                  {filters.search && (
                    <span className="active-filter-chip">
                      Từ khoá: &quot;{filters.search}&quot;
                      <button onClick={() => setFilters(f => ({ ...f, search: '' }))} title="Xoá">×</button>
                    </span>
                  )}
                  {filters.subjectId !== 'All' && (
                    <span className="active-filter-chip">
                      {activeSubjectName}
                      <button onClick={() => setFilters(f => ({ ...f, subjectId: 'All' }))} title="Xoá">×</button>
                    </span>
                  )}
                  {filters.year !== 'All' && (
                    <span className="active-filter-chip">
                      Năm {filters.year}
                      <button onClick={() => setFilters(f => ({ ...f, year: 'All' }))} title="Xoá">×</button>
                    </span>
                  )}
                  {filters.examType !== 'All' && (
                    <span className="active-filter-chip">
                      {filters.examType === 'official' ? 'Chính thức' : filters.examType === 'mock' ? 'Trường chuyên' : 'Nội bộ'}
                      <button onClick={() => setFilters(f => ({ ...f, examType: 'All' }))} title="Xoá">×</button>
                    </span>
                  )}
                  <button
                    onClick={() => setFilters({ search: '', subjectId: 'All', year: 'All', examType: 'All' })}
                    style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
                  >
                    Xoá tất cả
                  </button>
                </div>
              )}
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
            <HiOutlineFolderOpen style={{ fontSize: '48px', color: 'var(--text-muted)', display: 'block', margin: '0 auto 12px auto' }} />
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
            <button className="cta-btn" onClick={() => navigateTo('/')}>Đăng ký ngay →</button>
          </div>
        )}
      </div>
    </div>
  );
}
