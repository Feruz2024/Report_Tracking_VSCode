// src/entities/NotificationPanel.js

import React, { useEffect, useState } from "react";
import { authFetch } from "../utils/api";

// Accepts onNotificationClick prop for click-to-open-messagepanel
export default function NotificationPanel({ onNotificationClick }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchNotifications() {
    setLoading(true);
    const res = await authFetch("/api/notifications/");
    if (res.ok) {
      const data = await res.json();
      setNotifications(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchNotifications();
    // Optionally, auto-refresh every 60s
    // const interval = setInterval(fetchNotifications, 60000);
    // return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  async function markAsRead(id) {
    await authFetch(`/api/notifications/${id}/`, {
      method: "PATCH",
      body: JSON.stringify({ read: true }),
    });
    fetchNotifications();
  }

  return (
    <div style={{ minWidth: 280, maxWidth: 340, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 0, boxShadow: '0 2px 12px rgba(44,62,80,0.07)', overflow: 'hidden', fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', alignItems: 'center', background: '#f7fafc', padding: '10px 16px', borderBottom: '1px solid #e2e8f0' }}>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#2a4365' }}>Notifications</span>
        {unreadCount > 0 && <span style={{ background: '#3182ce', color: '#fff', borderRadius: 12, padding: '2px 8px', fontSize: 13, marginLeft: 8 }}>{unreadCount}</span>}
        <button onClick={fetchNotifications} style={{ marginLeft: 'auto', fontSize: 12, background: '#e2e8f0', border: 'none', borderRadius: 6, padding: '2px 10px', cursor: 'pointer', color: '#2a4365', marginRight: 8 }}>Refresh</button>
        <button onClick={async () => { await authFetch('/api/notifications/mark_all_read/', { method: 'POST' }); fetchNotifications(); }} style={{ fontSize: 12, background: '#2f855a', border: 'none', borderRadius: 6, padding: '2px 10px', cursor: 'pointer', color: '#fff' }}>Mark All Read</button>
      </div>
      <div style={{ padding: '10px 16px 8px 16px', minHeight: 60 }}>
        {loading ? <div style={{ color: '#888', fontSize: 14 }}>Loading notifications...</div> : (
          <>
            {notifications.length === 0 && <div style={{ color: '#bbb', fontSize: 14, textAlign: 'center', margin: '18px 0' }}>No notifications.</div>}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {notifications.map(n => (
              <li key={n.id} style={{
                  marginBottom: 10,
                  background: n.read ? '#f8fafc' : '#e3f2fd',
                  borderRadius: 8,
                  padding: '10px 12px 8px 12px',
                  position: 'relative',
                  border: n.read ? '1px solid #e2e8f0' : '1.5px solid #3182ce',
                  boxShadow: n.read ? 'none' : '0 2px 8px rgba(49,130,206,0.07)'
                }}>
                  <div
                    style={{ fontWeight: n.read ? 400 : 700, color: n.read ? '#2a4365' : '#174ea6', fontSize: 15, cursor: onNotificationClick ? 'pointer' : 'default' }}
                    onClick={onNotificationClick}
                    title={onNotificationClick ? 'Open messages' : undefined}
                  >
                    {n.message}
                  </div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{new Date(n.timestamp).toLocaleString()}</div>
                  {n.link && <a href={n.link} style={{ fontSize: 12, color: '#3182ce', textDecoration: 'underline' }}>View</a>}
                  {!n.read && (
                    <button onClick={() => markAsRead(n.id)} style={{ position: 'absolute', right: 12, top: 10, fontSize: 11, background: '#3182ce', color: '#fff', border: 'none', borderRadius: 5, padding: '2px 8px', cursor: 'pointer' }}>Mark as read</button>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
