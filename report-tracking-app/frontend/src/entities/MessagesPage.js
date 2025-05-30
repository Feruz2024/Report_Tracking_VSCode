import React, { useEffect, useState, useRef } from "react";
import { authFetch } from "../utils/api";

// Shows a two-column messaging UI for analysts

export default function MessagesPage({ username, role }) {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [recipientId, setRecipientId] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const messagesEndRef = useRef(null);

  // Fetch threads
  useEffect(() => {
    setLoading(true);
    authFetch("/api/messages/threads/")
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setThreads(data);
        if (data.length > 0 && !selectedThread) setSelectedThread(data[0]);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // selectedThread intentionally omitted to avoid infinite loop

  // Fetch all users for recipient selection
  useEffect(() => {
    authFetch("/api/users/")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setAllUsers(Array.isArray(data) ? data.filter(u => u.is_active) : []))
      .catch(() => setAllUsers([]));
  }, []);

  // Fetch messages for selected thread (filter by both participants)
  useEffect(() => {
    if (!selectedThread) return;
    setRecipientId(selectedThread.recipientId);
    setLoading(true);
    // participants_filter: "<currentUserId>,<recipientId>"
    const currentUserId = allUsers.find(u => u.username === username)?.id;
    const participants = currentUserId && selectedThread.recipientId ? `${currentUserId},${selectedThread.recipientId}` : "";
    const url = `/api/messages/?context=${selectedThread.contextId}${participants ? `&participants_filter=${participants}` : ''}`;
    authFetch(url)
      .then(res => res.ok ? res.json() : [])
      .then(data => setMessages(data))
      .finally(() => setLoading(false));
  }, [selectedThread, allUsers, username]);

  useEffect(() => {
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
      body: JSON.stringify({ recipient: recipientId, context: selectedThread ? selectedThread.contextId : "dashboard", content }),
    });
    if (res.ok) {
      setContent("");
      setConfirmation("Message sent successfully.");
      // Fetch only messages between current user and recipient in this context
      const currentUserId = allUsers.find(u => u.username === username)?.id;
      const participants = currentUserId && recipientId ? `${currentUserId},${recipientId}` : "";
      const url = `/api/messages/?context=${selectedThread ? selectedThread.contextId : "dashboard"}${participants ? `&participants_filter=${participants}` : ''}`;
      await authFetch(url)
        .then(res => res.ok ? res.json() : [])
        .then(data => setMessages(data));
      setTimeout(() => setConfirmation(""), 2500);
    } else {
      setConfirmation("Failed to send message.");
      setTimeout(() => setConfirmation(""), 2500);
    }
    setSending(false);
  }

  // Role-based color and header
  let headerColor = '#2a4365';
  let headerBg = '#e2e8f0';
  let headerText = 'Messages';
  if (role === 'admin') {
    headerColor = '#b83280';
    headerBg = '#fbeffb';
    headerText = 'Admin Messages';
  } else if (role === 'manager') {
    headerColor = '#22543d';
    headerBg = '#e6fffa';
    headerText = 'Manager Messages';
  }

  return (
    <>
      <div style={{ display: 'flex', height: '75vh', minWidth: 900, background: '#f7fafc', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {/* Left: Thread list */}
        <div style={{ width: 280, background: '#fff', borderRight: '2px solid #e2e8f0', overflowY: 'auto' }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#2a4365', padding: '18px 16px', borderBottom: '1px solid #e2e8f0' }}>Conversations</div>
          {loading ? <div style={{ padding: 16, color: '#888' }}>Loading...</div> : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {threads.map(thread => (
                <li key={thread.id} style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid #f1f5f9',
                  background: selectedThread && selectedThread.id === thread.id ? '#e3f2fd' : 'none',
                  cursor: 'pointer',
                  fontWeight: selectedThread && selectedThread.id === thread.id ? 700 : 500,
                  color: '#2a4365',
                }}
                  onClick={() => setSelectedThread(thread)}
                >
                  {thread.title || thread.recipientName || `User ${thread.recipientId}`}
                </li>
              ))}
              {threads.length === 0 && <li style={{ color: '#bbb', padding: 16 }}>No conversations.</li>}
            </ul>
          )}
        </div>
        {/* Right: Message thread */}
        <div style={{ flex: 1, background: '#f8fafc', display: 'flex', flexDirection: 'column', minWidth: 0, maxWidth: '100%' }}>
          {selectedThread ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', background: headerBg, padding: '10px 16px', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ fontWeight: 700, fontSize: 17, color: headerColor }}>{headerText}</span>
                <button onClick={() => setSelectedThread(null)} style={{ marginLeft: 'auto', fontSize: 12, background: headerBg, border: 'none', borderRadius: 6, padding: '2px 10px', cursor: 'pointer', color: headerColor }}>New Message</button>
              </div>
              <div style={{ padding: '8px 16px 0 16px', background: '#f7fafc' }}>
                <label style={{ fontSize: 13, color: '#2a4365', fontWeight: 600 }}>To:&nbsp;</label>
                <select
                  value={recipientId}
                  onChange={e => setRecipientId(e.target.value)}
                  style={{ fontSize: 14, borderRadius: 6, border: '1px solid #cbd5e1', padding: '2px 8px', minWidth: 120 }}
                  disabled={!!selectedThread}
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
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', background: headerBg, padding: '10px 16px', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ fontWeight: 700, fontSize: 17, color: headerColor }}>New Message</span>
              </div>
              <div style={{ padding: '8px 16px 0 16px', background: '#f7fafc' }}>
                <label style={{ fontSize: 13, color: '#2a4365', fontWeight: 600 }}>To:&nbsp;</label>
                <select
                  value={recipientId}
                  onChange={e => setRecipientId(e.target.value)}
                  style={{ fontSize: 14, borderRadius: 6, border: '1px solid #cbd5e1', padding: '2px 8px', minWidth: 120 }}
                >
                  <option value="">Select recipient</option>
                  {allUsers.map(user => (
                    <option key={user.id} value={user.id}>{user.username}</option>
                  ))}
                </select>
              </div>
              <form onSubmit={sendMessage} style={{ borderTop: '1px solid #e2e8f0', padding: '10px 16px', background: '#f7fafc', display: 'flex', flexDirection: 'column', gap: 6, marginTop: 24 }}>
                {confirmation && <div style={{ color: confirmation.includes('success') ? '#38a169' : '#e53e3e', fontWeight: 600, marginBottom: 4 }}>{confirmation}</div>}
                <textarea value={content} onChange={e => setContent(e.target.value)} rows={2} style={{ width: '100%', borderRadius: 6, border: '1px solid #cbd5e1', padding: 6, fontSize: 15, resize: 'none' }} disabled={sending} required placeholder="Type your message..." />
                <button type="submit" disabled={sending || !content.trim() || !recipientId} style={{ alignSelf: 'flex-end', background: '#3182ce', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: sending ? 'not-allowed' : 'pointer' }}>Send</button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
