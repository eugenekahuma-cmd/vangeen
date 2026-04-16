import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendMessage } from '../services/api';
import '../assets/Chat.css';

const Chat = () => {
  const { logout } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Welcome to Vangeen — your elite financial intelligence platform. I can help you with financial analysis, accounting, auditing, tax research, investment analysis, and much more. How can I assist you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    try {
      const reply = await sendMessage(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    "Analyze Apple's latest financial statements",
    'Explain IFRS 16 lease accounting',
    'What are red flags in an audit?',
    'Calculate DCF valuation for a startup',
  ];

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="sidebar-logo">Vangeen</div>
        <div className="sidebar-label">CAPABILITIES</div>
        <div className="sidebar-item active">💬 AI Research Chat</div>
        <div className="sidebar-item">📊 Financial Analysis</div>
        <div className="sidebar-item">📋 Audit Assistant</div>
        <div className="sidebar-item">📈 Market Data</div>
        <div className="sidebar-item">📁 Document Analysis</div>
        <div className="sidebar-bottom">
          <div className="sidebar-item" onClick={logout}>🚪 Sign Out</div>
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-topbar">
          <div className="chat-topbar-title">AI Research Chat</div>
          <div className="chat-badge">Groq • Llama 3.3 70B</div>
        </div>

        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'assistant' ? 'V' : 'U'}
              </div>
              <div className="message-content">{msg.content}</div>
            </div>
          ))}
          {loading && (
            <div className="message assistant">
              <div className="message-avatar">V</div>
              <div className="message-content typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length === 1 && (
          <div className="suggestions">
            {suggestions.map((s, i) => (
              <div key={i} className="suggestion-chip" onClick={() => setInput(s)}>
                {s}
              </div>
            ))}
          </div>
        )}

        <div className="chat-input-area">
          <textarea
            className="chat-input"
            placeholder="Ask anything about finance, accounting, auditing..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button className="send-btn" onClick={handleSend} disabled={loading}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;