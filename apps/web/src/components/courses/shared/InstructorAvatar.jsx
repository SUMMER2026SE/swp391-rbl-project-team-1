import React from 'react';
import { HiBadgeCheck } from 'react-icons/hi';

export default function InstructorAvatar({ instructor, size = 'md' }) {
  if (!instructor) return null;

  const initials = instructor.name ? instructor.name.slice(0, 2).toUpperCase() : 'GV';
  // Use avatarUrl, avatar, or fallback
  const avatarSrc = instructor.avatarUrl || instructor.avatar;

  return (
    <div className={`instructor-avatar instructor-avatar--${size}`}>
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={instructor.name}
          className="instructor-avatar__img"
        />
      ) : (
        <div className="instructor-avatar__placeholder">
          {initials}
        </div>
      )}
      <HiBadgeCheck className="instructor-avatar__badge" />
    </div>
  );
}
