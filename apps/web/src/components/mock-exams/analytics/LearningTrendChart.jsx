import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { HiTrendingUp } from 'react-icons/hi';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '10px 14px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '4px' }}>
          Ngày {label}
        </div>
        <div style={{ fontSize: '13px', fontWeight: '800', color: '#6c5ce7' }}>
          Tỷ lệ đúng: {payload[0].value}%
        </div>
        {payload[1] && (
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#00b894' }}>
            Dự đoán điểm: {payload[1].value} điểm
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function LearningTrendChart({ trendData }) {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiTrendingUp style={{ color: 'var(--exams-purple)' }} /> XU HƯỚNG TẮNG TRƯỞNG & ĐỘ CHÍNH XÁC (30 NGÀY QUÁ)
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Đồ thị theo dõi sự tiến bộ liên tục qua các đợt thi thử
          </span>
        </div>
      </div>

      <div style={{ width: '100%', height: '260px', marginTop: 'auto' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6c5ce7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00b894" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#00b894" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
            <YAxis stroke="var(--text-secondary)" fontSize={12} domain={[50, 100]} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="accuracy" name="Tỷ lệ đúng (%)" stroke="#6c5ce7" strokeWidth={3} fillOpacity={1} fill="url(#colorAccuracy)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
