import { useState, useEffect } from 'react';
import { HiCheckCircle, HiXCircle } from 'react-icons/hi';
import { api } from '../api';

export default function ConfirmEmailPage({ onAuthSuccess, navigateTo }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const email = params.get('email');

      if (!token || !email) {
        setStatus('error');
        setErrorMsg('Thiếu thông tin xác thực (Email hoặc Token). Vui lòng kiểm tra lại liên kết trong email.');
        return;
      }

      try {
        const data = await api.verifyOtpRegister(email, token);
        
        // Save auth tokens
        if (data.accessToken) localStorage.setItem('access_token', data.accessToken);
        if (data.refreshToken) localStorage.setItem('refresh_token', data.refreshToken);

        // Map backend user to frontend structure
        const roleLower = (data.user.role || 'STUDENT').toLowerCase();
        const name = data.user.fullName || data.user.email.split('@')[0];
        const mappedUser = {
          id: data.user.id,
          name,
          email: data.user.email,
          password: 'backend_managed',
          role: roleLower,
          combo: data.user.subjectGroup || (roleLower === 'student' ? 'A01 (Toán – Lý – Anh)' : ''),
          grade: roleLower === 'student' ? '12' : '',
          avatar: data.user.avatarUrl ? null : name.substring(0, 2).toUpperCase(),
          avatarUrl: data.user.avatarUrl || null,
          isBanned: false,
          status: 'active',
          unlockedCourses: []
        };

        setStatus('success');
        
        // Wait 2.5 seconds to let the user see the gorgeous success state, then log them in
        setTimeout(() => {
          onAuthSuccess(mappedUser);
          navigateTo('/');
        }, 2500);

      } catch (err) {
        setStatus('error');
        setErrorMsg(err.message || 'Mã xác nhận không hợp lệ hoặc đã hết hạn.');
      }
    };

    confirmEmail();
  }, [onAuthSuccess, navigateTo]);

  return (
    <div 
      style={{
        width: '100%',
        maxWidth: '500px',
        padding: '30px',
        background: '#ffffff',
        border: '3px solid #000000',
        borderRadius: '20px',
        boxShadow: '8px 8px 0px #000000',
        textAlign: 'center',
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
      }}
    >
      {status === 'loading' && (
        <div style={{ padding: '20px 0' }}>
          <div className="spinner-loading" style={{
            width: '50px',
            height: '50px',
            border: '5px solid #e0e7ff',
            borderTop: '5px solid #6c5ce7',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px auto'
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b', margin: '0 0 10px 0' }}>
            Đang xác thực tài khoản ⏳
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Hệ thống đang kiểm tra liên kết xác thực của em. Vui lòng giữ kết nối internet ổn định.
          </p>
        </div>
      )}

      {status === 'success' && (
        <div style={{ padding: '10px 0' }}>
          <HiCheckCircle style={{ fontSize: '64px', color: '#10b981', marginBottom: '15px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: '950', color: '#10b981', margin: '0 0 10px 0' }}>
            Xác thực thành công! 🎉
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px 0' }}>
            Tài khoản của em đã được kích hoạt thành công. Đang tự động đăng nhập và chuẩn bị lộ trình học cho em...
          </p>
          <div style={{
            height: '4px',
            background: '#10b981',
            width: '100%',
            borderRadius: '2px',
            animation: 'progressLoad 2.5s ease-out forwards'
          }}></div>
          <style>{`
            @keyframes progressLoad {
              0% { width: 0%; }
              100% { width: 100%; }
            }
          `}</style>
        </div>
      )}

      {status === 'error' && (
        <div style={{ padding: '10px 0' }}>
          <HiXCircle style={{ fontSize: '64px', color: '#ef4444', marginBottom: '15px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: '950', color: '#ef4444', margin: '0 0 10px 0' }}>
            Xác thực thất bại ❌
          </h2>
          <p style={{ fontSize: '14.5px', color: '#475569', margin: '0 0 25px 0', lineHeight: '1.6' }}>
            {errorMsg}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => {
                navigateTo('/');
                // Trigger auth event in App.jsx to open the signup page
                window.dispatchEvent(new CustomEvent('edupath-auth-redirect', { detail: { mode: 'signup' } }));
              }}
              style={{
                background: '#6c5ce7',
                color: '#ffffff',
                border: '2px solid #000000',
                borderRadius: '12px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '800',
                boxShadow: '3px 3px 0px #000000',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translate(2px, 2px)';
                e.currentTarget.style.boxShadow = '1px 1px 0px #000000';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '3px 3px 0px #000000';
              }}
            >
              Đăng ký lại tài khoản mới
            </button>
            <button
              onClick={() => navigateTo('/')}
              style={{
                background: '#f1f5f9',
                color: '#475569',
                border: '2px solid #000000',
                borderRadius: '12px',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Quay về trang chủ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
