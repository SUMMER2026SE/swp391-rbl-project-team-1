import React from 'react';

export default function CourseBadge({ type }) {
  if (!type) return null;

  const normalized = type.toUpperCase().trim();
  let badgeClass = 'cc-badge';
  let label = type;

  if (normalized === 'BÁN CHẠY' || normalized === 'BESTSELLER') {
    badgeClass += ' cc-badge--bestseller';
    label = 'BÁN CHẠY';
  } else if (normalized === 'HOT') {
    badgeClass += ' cc-badge--hot';
    label = 'HOT';
  } else if (normalized === 'MỚI' || normalized === 'NEW') {
    badgeClass += ' cc-badge--new';
    label = 'MỚI';
  } else if (normalized === 'ĐỀ XUẤT' || normalized === 'RECOMMENDED') {
    badgeClass += ' cc-badge--recommended';
    label = 'ĐỀ XUẤT';
  } else if (normalized === 'PRO') {
    badgeClass += ' cc-badge--pro';
    label = 'PRO';
  } else if (normalized === 'MIỄN PHÍ' || normalized === 'FREE') {
    badgeClass += ' cc-badge--free';
    label = 'MIỄN PHÍ';
  } else {
    badgeClass += ' cc-badge--default';
  }

  return <span className={badgeClass}>{label}</span>;
}
