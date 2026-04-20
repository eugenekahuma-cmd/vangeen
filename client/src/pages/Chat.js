import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import './Chat.css';

const API_URL = 'https://vangeen-backend.onrender.com/api/chat';

const CAPABILITIES = [
  { icon: '📊', title: 'Financial Analysis', desc: 'NPV, IRR, DCF, ratios' },
  { icon: '📋', title: 'Audit & Compliance', desc: 'Risk flags, controls' },
  { icon: '🌍', title: 'Macroeconomics', desc: 'GDP, inflation, policy' },
  { icon: '📐', title: 'Econometrics', desc: 'Regression, STATA output' },
];

const SUGGESTIONS = [
  "Calculate NPV: investment 500000, flows 120000 150000 180000, rate 10%",
  "Analyze balance sheet ratios: Revenue 1M, Net Income 150K, Assets 800K",
  "What are red flags in an audit of a manufacturing company?",
  "Explain the impact of rising interest rates on bond prices",
  "Interpret this regression: GDP on military spending and inflation",
];

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;

    const token = localStorage.getItem('token');
    const userMsg = { role: 'user', content: trimmed };
    const updated = [...messages, userMsg];

    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(
        API_URL,
        { message: trimmed, history: updated },
        {
          timeout: 30000,
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );

      const reply = res?.data?.reply || 'No response received.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);

    } catch (error) {
      let msg = 'Could not reach backend.';
      if (error.response?.data?.error) msg = error.response.data.error;
      else if (error.code === 'ECONNABORTED') msg = 'Request timed out. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: msg }]);
    }

    setLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
  };

  return (
    <div className="chat-container">
      <Sidebar
        user={user}
        history={[]}
        onNewChat={handleNewChat}
        onLogout={handleLogout}
      />

      <div className="chat-main">
        <div className="chat-topbar">
          <div>
            <div className="chat-topbar-title">AI Research Chat</div>
            <div className="chat-topbar-sub">Finance · Accounting · Economics · Audit</div>
          </div>
          <div className="chat-topbar-actions">
            <div className="chat-badge">Groq · Llama 3.3 70B</div>
            <div className="chat-badge warning">Beta</div>
          </div>
        </div>

        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-welcome">
              <div className="chat-welcome-logo">Vangeen</div>
              <div className="chat-welcome-sub">Elite Financial Intelligence</div>

              <div className="capabilities-grid">
                {CAPABILITIES.map((c, i) => (
                  <div
                    key={i}
                    className="capability-card"
                    onClick={() => setInput(`Tell me about ${c.title}`)}
                  >
                    <div className="capability-icon">{c.icon}</div>
                    <div className="capability-title">{c.title}</div>
                    <div className="capability-desc">{c.desc}</div>
                  </div>
                ))}
              </div>

              <div className="suggestions-row">
                {SUGGESTIONS.map((s, i) => (
                  <div
                    key={i}
                    className="suggestion-chip"
                    onClick={() => handleSend(s)}
                  >
                    {s.length > 50 ? s.substring(0, 50) + '...' : s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'assistant' ? 'V' : (user?.email?.charAt(0).toUpperCase() || 'U')}
              </div>
              <div className="message-body">
                <div className="message-role">
                  {msg.role === 'assistant' ? 'Vangeen' : 'You'}
                </div>
                <div className="message-content">{msg.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="typing-indicator">
              <div className="message-avatar" style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(0,229,160,0.15), rgba(0,153,255,0.15))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, color: '#00e5a0', flexShrink: 0,
                border: '1px solid rgba(0,229,160,0.15)'
              }}>V</div>
              <div className="typing-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="chat-input-wrapper">
          <div className="chat-input-box">
            <textarea
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about finance, accounting, auditing, economics..."
              rows={1}
            />
            <button
              className="send-btn"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
            >
              ➤
            </button>
          </div>
          <div className="input-hint">Enter to send · Shift+Enter for new line</div>
        </div>
      </div>
    </div>
  );
}