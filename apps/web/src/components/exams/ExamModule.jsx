import React from 'react';
import { useExamManagement } from '../../hooks/useExamManagement';
import { HeaderStats } from './HeaderStats';
import { QuickActions } from './QuickActions';
import { ExamsTab } from './ExamsTab';
import { QuestionsTab } from './QuestionsTab';
import { ImportsTab } from './ImportsTab';
import { ReportsTab } from './ReportsTab';
import { StatsTab } from './StatsTab';
import { CreateExamWizard } from './CreateExamWizard';
import '../../styles/teacherExams.css';

export default function ExamModule({ currentUser }) {
  const {
    activeTab,
    setActiveTab,
    loading,
    initialLoading,
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
    editingExamId,
    setEditingExamId,
    handleCloneExam,
    handleDeleteExam,
    fetchStats
  } = useExamManagement();

  return (
    <div className="exams-module-wrapper">
      {/* Upper Metrics Header */}
      <HeaderStats stats={stats} />

      {/* Main Tabs Navigation */}
      <div className="saas-tabs-container">
        <button 
          className={`saas-tab-btn ${activeTab === 'exams' ? 'active' : ''}`}
          onClick={() => setActiveTab('exams')}
        >
          Đề thi
        </button>
        <button 
          className={`saas-tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          Ngân hàng câu hỏi
        </button>
        <button 
          className={`saas-tab-btn ${activeTab === 'imports' ? 'active' : ''}`}
          onClick={() => setActiveTab('imports')}
        >
          Nhập đề thi
        </button>
        <button 
          className={`saas-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Báo cáo lỗi câu hỏi
        </button>
      </div>

      {/* Active Tab Content Area */}
      <div style={{ minHeight: '380px', position: 'relative' }}>
        {initialLoading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b', fontSize: '14px', fontWeight: 600 }}>
            ⏳ Đang tải dữ liệu từ hệ thống...
          </div>
        ) : (
          <>
            {activeTab === 'exams' && (
              <ExamsTab 
                exams={exams}
                pagination={examsPagination}
                filters={examsFilters}
                setFilters={setExamsFilters}
                onPageChange={fetchExams}
                onCreateClick={() => {
                  setEditingExamId(null);
                  setShowWizard(true);
                }}
                onEditClick={(id) => {
                  setEditingExamId(id);
                  setShowWizard(true);
                }}
                onCloneClick={handleCloneExam}
                onDeleteClick={handleDeleteExam}
              />
            )}

            {activeTab === 'questions' && (
              <QuestionsTab 
                questions={questions}
                pagination={questionsPagination}
                filters={questionsFilters}
                setFilters={setQuestionsFilters}
                onPageChange={fetchQuestions}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'imports' && (
              <ImportsTab 
                sessions={importSessions}
                activeSession={activeImportSession}
                decisions={importDecisions}
                setDecisions={setImportDecisions}
                onUpload={handleUploadDocument}
                onConfirm={handleConfirmImport}
                onUpdateQuestion={handleUpdateImportQuestion}
                onDeleteSession={handleDeleteImportSession}
                onViewDetail={fetchImportSessionDetail}
                onCloseDetail={() => setActiveImportSession(null)}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsTab 
                reports={reports}
                onResolve={handleResolveReport}
              />
            )}
          </>
        )}
      </div>

      {/* Create / Edit Wizard Modal */}
      {showWizard && (
        <CreateExamWizard 
          editingExamId={editingExamId}
          onClose={() => setShowWizard(false)}
          onSubmit={() => {
            setShowWizard(false);
            fetchExams(1);
            fetchStats();
          }}
        />
      )}
    </div>
  );
}
