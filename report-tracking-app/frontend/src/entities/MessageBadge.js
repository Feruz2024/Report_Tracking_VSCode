import React, { useEffect, useState } from "react";
import { authFetch } from "../utils/api";

// Simple badge for unread messages
export default function MessageBadge({ username }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchUnread() {
      // Fetch all messages for the user, filter unread
      const res = await authFetch("/api/messages/?unread_only=true");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(Array.isArray(data) ? data.length : 0);
      } else {
        setUnreadCount(0);
      }
    }
    fetchUnread();
    // Optionally poll every 60s
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [username]);

  if (unreadCount === 0) return null;
  return (
    <span style={{
      background: '#e53e3e',
      color: '#fff',
      borderRadius: '50%',
      padding: '2px 8px',
      fontSize: 13,
      fontWeight: 700,
      marginLeft: 6,
      verticalAlign: 'middle',
      minWidth: 22,
      display: 'inline-block',
      textAlign: 'center',
      boxShadow: '0 1px 4px rgba(229,62,62,0.15)'
    }}>
      {unreadCount}
    </span>
  );
}
