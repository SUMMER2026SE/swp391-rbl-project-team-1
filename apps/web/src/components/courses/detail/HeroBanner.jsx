import React, { useState } from 'react';
import { HiStar, HiBookOpen } from 'react-icons/hi';

const getSubjectStyle = (subj) => {
  const s = (subj || '').toLowerCase();
  if (s.includes('toán')) {
    return {
      bgGrad: 'linear-gradient(135deg, #EEF2FF 0%, #D2DEFF 100%)',
      bg: '#EEF2FF',
      border: '#C7D2FE',
      text: '#1E1B4B',
      accent: '#4F46E5',
      accentBg: '#E0E7FF'
    };
  }
  if (s.includes('lý') || s.includes('vật lý') || s.includes('địa lý')) {
    return {
      bgGrad: 'linear-gradient(135deg, #ECFDF5 0%, #C6F6D5 100%)',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      text: '#064E3B',
      accent: '#059669',
      accentBg: '#D1FAE5'
    };
  }
  if (s.includes('anh') || s.includes('tiếng anh')) {
    return {
      bgGrad: 'linear-gradient(135deg, #FFF7ED 0%, #FFE4C4 100%)',
      bg: '#FFF7ED',
      border: '#FED7AA',
      text: '#7C2D12',
      accent: '#EA580C',
      accentBg: '#FFEDD5'
    };
  }
  if (s.includes('hóa')) {
    return {
      bgGrad: 'linear-gradient(135deg, #FDF2F8 0%, #FBCFE8 100%)',
      bg: '#FDF2F8',
      border: '#FBCFE8',
      text: '#9D174D',
      accent: '#EC4899',
      accentBg: '#FCE7F3'
    };
  }
  if (s.includes('sinh')) {
    return {
      bgGrad: 'linear-gradient(135deg, #FAF5FF 0%, #E8D2FF 100%)',
      bg: '#FAF5FF',
      border: '#E9D5FF',
      text: '#581C87',
      accent: '#7C3AED',
      accentBg: '#F3E8FF'
    };
  }
  if (s.includes('văn') || s.includes('ngữ văn') || s.includes('sử') || s.includes('lịch sử') || s.includes('gdcd')) {
    return {
      bgGrad: 'linear-gradient(135deg, #F0F9FF 0%, #C4E8FD 100%)',
      bg: '#F0F9FF',
      border: '#BAE6FD',
      text: '#075985',
      accent: '#0284C7',
      accentBg: '#E0F2FE'
    };
  }
  // Default style (white/grey)
  return {
    bgGrad: 'linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)',
    bg: '#ffffff',
    border: '#E5E7EB',
    text: '#1F2937',
    accent: '#4B5563',
    accentBg: '#F3F4F6'
  };
};

export default function HeroBanner({ course, reviewsCount = 0 }) {
  const [descExpanded, setDescExpanded] = useState(false);

  const {
    title,
    description = '',
    instructor = {},
    rating = 5.0,
    curriculum = [],
    subject,
    badge,
    level,
    durationHours = 12
  } = course;

  // Description collapse/expand logic
  const isDescLong = description.length > 250;
  const displayedDesc = isDescLong && !descExpanded 
    ? `${description.slice(0, 250)}...` 
    : description;

  const totalSections = curriculum.length;
  const styles = getSubjectStyle(subject);

  return (
    <div className="fts-hero animate-in" style={{
      position: 'relative',
      overflow: 'hidden',
      background: styles.bgGrad,
      borderRadius: '24px',
      border: '3px solid #000000',
      boxShadow: '8px 8px 0px #000000',
      padding: '24px 36px 28px 36px',
      color: styles.text,
      minHeight: 'auto'
    }}>
      {/* Background blurs for a friendly glow */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'rgba(255, 226, 89, 0.1)',
        filter: 'blur(45px)',
        pointerEvents: 'none'
      }} />
      
      {/* Subtle abstract geometric pattern behind the hero banner */}
      <div style={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: '280px',
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: 0.07,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        zIndex: 0
      }}>
        <svg width="300" height="300" viewBox="0 0 300 300" fill="none">
          <circle cx="250" cy="150" r="130" fill={styles.accent} />
          <circle cx="250" cy="150" r="85" fill={styles.text} />
          <circle cx="150" cy="250" r="100" fill={styles.accent} />
        </svg>
      </div>

      <div className="fts-hero-grid" style={{ zIndex: 1, position: 'relative', gridTemplateColumns: '1fr' }}>
        {/* Left column content - now spanning full width */}
        <div className="fts-hero-left" style={{ textAlign: 'left' }}>
          
          {/* Badge & Subject Row */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {subject && (
              <span style={{
                background: styles.accentBg,
                border: `1.5px solid ${styles.border}`,
                color: styles.accent,
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {subject}
              </span>
            )}
            
            {badge && (
              <span style={{
                background: 'linear-gradient(90deg, #FFE259, #FFA751)',
                color: '#000000',
                border: '1.5px solid #000000',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '950',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                boxShadow: '2px 2px 0px #000000'
              }}>
                ⭐ {badge}
              </span>
            )}

            {level && (
              <span style={{
                background: 'rgba(0, 0, 0, 0.05)',
                border: '1.5px solid rgba(0, 0, 0, 0.1)',
                color: styles.text,
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '800'
              }}>
                {level}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="fts-hero-title" style={{
            fontSize: '30px',
            fontWeight: '950',
            color: styles.text,
            lineHeight: '1.25',
            marginBottom: '12px',
            letterSpacing: '-0.02em',
            maxWidth: '100%'
          }}>
            {title}
          </h1>

          {/* Description */}
          <p className="fts-hero-desc" style={{
            fontSize: '14px',
            lineHeight: '1.6',
            color: styles.text,
            opacity: 0.9,
            marginBottom: '16px',
            fontWeight: '500',
            maxWidth: '100%'
          }}>
            {displayedDesc}
            {isDescLong && (
              <button 
                type="button"
                className="fts-hero-desc-expand-btn"
                onClick={() => setDescExpanded(!descExpanded)}
                style={{
                  background: styles.accentBg,
                  border: `1.5px solid ${styles.border}`,
                  color: styles.accent,
                  fontWeight: '800',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  marginLeft: '8px',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
              >
                {descExpanded ? 'Rút gọn' : 'Xem thêm'}
              </button>
            )}
          </p>

          {/* Author & Rating Group */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap',
            marginBottom: '20px'
          }}>
            {/* Instructor badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: styles.accentBg,
              border: `1.5px solid ${styles.border}`,
              padding: '6px 14px',
              borderRadius: '50px'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${styles.accent}, ${styles.text})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                color: '#fff',
                fontSize: '11px',
                border: '1.5px solid #fff'
              }}>
                {instructor?.name ? instructor.name.split(' ').pop().slice(0, 2).toUpperCase() : 'GV'}
              </div>
              <span style={{ fontSize: '13px', fontWeight: '800', color: styles.text }}>
                Giảng viên: <span style={{ color: styles.accent }}>{instructor?.name || 'EduPath Specialist'}</span>
              </span>
            </div>

            {/* Rating row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(0, 0, 0, 0.03)',
              padding: '6px 14px',
              borderRadius: '50px',
              border: '1.5px solid rgba(0, 0, 0, 0.08)',
              color: styles.text
            }}>
              <span style={{ fontSize: '13.5px', fontWeight: '900', color: '#D97706' }}>{Number(rating).toFixed(1)}</span>
              <div style={{ display: 'flex', gap: '1px' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <HiStar 
                    key={i} 
                    style={{
                      fontSize: '14px',
                      color: i < Math.round(rating) ? '#FBBF24' : 'rgba(0, 0, 0, 0.15)'
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: '12px', color: styles.text, opacity: 0.8, marginLeft: '2px', fontWeight: '700' }}>
                ({reviewsCount} đánh giá)
              </span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
            paddingTop: '16px',
            borderTop: `2px dashed ${styles.border}`,
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>📚</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '11px', color: styles.text, opacity: 0.7, fontWeight: '700', textTransform: 'uppercase' }}>Bài học</span>
                <span style={{ fontSize: '13.5px', fontWeight: '900', color: styles.text }}>{totalSections} học phần</span>
              </div>
            </div>

            {durationHours && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>⏱️</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '11px', color: styles.text, opacity: 0.7, fontWeight: '700', textTransform: 'uppercase' }}>Thời lượng</span>
                  <span style={{ fontSize: '13.5px', fontWeight: '900', color: styles.text }}>{durationHours} giờ học</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>🛡️</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '11px', color: styles.text, opacity: 0.7, fontWeight: '700', textTransform: 'uppercase' }}>Đầu ra</span>
                <span style={{ fontSize: '13.5px', fontWeight: '900', color: styles.text }}>Cam kết 8+ THPTQG</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
