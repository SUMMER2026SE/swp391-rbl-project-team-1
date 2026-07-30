import React from 'react';
import { HiViewGrid, HiExclamation, HiCheckCircle } from 'react-icons/hi';

export default function TopicBreakdown({ subjects, selectedSubjectId }) {
  const targetSubjects = selectedSubjectId
    ? subjects.filter(s => s.id === selectedSubjectId)
    : subjects;

  return (
    <div style={{
      background: 'var(--bg-card, #ffffff)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      boxShadow: 'var(--shadow-sm)',
      height: '100%'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiViewGrid style={{ color: 'var(--exams-blue)' }} /> CHI TIẾT THEO TỪNG CHỦ ĐỀ KIẾN THỨC
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Phân tích tỷ lệ đúng, số lượng câu hỏi và đánh giá mức độ thành thạo
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {targetSubjects.map((subj) => (
          <div key={subj.id} style={{ background: 'var(--bg-main, #f8fafc)', borderRadius: '12px', padding: '16px 18px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '20px' }}>{subj.icon}</span>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: subj.color }}>
                {subj.name} ({subj.topics.length} chủ đề)
              </h4>
            </div>

            {subj.topics.length === 0 ? (
              <div style={{
                background: 'var(--bg-card, #ffffff)',
                border: '1px dashed var(--border)',
                borderRadius: '10px',
                padding: '16px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: '600'
              }}>
                Chưa có dữ liệu bài làm cho môn {subj.name}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                {subj.topics.map((t) => {
                  let badgeBg = 'rgba(0, 184, 148, 0.12)';
                  let badgeColor = 'var(--exams-green, #00b894)';
                  let badgeText = 'Thành thạo';
                  let BadgeIcon = HiCheckCircle;

                  if (t.status === 'weak') {
                    badgeBg = 'rgba(214, 48, 49, 0.12)';
                    badgeColor = 'var(--exams-red, #d63031)';
                    badgeText = 'Cần luyện gấp';
                    BadgeIcon = HiExclamation;
                  } else if (t.status === 'warning') {
                    badgeBg = 'rgba(253, 203, 110, 0.2)';
                    badgeColor = '#d63031';
                    badgeText = 'Chú ý';
                    BadgeIcon = HiExclamation;
                  }

                  return (
                    <div
                      key={t.id}
                      style={{
                        background: 'var(--bg-card, #ffffff)',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                        <h5 style={{ margin: 0, fontSize: '13.5px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                          {t.name}
                        </h5>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '800',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: badgeBg,
                          color: badgeColor,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          flexShrink: 0
                        }}>
                          <BadgeIcon /> {badgeText}
                        </span>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{t.solved} câu ({t.mistakes} lỗi)</span>
                          <span style={{ color: badgeColor }}>{t.correctPct}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${t.correctPct}%`,
                              height: '100%',
                              background: badgeColor,
                              borderRadius: '3px'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
