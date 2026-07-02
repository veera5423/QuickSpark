import React from 'react';

// Fallback component for when user management fails
export const UserManagementFallback = () => (
  <div className="fallback-card" style={{
    padding: '20px',
    border: '2px dashed #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
    textAlign: 'center',
    margin: '10px 0'
  }}>
    <div style={{ fontSize: '32px', marginBottom: '10px' }}>👥</div>
    <h4 style={{ color: '#666', margin: '0 0 10px 0' }}>User Management Unavailable</h4>
    <p style={{ color: '#999', fontSize: '14px', margin: '0' }}>
      Unable to load user management features. Please try again later.
    </p>
  </div>
);

// Fallback component for when reports fail
export const ReportsFallback = () => (
  <div className="fallback-card" style={{
    padding: '20px',
    border: '2px dashed #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
    textAlign: 'center',
    margin: '10px 0'
  }}>
    <div style={{ fontSize: '32px', marginBottom: '10px' }}>📊</div>
    <h4 style={{ color: '#666', margin: '0 0 10px 0' }}>Reports Unavailable</h4>
    <p style={{ color: '#999', fontSize: '14px', margin: '0' }}>
      Report generation is temporarily unavailable. Other admin features remain accessible.
    </p>
  </div>
);

// Fallback component for when dashboard stats fail
export const StatsFallback = () => (
  <div className="fallback-card" style={{
    padding: '20px',
    border: '2px dashed #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
    textAlign: 'center',
    margin: '10px 0'
  }}>
    <div style={{ fontSize: '32px', marginBottom: '10px' }}>📈</div>
    <h4 style={{ color: '#666', margin: '0 0 10px 0' }}>Statistics Unavailable</h4>
    <p style={{ color: '#999', fontSize: '14px', margin: '0' }}>
      Dashboard statistics are temporarily unavailable. Core functionality remains intact.
    </p>
  </div>
);

// Fallback component for when resource management fails
export const ResourcesFallback = () => (
  <div className="fallback-card" style={{
    padding: '20px',
    border: '2px dashed #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
    textAlign: 'center',
    margin: '10px 0'
  }}>
    <div style={{ fontSize: '32px', marginBottom: '10px' }}>📚</div>
    <h4 style={{ color: '#666', margin: '0 0 10px 0' }}>Resource Management Unavailable</h4>
    <p style={{ color: '#999', fontSize: '14px', margin: '0' }}>
      Resource management features are temporarily unavailable. Please try again later.
    </p>
  </div>
);

// Fallback component for when pro requests management fails
export const ProRequestsFallback = () => (
  <div className="fallback-card" style={{
    padding: '20px',
    border: '2px dashed #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
    textAlign: 'center',
    margin: '10px 0'
  }}>
    <div style={{ fontSize: '32px', marginBottom: '10px' }}>⭐</div>
    <h4 style={{ color: '#666', margin: '0 0 10px 0' }}>Pro Requests Unavailable</h4>
    <p style={{ color: '#999', fontSize: '14px', margin: '0' }}>
      Pro membership request management is temporarily unavailable. Other admin features remain accessible.
    </p>
  </div>
);

// Generic loading state component
export const ServiceLoading = ({ serviceName }) => (
  <div className="loading-card" style={{
    padding: '20px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
    textAlign: 'center',
    margin: '10px 0'
  }}>
    <div style={{
      display: 'inline-block',
      width: '20px',
      height: '20px',
      border: '2px solid #f3f3f3',
      borderTop: '2px solid #3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '10px'
    }}></div>
    <p style={{ color: '#666', margin: '0', fontSize: '14px' }}>
      Loading {serviceName}...
    </p>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Offline indicator component
export const ServiceOffline = ({ serviceName, lastUpdated }) => (
  <div className="offline-indicator" style={{
    padding: '12px 16px',
    backgroundColor: '#fff3cd',
    border: '1px solid #ffeaa7',
    borderRadius: '6px',
    margin: '10px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  }}>
    <div style={{ fontSize: '16px' }}>⚠️</div>
    <div>
      <div style={{ fontWeight: '600', color: '#856404', fontSize: '14px' }}>
        {serviceName} Offline
      </div>
      {lastUpdated && (
        <div style={{ color: '#856404', fontSize: '12px' }}>
          Last updated: {lastUpdated}
        </div>
      )}
    </div>
  </div>
);

// Fallback component for when API monitoring fails
export const ApiMonitoringFallback = () => (
  <div className="fallback-card" style={{
    padding: '20px',
    border: '2px dashed #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
    textAlign: 'center',
    margin: '10px 0'
  }}>
    <div style={{ fontSize: '32px', marginBottom: '10px' }}>📊</div>
    <h4 style={{ color: '#666', margin: '0 0 10px 0' }}>API Monitoring Unavailable</h4>
    <p style={{ color: '#999', fontSize: '14px', margin: '0' }}>
      API usage monitoring is temporarily unavailable. Other admin features remain accessible.
    </p>
  </div>
);

// Success indicator component
export const ServiceOnline = ({ serviceName }) => (
  <div className="online-indicator" style={{
    padding: '8px 12px',
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    borderRadius: '4px',
    margin: '5px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#155724'
  }}>
    <div style={{ fontSize: '12px' }}>✅</div>
    <span>{serviceName} operational</span>
  </div>
);