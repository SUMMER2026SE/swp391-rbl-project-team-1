import { useState, useEffect } from 'react';
import { HiSparkles, HiTrendingUp, HiAcademicCap, HiCheck, HiLockClosed } from 'react-icons/hi';
import studentSuccessImg from '../assets/student_success.png';
import { api } from '../api';

export default function AISystemCenter({ submissions, addLog }) {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const res = await api.refreshRoadmap();
      if (res && res.content) {
        const content = typeof res.content === 'string' ? JSON.parse(res.content) : res.content;
        setRoadmap(content);
      }
    } catch (err) {
      console.warn("Lỗi tải lộ trình thích ứng từ backend API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  // Compute weak points based on submissions or roadmap priorityTopics
  const getWeaknesses = () => {
    if (roadmap && roadmap.priorityTopics && roadmap.priorityTopics.length > 0) {
      return roadmap.priorityTopics;
    }
    if (!submissions || submissions.length === 0) return ['Chưa có dữ liệu làm bài để phân tích.'];
    const weakList = [];
    submissions.forEach(sub => {
      if (sub.score < 8) {
        sub.failedTopics?.forEach(topic => {
          if (!weakList.includes(topic)) weakList.push(topic);
        });
      }
    });
    return weakList.length > 0 ? weakList : ['Không phát hiện điểm yếu rõ rệt. Phong độ rất ổn định!'];
  };

  const weaknesses = getWeaknesses();

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Visual Analytics Banner */}
      <div 
        style={{ 
          backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.4)), url(${studentSuccessImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 'var(--radius-lg)', 
          padding: '30px', 
          color: '#fff',
          boxShadow: '0 8px 32px rgba(108,92,231,0.15)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: '180px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <HiSparkles style={{ fontSize: '24px', color: '#ffa751' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '0.5px' }}>
            HỆ THỐNG AI PHÂN TÍCH LỘ TRÌNH THÍCH ỨNG
          </h3>
        </div>
        <p style={{ fontSize: '13.5px', opacity: 0.9, lineHeight: '1.6', maxWidth: '650px', margin: 0 }}>
          Trí tuệ nhân tạo (Adaptive Learning AI) đang liên tục giám sát và phân tích mọi câu trả lời của học sinh. Thuật toán tự động chẩn đoán điểm khuyết kiến thức kết cấu để tái lập bản đồ học tập tối ưu thời gian ôn luyện.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Diagnostics */}
        <div className="card">
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <HiTrendingUp style={{ color: 'var(--accent-orange)' }} /> UC-31: CHẨN ĐOÁN KỸ THUẬT & ĐIỂM YẾU KẾT CẤU
          </h3>
          <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-red)', marginBottom: '8px' }}>
              Danh sách chuyên đề cần củng cố:
            </div>
            <ul style={{ paddingLeft: '16px', fontSize: '12.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {weaknesses.map((w, idx) => (
                <li key={idx} style={{ fontWeight: '500' }}>{w}</li>
              ))}
            </ul>

            <div style={{ borderTop: '1px solid var(--border)', marginTop: '14px', paddingTop: '14px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              🤖 <strong>AI Advice:</strong> {roadmap?.motivationalMessage || 'Lịch sử làm bài cho thấy học sinh cần ôn tập củng cố thêm phần lý thuyết cơ bản và làm các đề thi thử.'}
            </div>
          </div>
        </div>

        {/* Adaptive Roadmap Visualizer */}
        <div className="card">
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <HiAcademicCap style={{ color: 'var(--accent-blue)' }} /> UC-32 & UC-33: BẢN ĐỒ LỘ TRÌNH THÍCH ỨNG AI
          </h3>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '24px', paddingLeft: '20px', borderLeft: '2px dashed var(--border)', marginLeft: '12px' }}>
            {loading ? (
              <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <div className="progress-spinner" style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Đang tính toán lộ trình AI...</span>
              </div>
            ) : roadmap && roadmap.weeklyPlan && roadmap.weeklyPlan.length > 0 ? (
              roadmap.weeklyPlan.map((weekPlan, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  {/* Dot */}
                  <div style={{
                    position: 'absolute',
                    left: '-31px',
                    top: '0px',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: idx === 0 ? 'linear-gradient(135deg, var(--primary), #a29bfe)' : 'var(--border)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    boxShadow: idx === 0 ? '0 0 12px rgba(108,92,231,0.5)' : 'none',
                    zIndex: 2
                  }}>
                    {idx === 0 ? '⚡' : '🔒'}
                  </div>
                  <div className="card" style={{ padding: '16px', background: 'var(--bg-card)', border: idx === 0 ? '1.5px solid var(--primary)' : '1px solid var(--border)', borderRadius: 'var(--radius-md)', margin: 0, boxShadow: idx === 0 ? '0 4px 15px rgba(108,92,231,0.08)' : 'none', opacity: idx === 0 ? 1 : 0.8 }}>
                    <span className="badge-pill" style={{ background: idx === 0 ? 'var(--primary-bg)' : 'rgba(0,0,0,0.05)', color: idx === 0 ? 'var(--primary)' : 'var(--text-muted)', fontSize: '9px', fontWeight: 'bold' }}>
                      {idx === 0 ? 'ĐANG TRỌNG TÂM ÔN LUYỆN' : 'CHƯA MỞ KHÓA'}
                    </span>
                    <h5 style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '6px', marginBottom: '8px', color: 'var(--text-main)' }}>
                      {weekPlan.week}: {weekPlan.focus}
                    </h5>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                      {weekPlan.dailyTasks?.map((dt, dIdx) => (
                        <div key={dIdx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '4px' }}>
                          <span>📅 {dt.day}: {dt.task}</span>
                          <span style={{ color: 'var(--text-muted)' }}>⏱ {dt.estimatedMinutes} phút</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--primary)', fontWeight: '600' }}>
                      🎯 Mục tiêu: {weekPlan.targetScore}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <>
                {/* Item 1 */}
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '-29px',
                    top: '2px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#22c55e',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    boxShadow: '0 0 10px rgba(34,197,94,0.4)',
                    zIndex: 2
                  }}>
                    ✓
                  </div>
                  <div className="card" style={{ padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', margin: 0 }}>
                    <span className="badge-pill" style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--accent-green)', fontSize: '9px', fontWeight: 'bold' }}>HOÀN THÀNH</span>
                    <h5 style={{ fontSize: '12.5px', fontWeight: 'bold', marginTop: '6px', marginBottom: '4px', color: 'var(--text-main)' }}>Chương I: Sự đồng biến, nghịch biến của hàm số</h5>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>Điểm đánh giá: 9.0/10 • Hoàn thành ngày 24/05/2026</p>
                  </div>
                </div>

                {/* Item 2 */}
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '-31px',
                    top: '0px',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), #a29bfe)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    boxShadow: '0 0 12px rgba(108,92,231,0.5)',
                    zIndex: 2
                  }}>
                    ⚡
                  </div>
                  <div className="card" style={{ padding: '16px', background: 'var(--bg-card)', border: '1.5px solid var(--primary)', borderRadius: 'var(--radius-md)', margin: 0, boxShadow: '0 4px 15px rgba(108,92,231,0.08)' }}>
                    <span className="badge-pill" style={{ background: 'var(--primary-bg)', color: 'var(--primary)', fontSize: '9px', fontWeight: 'bold' }}>ĐANG TRỌNG TÂM ÔN LUYỆN</span>
                    <h5 style={{ fontSize: '12.5px', fontWeight: 'bold', marginTop: '6px', marginBottom: '4px', color: 'var(--text-main)' }}>Chương II: Phương trình mũ & Lôgarit chứa tham số</h5>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                      Lộ trình tiêu chuẩn: Hoàn thành 4/6 chuyên đề đạt yêu cầu.
                    </p>
                  </div>
                </div>

                {/* Item 3 */}
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '-29px',
                    top: '2px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: 'var(--border)',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    zIndex: 2
                  }}>
                    🔒
                  </div>
                  <div className="card" style={{ padding: '16px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', margin: 0, opacity: 0.8 }}>
                    <span className="badge-pill" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-muted)', fontSize: '9px', fontWeight: 'bold' }}>CHƯA MỞ KHÓA</span>
                    <h5 style={{ fontSize: '12.5px', fontWeight: 'bold', marginTop: '6px', marginBottom: '4px', color: 'var(--text-muted)' }}>Chương III: Tích phân & Ứng dụng hình học</h5>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Sẽ tự động kích hoạt sau khi học sinh vượt qua bài kiểm tra với điểm số trên 7.0.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
