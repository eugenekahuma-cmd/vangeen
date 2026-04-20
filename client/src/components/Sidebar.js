import React, { useState } from 'react';
import '../pages/Chat.css';

export default function Sidebar({ user, history, onNewChat, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : 'VG';

  const navItems = [
    { icon: '✦', label: 'New Chat', action: onNewChat },
    { icon: '◎', label: 'Search Chat' },
    { icon: '⊕', label: 'Discover' },
    { icon: '◈', label: 'Customize' },
    { icon: '▤', label: 'Project' },
  ];

  return (
    <div className={`chat-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '→' : '←'}
        </button>
        <div className="sidebar-logo">Vangeen</div>
      </div>

      <div className="sidebar-body">
        <div className="sidebar-section-label">Navigation</div>

        {navItems.map((item, i) => (
          <div
            key={i}
            className={`sidebar-item ${i === 0 ? 'active' : ''}`}
            onClick={item.action}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-text">{item.label}</span>
          </div>
        ))}

        <div className="sidebar-section-label" style={{ marginTop: '12px' }}>
          Capabilities
        </div>

        {[
          { icon: '📊', label: 'Financial Analysis' },
          { icon: '📋', label: 'Audit Assistant' },
          { icon: '📈', label: 'Market Data' },
          { icon: '🌍', label: 'Macroeconomics' },
          { icon: '📉', label: 'Microeconomics' },
          { icon: '📐', label: 'Econometrics' },
          { icon: '💰', label: 'Tax & Compliance' },
        ].map((item, i) => (
          <div key={i} className="sidebar-item">
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-text">{item.label}</span>
          </div>
        ))}

        <div className="sidebar-section-label" style={{ marginTop: '12px' }}>
          Chat History
        </div>

        <div className="chat-history-list">
          {history && history.length > 0 ? (
            history.map((chat, idx) => (
              <div key={idx} className="history-item">
                {chat.title || `Session ${idx + 1}`}
              </div>
            ))
          ) : (
            <div className="history-item">No chats yet</div>
          )}
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="user-badge">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.email || 'Guest'}</div>
            <div className="user-plan">{user?.plan || 'Free'} Plan</div>
          </div>
        </div>
        <div className="sidebar-item" onClick={onLogout}>
          <span className="sidebar-icon">↩</span>
          <span className="sidebar-text">Logout</span>
        </div>
      </div>
    </div>
  );
}