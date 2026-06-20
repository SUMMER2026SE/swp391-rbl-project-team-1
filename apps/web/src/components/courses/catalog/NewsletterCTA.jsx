import React, { useState } from 'react';
import { toast } from '../../../utils/toast';

export default function NewsletterCTA() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast(`Đăng ký nhận tài liệu & lộ trình học tập thành công cho: ${email}`, 'success');
    setEmail('');
  };

  return (
    <div className="newsletter-banner">
      <div className="newsletter-banner__content">
        <h2 className="newsletter-banner__title">Nhận tài liệu & lộ trình học tập miễn phí</h2>
        <p className="newsletter-banner__desc">Đăng ký để nhận ngay cẩm nang tóm tắt lý thuyết, đề thi thử mẫu và cập nhật xu hướng đề thi THPTQG gửi trực tiếp qua hòm thư điện tử.</p>
        
        <form onSubmit={handleSubmit} className="newsletter-banner__form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập địa chỉ email của em..."
            className="newsletter-banner__input"
            required
          />
          <button type="submit" className="newsletter-banner__btn">
            Nhận lộ trình học
          </button>
        </form>
      </div>
    </div>
  );
}
