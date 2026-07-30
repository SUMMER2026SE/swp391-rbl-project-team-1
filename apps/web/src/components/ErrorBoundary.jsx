import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[React ErrorBoundary caught error]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          background: '#ffffff',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          margin: '16px'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔄</div>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' }}>
            {this.props.title || 'Đang cập nhật lại nội dung bài học...'}
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '380px', margin: '0 0 16px 0' }}>
            Hệ thống đang tự động làm mới nội dung. Bạn có thể tải lại để học tiếp.
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onRetry) {
                this.props.onRetry();
              } else {
                window.location.reload();
              }
            }}
            style={{
              padding: '8px 20px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            Tải lại phần này
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
