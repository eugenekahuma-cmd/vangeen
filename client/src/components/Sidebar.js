import React, { useState } from 'react';
import '../pages/Chat.css';

export default function Sidebar({ user, history }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`chat-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
        ☰
      </div>
      <div className="sidebar-logo">Vangeen</div>
      <div className="sidebar-label">
        {user?.name || "Guest"} ({user?.plan || "Free"})
      </div>

      <div className="sidebar-item"><span>📝</span><span>New Chat</span></div>
      <div className="sidebar-item"><span>🔍</span><span>Search Chat</span></div>
      <div className="sidebar-item"><span>🌐</span><span>Discover</span></div>
      <div className="sidebar-item"><span>🎨</span><span>Customize</span></div>
      <div className="sidebar-item"><span>📂</span><span>Project</span></div>

      <div className="sidebar-label">Chat History</div>
      <div className="chat-history">
        {history && history.length > 0 ? (
          history.map((chat, idx) => (
            <div key={idx} className="sidebar-item">
              <span>💬</span><span>{chat.title || `Chat ${idx+1}`}</span>
            </div>
          ))
        ) : (
          <div className="sidebar-item">No chats yet</div>
        )}
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-item"><span>⚙️</span><span>Settings</span></div>
        <div className="sidebar-item"><span>🚪</span><span>Logout</span></div>
      </div>
    </div>
  );
}
