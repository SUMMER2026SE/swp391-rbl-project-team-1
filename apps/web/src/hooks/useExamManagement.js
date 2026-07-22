import { useState, useEffect } from 'react';
import { api } from '../api';

export function useExamManagement() {
  const [activeTab, setActiveTab] = useState('exams');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Stats State
  const [stats, setStats] = useState(null);

  // Exams State
  const [exams, setExams] = useState([]);
  const [examsPagination, setExamsPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [examsFilters, setExamsFilters] = useState({ search: '', subject: '', status: '' });

  // Questions State
  const [questions, setQuestions] = useState([]);
  const [questionsPagination, setQuestionsPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [questionsFilters, setQuestionsFilters] = useState({ search: '', subject: '', difficulty: '', ownerOnly: false });

  // Import State
  const [importSessions, setImportSessions] = useState([]);
  const [activeImportSession, setActiveImportSession] = useState(null);
  const [importDecisions, setImportDecisions] = useState({}); // { [importQuestionId]: 'CREATE_NEW' | 'REUSE' }

  // Reports State
  const [reports, setReports] = useState([]);

  // Exam Wizard State
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [examFormData, setExamFormData] = useState({
    title: '',
    subject: 'Toán học',
    duration: 90,
    grade: 12,
    description: '',
    creationMethod: 'MANUAL',
    questionIds: [],
    aiConfig: { topic: '', easyCount: 5, mediumCount: 5, hardCount: 5 }
  });

  // Edit / Preview State
  const [editingExamId, setEditingExamId] = useState(null);

  // Initial & Background Loading State
  const [initialLoading, setInitialLoading] = useState(true);

  // --- FETCH DATA ACTIONS ---
  const fetchStats = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const res = await api.getTeacherExamStats();
      setStats(res);
    } catch (err) {
      setError(err.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchExams = async (page = 1, showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const res = await api.getTeacherExams({ ...examsFilters, page });
      const examList = Array.isArray(res) ? res : (res?.exams || res?.data || []);
      const pagination = res?.pagination || { page, limit: 10, total: examList.length };
      setExams(examList);
      setExamsPagination(pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchQuestions = async (page = 1, showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const res = await api.getTeacherQuestions({ ...questionsFilters, page });
      const qList = Array.isArray(res) ? res : (res?.questions || res?.data || []);
      const pagination = res?.pagination || { page, limit: 10, total: qList.length };
      setQuestions(qList);
      setQuestionsPagination(pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchImportSessions = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const res = await api.getImportSessions();
      setImportSessions(res || []);
    } catch (err) {
      setError(err.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchImportSessionDetail = async (id, showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      let res;
      try {
        res = await api.getImportSessionByIdV3(id);
      } catch (e) {
        res = await api.getImportSessionById(id);
      }
      setActiveImportSession(res);

      const initialDecisions = {};
      res.questions?.forEach(q => {
        initialDecisions[q.id] = 'CREATE_NEW';
      });
      setImportDecisions(initialDecisions);
    } catch (err) {
      setError(err.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchReports = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const res = await api.getTeacherReports();
      setReports(res || []);
    } catch (err) {
      setError(err.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // --- ACTIONS ---
  const handleCreateExam = async () => {
    try {
      setLoading(true);
      await api.createTeacherExam(examFormData);
      setShowWizard(false);
      fetchExams(1);
      fetchStats();
      resetExamForm();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExam = async (id) => {
    try {
      setLoading(true);
      await api.updateTeacherExam(id, examFormData);
      setEditingExamId(null);
      fetchExams(examsPagination.page);
      resetExamForm();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloneExam = async (id) => {
    try {
      setLoading(true);
      await api.cloneTeacherExam(id);
      fetchExams(1);
      fetchStats();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đề thi này khỏi hệ thống?')) return;
    try {
      setLoading(true);
      await api.deleteTeacherExam(id);
      fetchExams(1);
      fetchStats();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = async (file) => {
    try {
      setLoading(true);
      await api.uploadImportDocument(file);
      alert('Tài liệu đã được tải lên thành công. AI đang thực hiện phân tích và nhận diện câu hỏi.');
      fetchImportSessions();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async (sessionId) => {
    try {
      setLoading(true);
      const decisionsList = Object.entries(importDecisions).map(([importQuestionId, action]) => ({
        importQuestionId: Number(importQuestionId),
        action
      }));
      await api.confirmImportSession(sessionId, decisionsList);
      setActiveImportSession(null);
      await fetchImportSessions(false);
      await fetchExams(1);
      await fetchQuestions(1);
      await fetchStats();
      window.dispatchEvent(new CustomEvent('refresh-import-sessions', { detail: { showLoading: false } }));
      setActiveTab('exams');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateImportQuestion = async (id, updatedQuestion) => {
    try {
      setLoading(true);
      await api.updateImportQuestion(id, updatedQuestion);
      if (activeImportSession) {
        const updatedQuestions = activeImportSession.questions.map(q => 
          q.id === id ? { ...q, ...updatedQuestion } : q
        );
        setActiveImportSession({ ...activeImportSession, questions: updatedQuestions });
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImportSession = async (sessionId) => {
    try {
      setLoading(true);
      await api.deleteImportSession(sessionId);
      setActiveImportSession(null);
      await fetchImportSessions();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (reportId, status) => {
    try {
      setLoading(true);
      await api.resolveTeacherReport(reportId, status);
      fetchReports();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetExamForm = () => {
    setExamFormData({
      title: '',
      subject: 'Toán học',
      duration: 90,
      grade: 12,
      description: '',
      creationMethod: 'MANUAL',
      questionIds: [],
      aiConfig: { topic: '', easyCount: 5, mediumCount: 5, hardCount: 5 }
    });
    setWizardStep(1);
  };

  // Listen for refresh import sessions event
  useEffect(() => {
    const handleRefresh = (e) => {
      const showLoading = e?.detail?.showLoading ?? false;
      fetchImportSessions(showLoading);
      fetchExams(1, showLoading);
      fetchStats(showLoading);
    };
    window.addEventListener('refresh-import-sessions', handleRefresh);
    return () => window.removeEventListener('refresh-import-sessions', handleRefresh);
  }, []);

  // Initial Data Fetch
  useEffect(() => {
    Promise.all([
      fetchStats(false),
      fetchExams(1, false),
      fetchImportSessions(false),
      fetchQuestions(1, false),
      fetchReports(false)
    ]).finally(() => {
      setInitialLoading(false);
    });
  }, []);

  // Sync tab data triggers across all sections on filter change
  useEffect(() => {
    fetchExams(1, false);
    if (activeTab === 'questions') fetchQuestions(1, false);
    if (activeTab === 'reports') fetchReports(false);
  }, [activeTab, examsFilters, questionsFilters]);


  return {
    activeTab,
    setActiveTab,
    loading,
    initialLoading,
    error,
    stats,
    exams,
    examsPagination,
    examsFilters,
    setExamsFilters,
    fetchExams,
    questions,
    questionsPagination,
    questionsFilters,
    setQuestionsFilters,
    fetchQuestions,
    importSessions,
    activeImportSession,
    setActiveImportSession,
    importDecisions,
    setImportDecisions,
    fetchImportSessionDetail,
    handleUploadDocument,
    handleConfirmImport,
    handleUpdateImportQuestion,
    handleDeleteImportSession,
    reports,
    handleResolveReport,
    // Wizard
    showWizard,
    setShowWizard,
    wizardStep,
    setWizardStep,
    examFormData,
    setExamFormData,
    resetExamForm,
    handleCreateExam,
    // Actions
    editingExamId,
    setEditingExamId,
    handleUpdateExam,
    handleCloneExam,
    handleDeleteExam,
    fetchStats
  };
}
