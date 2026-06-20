import React from 'react';
import { HiUserGroup, HiClipboardList, HiAcademicCap, HiTrendingUp } from 'react-icons/hi';

export default function StatsBand() {
  return (
    <div className="stats-band">
      <div className="stats-band__item">
        <HiUserGroup className="stats-band__icon" />
        <div className="stats-band__info">
          <strong>50.000+</strong>
          <span>Học viên tin tưởng</span>
        </div>
      </div>
      <div className="stats-band__item">
        <HiClipboardList className="stats-band__icon" />
        <div className="stats-band__info">
          <strong>1.200+</strong>
          <span>Đề thi & Tài liệu ôn luyện</span>
        </div>
      </div>
      <div className="stats-band__item">
        <HiAcademicCap className="stats-band__icon" />
        <div className="stats-band__info">
          <strong>150+</strong>
          <span>Giảng viên tiêu biểu</span>
        </div>
      </div>
      <div className="stats-band__item">
        <HiTrendingUp className="stats-band__icon" />
        <div className="stats-band__info">
          <strong>98.5%</strong>
          <span>Đạt nguyện vọng target</span>
        </div>
      </div>
    </div>
  );
}
