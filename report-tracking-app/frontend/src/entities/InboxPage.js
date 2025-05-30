import React, { useState } from 'react';
import ConversationList from './ConversationList';
import MessageThreadView from './MessageThreadView';
import './InboxPage.css'; 
import Footer from "./Footer";

const InboxPage = ({ currentUser }) => {
    const [selectedConversation, setSelectedConversation] = useState(null);

    // selectedConversation will be an object like:
    // { otherUserId: '123', contextId: 'campaign:789', otherUsername: 'John Doe' }

    return (
        <>
            <div className="inbox-page">
                <div className="conversation-list-panel">
                    <ConversationList 
                        currentUser={currentUser}
                        onSelectConversation={setSelectedConversation}
                    />
                </div>
                <div className="message-thread-panel">
                    {selectedConversation ? (
                        <MessageThreadView 
                            key={`${selectedConversation.otherUserId}-${selectedConversation.contextId}`}
                            currentUser={currentUser} 
                            otherUserId={selectedConversation.otherUserId}
                            contextId={selectedConversation.contextId}
                            otherUsername={selectedConversation.otherUsername}
                        />
                    ) : (
                        <div className="no-conversation-selected">
                            <p>Select a conversation to view messages or start a new one.</p>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default InboxPage;
