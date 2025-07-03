import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { authFetch } from "../utils/api";

const MessageContext = createContext();

export function MessageProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    // Fetch unread messages for the current user
    const res = await authFetch("/api/messages/?unread_only=true");
    if (res.ok) {
      const data = await res.json();
      setUnreadCount(Array.isArray(data) ? data.length : 0);
    } else {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  return (
    <MessageContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </MessageContext.Provider>
  );
}

export function useMessageContext() {
  return useContext(MessageContext);
}
