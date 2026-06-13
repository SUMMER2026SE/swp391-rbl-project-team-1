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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px', margin: '0 auto', padding: '0 16px' }} className="animate-in">
      {!currentUser && (
        <button 
          onClick={() => navigateTo('/')}
          style={{
            border: 'none', background: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '13.5px',
            display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content',
            padding: '12px 0 0 0'
          }}
        >
          ← Quay lại trang chủ
        </button>
      )}
      
      {/* Hero Banner with statistics */}
      <div className="exams-hero-banner">
        <span className="badge-pill" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#fff', fontSize: '11px', fontWeight: 'bold', display: 'inline-block', marginBottom: '12px' }}>
          Học đúng hướng · Thi đúng đích cùng EduPath AI 🎓
        </span>
        <h2 style={{ fontSize: '28px', fontWeight: '950', color: '#fff', margin: '0 0 8px 0', lineHeight: 1.2 }}>
          TRUNG TÂM LUYỆN THI THỬ QUỐC GIA
        </h2>
        <p style={{ fontSize: '13.5px', color: '#f3e8ff', margin: '0 0 24px 0', maxWidth: '650px', lineHeight: 1.5 }}>
          Tổng hợp kho đề thi chính thức từ Bộ GD&ĐT qua các năm và đề thi thử từ các trường chuyên danh tiếng trên cả nước. Chấm điểm tự động và chẩn đoán lỗ hổng kiến thức bằng AI.
        </p>

        {/* Hero counters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold' }}>TỔNG SỐ ĐỀ THI</span>
            <strong style={{ fontSize: '20px', color: '#fff', fontWeight: '900' }}>{exams.length}+ Bộ đề</strong>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold' }}>LƯỢT THI TUẦN</span>
            <strong style={{ fontSize: '20px', color: '#fff', fontWeight: '900' }}>15,200+ Lượt</strong>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold' }}>ĐÁP ÁN CHÍNH THỨC</span>
            <strong style={{ fontSize: '20px', color: '#fff', fontWeight: '900' }}>100% Khớp</strong>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold' }}>EDU BOT AI</span>
            <strong style={{ fontSize: '20px', color: '#fff', fontWeight: '900' }}>Hỗ trợ 24/7</strong>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      <MockExamFilters 
        filters={filters} 
        onFilterChange={setFilters} 
        subjects={subjects} 
      />

      {/* Exam Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} style={{ height: '340px', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '24px', animation: 'pulse 1.5s infinite alternate' }}>⏳</div>
                <div style={{ fontSize: '12px', marginTop: '8px' }}>Đang tải đề thi...</div>
              </div>
            </div>
          ))}
        </div>
      ) : exams.length > 0 ? (
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
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '48px' }}>📂</span>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '16px 0 8px 0', color: 'var(--text-primary)' }}>Không tìm thấy đề thi phù hợp</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Vui lòng thay đổi từ khóa hoặc điều chỉnh bộ lọc tìm kiếm.</p>
        </div>
      )}
    </div>
  );
}
