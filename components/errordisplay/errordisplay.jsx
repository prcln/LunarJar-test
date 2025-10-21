import React from 'react';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';

const ErrorDisplay = ({ 
  message, 
  title = 'Oops! Something went wrong',
  showBackButton = true,
  showRefreshButton = false,
  onRefresh,
  variant = 'default' // 'default', 'minimal', 'centered'
}) => {
  const handleBack = () => {
    window.history.back();
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  if (variant === 'minimal') {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#e53e3e'
      }}>
        <AlertCircle size={24} style={{ marginBottom: '8px' }} />
        <div>{message || 'An error occurred'}</div>
      </div>
    );
  }

  if (variant === 'centered') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        background: 'linear-gradient(135deg, #FFF8DC 0%, #FFE4B5 100%)'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '40px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: '#FEE',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <AlertCircle size={32} color="#e53e3e" />
          </div>
          <h2 style={{
            fontSize: '24px',
            color: '#2D3748',
            marginBottom: '12px',
            fontWeight: '600'
          }}>
            {title}
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#718096',
            marginBottom: '30px',
            lineHeight: '1.5'
          }}>
            {message || 'An unexpected error occurred. Please try again.'}
          </p>
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {showRefreshButton && (
              <button
                onClick={handleRefresh}
                style={{
                  padding: '12px 24px',
                  background: '#8B0000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#A00000'}
                onMouseOut={(e) => e.target.style.background = '#8B0000'}
              >
                <RefreshCw size={18} />
                Try Again
              </button>
            )}
            {showBackButton && (
              <button
                onClick={handleBack}
                style={{
                  padding: '12px 24px',
                  background: '#F7FAFC',
                  color: '#2D3748',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#EDF2F7'}
                onMouseOut={(e) => e.target.style.background = '#F7FAFC'}
              >
                <Home size={18} />
                Go Back
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div style={{
      textAlign: 'center',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          background: '#FEE',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <AlertCircle size={32} color="#e53e3e" />
        </div>
        <h2 style={{
          fontSize: '24px',
          color: '#2D3748',
          marginBottom: '12px',
          fontWeight: '600'
        }}>
          {title}
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#718096',
          marginBottom: '30px',
          lineHeight: '1.5'
        }}>
          {message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {showRefreshButton && (
            <button
              onClick={handleRefresh}
              style={{
                padding: '12px 24px',
                background: '#8B0000',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#A00000'}
              onMouseOut={(e) => e.target.style.background = '#8B0000'}
            >
              <RefreshCw size={18} />
              Try Again
            </button>
          )}
          {showBackButton && (
            <button
              onClick={handleBack}
              style={{
                padding: '12px 24px',
                background: '#F7FAFC',
                color: '#2D3748',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#EDF2F7'}
              onMouseOut={(e) => e.target.style.background = '#F7FAFC'}
            >
              <Home size={18} />
              Go Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;