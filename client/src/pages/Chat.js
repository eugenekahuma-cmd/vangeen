import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import './Chat.css';

const API_URL = "https://vangeen-backend.onrender.com/chat";

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const token = localStorage.getItem("token");

    // HARD GUARD (backend requires JWT)
    if (!token) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Authentication required. Please log in again." }
      ]);
      return;
    }

    const userMessage = { role: "user", content: trimmed };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        API_URL,
        {
          message: trimmed,
          history: updatedMessages
        },
        {
          timeout: 20000,
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const reply = response?.data?.reply;

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: reply || "Empty response from backend"
        }
      ]);

    } catch (error) {
      console.error("Chat error:", error);

      let errorMessage = "Unexpected backend failure";

      if (error.response) {
        errorMessage = error.response.data?.error || errorMessage;

        // TOKEN EXPIRED / INVALID HANDLING
        if (error.response.status === 401) {
          localStorage.removeItem("token");
          errorMessage = "Session expired. Please log in again.";
        }

      } else if (error.request) {
        errorMessage = "Server unreachable (network or timeout)";
      }

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: errorMessage }
      ]);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <Sidebar user={{ name: "User", plan: "Free" }} history={[]} />

      <div className="chat-main">
        <div className="chat-topbar">
          <div className="chat-topbar-title">Chat</div>
          <div className="chat-badge">Beta</div>
        </div>

        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === "user" ? "U" : "A"}
              </div>
              <div className="message-content">
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="typing">
              <span></span><span></span><span></span>
            </div>
          )}
        </div>

        <div className="chat-input-area">
          <textarea
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <button
            className="send-btn"
            onClick={handleSend}
            disabled={loading}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;