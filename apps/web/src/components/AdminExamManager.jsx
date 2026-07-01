import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  HiSearch, 
  HiAdjustments, 
  HiChevronDown, 
  HiCheck, 
  HiX, 
  HiEye, 
  HiEyeOff, 
  HiBookOpen,
  HiClock,
  HiAcademicCap,
  HiChevronLeft,
  HiChevronRight,
  HiShieldCheck,
  HiTrash,
  HiChevronDoubleLeft,
  HiChevronDoubleRight
} from 'react-icons/hi';

export default function AdminExamManager() {
  // Query Filters & Pagination State
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('all');
  const [status, setStatus] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalExams, setTotalExams] = useState(0);
  const [globalStats, setGlobalStats] = useState({
    total: 0,
    pending: 0,
    published: 0,
    hidden: 0
  });

  // Generate page numbers array with windows and ellipses
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);
      
      if (page <= 3) {
        end = 4;
      } else if (page >= totalPages - 2) {
        start = totalPages - 3;
      }
      
      if (start > 2) {
        pageNumbers.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
      
      if (end < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  // Normalize options shape for safe rendering across array and object formats
  const getNormalizedOptions = (q) => {
    if (!q || !q.options) return [];
    
    let parsedOptions = [];
    try {
      if (typeof q.options === 'string') {
        parsedOptions = JSON.parse(q.options);
      } else if (Array.isArray(q.options)) {
        parsedOptions = q.options;
      } else if (typeof q.options === 'object') {
        parsedOptions = Object.entries(q.options).map(([k, v]) => ({
          label: k,
          text: v
        }));
      }
    } catch (e) {
      console.error('Error parsing options:', e);
    }
    
    if (!Array.isArray(parsedOptions)) return [];

    return parsedOptions.map(opt => ({
      key: (opt.label || opt.key || opt.option_label || '').toUpperCase(),
      text: opt.text || opt.value || opt.option_text || ''
    }));
  };

  // Detail Modal & Preview Drawer State
  const [selectedExam, setSelectedExam] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [showPreviewDrawer, setShowPreviewDrawer] = useState(false);

  // Reject Action State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingExamId, setRejectingExamId] = useState(null);

  // Hide Action State
  const [hideModalOpen, setHideModalOpen] = useState(false);
  const [hideReason, setHideReason] = useState('');
  const [hidingExamId, setHidingExamId] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  // Simulator Interactive States
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionId: selectedOptionLetter }
  const [showInstantExplanation, setShowInstantExplanation] = useState(false);
  const [submittedSimulator, setSubmittedSimulator] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Fetch Exams List
  const fetchExams = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminTests({
        search,
        subject,
        status,
        difficulty,
        page,
        limit: 10
      });
      if (data) {
        setExams(data.exams || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalExams(data.pagination?.total || 0);
        if (data.stats) {
          setGlobalStats(data.stats);
        }
      }
    } catch (err) {
      triggerToast(err.message || 'Lỗi tải danh sách đề thi', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [subject, status, difficulty, page]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchExams();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Toast Helper
  const triggerToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('app:toast', { detail: { message, type } }));
  };

  // Fetch Exam Details
  const handleViewDetails = async (examId) => {
    try {
      setLoadingDetail(true);
      setShowDetailDrawer(true);
      setSelectedExam(null);
      const data = await api.getAdminTestById(examId);
      if (data) {
        setSelectedExam(data);
      }
    } catch (err) {
      triggerToast(err.message || 'Lỗi tải thông tin đề thi', 'error');
      setShowDetailDrawer(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Approve action
  const handleApprove = async (examId) => {
    if (!window.confirm('Bạn có chắc chắn muốn phê duyệt đề thi thử này không?')) return;
    try {
      setActionLoading(true);
      await api.approveTest(examId);
      triggerToast('Phê duyệt đề thi thử thành công!', 'success');
      
      // Update UI state
      fetchExams();
      if (selectedExam && selectedExam.id === examId) {
        // Refresh details
        const updated = await api.getAdminTestById(examId);
        setSelectedExam(updated);
      }
    } catch (err) {
      triggerToast(err.message || 'Duyệt đề thi thất bại', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Reject action
  const handleOpenRejectModal = (examId) => {
    setRejectingExamId(examId);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      triggerToast('Vui lòng nhập lý do từ chối!', 'error');
      return;
    }
    try {
      setActionLoading(true);
      await api.rejectTest(rejectingExamId, rejectReason.trim());
      triggerToast('Đã từ chối phê duyệt đề thi!', 'success');
      setRejectModalOpen(false);
      
      // Update UI state
      fetchExams();
      if (selectedExam && selectedExam.id === rejectingExamId) {
        const updated = await api.getAdminTestById(rejectingExamId);
        setSelectedExam(updated);
      }
    } catch (err) {
      triggerToast(err.message || 'Từ chối duyệt thất bại', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Hide action
  const handleOpenHideModal = (examId) => {
    setHidingExamId(examId);
    setHideReason('');
    setHideModalOpen(true);
  };

  const handleHideSubmit = async () => {
    try {
      setActionLoading(true);
      await api.hideTest(hidingExamId, hideReason.trim() || undefined);
      triggerToast('Đã ẩn đề thi thành công!', 'success');
      setHideModalOpen(false);

      // Update UI state
      fetchExams();
      if (selectedExam && selectedExam.id === hidingExamId) {
        const updated = await api.getAdminTestById(hidingExamId);
        setSelectedExam(updated);
      }
    } catch (err) {
      triggerToast(err.message || 'Ẩn đề thi thất bại', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Show action
  const handleShow = async (examId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hiển thị lại đề thi này không?')) return;
    try {
      setActionLoading(true);
      await api.showTest(examId);
      triggerToast('Đã hiển thị lại đề thi thành công!', 'success');

      // Update UI state
      fetchExams();
      if (selectedExam && selectedExam.id === examId) {
        const updated = await api.getAdminTestById(examId);
        setSelectedExam(updated);
      }
    } catch (err) {
      triggerToast(err.message || 'Hiển thị lại đề thi thất bại', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Simulator Preview Open
  const handleOpenPreview = () => {
    if (!selectedExam || !selectedExam.questions || selectedExam.questions.length === 0) {
      triggerToast('Đề thi không có câu hỏi nào để xem trước!', 'warning');
      return;
    }
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setShowPreviewDrawer(true);
  };

  // Click on statistic KPI card to filter status and reset search query
  const handleStatCardClick = (targetStatus) => {
    setStatus(targetStatus);
    setSearch('');
    setPage(1);
  };

  const getStatusBadge = (statusStr) => {
    switch (statusStr) {
      case 'published':
        return <span style={{ background: '#D1FAE5', color: '#065F46', border: '2px solid #065F46', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>ĐÃ DUYỆT</span>;
      case 'pending':
        return <span style={{ background: '#FEF3C7', color: '#92400E', border: '2px solid #92400E', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>CHỜ DUYỆT</span>;
      case 'rejected':
        return <span style={{ background: '#FEE2E2', color: '#991B1B', border: '2px solid #991B1B', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>BỊ TỪ CHỐI</span>;
      case 'hidden':
        return <span style={{ background: '#E5E7EB', color: '#374151', border: '2px solid #374151', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>ĐÃ ẨN</span>;
      default:
        return <span style={{ background: '#F3F4F6', color: '#1F2937', border: '2px solid #1F2937', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>{statusStr}</span>;
    }
  };

  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case 'EASY':
        return <span style={{ color: '#059669', fontWeight: '700' }}>Dễ</span>;
      case 'MEDIUM':
        return <span style={{ color: '#D97706', fontWeight: '700' }}>Vừa</span>;
      case 'HARD':
        return <span style={{ color: '#DC2626', fontWeight: '700' }}>Khó</span>;
      default:
        return <span>{diff}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Statistics Summary Header Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div 
          className="admin-card" 
          onClick={() => handleStatCardClick('all')}
          style={{ border: '3px solid #000', boxShadow: status === 'all' ? '4px 4px 0px #6C5CE7' : '4px 4px 0px #000', padding: '20px', background: '#FFF', cursor: 'pointer', transition: 'all 0.15s' }}
          title="Xem tất cả đề thi thử"
        >
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#666', textTransform: 'uppercase' }}>Tổng số đề thi thử</div>
          <div style={{ fontSize: '32px', fontWeight: '950', marginTop: '8px', color: '#000' }}>{globalStats.total}</div>
        </div>
        <div 
          className="admin-card" 
          onClick={() => handleStatCardClick('pending')}
          style={{ border: '3px solid #000', boxShadow: status === 'pending' ? '4px 4px 0px #D97706' : '4px 4px 0px #000', padding: '20px', background: '#FEF3C7', cursor: 'pointer', transition: 'all 0.15s' }}
          title="Lọc đề thi chờ duyệt"
        >
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#92400E', textTransform: 'uppercase' }}>Đề thi chờ duyệt</div>
          <div style={{ fontSize: '32px', fontWeight: '950', marginTop: '8px', color: '#92400E' }}>
            {globalStats.pending}
          </div>
        </div>
        <div 
          className="admin-card" 
          onClick={() => handleStatCardClick('published')}
          style={{ border: '3px solid #000', boxShadow: status === 'published' ? '4px 4px 0px #059669' : '4px 4px 0px #000', padding: '20px', background: '#D1FAE5', cursor: 'pointer', transition: 'all 0.15s' }}
          title="Lọc đề thi đã duyệt"
        >
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#065F46', textTransform: 'uppercase' }}>Đề thi đã duyệt</div>
          <div style={{ fontSize: '32px', fontWeight: '950', marginTop: '8px', color: '#065F46' }}>
            {globalStats.published}
          </div>
        </div>
        <div 
          className="admin-card" 
          onClick={() => handleStatCardClick('hidden')}
          style={{ border: '3px solid #000', boxShadow: status === 'hidden' ? '4px 4px 0px #374151' : '4px 4px 0px #000', padding: '20px', background: '#F3F4F6', cursor: 'pointer', transition: 'all 0.15s' }}
          title="Lọc đề thi đã ẩn"
        >
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#374151', textTransform: 'uppercase' }}>Đề thi đã ẩn</div>
          <div style={{ fontSize: '32px', fontWeight: '950', marginTop: '8px', color: '#374151' }}>
            {globalStats.hidden}
          </div>
        </div>
      </div>

      {/* 2. Filter Box */}
      <div className="admin-card" style={{ border: '3px solid #000', boxShadow: '4px 4px 0px #000', padding: '20px', background: '#FCFBFA', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <div style={{ flex: '1 1 240px', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <HiSearch style={{ position: 'absolute', left: '12px', color: '#777', fontSize: '16px', pointerEvents: 'none' }} />
          <input
            type="text"
            className="admin-input"
            placeholder="Tìm theo tiêu đề đề thi hoặc giáo viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '38px', paddingRight: search ? '36px' : '12px', border: '2px solid #000', borderRadius: '8px', height: '42px', fontSize: '13px', fontWeight: 'bold' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#9CA3AF',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px'
              }}
              title="Xóa tìm kiếm"
            >
              <HiX style={{ color: '#000', strokeWidth: '1' }} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {/* Subject Filter */}
          <select
            value={subject}
            onChange={(e) => { setSubject(e.target.value); setPage(1); }}
            style={{ border: '2px solid #000', padding: '0 12px', borderRadius: '8px', height: '42px', fontSize: '13px', fontWeight: '800', background: '#FFF', cursor: 'pointer' }}
          >
            <option value="all">Môn học (Tất cả)</option>
            <option value="toán học">Toán học</option>
            <option value="vật lý">Vật lý</option>
            <option value="hóa học">Hóa học</option>
            <option value="sinh học">Sinh học</option>
            <option value="tiếng anh">Tiếng Anh</option>
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            style={{ border: '2px solid #000', padding: '0 12px', borderRadius: '8px', height: '42px', fontSize: '13px', fontWeight: '800', background: '#FFF', cursor: 'pointer' }}
          >
            <option value="all">Trạng thái (Tất cả)</option>
            <option value="pending">Chờ duyệt</option>
            <option value="published">Đã duyệt (Phát hành)</option>
            <option value="rejected">Bị từ chối</option>
            <option value="hidden">Đã ẩn</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={difficulty}
            onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
            style={{ border: '2px solid #000', padding: '0 12px', borderRadius: '8px', height: '42px', fontSize: '13px', fontWeight: '800', background: '#FFF', cursor: 'pointer' }}
          >
            <option value="all">Độ khó (Tất cả)</option>
            <option value="EASY">Dễ</option>
            <option value="MEDIUM">Vừa</option>
            <option value="HARD">Khó</option>
          </select>
        </div>
      </div>

      {/* 3. Exams List Table */}
      <div className="admin-card" style={{ border: '3px solid #000', boxShadow: '4px 4px 0px #000', background: '#FFF', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', fontWeight: '800', fontSize: '15px' }}>
            Đang tải danh sách đề thi thử... ⏳
          </div>
        ) : exams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', fontWeight: '800', color: '#666' }}>
            Không tìm thấy đề thi thử nào phù hợp với bộ lọc hiện tại. 🔍
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '3.5px solid #000', background: '#F8F9FA' }}>
                  <th style={{ padding: '16px 12px', fontWeight: '950', fontSize: '12px', textTransform: 'uppercase' }}>Đề thi</th>
                  <th style={{ padding: '16px 12px', fontWeight: '950', fontSize: '12px', textTransform: 'uppercase' }}>Môn học</th>
                  <th style={{ padding: '16px 12px', fontWeight: '950', fontSize: '12px', textTransform: 'uppercase' }}>Người tạo</th>
                  <th style={{ padding: '16px 12px', fontWeight: '950', fontSize: '12px', textTransform: 'uppercase', textAlign: 'center' }}>Số câu hỏi</th>
                  <th style={{ padding: '16px 12px', fontWeight: '950', fontSize: '12px', textTransform: 'uppercase', textAlign: 'center' }}>Thời lượng</th>
                  <th style={{ padding: '16px 12px', fontWeight: '950', fontSize: '12px', textTransform: 'uppercase' }}>Độ khó</th>
                  <th style={{ padding: '16px 12px', fontWeight: '950', fontSize: '12px', textTransform: 'uppercase', textAlign: 'center' }}>Lượt thi</th>
                  <th style={{ padding: '16px 12px', fontWeight: '950', fontSize: '12px', textTransform: 'uppercase', textAlign: 'center' }}>Đtb</th>
                  <th style={{ padding: '16px 12px', fontWeight: '950', fontSize: '12px', textTransform: 'uppercase' }}>Trạng thái</th>
                  <th style={{ padding: '16px 12px', fontWeight: '950', fontSize: '12px', textTransform: 'uppercase', width: '80px' }}></th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.id} style={{ borderBottom: '2px solid #000', transition: 'background 0.2s' }} className="admin-table-row">
                    <td style={{ padding: '14px 12px' }}>
                      <div 
                        onClick={() => handleViewDetails(exam.id)}
                        style={{ fontWeight: '900', color: '#6C5CE7', cursor: 'pointer', fontSize: '13.5px', textDecoration: 'underline' }}
                      >
                        {exam.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#777', fontWeight: 'bold', marginTop: '2px' }}>
                        Tạo lúc: {new Date(exam.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '14px 12px', fontWeight: '800', textTransform: 'capitalize', fontSize: '13px' }}>
                      {exam.subject}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ fontWeight: '800', fontSize: '13px' }}>{exam.creatorName}</div>
                      <div style={{ fontSize: '11px', color: '#888', fontWeight: '700' }}>{exam.creatorEmail}</div>
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '900', fontSize: '13px' }}>
                      {exam.totalQuestions}
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '900', fontSize: '13px' }}>
                      {exam.duration}p
                    </td>
                    <td style={{ padding: '14px 12px', fontSize: '13px' }}>
                      {getDifficultyBadge(exam.difficulty)}
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '900', fontSize: '13px' }}>
                      {exam.attemptsCount}
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '900', color: '#6C5CE7', fontSize: '13px' }}>
                      {exam.avgScore > 0 ? exam.avgScore : '-'}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      {getStatusBadge(exam.status)}
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleViewDetails(exam.id)}
                        className="admin-back-btn"
                        style={{ border: '2px solid #000', padding: '6px 12px', boxShadow: 'none', background: '#FFF', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '16px', borderTop: '3px solid #000', background: '#F8F9FA', flexWrap: 'wrap' }}>
            {/* Về đầu */}
            <button
              disabled={page === 1}
              onClick={() => setPage(1)}
              title="Về trang đầu"
              style={{ 
                border: '2px solid #000', 
                padding: '6px 12px', 
                fontWeight: '800', 
                background: page === 1 ? '#E5E7EB' : '#FFF', 
                color: page === 1 ? '#9CA3AF' : '#000',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: page === 1 ? 'none' : '2px 2px 0px #000',
                transition: 'all 0.1s'
              }}
            >
              <HiChevronDoubleLeft style={{ fontSize: '14px' }} /> Đầu
            </button>

            {/* Trước */}
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              title="Trang trước"
              style={{ 
                border: '2px solid #000', 
                padding: '6px 12px', 
                fontWeight: '800', 
                background: page === 1 ? '#E5E7EB' : '#FFF', 
                color: page === 1 ? '#9CA3AF' : '#000',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: page === 1 ? 'none' : '2px 2px 0px #000',
                transition: 'all 0.1s'
              }}
            >
              <HiChevronLeft style={{ fontSize: '14px' }} /> Trước
            </button>

            {/* Page numbers list */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {getPageNumbers().map((pageNum, index) => {
                if (pageNum === '...') {
                  return (
                    <span key={`ellipsis-${index}`} style={{ fontWeight: '900', padding: '0 6px', color: '#777' }}>
                      ...
                    </span>
                  );
                }

                const isCurrent = pageNum === page;
                return (
                  <button
                    key={`page-${pageNum}`}
                    onClick={() => setPage(pageNum)}
                    style={{
                      border: '2px solid #000',
                      width: '38px',
                      height: '38px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '900',
                      fontSize: '13px',
                      background: isCurrent ? '#6C5CE7' : '#FFF',
                      color: isCurrent ? '#FFF' : '#000',
                      cursor: 'pointer',
                      boxShadow: isCurrent ? 'none' : '2px 2px 0px #000',
                      transform: isCurrent ? 'translate(2px, 2px)' : 'none',
                      transition: 'all 0.1s'
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Sau */}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              title="Trang sau"
              style={{ 
                border: '2px solid #000', 
                padding: '6px 12px', 
                fontWeight: '800', 
                background: page === totalPages ? '#E5E7EB' : '#FFF', 
                color: page === totalPages ? '#9CA3AF' : '#000',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: page === totalPages ? 'none' : '2px 2px 0px #000',
                transition: 'all 0.1s'
              }}
            >
              Sau <HiChevronRight style={{ fontSize: '14px' }} />
            </button>

            {/* Đến cuối */}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(totalPages)}
              title="Đến trang cuối"
              style={{ 
                border: '2px solid #000', 
                padding: '6px 12px', 
                fontWeight: '800', 
                background: page === totalPages ? '#E5E7EB' : '#FFF', 
                color: page === totalPages ? '#9CA3AF' : '#000',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: page === totalPages ? 'none' : '2px 2px 0px #000',
                transition: 'all 0.1s'
              }}
            >
              Cuối <HiChevronDoubleRight style={{ fontSize: '14px' }} />
            </button>
          </div>
        )}
      </div>

      {/* ==========================================
          DRAWER: EXAM DETAIL & REVIEW
          ========================================== */}
      {showDetailDrawer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.5)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
          {/* Overlay Click to Close */}
          <div onClick={() => setShowDetailDrawer(false)} style={{ flex: 1 }}></div>

          <div style={{ width: 'min(700px, 90vw)', background: '#FFF', height: '100%', borderLeft: '4px solid #000', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            {/* Header */}
            <div style={{ borderBottom: '3.5px solid #000', padding: '20px', background: '#F8F9FA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '950', margin: 0, textTransform: 'uppercase' }}>Chi tiết đề thi</h3>
                <p style={{ fontSize: '12px', color: '#666', fontWeight: 'bold', margin: '4px 0 0 0' }}>Xem lại nội dung câu hỏi trước khi kiểm duyệt</p>
              </div>
              <button 
                onClick={() => setShowDetailDrawer(false)} 
                style={{ border: '2px solid #000', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', cursor: 'pointer', fontWeight: '900' }}
              >
                ✖
              </button>
            </div>

            {/* Content Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {loadingDetail ? (
                <div style={{ textAlign: 'center', padding: '100px 0', fontWeight: '800' }}>Đang tải dữ liệu đề thi chi tiết... ⏳</div>
              ) : selectedExam ? (
                <>
                  {/* General Summary Card */}
                  <div className="admin-card" style={{ border: '2.5px solid #000', boxShadow: '3px 3px 0px #000', padding: '16px', background: '#FCFBFA', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '800' }}>
                      <strong style={{ color: '#555' }}>Tên đề thi: </strong>
                      <span style={{ color: '#000', fontWeight: '900' }}>{selectedExam.title}</span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '800' }}>
                      <strong style={{ color: '#555' }}>Môn học: </strong>
                      <span style={{ textTransform: 'capitalize' }}>{selectedExam.subject}</span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '800' }}>
                      <strong style={{ color: '#555' }}>Người tạo: </strong>
                      <span>{selectedExam.creatorName} ({selectedExam.creatorEmail})</span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '800' }}>
                      <strong style={{ color: '#555' }}>Thời gian: </strong>
                      <span>{selectedExam.duration} phút</span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '800' }}>
                      <strong style={{ color: '#555' }}>Mức độ: </strong>
                      {getDifficultyBadge(selectedExam.difficulty)}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '800' }}>
                      <strong style={{ color: '#555' }}>Trạng thái: </strong>
                      {getStatusBadge(selectedExam.status)}
                    </div>
                  </div>

                  {/* Attempts Statistics Card */}
                  <div className="admin-card" style={{ border: '2.5px solid #000', boxShadow: '3px 3px 0px #000', padding: '16px', background: '#EEF2FF', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#4F46E5', textTransform: 'uppercase' }}>Tổng lượt thi</div>
                      <div style={{ fontSize: '20px', fontWeight: '950', color: '#1E1B4B', marginTop: '4px' }}>{selectedExam.stats?.totalAttempts || 0}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#4F46E5', textTransform: 'uppercase' }}>Điểm trung bình</div>
                      <div style={{ fontSize: '20px', fontWeight: '950', color: '#1E1B4B', marginTop: '4px' }}>{selectedExam.stats?.avgScore || '-'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#4F46E5', textTransform: 'uppercase' }}>{"Số lượt đạt (>= 5)"}</div>
                      <div style={{ fontSize: '20px', fontWeight: '950', color: '#1E1B4B', marginTop: '4px' }}>{selectedExam.stats?.passedCount || 0}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#4F46E5', textTransform: 'uppercase' }}>Tỉ lệ đạt</div>
                      <div style={{ fontSize: '20px', fontWeight: '950', color: '#1E1B4B', marginTop: '4px' }}>{selectedExam.stats?.passRate || 0}%</div>
                    </div>
                  </div>

                  {/* Rejected Reason (If Rejected) */}
                  {selectedExam.status === 'rejected' && selectedExam.rejectedReason && (
                    <div style={{ border: '3px solid #DC2626', background: '#FEF2F2', padding: '14px', borderRadius: '8px', fontSize: '13px', fontWeight: '800', color: '#991B1B' }}>
                      ⚠️ <strong>Lý do từ chối trước đó:</strong> "{selectedExam.rejectedReason}"
                    </div>
                  )}

                  {/* Hidden Reason (If Hidden) */}
                  {selectedExam.status === 'hidden' && selectedExam.hiddenReason && (
                    <div style={{ border: '3px solid #374151', background: '#F9FAFB', padding: '14px', borderRadius: '8px', fontSize: '13px', fontWeight: '800', color: '#374151' }}>
                      👁️‍🗨️ <strong>Lý do ẩn đề:</strong> "{selectedExam.hiddenReason}"
                    </div>
                  )}

                  {/* Action Buttons inside Drawer */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', borderBottom: '2.5px dashed #000', paddingBottom: '20px' }}>
                    <button
                      onClick={handleOpenPreview}
                      className="admin-back-btn"
                      style={{ flex: 1, border: '2px solid #000', background: '#6C5CE7', color: '#FFF', padding: '10px 16px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                    >
                      <HiBookOpen style={{ fontSize: '16px' }} /> Trải nghiệm Xem trước (Preview)
                    </button>

                    {selectedExam.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(selectedExam.id)}
                          disabled={actionLoading}
                          className="admin-back-btn"
                          style={{ flex: '0 0 130px', border: '2px solid #000', background: '#10B981', color: '#FFF', padding: '10px 16px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
                        >
                          <HiCheck /> Phê duyệt
                        </button>
                        <button
                          onClick={() => handleOpenRejectModal(selectedExam.id)}
                          disabled={actionLoading}
                          className="admin-back-btn"
                          style={{ flex: '0 0 130px', border: '2px solid #000', background: '#EF4444', color: '#FFF', padding: '10px 16px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
                        >
                          <HiX /> Từ chối
                        </button>
                      </>
                    )}

                    {selectedExam.status === 'published' && (
                      <button
                        onClick={() => handleOpenHideModal(selectedExam.id)}
                        disabled={actionLoading}
                        className="admin-back-btn"
                        style={{ flex: '0 0 130px', border: '2px solid #000', background: '#374151', color: '#FFF', padding: '10px 16px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
                      >
                        <HiEyeOff /> Ẩn đề thi
                      </button>
                    )}

                    {selectedExam.status === 'hidden' && (
                      <button
                        onClick={() => handleShow(selectedExam.id)}
                        disabled={actionLoading}
                        className="admin-back-btn"
                        style={{ flex: '0 0 130px', border: '2px solid #000', background: '#10B981', color: '#FFF', padding: '10px 16px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
                      >
                        <HiEye /> Hiện đề thi
                      </button>
                    )}
                  </div>

                  {/* List of Questions */}
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '900', marginBottom: '14px', textTransform: 'uppercase' }}>Danh sách câu hỏi ({selectedExam.questions?.length})</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {selectedExam.questions?.map((q, idx) => (
                        <div 
                          key={q.id} 
                          className="admin-card" 
                          style={{ border: '2px solid #000', borderRadius: '8px', padding: '16px', background: '#FFF', display: 'flex', flexDirection: 'column', gap: '10px' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #DDD', paddingBottom: '8px' }}>
                            <span style={{ fontWeight: '900', fontSize: '13px' }}>Câu {idx + 1}:</span>
                            <span style={{ fontSize: '11px', background: '#F3F4F6', border: '1px solid #CCC', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                              Topic: {q.topic || 'Chưa phân loại'}
                            </span>
                          </div>
                          <div style={{ fontSize: '13.5px', fontWeight: '800', lineHeight: 1.5, color: '#000' }}>
                            {q.content}
                          </div>
                          {q.imageUrl && (
                            <div style={{ border: '2px solid #000', borderRadius: '6px', overflow: 'hidden', maxWidth: '300px', margin: '4px 0' }}>
                              <img src={q.imageUrl} alt="Câu hỏi" style={{ width: '100%', objectFit: 'contain' }} />
                            </div>
                          )}

                          {/* Options grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                            {getNormalizedOptions(q).map((opt) => {
                              const isCorrect = opt.key === q.correctAnswer?.toUpperCase();
                              return (
                                <div 
                                  key={opt.key} 
                                  style={{ 
                                    padding: '8px 12px', 
                                    border: isCorrect ? '2px solid #10B981' : '1px solid #DDD', 
                                    borderRadius: '6px', 
                                    background: isCorrect ? '#D1FAE5' : '#FCFBFA', 
                                    fontSize: '12.5px', 
                                    fontWeight: '800', 
                                    color: isCorrect ? '#065F46' : '#333',
                                    display: 'flex',
                                    gap: '6px'
                                  }}
                                >
                                  <strong>{opt.key}.</strong> <span>{opt.text}</span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Explanation */}
                          {q.explanation && (
                            <div style={{ background: '#F9FAFB', borderLeft: '3px solid #6C5CE7', padding: '10px 12px', fontSize: '12px', color: '#555', fontWeight: 'bold', marginTop: '6px' }}>
                              <strong>Lời giải:</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px' }}>Không có dữ liệu đề thi.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          PREVIEW DRAWERS: INTERACTIVE EXAM SIMULATOR
          ========================================== */}
      {showPreviewDrawer && selectedExam && (
        <div style={{ position: 'fixed', inset: 0, background: '#FFF', zIndex: 1100, display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ borderBottom: '3.5px solid #000', padding: '16px 24px', background: '#FCFBFA', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, flex: 1 }}>
              <span style={{ fontSize: '24px', flexShrink: 0 }}>🎯</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: '950', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={`XEM TRƯỚC GIẢ LẬP: ${selectedExam.title}`}>XEM TRƯỚC GIẢ LẬP: {selectedExam.title}</h3>
                <span style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Bạn đang trải nghiệm giao diện thi thử thực tế của học sinh</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
              <button
                onClick={() => setShowPreviewDrawer(false)}
                className="admin-back-btn"
                style={{ border: '2px solid #000', background: '#EF4444', color: '#FFF', padding: '8px 18px', fontWeight: '950', cursor: 'pointer', boxShadow: 'none' }}
              >
                Thoát xem trước
              </button>
            </div>
          </div>

          {/* Simulator Body */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            
            {/* Left Column: Question Map */}
            <div style={{ width: '280px', borderRight: '3.5px solid #000', background: '#FCFBFA', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: '900', textTransform: 'uppercase', margin: 0, paddingBottom: '8px', borderBottom: '2px solid #000' }}>
                Bản đồ câu hỏi
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                {selectedExam.questions?.map((q, idx) => {
                  const isAnswered = !!selectedAnswers[q.id];
                  const isCurrent = currentQuestionIdx === idx;
                  const isCorrect = selectedAnswers[q.id]?.toUpperCase() === q.correctAnswer?.toUpperCase();

                  let btnBg = '#FFF';
                  let btnColor = '#000';
                  let btnBorder = '2px solid #000';

                  if (submittedSimulator) {
                    if (isAnswered) {
                      btnBg = isCorrect ? '#D1FAE5' : '#FEE2E2';
                      btnColor = isCorrect ? '#065F46' : '#991B1B';
                      btnBorder = isCorrect ? '2px solid #10B981' : '2px solid #EF4444';
                    } else {
                      btnBg = '#F3F4F6';
                      btnColor = '#9CA3AF';
                      btnBorder = '2px solid #D1D5DB';
                    }
                  } else {
                    if (isCurrent) {
                      btnBg = '#6C5CE7';
                      btnColor = '#FFF';
                      btnBorder = '2px solid #000';
                    } else if (isAnswered) {
                      btnBg = '#E0F2FE';
                      btnColor = '#0369A1';
                      btnBorder = '2px solid #0284C7';
                    }
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIdx(idx)}
                      style={{
                        background: btnBg,
                        color: btnColor,
                        border: btnBorder,
                        borderRadius: '6px',
                        height: '38px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '900',
                        fontSize: '13px',
                        cursor: 'pointer',
                        boxShadow: isCurrent && !submittedSimulator ? 'none' : '1px 1px 0px #000'
                      }}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Simulator Metrics Legend */}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '2px solid #DDD', paddingTop: '16px', fontSize: '12px', fontWeight: 'bold' }}>
                {!submittedSimulator ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '14px', height: '14px', background: '#6C5CE7', border: '1.5px solid #000', borderRadius: '3px' }}></span>
                      <span>Đang chọn xem</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '14px', height: '14px', background: '#E0F2FE', border: '1.5px solid #0284C7', borderRadius: '3px' }}></span>
                      <span>Đã chọn đáp án</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '14px', height: '14px', background: '#FFF', border: '1.5px solid #000', borderRadius: '3px' }}></span>
                      <span>Chưa trả lời</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '14px', height: '14px', background: '#D1FAE5', border: '1.5px solid #10B981', borderRadius: '3px' }}></span>
                      <span>Trả lời Đúng</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '14px', height: '14px', background: '#FEE2E2', border: '1.5px solid #EF4444', borderRadius: '3px' }}></span>
                      <span>Trả lời Sai</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Active Question Workspace */}
            <div style={{ flex: 1, padding: '24px 30px', overflowY: 'auto', background: '#FFF', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {submittedSimulator ? (
                /* Results summary card inside preview screen */
                <div className="admin-card" style={{ border: '3px solid #000', boxShadow: '4px 4px 0px #000', padding: '24px', background: '#EEF2FF', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: '950', color: '#4F46E5', margin: 0 }}>KẾT QUẢ THI GIẢ LẬP</h2>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '12px' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#666' }}>Số câu đúng</div>
                      <div style={{ fontSize: '28px', fontWeight: '950', color: '#10B981' }}>
                        {selectedExam.questions?.filter(q => selectedAnswers[q.id]?.toUpperCase() === q.correctAnswer?.toUpperCase()).length} / {selectedExam.questions?.length || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#666' }}>Điểm số giả lập</div>
                      <div style={{ fontSize: '28px', fontWeight: '950', color: '#4F46E5' }}>
                        {((selectedExam.questions?.filter(q => selectedAnswers[q.id]?.toUpperCase() === q.correctAnswer?.toUpperCase()).length / (selectedExam.questions?.length || 1)) * 10).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#666' }}>Thời gian làm</div>
                      <div style={{ fontSize: '28px', fontWeight: '950', color: '#1E1B4B' }}>{formatTime(elapsedTime)}</div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Question Box */}
              {(() => {
                const q = selectedExam.questions[currentQuestionIdx];
                if (!q) return null;

                const selectedOption = selectedAnswers[q.id];
                const isCorrectOptionSelected = selectedOption?.toUpperCase() === q.correctAnswer?.toUpperCase();
                
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2.5px solid #000', paddingBottom: '10px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '900' }}>Câu số {currentQuestionIdx + 1} / {selectedExam.questions?.length || 0}</span>
                      <span style={{ fontSize: '12px', background: '#FCFBFA', border: '1.5px solid #000', padding: '4px 10px', borderRadius: '4px', fontWeight: '800' }}>
                        Môn {selectedExam.subject} • Khối {selectedExam.grade || '12'}
                      </span>
                    </div>

                    <div style={{ fontSize: '15px', fontWeight: '900', color: '#000', lineHeight: 1.6 }}>
                      {q.content}
                    </div>

                    {q.imageUrl && (
                      <div style={{ border: '2.5px solid #000', borderRadius: '8px', overflow: 'hidden', maxWidth: '400px', margin: '8px 0' }}>
                        <img src={q.imageUrl} alt="Minh họa" style={{ width: '100%', objectFit: 'contain' }} />
                      </div>
                    )}

                    {/* Options list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                      {getNormalizedOptions(q).map((opt) => {
                        const optionLetter = opt.key;
                        const text = opt.text;
                        const isSelected = selectedOption === optionLetter;
                        const isTrueCorrect = optionLetter === q.correctAnswer?.toUpperCase();

                        let optBorder = '2.5px solid #000';
                        let optBg = '#FFF';
                        let optColor = '#000';

                        if (isSelected) {
                          if (isTrueCorrect) {
                            optBg = '#D1FAE5';
                            optBorder = '2.5px solid #10B981';
                            optColor = '#065F46';
                          } else {
                            optBg = '#FEE2E2';
                            optBorder = '2.5px solid #EF4444';
                            optColor = '#991B1B';
                          }
                        } else if (isTrueCorrect) {
                          optBg = '#F0FDF4';
                          optBorder = '2.5px dashed #10B981';
                          optColor = '#15803D';
                        }

                        return (
                          <div
                            key={opt.key}
                            onClick={() => {
                              if (submittedSimulator) return;
                              setSelectedAnswers(prev => ({
                                ...prev,
                                [q.id]: optionLetter
                              }));
                            }}
                            style={{
                              padding: '12px 18px',
                              border: optBorder,
                              background: optBg,
                              color: optColor,
                              borderRadius: '8px',
                              cursor: submittedSimulator ? 'default' : 'pointer',
                              fontWeight: '800',
                              fontSize: '13.5px',
                              display: 'flex',
                              gap: '10px',
                              boxShadow: isSelected ? 'none' : '2px 2px 0px #000',
                              transition: 'all 0.15s'
                            }}
                          >
                            <strong>{optionLetter}.</strong> <span>{text}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Admin Review Info: Correct Answer & Explanation */}
                    <div 
                      className="admin-card animate-slide-up"
                      style={{ border: '2.5px solid #000', borderRadius: '8px', padding: '16px', background: '#F0FDF4', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', fontWeight: '950', color: '#16A34A' }}>
                        <span>🌟 ĐÁP ÁN ĐÚNG: {q.correctAnswer?.toUpperCase()}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', color: '#374151', fontWeight: '700', lineHeight: 1.5 }}>
                        <strong>Giải thích:</strong> {q.explanation || 'Không có giải thích đi kèm câu hỏi này.'}
                      </p>
                    </div>

                    {/* Navigation Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', borderTop: '2.5px solid #000', paddingTop: '16px' }}>
                      <button
                        disabled={currentQuestionIdx === 0}
                        onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                        className="admin-back-btn"
                        style={{ border: '2px solid #000', padding: '8px 18px', fontWeight: '950', background: currentQuestionIdx === 0 ? '#F3F4F6' : '#FFF', cursor: currentQuestionIdx === 0 ? 'not-allowed' : 'pointer', boxShadow: currentQuestionIdx === 0 ? 'none' : '2px 2px 0px #000' }}
                      >
                        Câu trước
                      </button>
                      <button
                        disabled={currentQuestionIdx === selectedExam.questions.length - 1}
                        onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                        className="admin-back-btn"
                        style={{ border: '2px solid #000', padding: '8px 18px', fontWeight: '950', background: currentQuestionIdx === selectedExam.questions.length - 1 ? '#F3F4F6' : '#FFF', cursor: currentQuestionIdx === selectedExam.questions.length - 1 ? 'not-allowed' : 'pointer', boxShadow: currentQuestionIdx === selectedExam.questions.length - 1 ? 'none' : '2px 2px 0px #000' }}
                      >
                        Câu tiếp theo
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: REJECT EXAM WITH REASON
          ========================================== */}
      {rejectModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="admin-card" style={{ width: '450px', border: '3px solid #000', boxShadow: '6px 6px 0px #000', padding: '24px', background: '#FFF', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '950', margin: 0, color: '#EF4444' }}>✖ TỪ CHỐI PHÊ DUYỆT ĐỀ THI</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '900', color: '#555' }}>Lý do từ chối (bắt buộc):</label>
              <textarea
                rows={4}
                className="admin-input"
                placeholder="Nhập lý do từ chối rõ ràng gửi cho Giáo viên để chỉnh sửa (ví dụ: Sai kiến thức câu 5, đề thiếu hình vẽ...)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{ border: '2px solid #000', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 'bold', width: '100%', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', justifySelf: 'flex-end', gap: '12px', marginTop: '4px' }}>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="admin-back-btn"
                style={{ border: '2px solid #000', background: '#FFF', color: '#000', padding: '8px 16px', fontWeight: '800', cursor: 'pointer' }}
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={actionLoading}
                className="admin-back-btn"
                style={{ border: '2px solid #000', background: '#EF4444', color: '#FFF', padding: '8px 16px', fontWeight: '900', cursor: 'pointer' }}
              >
                {actionLoading ? 'Đang gửi...' : 'Từ chối duyệt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: HIDE EXAM WITH REASON
          ========================================== */}
      {hideModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="admin-card" style={{ width: '450px', border: '3px solid #000', boxShadow: '6px 6px 0px #000', padding: '24px', background: '#FFF', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '950', margin: 0, color: '#374151' }}>👁️‍Q HẠ HẨN ĐỀ THI</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '900', color: '#555' }}>Lý do ẩn đề (không bắt buộc):</label>
              <textarea
                rows={4}
                className="admin-input"
                placeholder="Nhập lý do ẩn đề thi thử khỏi học viên..."
                value={hideReason}
                onChange={(e) => setHideReason(e.target.value)}
                style={{ border: '2px solid #000', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 'bold', width: '100%', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', justifySelf: 'flex-end', gap: '12px', marginTop: '4px' }}>
              <button
                onClick={() => setHideModalOpen(false)}
                className="admin-back-btn"
                style={{ border: '2px solid #000', background: '#FFF', color: '#000', padding: '8px 16px', fontWeight: '800', cursor: 'pointer' }}
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleHideSubmit}
                disabled={actionLoading}
                className="admin-back-btn"
                style={{ border: '2px solid #000', background: '#374151', color: '#FFF', padding: '8px 16px', fontWeight: '900', cursor: 'pointer' }}
              >
                {actionLoading ? 'Đang thực hiện...' : 'Ẩn đề thi'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
