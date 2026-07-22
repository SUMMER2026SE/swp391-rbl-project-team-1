import React, { useState, useEffect } from 'react';
import { MOCK_ANALYTICS_DATA } from '../../../mock/mockAnalyticsData';
import { fetchRealAnalyticsData } from '../../../services/analyticsService';
import LearningFilters from './LearningFilters';
import OverviewCards from './OverviewCards';
import SubjectPerformance from './SubjectPerformance';
import TopicBreakdown from './TopicBreakdown';
import WeakKnowledgeCard from './WeakKnowledgeCard';
import AiCoachCard from './AiCoachCard';
import GenerateExamCard from './GenerateExamCard';
import LearningTrendChart from './LearningTrendChart';
import StudyHeatmap from './StudyHeatmap';
import RadarSkillChart from './RadarSkillChart';
import RecentInsights from './RecentInsights';
import { HiCheckCircle, HiDatabase, HiRefresh } from 'react-icons/hi';

export default function AnalyticsTab({ navigateTo, currentUser }) {
  const [filters, setFilters] = useState({
    subject: 'math',
    timeRange: '30d',
    source: 'all'
  });

  const [analyticsData, setAnalyticsData] = useState(MOCK_ANALYTICS_DATA);
  const [loading, setLoading] = useState(true);
  const [isRealDb, setIsRealDb] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [externalPracticeConfig, setExternalPracticeConfig] = useState(null);

  const getExamIdForSubject = (subjName) => {
    const s = (subjName || '').toLowerCase();
    if (s.includes('vật') || s.includes('ly') || s.includes('phys')) return '214';
    if (s.includes('hóa') || s.includes('chem')) return '213';
    if (s.includes('anh') || s.includes('eng')) return '212';
    return '211';
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchRealAnalyticsData(currentUser);
      if (res) {
        setAnalyticsData(res);
        setIsRealDb(res.isRealData);
      }
    } catch (e) {
      console.error('Error loading analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const subjectsList = analyticsData.subjects || MOCK_ANALYTICS_DATA.subjects;
  const filteredSubjects = subjectsList ? (filters.subject === 'all' ? subjectsList : subjectsList.filter(s => s.id === filters.subject)) : [];

  return (
    <div className="analytics-tab-wrapper animate-in" style={{ paddingBottom: '40px' }}>
      {/* Real DB Status Bar */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0, 184, 148, 0.08) 0%, rgba(9, 132, 227, 0.08) 100%)',
        border: '1px solid rgba(0, 184, 148, 0.25)',
        borderRadius: '12px',
        padding: '10px 16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>
          <HiDatabase style={{ color: 'var(--exams-green)', fontSize: '18px' }} />
          <span>Hệ thống phân tích AI:</span>
          <span style={{ color: isRealDb ? 'var(--exams-green)' : 'var(--exams-purple)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <HiCheckCircle /> {isRealDb ? `Số bài thi đã nộp: ${analyticsData.attemptsCount || 0}` : 'Đang đồng bộ dữ liệu thời gian thực từ CSDL'}
          </span>
        </div>

        <button
          onClick={loadData}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            padding: '4px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <HiRefresh style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Làm mới dữ liệu
        </button>
      </div>

      {/* SECTION 2: Overview Cards */}
      <OverviewCards
        data={{
          ...(analyticsData.overview || MOCK_ANALYTICS_DATA.overview),
          attemptsCount: analyticsData.attemptsCount || 0
        }}
      />

      {/* SECTIONS 8 & 10: Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        marginBottom: '28px'
      }}>
        {/* SECTION 8: Learning Trend Line/Area Chart */}
        <LearningTrendChart
          trendData={analyticsData.learningTrend || MOCK_ANALYTICS_DATA.learningTrend}
        />

        {/* SECTION 10: Radar Skill Chart */}
        <RadarSkillChart
          skillData={analyticsData.radarSkills || MOCK_ANALYTICS_DATA.radarSkills}
        />
      </div>

      {/* SECTION 1: Learning Filters (Moved right above Subject Performance) */}
      <LearningFilters
        filters={filters}
        onFilterChange={setFilters}
      />

      {/* ROW 1: 2-Column Grid (Left: Năng lực môn học, Right: Chi tiết chủ đề) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        alignItems: 'stretch',
        marginBottom: '28px'
      }}>
        {/* Left Column: Năng lực theo môn học */}
        <SubjectPerformance
          subjects={filteredSubjects}
          selectedSubjectId={selectedSubjectId}
          onSelectSubject={setSelectedSubjectId}
        />

        {/* Right Column: Chi tiết theo từng chủ đề kiến thức */}
        <TopicBreakdown
          subjects={filteredSubjects}
          selectedSubjectId={selectedSubjectId}
        />
      </div>

      {/* ROW 2: 2-Column Grid (Left: Tạo đề luyện tập, Right: Study Heatmap) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        alignItems: 'stretch',
        marginBottom: '28px'
      }}>
        {/* Left Column: Tạo đề luyện tập theo yêu cầu */}
        <GenerateExamCard
          externalConfig={externalPracticeConfig}
          onGenerate={(config) => {
            if (navigateTo) {
              const targetId = getExamIdForSubject(config.subject);
              navigateTo(`/mock-exams/${targetId}/start`, { practiceConfig: config });
            }
          }}
        />

        {/* Right Column: Tần suất học tập (Study Heatmap) */}
        <StudyHeatmap
          heatmapData={analyticsData.heatmapData || MOCK_ANALYTICS_DATA.heatmapData}
        />
      </div>

      {/* SECTION 5: Weak Knowledge Detection */}
      <WeakKnowledgeCard
        weakKnowledgeList={analyticsData.weakKnowledgeList || MOCK_ANALYTICS_DATA.weakKnowledgeList}
        onStartPractice={(item) => {
          if (navigateTo) {
            const targetId = getExamIdForSubject(item.subject);
            navigateTo(`/mock-exams/${targetId}/start`, { targetTopic: item, questionCount: 20 });
          }
        }}
      />

      {/* SECTION 6: AI Coach */}
      <AiCoachCard
        insights={analyticsData.aiCoachInsights || MOCK_ANALYTICS_DATA.aiCoachInsights}
      />
    </div>
  );
}
