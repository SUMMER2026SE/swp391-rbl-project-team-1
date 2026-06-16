import React from 'react';

function ViolationRow({ icon, label, count, threshold, color }) {
  const over = count >= threshold;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <span style={{
        fontSize: '12px', fontWeight: '700',
        color: over ? '#e17055' : count > 0 ? '#f39c12' : '#00b894',
        background: over ? '#e1705514' : count > 0 ? '#f39c1214' : '#00b89414',
        padding: '2px 10px', borderRadius: '99px'
      }}>
        {count}/{threshold} lần
      </span>
    </div>
  );
}

export default function TrustScoreCard({ trustScore, tabSwitchCount = 0, copyPasteCount = 0, fullscreenExitCount = 0 }) {
  if (trustScore === null || trustScore === undefined) return null;

  const score = Math.round(trustScore);
  let status, statusColor, statusBg, statusIcon;

  if (score >= 90) {
    status = 'Đáng tin cậy';
    statusColor = '#00b894';
    statusBg = '#00b89414';
    statusIcon = '🛡️';
  } else if (score >= 70) {
    status = 'Có vi phạm nhỏ';
    statusColor = '#f39c12';
    statusBg = '#f39c1214';
    statusIcon = '⚠️';
  } else if (score >= 50) {
    status = 'Nhiều vi phạm';
    statusColor = '#e17055';
    statusBg = '#e1705514';
    statusIcon = '🚨';
  } else {
    status = 'Nghi ngờ gian lận';
    statusColor = '#d63031';
    statusBg = '#d6303114';
    statusIcon = '🔴';
  }

  const r = 32;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Circular trust score */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="40" cy="40" r={r} fill="none" stroke="var(--border)" strokeWidth="7" />
            <circle
              cx="40" cy="40" r={r} fill="none"
              stroke={statusColor} strokeWidth="7"
              strokeDasharray={circ} strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '16px', fontWeight: '900', color: statusColor }}>{score}</span>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>/ 100</span>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>
              Điểm tin cậy thi cử
            </span>
            <span style={{
              fontSize: '11px', fontWeight: '700', color: statusColor,
              background: statusBg, padding: '2px 9px', borderRadius: '99px'
            }}>
              {statusIcon} {status}
            </span>
          </div>

          <ViolationRow icon="↔️" label="Chuyển tab / cửa sổ" count={tabSwitchCount} threshold={3} />
          <ViolationRow icon="📋" label="Sao chép / dán" count={copyPasteCount} threshold={5} />
          <ViolationRow icon="🖥️" label="Thoát toàn màn hình" count={fullscreenExitCount} threshold={3} />
        </div>
      </div>

      {score < 70 && (
        <div style={{ marginTop: '12px', padding: '10px 14px', background: '#e1705510', border: '1px solid #e1705530', borderRadius: '10px', fontSize: '12px', color: '#c0392b', lineHeight: 1.5 }}>
          ⚠️ Kết quả này có điểm tin cậy thấp do nhiều vi phạm được ghi nhận. Điểm số chỉ mang tính tham khảo.
        </div>
      )}
    </div>
  );
}
