// src/entities/NotificationPanel.js
import React, { useEffect, useState, useRef } from "react";
import { authFetch } from "../utils/api";

export default function NotificationPanel({ onNotificationClick }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Fetch notifications list
  const fetchNotifications = async () => {
    setLoading(true);
    const res = await authFetch("/api/notifications/");
    if (res.ok) setNotifications(await res.json());
    setLoading(false);
  };

  // Mark single notification as read
  const markAsRead = async (e, id) => {
    e.stopPropagation();
    await authFetch(`/api/notifications/${id}/`, { method: "PATCH", body: JSON.stringify({ read: true }) });
    fetchNotifications();
  };

  // Mark all notifications read
  const markAllRead = async () => {
    await authFetch("/api/notifications/mark_all_read/", { method: "POST" });
    fetchNotifications();
  };

  useEffect(() => { fetchNotifications(); }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <div style={{ position: "relative", display: "inline-block" }} ref={dropdownRef}>
        <button
          onClick={() => setOpen(prev => !prev)}
          style={{ background: "#fff", border: "1px solid #3182ce", borderRadius: 4, padding: "6px 12px", cursor: "pointer" }}
        >
          Notifications{unreadCount > 0 && ` (${unreadCount})`}
        </button>
        {open && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              width: 300,
              maxHeight: "60vh",
              overflowY: "auto",
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 4,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              zIndex: 1000,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", background: "#f7fafc", padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ fontWeight: 600, fontSize: 15, color: "#2a4365" }}>Notifications</span>
              <button onClick={fetchNotifications} style={{ marginLeft: "auto", background: "transparent", border: "none", cursor: "pointer", color: "#3182ce", fontSize: 12 }}>Refresh</button>
              <button onClick={markAllRead} style={{ marginLeft: 8, background: "transparent", border: "none", cursor: "pointer", color: "#2f855a", fontSize: 12 }}>Mark All</button>
            </div>
            {/* Content */}
            {loading ? (
              <div style={{ padding: 12, fontSize: 14, color: "#888" }}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: 12, fontSize: 14, color: "#bbb", textAlign: "center" }}>No notifications.</div>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {notifications.map(n => (
                  <li
                    key={n.id}
                    onClick={() => onNotificationClick && onNotificationClick(n)}
                    style={{
                      padding: "8px 12px",
                      borderBottom: "1px solid #e2e8f0",
                      background: n.read ? "#fff" : "#e3f2fd",
                      cursor: onNotificationClick ? "pointer" : "default",
                      position: "relative",
                      transition: 'background 0.2s',
                    }}
                    onMouseDown={e => e.currentTarget.style.background = '#bee3f8'}
                    onMouseUp={e => e.currentTarget.style.background = n.read ? '#fff' : '#e3f2fd'}
                    onMouseLeave={e => e.currentTarget.style.background = n.read ? '#fff' : '#e3f2fd'}
                  >
                    <div style={{ fontWeight: n.read ? 400 : 700, fontSize: 14, color: "#2a4365" }}>{n.message}</div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{new Date(n.timestamp).toLocaleString()}</div>
                    {!n.read && (
                      <button
                        onClick={e => markAsRead(e, n.id)}
                        style={{ position: "absolute", top: 8, right: 8, fontSize: 11, background: "#3182ce", color: "#fff", border: "none", borderRadius: 4, padding: "2px 6px", cursor: "pointer" }}
                      >
                        Mark
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      {/* Footer removed from NotificationPanel to avoid duplicate branding in dropdown */}
    </>
  );
}
