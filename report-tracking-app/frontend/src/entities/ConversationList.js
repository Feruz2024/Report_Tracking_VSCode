import React, { useState, useEffect, useCallback } from 'react';
import { fetchMessages, fetchUsers } from '../utils/api'; // Assuming you have this
import './ConversationList.css'; // We'll create this for styling

function ConversationList({ currentUser, onSelectConversation }) {
    const [conversations, setConversations] = useState([]);
    const [users, setUsers] = useState({}); // To map user IDs to usernames
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // DEBUG: Log currentUser
    useEffect(() => {
        console.log('[ConversationList] currentUser:', currentUser);
    }, [currentUser]);

    const loadUsers = useCallback(async () => {
        try {
            const fetchedUsers = await fetchUsers();
            const usersMap = fetchedUsers.reduce((acc, user) => {
                acc[user.id] = user.username;
                return acc;
            }, {});
            setUsers(usersMap);
        } catch (err) {
            console.error("Failed to fetch users:", err);
            // setError('Failed to load user data.'); // Optional: display error for users
        }
    }, []);

    const loadConversations = useCallback(async () => {
        if (!currentUser || !currentUser.id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // Fetch all messages where the current user is either sender or recipient
            const messages = await fetchMessages({ user_messages: currentUser.id });
            console.log('[ConversationList] fetchMessages result:', messages);
            const conversationsMap = new Map();

            messages.forEach(msg => {
                const otherUserId = msg.sender_id === currentUser.id ? msg.recipient_id : msg.sender_id;
                const contextKey = msg.context_id || 'general'; // Use 'general' if no context_id
                const conversationKey = `${otherUserId}-${contextKey}`;

                if (!conversationsMap.has(conversationKey)) {
                    conversationsMap.set(conversationKey, {
                        otherUserId: otherUserId,
                        contextId: contextKey,
                        lastMessage: msg.content,
                        timestamp: msg.timestamp,
                        messageCount: 0,
                        unreadCount: 0, // Placeholder for future unread functionality
                        otherUsername: users[otherUserId] || `User ${otherUserId}` // Fallback username
                    });
                }
                const convo = conversationsMap.get(conversationKey);
                convo.messageCount += 1;
                if (new Date(msg.timestamp) > new Date(convo.timestamp)) {
                    convo.lastMessage = msg.content;
                    convo.timestamp = msg.timestamp;
                }
            });

            // Update usernames after users are loaded
            conversationsMap.forEach(convo => {
                convo.otherUsername = users[convo.otherUserId] || `User ${convo.otherUserId}`;
            });

            setConversations(Array.from(conversationsMap.values()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
            setError(null);
        } catch (err) {
            console.error("Failed to fetch messages for conversations:", err);
            setError('Failed to load conversations.');
        } finally {
            setLoading(false);
        }
    }, [currentUser, users]); // Depend on users to re-process conversations when usernames are available

    useEffect(() => {
        loadUsers().then(() => {
            // Conversations will be loaded by the next effect that depends on 'users'
        });
    }, [loadUsers]);

    useEffect(() => {
        // Load conversations if currentUser.id is available.
        // The loadConversations function itself depends on the `users` state for enrichment,
        // so it will re-run if `users` data changes later.
        if (currentUser && currentUser.id) { 
            loadConversations();
        } else {
            // If there's no current user ID, we are not in a state to load conversations.
            setLoading(false);
        }
        // Optional: Set up polling for new messages
        // const intervalId = setInterval(loadConversations, 30000); // Refresh every 30 seconds
        // return () => clearInterval(intervalId);
    }, [currentUser, users, loadConversations]); // loadConversations will change if `users` changes

    if (loading) return <div className="conversation-list-loading">Loading conversations...</div>;
    if (error) return <div className="conversation-list-error">Error: {error}</div>;
    if (conversations.length === 0) return <div className="conversation-list-empty">No conversations yet.</div>;

    const getContextDisplay = (contextId) => {
        if (!contextId || contextId === 'general') return 'General Chat';
        if (contextId.startsWith('campaign:')) return `Campaign: ${contextId.split(':')[1]}`;
        // Add more context parsers as needed
        return `Context: ${contextId}`;
    };

    return (
        <div className="conversation-list">
            <h3>Conversations</h3>
            <ul>
                {conversations.map((convo, index) => (
                    <li key={index} onClick={() => onSelectConversation(convo)}>
                        <div className="conversation-partner">{convo.otherUsername}</div>
                        <div className="conversation-context">{getContextDisplay(convo.contextId)}</div>
                        <div className="conversation-last-message">
                            {convo.lastMessage.length > 30 ? `${convo.lastMessage.substring(0, 27)}...` : convo.lastMessage}
                        </div>
                        <div className="conversation-timestamp">{new Date(convo.timestamp).toLocaleString()}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ConversationList;
