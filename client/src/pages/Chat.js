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
    if (!input.trim()) return;

    const token = localStorage.getItem("token"); // IMPORTANT

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        API_URL,
        {
          message: input,
          history: updatedMessages
        },
        {
          timeout: 20000,
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const reply =
        response.data?.reply ||
        response.data?.result?.reply ||
        "No response from AI.";

      setMessages([
        ...updatedMessages,
        { role: "assistant", content: reply }
      ]);

    } catch (error) {
      console.error(error);

      let errorMessage = "Backend error";

      if (error.response) {
        errorMessage = error.response.data?.error || errorMessage;
      } else if (error.request) {
        errorMessage = "Server unreachable";
      }

      setMessages([
        ...updatedMessages,
        { role: "assistant", content: errorMessage }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <Sidebar user={{ name: "Eugene", plan: "Free" }} history={[]} />

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
              <div className="message-content">{msg.content}</div>
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