import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchMessages, sendMessage, fetchUsers } from '../utils/api'; // Assuming api.js utility
import './MessageThreadView.css'; // We'll create this for styling

function MessageThreadView({ currentUser, otherUserId, contextId, otherUsername }) {
    const [messages, setMessages] = useState([]);
    const [newMessageContent, setNewMessageContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null); // To scroll to the bottom

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadMessages = useCallback(async () => {
        if (!currentUser || !currentUser.id || !otherUserId) {
            // Not enough info to load messages, or it's a general/new chat not yet defined by a recipient
            setMessages([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // Construct a query param that helps backend identify the two users in the conversation
            // This might need adjustment based on your backend API capabilities
            const participants = `${currentUser.id},${otherUserId}`;
            const fetchedMessages = await fetchMessages({ 
                context_id: contextId, 
                participants_filter: participants 
            });
            
            // Backend should already filter by participants and context_id correctly.
            // The client-side filter below is now redundant if backend is working as expected,
            // but can be kept as a safeguard or removed.
            // For now, let's assume backend handles it and we receive pre-filtered messages.
            // const filteredMessages = fetchedMessages.filter(msg => 
            //     msg.context_id === contextId &&
            //     ((msg.sender_id === currentUser.id && msg.recipient_id === otherUserId) || 
            //      (msg.sender_id === otherUserId && msg.recipient_id === currentUser.id))
            // );
            // setMessages(filteredMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
            
            setMessages(fetchedMessages); // Assuming backend sends them sorted and filtered
            setError(null);
        } catch (err) {
            console.error("Failed to fetch messages for thread:", err);
            setError('Failed to load messages.');
        } finally {
            setLoading(false);
        }
    }, [currentUser, otherUserId, contextId]);

    useEffect(() => {
        loadMessages();
        // Optional: Set up polling for new messages in this specific thread
        // const intervalId = setInterval(loadMessages, 5000); // Refresh every 5 seconds
        // return () => clearInterval(intervalId);
    }, [loadMessages]); // Rerun when conversation identifiers change

    useEffect(() => {
        scrollToBottom();
    }, [messages]); // Scroll when messages update

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessageContent.trim() || !currentUser || !currentUser.id || !otherUserId) return;

        try {
            const messageData = {
                recipient_id: otherUserId,
                content: newMessageContent,
                context_id: contextId, // Ensure contextId is included
            };
            const sentMessage = await sendMessage(messageData);
            setMessages(prevMessages => [...prevMessages, sentMessage]);
            setNewMessageContent("");
            // Optionally, trigger a refresh of the conversation list if a new message might change its order/summary
        } catch (err) {
            console.error("Failed to send message:", err);
            setError('Failed to send message. Please try again.');
        }
    };

    if (loading) return <div className="message-thread-loading">Loading messages...</div>;
    if (error) return <div className="message-thread-error">Error: {error}</div>;

    const getContextDisplay = () => {
        if (!contextId || contextId === 'general') return 'General Chat';
        if (contextId.startsWith('campaign:')) return `Campaign: ${contextId.split(':')[1]}`;
        return `Context: ${contextId}`;
    };

    return (
        <div className="message-thread-view">
            <div className="thread-header">
                <h4>Chat with {otherUsername || `User ${otherUserId}`}</h4>
                <p className="thread-context">{getContextDisplay()}</p>
            </div>
            <div className="messages-list">
                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`message-item ${msg.sender_id === currentUser.id ? 'sent' : 'received'}`}
                    >
                        <div className="message-content">{msg.content}</div>
                        <div className="message-timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} /> {/* For scrolling to bottom */}
            </div>
            <form onSubmit={handleSendMessage} className="message-input-form">
                <input 
                    type="text" 
                    value={newMessageContent}
                    onChange={(e) => setNewMessageContent(e.target.value)}
                    placeholder="Type your message..."
                    disabled={!otherUserId} // Disable if no recipient (e.g. before a conversation is selected)
                />
                <button type="submit" disabled={!newMessageContent.trim() || !otherUserId}>
                    Send
                </button>
            </form>
        </div>
    );
}

export default MessageThreadView;
