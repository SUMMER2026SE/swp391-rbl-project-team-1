import React, { useState, useEffect } from 'react';
import { mockExamService } from '../services/mockExamService';

export default function MockExamDetailPage({ examId, currentUser, onStartExam, navigateTo }) {
  const [exam, setExam] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadExamDetails = async () => {
    setLoading(true);
    try {
      const examData = await mockExamService.getMockExamById(examId);
      setExam(examData);

      if (currentUser) {
        const history = await mockExamService.getUserExamAttempts(currentUser.id, examId);
        setAttempts(history || []);
      }
    } catch (err) {
      console.error('Lỗi tải chi tiết đề thi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExamDetails();
  }, [examId, currentUser]);

  const handleStartClick = () => {
    onStartExam(examId);
  };

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m} phút ${s} giây`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: '30px', animation: 'pulse 1.5s infinite alternate' }}>⏳</div>
        <p style={{ marginTop: '12px', fontSize: '13px' }}>Đang tải thông tin chi tiết đề thi...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <span style={{ fontSize: '48px' }}>⚠️</span>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '16px 0 8px 0', color: 'var(--text-primary)' }}>Không tìm thấy đề thi</h3>
        <button className="btn-primary" onClick={() => navigateTo('/mock-exams')} style={{ marginTop: '12px' }}>
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto', padding: '0 16px' }} className="animate-in">
      {/* Back button */}
      <button 
        onClick={() => navigateTo('/mock-exams')}
        style={{
          border: 'none', background: 'none', cursor: 'pointer',
          color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '13.5px',
          display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content'
        }}
      >
        ← Quay lại danh mục đề thi
      </button>

      {/* Main Info Card */}
      <div className="card" style={{ padding: '32px', border: '1px solid var(--border)', borderRadius: '16px' }}>
        <span className="badge-pill" style={{ background: 'var(--exams-purple-bg)', color: 'var(--exams-purple)', fontWeight: 'bold', fontSize: '11px', display: 'inline-block' }}>
          {exam.exam_subjects?.name || 'Đề ôn tập'}
        </span>
        
        <h2 style={{ fontSize: '22px', fontWeight: '950', color: 'var(--text-primary)', margin: '12px 0 6px 0', lineHeight: 1.3 }}>
          {exam.title}
        </h2>

        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 24px 0' }}>
          {exam.description || 'Đề thi trắc nghiệm chuẩn cấu trúc ma trận của Bộ Giáo dục & Đào tạo. Hãy làm đề để đánh giá năng lực hiện tại của mình.'}
        </p>

        {/* Info list */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', background: 'var(--bg-main)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '24px' }}>
          <div>
            <span style={{ display: 'block', fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>NĂM THI</span>
            <strong style={{ fontSize: '14.5px', color: 'var(--text-primary)' }}>Năm {exam.year || '2024'}</strong>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>MÃ ĐỀ</span>
            <strong style={{ fontSize: '14.5px', color: 'var(--text-primary)' }}>Mã: {exam.exam_code || '101'}</strong>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>THỜI GIAN LÀM</span>
            <strong style={{ fontSize: '14.5px', color: 'var(--text-primary)' }}>{exam.duration_minutes || 90} phút</strong>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>SỐ CÂU HỎI</span>
            <strong style={{ fontSize: '14.5px', color: 'var(--text-primary)' }}>{exam.total_questions || 50} câu</strong>
          </div>
        </div>

        {/* PDF Downloads block */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {exam.pdf_url && (
            <a 
              href={exam.pdf_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-outline"
              style={{ padding: '10px 18px', fontSize: '12.5px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--text-primary)' }}
            >
              📥 Tải đề bài (PDF)
            </a>
          )}
          {exam.official_answer_key_url && (
            <a 
              href={exam.official_answer_key_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-outline"
              style={{ padding: '10px 18px', fontSize: '12.5px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--text-primary)' }}
            >
              📥 Tải đáp án chi tiết (PDF)
            </a>
          )}
        </div>

        {/* Primary CTA */}
        <button
          onClick={handleStartClick}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '14px',
            background: 'var(--exams-purple)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14.5px',
            fontWeight: 'bold',
            boxShadow: '0 8px 20px rgba(108, 92, 231, 0.25)',
            cursor: 'pointer',
            textAlign: 'center'
          }}
        >
          ⚡ BẮT ĐẦU LÀM BÀI THI NGAY
        </button>
      </div>

      {/* Attempt History Section */}
      <div className="card" style={{ padding: '24px', border: '1px solid var(--border)', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          📊 Lịch sử làm đề thi này của bạn
        </h3>

        {!currentUser ? (
          <div style={{ padding: '16px', background: 'rgba(243, 156, 18, 0.08)', borderRadius: '10px', fontSize: '13px', color: 'var(--accent-orange)', border: '1px solid rgba(243, 156, 18, 0.2)' }}>
            🔑 Bạn chưa đăng nhập. Vui lòng đăng nhập hoặc tạo tài khoản để lưu trữ lịch sử thi thử và nhận phân tích học tập từ AI.
          </div>
        ) : attempts.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '10px 12px' }}>Thời gian nộp</th>
                  <th style={{ padding: '10px 12px' }}>Thời lượng</th>
                  <th style={{ padding: '10px 12px' }}>Số câu đúng</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Điểm số</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((att) => {
                  const dateStr = new Date(att.submitted_at || att.started_at).toLocaleDateString('vi-VN', {
                    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                  });
                  return (
                    <tr key={att.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{dateStr}</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{formatDuration(att.duration_seconds || 0)}</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{att.correct_count} câu đúng</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: '900', color: att.score >= 8 ? 'var(--exams-green)' : (att.score >= 5 ? 'var(--exams-orange)' : 'var(--exams-red)') }}>
                        {att.score.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          className="btn-outline"
                          onClick={() => navigateTo(`/mock-exams/${examId}/result/${att.id}`)}
                          style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px' }}
                        >
                          Xem kết quả 🔎
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
            📭 Bạn chưa thực hiện lượt thi thử nào cho đề thi này.
          </div>
        )}
      </div>
    </div>
  );
}
