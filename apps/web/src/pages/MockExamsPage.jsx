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
        <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '20px', textTransform: 'uppercase' }}>
          Đề Thi Thử THPT Quốc Gia
        </h2>

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
