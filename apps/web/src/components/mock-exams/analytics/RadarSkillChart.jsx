import React from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip 
} from 'recharts';
import { HiSparkles } from 'react-icons/hi';

const CustomRadarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '8px 12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-primary)' }}>
          {payload[0].payload.skill}
        </div>
        <div style={{ fontSize: '13px', fontWeight: '900', color: '#6c5ce7' }}>
          Đánh giá: {payload[0].value} / 100 điểm
        </div>
      </div>
    );
  }
  return null;
};

export default function RadarSkillChart({ skillData }) {
  return (
    <div style={{
      background: 'var(--bg-card, #ffffff)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '22px',
      boxShadow: 'var(--shadow-sm)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiSparkles style={{ color: 'var(--exams-orange)' }} /> CHỈ SỐ KỸ NĂNG HỌC TẬP (RADAR SKILLS)
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Biểu đồ mạng nhện đánh giá 6 khía cạnh năng lực cá nhân
          </span>
        </div>
      </div>

      <div style={{ width: '100%', height: '260px', marginTop: 'auto' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={skillData}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis dataKey="skill" stroke="var(--text-primary)" fontSize={11} fontWeight={700} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--text-secondary)" fontSize={10} />
            <Radar name="Kỹ năng" dataKey="score" stroke="#6c5ce7" fill="#6c5ce7" fillOpacity={0.4} />
            <Tooltip content={<CustomRadarTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
