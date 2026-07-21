import React, { useState } from 'react';
import { 
  HiTerminal, 
  HiCode, 
  HiRefresh, 
  HiX, 
  HiClipboardCopy, 
  HiCheck 
} from 'react-icons/hi';

export default function PipelineDebugPanel({
  isOpen,
  onClose,
  sessionData,
  onRerunStage,
  loading = false
}) {
  const [activeTab, setActiveTab] = useState('candidates');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const media = sessionData?.media || {};
  const artifacts = media.pipelineArtifacts || {};
  const logs = sessionData?.logs || [];
  const questions = sessionData?.questions || [];

  const tabs = [
    { id: 'candidates', label: 'Question Candidates (Mới)', data: artifacts.questionCandidates || { info: 'Các ứng viên câu hỏi gom sẵn trước Gemini' } },
    { id: 'mineru', label: 'MinerU JSON', data: artifacts.mineruJson || { info: 'Dữ liệu thô từ MinerU Service' } },
    { id: 'examDoc', label: 'ExamDocument', data: artifacts.examDocument || { info: 'Cấu trúc khối chuẩn hóa' } },
    { id: 'segments', label: 'Segments', data: artifacts.segments || { info: 'Phân đoạn đề thi' } },
    { id: 'gemini', label: 'Gemini Response', data: artifacts.geminiRawResponse || { info: 'Dữ liệu JSON thô từ Gemini API' } },
    { id: 'graph', label: 'QuestionGraph', data: artifacts.questionGraph || questions.map(q => ({ id: q.id, order: q.questionOrder, blocks: q.regions })) },
    { id: 'preview', label: 'QuestionEntity Preview', data: questions.map(q => ({ content: q.content, type: q.type, section: q.section, optionsCount: q.options?.length || 0 })) },
    { id: 'logs', label: 'Execution Logs', data: logs }
  ];

  const currentTabData = tabs.find(t => t.id === activeTab)?.data;

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(currentTabData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl flex flex-col shadow-2xl overflow-hidden font-mono text-slate-100">
        
        {/* Header Bar */}
        <div className="h-16 px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HiTerminal className="w-6 h-6 text-indigo-400" />
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                Pipeline Debugger & Intermediate Artifacts Viewer
              </h3>
              <span className="text-[11px] text-slate-400 font-sans">
                Phiên: #{sessionData?.id} | {sessionData?.fileName}
              </span>
            </div>
          </div>

          {/* Re-run Stage Buttons */}
          <div className="flex items-center gap-2">
            <button
              disabled={loading}
              onClick={() => onRerunStage('normalizer')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1 transition"
              title="Chạy lại bước Document Normalizer"
            >
              <HiRefresh className="w-3.5 h-3.5" /> Re-run Normalizer
            </button>

            <button
              disabled={loading}
              onClick={() => onRerunStage('candidates')}
              className="px-3 py-1.5 bg-indigo-900 hover:bg-indigo-800 text-indigo-200 text-xs font-bold rounded-lg border border-indigo-700 flex items-center gap-1 transition"
              title="Chạy lại bước Candidate Builder"
            >
              <HiRefresh className="w-3.5 h-3.5" /> Re-run Candidates
            </button>

            <button
              disabled={loading}
              onClick={() => onRerunStage('gemini')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1 transition"
              title="Chạy lại AI Gemini Classifier"
            >
              <HiRefresh className="w-3.5 h-3.5" /> Re-run Gemini Classifier
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition ml-2"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-950 border-b border-slate-800 text-xs overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* JSON Content Display Body */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-950 relative">
          <button
            onClick={handleCopyJSON}
            className="absolute top-6 right-6 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1 shadow z-10"
          >
            {copied ? <HiCheck className="w-4 h-4 text-emerald-400" /> : <HiClipboardCopy className="w-4 h-4" />}
            {copied ? 'Đã sao chép' : 'Sao chép JSON'}
          </button>

          <pre className="text-xs text-emerald-400 font-mono leading-relaxed select-text">
            {JSON.stringify(currentTabData, null, 2)}
          </pre>
        </div>

      </div>
    </div>
  );
}
