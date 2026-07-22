import React from 'react';
import { 
  HiAcademicCap, 
  HiCheckCircle, 
  HiClipboardCheck, 
  HiClock, 
  HiFire, 
  HiSparkles,
  HiTrendingUp,
  HiDocumentText
} from 'react-icons/hi';

export default function OverviewCards({ data }) {
  const cards = [
    {
      id: 'attempts',
      label: 'Số bài thi đã nộp',
      value: `${data.attemptsCount || 0} bài thi`,
      subText: 'Đã hoàn thành và lưu CSDL',
      icon: HiDocumentText,
      color: '#6c5ce7',
      bg: 'rgba(108, 92, 231, 0.1)'
    },
    {
      id: 'predicted',
      label: 'Dự đoán điểm THPT',
      value: `${data.predictedScore} / 10`,
      subText: `${data.scoreChange} so với tuần trước`,
      icon: HiAcademicCap,
      color: '#6c5ce7',
      bg: 'rgba(108, 92, 231, 0.1)'
    },
    {
      id: 'accuracy',
      label: 'Tỷ lệ làm đúng',
      value: `${data.accuracy}%`,
      subText: `${data.accuracyChange} tỷ lệ làm bài`,
      icon: HiCheckCircle,
      color: '#00b894',
      bg: 'rgba(0, 184, 148, 0.1)'
    },
    {
      id: 'solved',
      label: 'Tổng câu hỏi đã giải',
      value: `${data.solvedQuestions.toLocaleString('vi-VN')} câu`,
      subText: data.solvedChange,
      icon: HiClipboardCheck,
      color: '#0984e3',
      bg: 'rgba(9, 132, 227, 0.1)'
    },
    {
      id: 'avgTime',
      label: 'Thời gian trung bình / câu',
      value: data.avgTimePerQuestion,
      subText: data.timeChange,
      icon: HiClock,
      color: '#e17055',
      bg: 'rgba(225, 112, 85, 0.1)'
    },
    {
      id: 'streak',
      label: 'Chuỗi học tập (Streak)',
      value: `${data.streakDays} ngày`,
      subText: 'Đang duy trì phong độ!',
      icon: HiFire,
      color: '#fdcb6e',
      bg: 'rgba(253, 203, 110, 0.15)'
    },
    {
      id: 'hours',
      label: 'Tổng giờ học tập',
      value: `${data.totalStudyHours} giờ`,
      subText: data.weeklyStudyHours,
      icon: HiSparkles,
      color: '#a29bfe',
      bg: 'rgba(162, 155, 254, 0.12)'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
      gap: '16px',
      marginBottom: '28px'
    }}>
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            style={{
              background: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '18px 20px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                {card.label}
              </span>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: card.bg,
                color: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                flexShrink: 0
              }}>
                <IconComponent />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: '6px' }}>
                {card.value}
              </div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: card.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <HiTrendingUp /> {card.subText}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
