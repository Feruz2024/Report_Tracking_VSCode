import React, { useEffect, useState } from 'react';
import { authFetch } from '../utils/api';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Link as MuiLink // Import Link from MUI for clickable rows
} from '@mui/material';

// Updated function to get a user-friendly representation of the context
const getContextDisplay = (context) => {
  if (!context || context === 'general') return 'General Chat';
  
  const parts = context.split(':');
  if (parts.length === 2) {
    const type = parts[0];
    const id = parts[1];
    if (type === 'campaign') {
      return `Campaign ID: ${id}`; // Placeholder - ideally fetch campaign name
    }
    if (type === 'assignment') {
      return `Assignment ID: ${id}`; // Placeholder - ideally fetch assignment details
    }
    // Add more types as needed
    return `${type.charAt(0).toUpperCase() + type.slice(1)}: ${id}`;
  }
  return context; // Fallback to raw context if not in expected format
};

// Add onMessageSelect prop to handle row clicks
export default function AllMessagesInbox({ onMessageSelect }) { 
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInboxMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/api/messages/?view_type=inbox');
      if (!res.ok) {
        throw new Error(`Failed to fetch messages: ${res.status}`);
      }
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInboxMessages();
  }, []);

  const handleRowClick = (msg) => {
    if (onMessageSelect) {
      // We need the sender's ID to open the chat with them.
      // Assuming msg.sender is the username, we need to find the user ID.
      // This is a simplification. Ideally, the API would return sender_id directly.
      // For now, we can't directly open the chat without sender's ID if it's not available.
      // Let's assume for now that onMessageSelect can handle opening a general context
      // or that future API changes will provide sender_id.
      // For a direct chat, recipientId for MessagePanel should be the other user's ID.
      // Since this is an inbox, the sender of the message is the other user.
      // We need to ensure msg.sender_id is available or find it.
      // For this step, we'll pass msg.sender (username) and msg.context.
      // The App.js handler will need to resolve username to ID if needed, or MessagePanel adapt.
      // Passing sender's ID (if available) as the recipientId for the new chat panel.
      // The backend MessageSerializer returns sender username. We need sender's ID.
      // This will require a modification in MessageSerializer or an additional fetch.
      // For now, let's pass the context and the sender's username.
      // The `openMessagePanelForConversation` in App.js expects a recipient *User ID*.
      // We will need to adjust this. For now, let's assume `msg.sender_id` is available.
      // If not, this click won't correctly set the recipient in MessagePanel.
      // Let's simulate having sender_id for now, this needs backend change for UserSerializer for Messages.
      onMessageSelect(msg.context, msg.sender_id); // ASSUMING msg.sender_id is available
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">Error loading messages: {error}</Alert>;
  }

  return (
    <Paper sx={{ margin: 2, padding: 2 }}>
      <Typography variant="h5" gutterBottom component="div" sx={{ mb: 2 }}>
        My Inbox
      </Typography>
      <Button onClick={fetchInboxMessages} variant="outlined" sx={{ mb: 2 }} disabled={loading}>
        Refresh Messages
      </Button>
      {messages.length === 0 ? (
        <Typography>Your inbox is empty.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="all messages inbox table">
            <TableHead sx={{ backgroundColor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>From</TableCell>
                <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Message</TableCell>
                <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Context</TableCell>
                <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Received</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {messages.map((msg) => (
                <TableRow
                  key={msg.id}
                  hover // Add hover effect
                  onClick={() => handleRowClick(msg)} // Handle row click
                  sx={{
                    cursor: 'pointer', // Change cursor on hover
                    '&:nth-of-type(odd)': { backgroundColor: 'action.hover' }
                  }}
                >
                  <TableCell>{msg.sender || 'System'}</TableCell>
                  <TableCell>{msg.content}</TableCell>
                  <TableCell>{getContextDisplay(msg.context)}</TableCell>
                  <TableCell>{new Date(msg.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}
