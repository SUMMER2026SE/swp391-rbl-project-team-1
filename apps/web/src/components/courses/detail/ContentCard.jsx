import React from 'react';

export default function ContentCard({ title, children }) {
  return (
    <div className="fts-card animate-in">
      {title && <h3 className="fts-card-title">{title}</h3>}
      {children}
    </div>
  );
}
