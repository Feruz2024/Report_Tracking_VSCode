// src/entities/MessagePanel.js


import React, { useEffect, useState, useRef } from "react";
import { authFetch } from "../utils/api";

export default function MessagePanel({ contextId, recipientId: initialRecipientId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [allUsers, setAllUsers] = useState([]); // State to hold all users for recipient list
  const [recipientId, setRecipientId] = useState(initialRecipientId || "");
  const [confirmation, setConfirmation] = useState("");
  const messagesEndRef = useRef(null);
  const [showNewMessageAlert, setShowNewMessageAlert] = useState(false); // For new message visual cue
  const initialLoadCompletedForCurrentContext = useRef(false); // Track initial load for current context

  async function fetchMessages() {
    setLoading(true);
    const res = await authFetch(`/api/messages/?context=${contextId}`);
    if (res.ok) {
      const newData = await res.json();

      if (initialLoadCompletedForCurrentContext.current) { // Only act if not the initial load for this context
        let newMessagesActuallyAdded = false;
        if (newData.length > 0) { // Only if new data is not empty
          const currentMessageIds = new Set(messages.map(m => m.id));
          for (const newMessage of newData) {
            if (!currentMessageIds.has(newMessage.id)) {
              newMessagesActuallyAdded = true;
              break;
            }
          }
        }
        // Consider if the list was non-empty and became empty, or if messages were removed
        const significantChange = newMessagesActuallyAdded || 
                                (messages.length > 0 && newData.length === 0) || 
                                (newData.length < messages.length && messages.length > 0 && !newMessagesActuallyAdded);

        if (significantChange) {
          setShowNewMessageAlert(true);
          setTimeout(() => setShowNewMessageAlert(false), 3500); // Show alert for 3.5 seconds
        }
      }
      setMessages(newData); // Update the state
    }
    setLoading(false);
    if (!initialLoadCompletedForCurrentContext.current) {
      initialLoadCompletedForCurrentContext.current = true;
    }
  }

  useEffect(() => {
    initialLoadCompletedForCurrentContext.current = false; // Reset for new context/recipient
    fetchMessages();
    // Optionally, auto-refresh every 60s
    // const interval = setInterval(fetchMessages, 60000);
    // return () => clearInterval(interval);
  }, [contextId, recipientId]);

  // Fetch all users for recipient selection
  useEffect(() => {
    authFetch("/api/users/") // Fetch all users
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setAllUsers(Array.isArray(data) ? data.filter(u => u.is_active) : [])) // Filter for active users
      .catch(() => setAllUsers([]));
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
      // Optimistically add the sent message to the UI immediately
      const now = new Date();
      setMessages(prev => [
        ...prev,
        {
          id: `temp-${now.getTime()}`,
          sender: "Me", // Optionally use current user name if available
          content,
          timestamp: now.toISOString(),
        },
      ]);
      await fetchMessages(); // Still fetch to sync with server
      setTimeout(() => setConfirmation(""), 2500);
    } else {
      setConfirmation("Failed to send message.");
      setTimeout(() => setConfirmation(""), 2500);
    }
    setSending(false);
  }

  return (
    <div style={{ position: 'relative', zIndex: 1000, minWidth: 280, maxWidth: 340, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 0, boxShadow: '0 2px 12px rgba(44,62,80,0.07)', overflow: 'hidden', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', height: 400 }}>
      <div style={{ display: 'flex', alignItems: 'center', background: '#f7fafc', padding: '10px 16px', borderBottom: '1px solid #e2e8f0' }}>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#2a4365' }}>Messages</span>
        {showNewMessageAlert && <span style={{ marginLeft: '10px', color: '#38a169', fontSize: '13px', fontWeight: '600' }}>New messages!</span>}
        <button onClick={fetchMessages} style={{ marginLeft: 'auto', fontSize: 12, background: '#e2e8f0', border: 'none', borderRadius: 6, padding: '2px 10px', cursor: 'pointer', color: '#2a4365' }}>Refresh</button>
      </div>
      {/* Recipient selector for manager */}
      <div style={{ padding: '8px 16px 0 16px', background: '#f7fafc' }}>
        <label style={{ fontSize: 13, color: '#2a4365', fontWeight: 600 }}>To:&nbsp;</label>
        <select
          value={recipientId}
          onChange={e => setRecipientId(e.target.value)}
          style={{ fontSize: 14, borderRadius: 6, border: '1px solid #cbd5e1', padding: '2px 8px', minWidth: 120 }}
          disabled={!!initialRecipientId}
        >
          <option value="">Select recipient</option>
          {allUsers.map(user => (
            <option key={user.id} value={user.id}>{user.username}</option>
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
