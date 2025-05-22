// src/entities/MessagePanel.js


import React, { useEffect, useState, useRef } from "react";
import { authFetch } from "../utils/api";

export default function MessagePanel({ contextId, recipientId: initialRecipientId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [analysts, setAnalysts] = useState([]);
  const [recipientId, setRecipientId] = useState(initialRecipientId || "");
  const [confirmation, setConfirmation] = useState("");
  const messagesEndRef = useRef(null);

  async function fetchMessages() {
    setLoading(true);
    const res = await authFetch(`/api/messages/?context=${contextId}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchMessages();
    // Optionally, auto-refresh every 60s
    // const interval = setInterval(fetchMessages, 60000);
    // return () => clearInterval(interval);
  }, [contextId, recipientId]);

  // Fetch analysts for manager recipient selection
  useEffect(() => {
    authFetch("/api/analysts/")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setAnalysts(Array.isArray(data) ? data : []))
      .catch(() => setAnalysts([]));
  }, []);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!recipientId) return;
    setSending(true);
    setConfirmation("");
    const res = await authFetch("/api/messages/", {
      method: "POST",
      body: JSON.stringify({ recipient: recipientId, context: contextId, content }),
    });
    if (res.ok) {
      setContent("");
      setConfirmation("Message sent successfully.");
      await fetchMessages(); // Refresh after send
      setTimeout(() => setConfirmation(""), 2500);
    } else {
      setConfirmation("Failed to send message.");
      setTimeout(() => setConfirmation(""), 2500);
    }
    setSending(false);
  }

  return (
    <div style={{ minWidth: 280, maxWidth: 340, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 0, boxShadow: '0 2px 12px rgba(44,62,80,0.07)', overflow: 'hidden', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', height: 400 }}>
      <div style={{ display: 'flex', alignItems: 'center', background: '#f7fafc', padding: '10px 16px', borderBottom: '1px solid #e2e8f0' }}>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#2a4365' }}>Messages</span>
        <button onClick={fetchMessages} style={{ marginLeft: 'auto', fontSize: 12, background: '#e2e8f0', border: 'none', borderRadius: 6, padding: '2px 10px', cursor: 'pointer', color: '#2a4365' }}>Refresh</button>
      </div>
      {/* Recipient selector for manager */}
      <div style={{ padding: '8px 16px 0 16px', background: '#f7fafc' }}>
        <label style={{ fontSize: 13, color: '#2a4365', fontWeight: 600 }}>To:&nbsp;</label>
        <select
          value={recipientId}
          onChange={e => setRecipientId(e.target.value)}
          style={{ fontSize: 14, borderRadius: 6, border: '1px solid #cbd5e1', padding: '2px 8px', minWidth: 120 }}
        >
          <option value="">Select recipient</option>
          {analysts.map(a => (
            <option key={a.id} value={a.user_id || a.user || a.id}>{a.user}</option>
          ))}
        </select>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px 8px 16px', minHeight: 60 }}>
        {loading ? <div style={{ color: '#888', fontSize: 14 }}>Loading messages...</div> : (
          <>
            {messages.length === 0 && <div style={{ color: '#bbb', fontSize: 14, textAlign: 'center', margin: '18px 0' }}>No messages.</div>}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {messages.map(m => (
                <li key={m.id} style={{
                  marginBottom: 10,
                  background: '#f8fafc',
                  borderRadius: 8,
                  padding: '8px 12px',
                  position: 'relative',
                  border: '1px solid #e2e8f0',
                  boxShadow: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.sender === recipientId ? 'flex-end' : 'flex-start',
                }}>
                  <div style={{ fontWeight: 600, color: '#2a4365', fontSize: 14 }}>{m.sender || `User ${m.sender}`}</div>
                  <div style={{ color: '#222', fontSize: 15, margin: '2px 0 2px 0' }}>{m.content}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{new Date(m.timestamp).toLocaleString()}</div>
                </li>
              ))}
              <div ref={messagesEndRef} />
            </ul>
          </>
        )}
      </div>
      <form onSubmit={sendMessage} style={{ borderTop: '1px solid #e2e8f0', padding: '10px 16px', background: '#f7fafc', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {confirmation && <div style={{ color: confirmation.includes('success') ? '#38a169' : '#e53e3e', fontWeight: 600, marginBottom: 4 }}>{confirmation}</div>}
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={2} style={{ width: '100%', borderRadius: 6, border: '1px solid #cbd5e1', padding: 6, fontSize: 15, resize: 'none' }} disabled={sending} required placeholder="Type your message..." />
        <button type="submit" disabled={sending || !content.trim() || !recipientId} style={{ alignSelf: 'flex-end', background: '#3182ce', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: sending ? 'not-allowed' : 'pointer' }}>Send</button>
      </form>
    </div>
  );
}
