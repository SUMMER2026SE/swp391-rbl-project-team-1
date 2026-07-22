import React, { useState, useEffect } from 'react';
import { HiLightningBolt, HiSparkles, HiAdjustments, HiCheckCircle } from 'react-icons/hi';
import { toast } from '../../../utils/toast';

export default function GenerateExamCard({ onGenerate, externalConfig }) {
  const [form, setForm] = useState({
    subject: 'math',
    topic: 'all',
    difficulty: 'medium',
    questionCount: 20,
    onlyWeakTopics: true,
    excludeSolved: true,
    singleTopicName: null
  });

  useEffect(() => {
    if (externalConfig) {
      const subjectMap = {
        'Toán học': 'math',
        'Vật lý': 'physics',
        'Hóa học': 'chemistry',
        'Sinh học': 'biology',
        'Tiếng Anh': 'english'
      };
      const subjKey = subjectMap[externalConfig.subject] || 'math';
      const topicName = externalConfig.subTopic || externalConfig.topic || 'Chủ đề trọng tâm';

      setForm(prev => ({
        ...prev,
        subject: subjKey,
        topic: 'single_topic',
        singleTopicName: topicName,
        questionCount: 20,
        onlyWeakTopics: true
      }));

      toast(`⚡ Đã tự động nạp cấu hình luyện tập cho chủ đề "${topicName}"!`, 'success');
    }
  }, [externalConfig]);

  const handleGenerateClick = () => {
    const isSingle = form.topic === 'single_topic' && form.singleTopicName;
    const msg = isSingle
      ? `⚡ AI đang gom tất cả câu hỏi có sẵn thuộc chủ đề "${form.singleTopicName}" (Tối đa 20 câu hoặc toàn bộ trong kho)...`
      : `⚡ AI đang tổng hợp bộ đề ${form.questionCount} câu cho bạn...`;

    toast(msg, 'info');
    if (onGenerate) onGenerate({ ...form, isSingleTopic: isSingle });
  };

  return (
    <div id="generate-exam-card" style={{
      background: 'var(--bg-card, #ffffff)',
      border: form.singleTopicName ? '2px solid var(--exams-purple)' : '1px solid var(--border)',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: 'var(--shadow-sm)',
      transition: 'border 0.3s ease-in-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>
            <HiAdjustments />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>
              TẠO ĐỀ LUYỆN TẬP THEO YÊU CẦU
            </h4>
            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              AI tổng hợp câu hỏi tối ưu theo năng lực
            </span>
          </div>
        </div>

        {form.singleTopicName && (
          <span style={{
            fontSize: '11px',
            fontWeight: '800',
            padding: '3px 8px',
            borderRadius: '6px',
            background: 'rgba(108, 92, 231, 0.12)',
            color: 'var(--exams-purple)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <HiCheckCircle /> Đã chọn 1 chủ đề
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Subject */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Môn học
          </label>
          <select
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', fontWeight: '700', outline: 'none' }}
          >
            <option value="math">Toán học</option>
            <option value="physics">Vật lý</option>
            <option value="chemistry">Hóa học</option>
            <option value="biology">Sinh học</option>
            <option value="english">Tiếng Anh</option>
          </select>
        </div>

        {/* Topic */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Chủ đề trọng tâm
          </label>
          <select
            value={form.topic}
            onChange={(e) => {
              const val = e.target.value;
              setForm({ 
                ...form, 
                topic: val, 
                singleTopicName: val !== 'all' && val !== 'single_topic' ? val : form.singleTopicName 
              });
            }}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', fontWeight: '700', outline: 'none' }}
          >
            {form.singleTopicName && (
              <option value="single_topic">
                🎯 {form.singleTopicName} (Chủ đề được chọn)
              </option>
            )}
            <option value="all">Tất cả chủ đề</option>
            {form.subject === 'math' && (
              <>
                <option value="Hàm số & Đồ thị">Hàm số & Đồ thị</option>
                <option value="Mũ & Lôgarit">Mũ & Lôgarit</option>
                <option value="Nguyên hàm & Tích phân">Nguyên hàm & Tích phân</option>
                <option value="Hình học tọa độ Oxyz">Hình học tọa độ Oxyz</option>
                <option value="Tổ hợp & Xác suất">Tổ hợp & Xác suất</option>
                <option value="Cấp số cộng & Cấp số nhân">Cấp số cộng & Cấp số nhân</option>
              </>
            )}
            {form.subject === 'physics' && (
              <>
                <option value="Dao động cơ">Dao động cơ</option>
                <option value="Dòng điện xoay chiều">Dòng điện xoay chiều</option>
                <option value="Dao động & Sóng điện từ">Dao động & Sóng điện từ</option>
                <option value="Vật lý hạt nhân">Vật lý hạt nhân</option>
              </>
            )}
            {form.subject === 'chemistry' && (
              <>
                <option value="Este - Lipit">Este - Lipit</option>
                <option value="Cacbohiđrat">Cacbohiđrat</option>
                <option value="Polime">Polime</option>
                <option value="Kim loại kiềm - Kiềm thổ">Kim loại kiềm - Kiềm thổ</option>
              </>
            )}
            {form.subject === 'english' && (
              <>
                <option value="Ngữ pháp cốt lõi">Ngữ pháp cốt lõi</option>
                <option value="Từ vựng trọng tâm">Từ vựng trọng tâm</option>
                <option value="Đọc hiểu văn bản">Đọc hiểu văn bản</option>
                <option value="Tìm lỗi sai">Tìm lỗi sai</option>
              </>
            )}
            {form.subject === 'biology' && (
              <>
                <option value="Cơ chế di truyền và biến dị">Cơ chế di truyền và biến dị</option>
                <option value="Quy luật di truyền">Quy luật di truyền</option>
                <option value="Di truyền học quần thể">Di truyền học quần thể</option>
              </>
            )}
          </select>
        </div>

        {/* Difficulty */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Độ khó câu hỏi
          </label>
          <select
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', fontWeight: '700', outline: 'none' }}
          >
            <option value="easy">Dễ (Nhận biết)</option>
            <option value="medium">Trung bình (Thông hiểu)</option>
            <option value="hard">Khó (Vận dụng cao)</option>
            <option value="mixed">Tổng hợp cấu trúc THPT QG</option>
          </select>
        </div>

        {/* Question Count */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Số lượng câu hỏi
          </label>
          <select
            value={form.questionCount}
            onChange={(e) => setForm({ ...form, questionCount: Number(e.target.value) })}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', fontWeight: '700', outline: 'none' }}
          >
            <option value={10}>10 câu (Luyện nhanh 15 phút)</option>
            <option value={15}>15 câu (Luyện tập 25 phút)</option>
            <option value={20}>20 câu (Luyện tập 35 phút)</option>
            <option value={40}>40 câu (Đề chuẩn THPT 50 phút)</option>
          </select>
        </div>

        {/* Checkboxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '4px 0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: '700', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.onlyWeakTopics}
              onChange={(e) => setForm({ ...form, onlyWeakTopics: e.target.checked })}
              style={{ accentColor: 'var(--exams-purple)', width: '15px', height: '15px' }}
            />
            <span>Ưu tiên lấy câu hỏi chủ đề yếu</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: '700', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.excludeSolved}
              onChange={(e) => setForm({ ...form, excludeSolved: e.target.checked })}
              style={{ accentColor: 'var(--exams-purple)', width: '15px', height: '15px' }}
            />
            <span>Loại bỏ các câu đã làm đúng</span>
          </label>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateClick}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6c5ce7 0%, #4f46e5 100%)',
            color: '#ffffff',
            fontWeight: '900',
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(108, 92, 231, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            marginTop: '6px'
          }}
        >
          <HiLightningBolt /> TẠO ĐỀ LUYỆN TẬP AI <HiSparkles />
        </button>
      </div>
    </div>
  );
}
