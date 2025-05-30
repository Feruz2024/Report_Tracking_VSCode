import React from 'react';
import NotificationPanel from './NotificationPanel';

const TopNavBar = ({ username, onLogout, showNotifications = false, children }) => (
  <div style={{
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    padding: '0 32px',
    minHeight: 56,
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  }}>
    <div style={{ display: 'flex', gap: 8 }}>
      {children}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      {showNotifications && <NotificationPanel />}
      <span style={{ color: '#2a4365', fontWeight: 600, fontSize: 16 }}>
        Logged in as <strong>{username}</strong>
      </span>
      <button
        onClick={onLogout}
        style={{
          background: '#e53e3e',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '6px 16px',
          fontWeight: 600,
          fontSize: 15,
          cursor: 'pointer',
          marginLeft: 8,
        }}
      >
        Logout
      </button>
    </div>
  </div>
);

export default TopNavBar;
