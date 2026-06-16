import { useState, useEffect } from 'react';
import { api } from '../api';

export default function ContributionHeatmap({ userId }) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-11
  
  // startMonth is the first month of the 3-month window (0-indexed)
  const getInitialStartMonth = () => {
    // Align to the nearest 3-month block containing the current month
    return Math.floor(currentMonth / 3) * 3;
  };

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [startMonth, setStartMonth] = useState(getInitialStartMonth());
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' | 'yearly'
  
  const [data, setData] = useState({ totalContributions: 0, contributions: {} });
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let active = true;
    const fetchHeatmap = async () => {
      setLoading(true);
      try {
        const res = await api.getActivityHeatmap(userId, selectedYear);
        if (active && res) {
          setData(res);
        }
      } catch (err) {
        console.error('Lỗi tải bản đồ nhiệt đóng góp:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchHeatmap();
    return () => { active = false; };
  }, [userId, selectedYear]);

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const getCellColorClass = (level) => {
    switch (level) {
      case 1: return 'var(--heatmap-lvl1, #9be9a8)';
      case 2: return 'var(--heatmap-lvl2, #40c463)';
      case 3: return 'var(--heatmap-lvl3, #30a14e)';
      case 4: return 'var(--heatmap-lvl4, #216e39)';
      default: return 'var(--heatmap-lvl0, #ebedf0)';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleMouseEnter = (e, day, info) => {
    if (!day) return;
    const rect = e.target.getBoundingClientRect();
    setHoveredDay({ day, info });
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  // Helper to generate cells for a specific month
  const getMonthCells = (year, monthIndex) => {
    const numDays = new Date(year, monthIndex + 1, 0).getDate();
    const rawStartDay = new Date(year, monthIndex, 1).getDay();
    const startDayOfWeek = (rawStartDay + 6) % 7; // Convert to Mon=0, Sun=6

    const cells = [];
    // Pad initial days
    for (let i = 0; i < startDayOfWeek; i++) {
      cells.push(null);
    }

    // Month days
    for (let day = 1; day <= numDays; day++) {
      const dateObj = new Date(year, monthIndex, day);
      const dateStr = dateObj.toISOString().split('T')[0];
      const info = data.contributions[dateStr] || { level: 0 };
      cells.push({
        date: dateObj,
        info
      });
    }

    // Pad ending days to complete the week
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  };

  // Navigate by 3 months
  const handlePrev3Months = () => {
    if (startMonth === 0) {
      setStartMonth(9); // Oct-Nov-Dec of prev year
      setSelectedYear((prev) => prev - 1);
    } else {
      setStartMonth((prev) => prev - 3);
    }
  };

  const handleNext3Months = () => {
    if (startMonth === 9) {
      setStartMonth(0); // Jan-Feb-Mar of next year
      setSelectedYear((prev) => prev + 1);
    } else {
      setStartMonth((prev) => prev + 3);
    }
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Get month contribution count
  const getMonthContributions = (year, mIndex) => {
    let count = 0;
    const numDays = new Date(year, mIndex + 1, 0).getDate();
    for (let d = 1; d <= numDays; d++) {
      const dateStr = new Date(year, mIndex, d).toISOString().split('T')[0];
      const info = data.contributions[dateStr];
      if (info && info.level > 0) count++;
    }
    return count;
  };

  // Render a single month card (large version for 3-month view)
  const renderMonthCardLarge = (year, mIndex) => {
    const monthName = monthNames[mIndex];
    const cells = getMonthCells(year, mIndex);
    const activeDays = getMonthContributions(year, mIndex);

    return (
      <div
        key={`${year}-${mIndex}`}
        style={{
          border: '2.5px solid #000',
          borderRadius: '18px',
          padding: '20px 18px',
          background: 'var(--bg-main, #f9fafb)',
          boxShadow: '4px 4px 0px #000',
          flex: '1 1 0',
          minWidth: '0',
          transition: 'all 0.25s ease',
        }}
      >
        {/* Month header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          borderBottom: '2px solid #000',
          paddingBottom: '10px'
        }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '950',
            textTransform: 'uppercase',
            color: '#000',
            margin: 0,
            letterSpacing: '0.5px'
          }}>
            {monthName}
          </h4>
          <span style={{
            fontSize: '12px',
            fontWeight: '800',
            background: activeDays > 0 ? '#a7f3d0' : 'var(--bg-card, #fff)',
            border: '1.5px solid #000',
            borderRadius: '6px',
            padding: '2px 8px',
            color: '#000'
          }}>
            {activeDays} ngày
          </span>
        </div>

        {/* Calendar Matrix */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '5px',
        }}>
          {/* Day Headers */}
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
            <span
              key={d}
              style={{
                fontSize: '11px',
                fontWeight: '900',
                color: d === 'CN' ? '#e74c3c' : 'var(--text-secondary, #6b7280)',
                textAlign: 'center',
                marginBottom: '6px',
                letterSpacing: '0.3px'
              }}
            >
              {d}
            </span>
          ))}

          {/* Cells */}
          {cells.map((cell, idx) => {
            if (!cell) {
              return <div key={idx} style={{ aspectRatio: '1' }} />;
            }

            const todayHighlight = isToday(cell.date);
            
            return (
              <div
                key={idx}
                style={{
                  aspectRatio: '1',
                  borderRadius: '8px',
                  background: getCellColorClass(cell.info.level),
                  cursor: 'pointer',
                  border: todayHighlight ? '2.5px solid #6c5ce7' : '1.5px solid #000',
                  boxShadow: todayHighlight ? '0 0 0 2px #a29bfe, 2px 2px 0px #000' : '1.5px 1.5px 0px #000',
                  transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  color: cell.info.level > 0 ? '#fff' : 'var(--text-primary, #000)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.15)';
                  e.currentTarget.style.zIndex = '10';
                  handleMouseEnter(e, cell.date, cell.info);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.zIndex = '1';
                  handleMouseLeave();
                }}
              >
                {cell.date.getDate()}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render a smaller month card (for yearly overview)
  const renderMonthCardSmall = (year, mIndex) => {
    const monthName = monthNames[mIndex];
    const cells = getMonthCells(year, mIndex);

    return (
      <div
        key={`${year}-${mIndex}`}
        style={{
          border: '2px solid #000',
          borderRadius: '14px',
          padding: '12px 10px',
          background: 'var(--bg-main, #f9fafb)',
          boxShadow: '3px 3px 0px #000',
          transition: 'all 0.2s ease'
        }}
      >
        <h4 style={{
          fontSize: '12px',
          fontWeight: '950',
          textAlign: 'center',
          marginBottom: '10px',
          textTransform: 'uppercase',
          color: '#000'
        }}>
          {monthName}
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '3px',
        }}>
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
            <span
              key={d}
              style={{
                fontSize: '8px',
                fontWeight: '900',
                color: 'var(--text-secondary, #6b7280)',
                textAlign: 'center',
                marginBottom: '4px'
              }}
            >
              {d}
            </span>
          ))}

          {cells.map((cell, idx) => {
            if (!cell) {
              return <div key={idx} style={{ aspectRatio: '1' }} />;
            }
            return (
              <div
                key={idx}
                style={{
                  aspectRatio: '1',
                  borderRadius: '4px',
                  background: getCellColorClass(cell.info.level),
                  border: '1px solid #000',
                  boxShadow: '1px 1px 0px #000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '8px',
                  fontWeight: 'bold',
                  color: cell.info.level > 0 ? '#fff' : 'var(--text-primary, #000)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => handleMouseEnter(e, cell.date, cell.info)}
                onMouseLeave={handleMouseLeave}
              >
                {cell.date.getDate()}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Get the 3 months to display
  const visibleMonths = [startMonth, startMonth + 1, startMonth + 2];
  const rangeLabel = `${monthNames[startMonth]} – ${monthNames[startMonth + 2]} ${selectedYear}`;

  return (
    <div className="card animate-in" style={{
      border: '3px solid #000',
      boxShadow: '6px 6px 0px #000',
      padding: '28px',
      background: 'var(--bg-card, #fff)',
      color: 'var(--text-main, #000)',
      fontFamily: 'system-ui, sans-serif',
      position: 'relative',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Header section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2.5px solid #000',
        paddingBottom: '18px',
        marginBottom: '22px',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <h3 style={{
            fontSize: '22px',
            fontWeight: '950',
            margin: 0,
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            letterSpacing: '0.5px'
          }}>
            <span style={{ fontSize: '26px' }}>📅</span> Lịch đóng góp học tập
          </h3>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary, #6b7280)',
            margin: '6px 0 0 0'
          }}>
            Hoạt động trong năm {selectedYear}:{' '}
            <strong style={{
              color: 'var(--primary, #6c5ce7)',
              fontSize: '16px',
              background: '#f0ecff',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1.5px solid #6c5ce7'
            }}>
              {data.totalContributions} ngày
            </strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Toggle View Mode Button */}
          <button
            onClick={() => setViewMode(viewMode === 'monthly' ? 'yearly' : 'monthly')}
            style={{
              border: '2.5px solid #000',
              background: viewMode === 'yearly' ? '#a29bfe' : '#FFE259',
              color: '#000',
              fontWeight: '900',
              padding: '8px 18px',
              borderRadius: '10px',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '3px 3px 0px #000',
              transition: 'all 0.12s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translate(3px, 3px)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '3px 3px 0px #000';
            }}
          >
            {viewMode === 'monthly' ? '📊 Tổng quan cả năm' : '📅 Chi tiết từng tháng'}
          </button>

          {/* Year select list */}
          <div style={{ display: 'flex', gap: '5px' }}>
            {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                style={{
                  border: '2.5px solid #000',
                  background: selectedYear === y ? '#000' : 'var(--bg-main, #f3f4f6)',
                  color: selectedYear === y ? '#fff' : 'var(--text-main, #000)',
                  fontWeight: '800',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: selectedYear === y ? 'none' : '3px 3px 0px #000',
                  transition: 'all 0.12s ease',
                  transform: selectedYear === y ? 'translate(3px, 3px)' : 'none'
                }}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 0',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔄</div>
          Đang tải lịch hoạt động học tập...
        </div>
      ) : (
        <>
          {/* ====== MONTHLY VIEW: 3 months side by side ====== */}
          {viewMode === 'monthly' && (
            <div style={{ padding: '6px 0 20px 0' }}>
              {/* Navigation Controls */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '24px',
                marginBottom: '24px'
              }}>
                <button
                  onClick={handlePrev3Months}
                  style={{
                    border: '2.5px solid #000',
                    background: 'var(--bg-card, #fff)',
                    color: '#000',
                    fontWeight: '900',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    boxShadow: '3px 3px 0px #000',
                    fontSize: '16px',
                    transition: 'all 0.12s ease'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translate(3px, 3px)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '3px 3px 0px #000';
                  }}
                >
                  ◀
                </button>
                <span style={{
                  fontSize: '20px',
                  fontWeight: '950',
                  color: 'var(--text-primary, #000)',
                  background: '#f0ecff',
                  padding: '6px 20px',
                  borderRadius: '10px',
                  border: '2px solid #6c5ce7',
                  letterSpacing: '0.3px'
                }}>
                  {rangeLabel}
                </span>
                <button
                  onClick={handleNext3Months}
                  style={{
                    border: '2.5px solid #000',
                    background: 'var(--bg-card, #fff)',
                    color: '#000',
                    fontWeight: '900',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    boxShadow: '3px 3px 0px #000',
                    fontSize: '16px',
                    transition: 'all 0.12s ease'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translate(3px, 3px)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '3px 3px 0px #000';
                  }}
                >
                  ▶
                </button>
              </div>

              {/* 3 month cards side by side */}
              <div style={{
                display: 'flex',
                gap: '20px',
                width: '100%'
              }}>
                {visibleMonths.map((mIdx) => renderMonthCardLarge(selectedYear, mIdx))}
              </div>
            </div>
          )}

          {/* ====== YEARLY VIEW: All 12 months ====== */}
          {viewMode === 'yearly' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '18px',
              marginBottom: '20px'
            }}>
              {monthNames.map((_, mIdx) => renderMonthCardSmall(selectedYear, mIdx))}
            </div>
          )}

          {/* Legend */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--text-secondary, #6b7280)',
            marginTop: '18px',
            padding: '12px 0',
            borderTop: '2px dashed rgba(0,0,0,0.15)'
          }}>
            <span style={{ fontWeight: '700' }}>Ít học</span>
            {[0, 1, 2, 3, 4].map((lvl) => (
              <div key={lvl} style={{
                width: '18px',
                height: '18px',
                background: getCellColorClass(lvl),
                borderRadius: '4px',
                border: '1.5px solid rgba(0,0,0,0.2)'
              }} />
            ))}
            <span style={{ fontWeight: '700' }}>Chăm chỉ</span>
          </div>
        </>
      )}

      {/* Floating Tooltip Component */}
      {hoveredDay && (
        <div style={{
          position: 'fixed',
          left: `${tooltipPos.x}px`,
          top: `${tooltipPos.y}px`,
          transform: 'translate(-50%, -100%)',
          zIndex: 10000,
          background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
          color: '#fff',
          padding: '14px 18px',
          borderRadius: '12px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
          fontSize: '13px',
          lineHeight: '1.6',
          pointerEvents: 'none',
          minWidth: '240px',
          border: '2px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            fontWeight: 'bold',
            borderBottom: '1px solid rgba(255,255,255,0.2)',
            paddingBottom: '6px',
            marginBottom: '8px',
            fontSize: '14px'
          }}>
            {formatDate(hoveredDay.day)}
          </div>
          {hoveredDay.info.level > 0 ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>XP Tích lũy:</span>
                <strong style={{ color: '#a29bfe' }}>+{hoveredDay.info.xpEarned || 0} XP</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Thời gian học:</span>
                <strong style={{ color: '#74b9ff' }}>{hoveredDay.info.studyMinutes || 0} phút</strong>
              </div>
              {hoveredDay.info.examsCompleted > 0 && (
                <div style={{ color: '#fed7aa', marginTop: '4px' }}>
                  ✓ Đã làm {hoveredDay.info.examsCompleted} đề thi thử
                </div>
              )}
              {hoveredDay.info.exerciseCount > 0 && (
                <div style={{ color: '#fef08a' }}>
                  ✓ Giải {hoveredDay.info.exerciseCount} bài tập trắc nghiệm
                </div>
              )}
              {hoveredDay.info.subjects && hoveredDay.info.subjects.length > 0 && (
                <div style={{ marginTop: '6px', fontSize: '12px', color: '#a7f3d0' }}>
                  Môn: {hoveredDay.info.subjects.join(', ').toUpperCase()}
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: '#9CA3AF' }}>Không có hoạt động học tập nào.</div>
          )}
          {/* Arrow */}
          <div style={{
            position: 'absolute',
            left: '50%',
            bottom: '-7px',
            transform: 'translateX(-50%) rotate(45deg)',
            width: '14px',
            height: '14px',
            background: '#16213e',
            borderRight: '2px solid rgba(255,255,255,0.15)',
            borderBottom: '2px solid rgba(255,255,255,0.15)'
          }} />
        </div>
      )}
    </div>
  );
}
