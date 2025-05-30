import React, { useRef, useState, useEffect } from "react";
import NotificationPanel from "./entities/NotificationPanel";
import MessagePanel from "./entities/MessagePanel";
import LoginForm from "./entities/LoginForm";
import RegisterForm from "./entities/RegisterForm";
import "./App.css";
import CampaignForm from "./entities/CampaignForm";
import CampaignList from "./entities/CampaignList";
import EntitiesTab from "./entities/EntitiesTab";
import AssignmentForm from "./entities/AssignmentForm";
import AssignmentList from "./entities/AssignmentList";
import DashboardSummary from "./entities/DashboardSummary";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import AnalystDashboard from "./entities/AnalystDashboard";
import CampaignDetail from "./entities/CampaignDetail";
import AccountantCampaignList from "./entities/AccountantCampaignList";
import AccountantDashboardSummary from "./entities/AccountantDashboardSummary";
import InboxPage from "./entities/InboxPage";

function App() {
  const listRef = useRef();
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [activeTab, setActiveTab] = React.useState(() => localStorage.getItem("activeTab") || "dashboard");
  
  // State for MessagePanel props when navigating from Inbox
  const [messagePanelContext, setMessagePanelContext] = useState({ contextId: "general", recipientId: null });

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  const handleLogin = (token, username, role, userId) => { // Added userId
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("role", role);
    if (userId) { // Store userId if provided
      localStorage.setItem("userId", userId);
    }
  };
  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("userId"); // Remove userId on logout
    setActiveTab("dashboard"); // Reset to dashboard on logout
    setMessagePanelContext({ contextId: "general", recipientId: null }); // Reset message panel context
  };

  // If not authenticated, show login only (no register)
  if (!token) {
    return (
      <div className="App">
        <LoginForm onLogin={(token, username, role, userId) => {
          localStorage.setItem("token", token);
          localStorage.setItem("username", username);
          localStorage.setItem("role", role);
          if (userId) localStorage.setItem("userId", userId);
          window.location.reload();
        }} />
      </div>
    );
  }

  // Derive role, username, and userId after login
  const role = localStorage.getItem("role") || "manager";
  const username = localStorage.getItem("username") || "";
  const userIdFromStorage = localStorage.getItem("userId");
  const currentUser = { username, role, id: userIdFromStorage ? parseInt(userIdFromStorage, 10) : null };

  // Function to open MessagePanel for a specific conversation
  const openMessagePanelForConversation = (contextId, recipientUserId) => {
    setMessagePanelContext({ contextId: contextId || "general", recipientId: recipientUserId });
    setActiveTab("messages");
  };

  // Function to trigger refresh in ClientList
  const refreshClients = () => {
    if (listRef.current && listRef.current.reload) {
      listRef.current.reload();
    }
  };

  // Define tabs based on role
  let availableTabs = [];
  if (role === "manager") {
    availableTabs = [
      { key: "dashboard", label: "Dashboard" },
      { key: "entities", label: "Entities" },
      { key: "campaigns", label: "Campaigns" },
      { key: "assignments", label: "Assignments" },
      { key: "inbox", label: "Inbox" },
    ];
  } else if (role === "analyst") {
    availableTabs = [
      { key: "dashboard", label: "Dashboard" },
      { key: "assignments", label: "My Assignments" },
      { key: "inbox", label: "Inbox" },
    ];
  } else if (role === "accountant") {
    availableTabs = [
      { key: "dashboard", label: "Dashboard" },
      { key: "campaigns", label: "Campaign Summary" },
      { key: "inbox", label: "Inbox" },
    ];
  } else if (role === "admin") {
    availableTabs = [
      { key: "dashboard", label: "Dashboard" },
      { key: "entities", label: "Manage Users & Entities" },
      { key: "campaigns", label: "Campaigns" },
      { key: "assignments", label: "Assignments" },
      { key: "inbox", label: "Inbox" },
    ];
  }

  // Common UI structure for logged-in users
  return (
    <div className="App" style={{ minHeight: '100vh', paddingTop: '80px', paddingRight: '360px', background: 'linear-gradient(120deg, #f0f4f8 0%, #e0e7ef 100%)' }}>
      <div style={{ float: "right", margin: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={() => openMessagePanelForConversation("general", null)} // Open general messages
          style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #3182ce', background: '#fff', color: '#3182ce', fontWeight: 600, cursor: 'pointer' }}
        >
          Messages
        </button>
        <NotificationPanel onNotificationClick={() => setActiveTab('messages')} />
        Logged in as <strong>{username} ({role})</strong> <button onClick={handleLogout}>Logout</button>
      </div>
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: 32 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {availableTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: 8,
                background: activeTab === tab.key ? '#3182ce' : '#e2e8f0',
                color: activeTab === tab.key ? '#fff' : '#2d3748',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s ease, color 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content based on activeTab and role */}
        {activeTab === "dashboard" && (
          <>
            {role === "manager" && <DashboardSummary />}
            {role === "analyst" && <AnalystDashboard />}
            {role === "accountant" && <AccountantDashboardSummary />}
            {role === "admin" && <DashboardSummary />}
          </>
        )}
        {activeTab === "entities" && (role === "manager" || role === "admin") && <EntitiesTab />}
        {activeTab === "campaigns" && (
          <>
            {(role === "manager" || role === "admin") && <CampaignList />}
            {role === "accountant" && <AccountantCampaignList />}
          </>
        )}
        {activeTab === "assignments" && (role === "manager" || role === "admin" || role === "analyst") && (
          <AssignmentList />
        )}
        {activeTab === "inbox" && 
          <InboxPage currentUser={currentUser} /> // Render InboxPage
        } {/* Render Inbox for all roles when tab is active, pass handler */}

        {/* MessagePanel overlay - shown when activeTab is 'messages' */}
        {activeTab === "messages" && (
          <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 1000 }}>
            <MessagePanel 
              key={`${messagePanelContext.contextId}-${messagePanelContext.recipientId}`} // Force re-render if context/recipient changes
              contextId={messagePanelContext.contextId} 
              recipientId={messagePanelContext.recipientId} 
            />
          </div>
        )}

        {/* Forms might be part of specific views or modals, example for manager */}
        {role === "manager" && activeTab === "campaigns" && (
          <div style={{ marginTop: 24, padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <CampaignForm onCampaignCreated={refreshClients} />
          </div>
        )}
        {role === "manager" && activeTab === "assignments" && (
          <div style={{ marginTop: 24, padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <AssignmentForm />
          </div>
        )}
      </div>
    </div>
  );

  // Original role-specific UI blocks are now integrated into the common structure above
  // The following blocks can be removed or further refactored if all UI is covered by the new structure.

  // Analyst UI
  if (role === "analyst") {
    return (
      <div className="App">
        <div style={{ float: "right" }}>
          Logged in as <strong>{username}</strong> <button onClick={handleLogout}>Logout</button>
        </div>
        <nav style={{ marginBottom: 20, display: 'flex', gap: 16 }}>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/assignments">Active Assignments</Link>
          <Link to="/notifications">Notifications</Link>
          <Link to="/messages">Messages</Link>
        </nav>
        <Routes>
          <Route path="/dashboard" element={<AnalystDashboard username={username} />} />
          <Route path="/assignments" element={<React.Suspense fallback={<div>Loading assignments...</div>}><AssignmentList analystView={true} username={username} /></React.Suspense>} />
          <Route path="/campaign/:id" element={<CampaignDetail username={username} />} />
          <Route path="/notifications" element={<NotificationPanel />} />
          <Route path="/messages" element={<MessagePanel contextId="dashboard" recipientId="" />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    );
  }

  // Accountant UI
  if (role === "accountant") {
    return (
      <div className="App" style={{ minHeight: '100vh', paddingTop: '80px', paddingRight: '360px', background: 'linear-gradient(120deg, #f0f4f8 0%, #e0e7ef 100%)' }}>
        <div style={{ float: "right", margin: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => setActiveTab('messages')}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #3182ce', background: '#fff', color: '#3182ce', fontWeight: 600, cursor: 'pointer' }}
          >
            Messages
          </button>
          <NotificationPanel onNotificationClick={() => setActiveTab('messages')} />
          Logged in as <strong>{username}</strong> <button onClick={handleLogout}>Logout</button>
        </div>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: 32 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {[
              { key: "dashboard", label: "Dashboard" },
              { key: "campaign_summary", label: "Campaign Details" },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: activeTab === tab.key ? '2px solid #3182ce' : '1px solid #cbd5e1',
                  background: activeTab === tab.key ? '#ebf8ff' : '#fff',
                  color: activeTab === tab.key ? '#2b6cb0' : '#2a4365',
                  fontWeight: activeTab === tab.key ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: activeTab === tab.key ? '0 2px 8px rgba(49,130,206,0.08)' : 'none',
                  outline: 'none',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 32, border: '1px solid #e3e8ee', minHeight: 400, maxWidth: 1500, margin: '0 auto', position: 'relative' }}>
            {activeTab === "dashboard" && (
              <AccountantDashboardSummary onNavigateTab={setActiveTab} />
            )}
            {activeTab === "campaign_summary" && (
              <>
                <AccountantCampaignList />
              </>
            )}
            {activeTab === "messages" && (
              <>
                <h1 style={{ color: '#2a4365' }}>Messages</h1>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                  <MessagePanel /> 
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Admin UI (Placeholder - to be expanded)
  if (role === "admin") {
    return (
      <div className="App" style={{ minHeight: '100vh', paddingTop: '80px', paddingRight: '360px', background: 'linear-gradient(120deg, #f0f4f8 0%, #e0e7ef 100%)' }}>
        <div style={{ float: "right", margin: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => setActiveTab('messages')}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #3182ce', background: '#fff', color: '#3182ce', fontWeight: 600, cursor: 'pointer' }}
          >
            Messages
          </button>
          <NotificationPanel onNotificationClick={() => setActiveTab('messages')} />
          Logged in as <strong>{username}</strong> <button onClick={handleLogout}>Logout</button>
        </div>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: 32 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {[
              { key: "dashboard", label: "Dashboard" },
              { key: "entities", label: "Entities" },
              { key: "campaigns", label: "Campaigns" },
              { key: "assignments", label: "Assignments" },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: activeTab === tab.key ? '2px solid #3182ce' : '1px solid #cbd5e1',
                  background: activeTab === tab.key ? '#ebf8ff' : '#fff',
                  color: activeTab === tab.key ? '#2b6cb0' : '#2a4365',
                  fontWeight: activeTab === tab.key ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: activeTab === tab.key ? '0 2px 8px rgba(49,130,206,0.08)' : 'none',
                  outline: 'none',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 32, border: '1px solid #e3e8ee', minHeight: 400, maxWidth: 1500, margin: '0 auto', position: 'relative' }}>
            {activeTab === "dashboard" && <DashboardSummary onNavigateTab={(tab, tabIndex) => {
              setActiveTab(tab);
            }} />}
            {activeTab === "entities" && <><h1 style={{ color: '#2a4365' }}>Entities Management</h1><React.Suspense fallback={<div>Loading entities...</div>}><EntitiesTab /></React.Suspense></>}
            {/* Use the exact manager portal implementation for both admin and manager in the campaigns tab */}
            {role === "admin activeTab === "campaigns" && (
              <div style={{ marginTop: 24, padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <CampaignFormAdmincampaigncreated==refreshClients/>
                <CampaignList />
              </div>
            )}
            
        {role === "admin" && activeTab === "assignments" && (
          <div style={{ marginTop: 24, padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <AssignmentForm />
          </div>
            )}
            {activeTab === "messages" && <>
              <h1 style={{ color: '#2a4365' }}>Messages</h1>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                <MessagePanel contextId={"assignment"} recipientId={2} />
              </div>
            </>}
          </div>
        </div>
      </div>
    );
  }

  // Fallback for unknown or unsupported roles
  return <div>No access or unknown role.</div>;
}

export default App;
