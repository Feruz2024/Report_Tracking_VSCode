import React, { useRef, useState, useEffect } from "react";
import NotificationPanel from "./entities/NotificationPanel";
import MessagePanel from "./entities/MessagePanel";
import LoginForm from "./entities/LoginForm";
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

function App2() {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("activeTab") || "dashboard");
  const [messagePanelContext, setMessagePanelContext] = useState({ contextId: "general", recipientId: null });

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  const handleLogin = (token, username, role, userId) => {
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("role", role);
    if (userId) localStorage.setItem("userId", userId);
  };
  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    setActiveTab("dashboard");
    setMessagePanelContext({ contextId: "general", recipientId: null });
  };

  if (!token) {
    return (
      <div className="App">
        <LoginForm onLogin={handleLogin} />
      </div>
    );
  }

  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");

  // Admin Portal
  if (role === "admin") {
    return (
      <div className="App">
        <div style={{ float: "right", margin: 16 }}>
          Logged in as <strong>{username}</strong> <button onClick={handleLogout}>Logout</button>
        </div>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: 32 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {["dashboard", "entities", "campaigns", "assignments"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: activeTab === tab ? '2px solid #3182ce' : '1px solid #cbd5e1',
                  background: activeTab === tab ? '#ebf8ff' : '#fff',
                  color: activeTab === tab ? '#2b6cb0' : '#2a4365',
                  fontWeight: activeTab === tab ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: activeTab === tab ? '0 2px 8px rgba(49,130,206,0.08)' : 'none',
                  outline: 'none',
                  transition: 'all 0.15s',
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 32, border: '1px solid #e3e8ee', minHeight: 400, maxWidth: 1500, margin: '0 auto', position: 'relative' }}>
            {activeTab === "dashboard" && <DashboardSummary />}
            {activeTab === "entities" && <EntitiesTab />}
            {activeTab === "campaigns" && (
              <div style={{ marginTop: 24, padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <CampaignForm />
                <CampaignList />
              </div>
            )}
            {activeTab === "assignments" && (
              <div style={{ marginTop: 24, padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <AssignmentForm />
                <AssignmentList />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Manager Portal
  if (role === "manager") {
    return (
      <div className="App">
        <div style={{ float: "right", margin: 16 }}>
          Logged in as <strong>{username}</strong> <button onClick={handleLogout}>Logout</button>
        </div>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: 32 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {["dashboard", "entities", "campaigns", "assignments"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: activeTab === tab ? '2px solid #3182ce' : '1px solid #cbd5e1',
                  background: activeTab === tab ? '#ebf8ff' : '#fff',
                  color: activeTab === tab ? '#2b6cb0' : '#2a4365',
                  fontWeight: activeTab === tab ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: activeTab === tab ? '0 2px 8px rgba(49,130,206,0.08)' : 'none',
                  outline: 'none',
                  transition: 'all 0.15s',
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 32, border: '1px solid #e3e8ee', minHeight: 400, maxWidth: 1500, margin: '0 auto', position: 'relative' }}>
            {activeTab === "dashboard" && <DashboardSummary />}
            {activeTab === "entities" && <EntitiesTab />}
            {activeTab === "campaigns" && (
              <div style={{ marginTop: 24, padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <CampaignForm />
                <CampaignList />
              </div>
            )}
            {activeTab === "assignments" && (
              <div style={{ marginTop: 24, padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <AssignmentForm />
                <AssignmentList />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Accountant Portal
  if (role === "accountant") {
    return (
      <div className="App">
        <div style={{ float: "right", margin: 16 }}>
          Logged in as <strong>{username}</strong> <button onClick={handleLogout}>Logout</button>
        </div>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: 32 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {["dashboard", "campaign_summary"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: activeTab === tab ? '2px solid #3182ce' : '1px solid #cbd5e1',
                  background: activeTab === tab ? '#ebf8ff' : '#fff',
                  color: activeTab === tab ? '#2b6cb0' : '#2a4365',
                  fontWeight: activeTab === tab ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: activeTab === tab ? '0 2px 8px rgba(49,130,206,0.08)' : 'none',
                  outline: 'none',
                  transition: 'all 0.15s',
                }}
              >
                {tab === "campaign_summary" ? "Campaign Details" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 32, border: '1px solid #e3e8ee', minHeight: 400, maxWidth: 1500, margin: '0 auto', position: 'relative' }}>
            {activeTab === "dashboard" && <AccountantDashboardSummary />}
            {activeTab === "campaign_summary" && <AccountantCampaignList />}
          </div>
        </div>
      </div>
    );
  }

  // Analyst Portal
  if (role === "analyst") {
    return (
      <div className="App">
        <div style={{ float: "right", margin: 16 }}>
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

  // Fallback
  return <div>No access or unknown role.</div>;
}

export default App2;
