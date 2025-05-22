import React, { useRef, useState } from "react";
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


function App() {
  const listRef = useRef();
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  // const [username, setUsername] = useState(() => localStorage.getItem("username") || "");
  const [showRegister, setShowRegister] = useState(false);
  // Move activeTab hook to top level to avoid conditional hook call error
  const [activeTab, setActiveTab] = React.useState("dashboard");

  // const handleLogin = (token, username) => {
  //   setToken(token);
  //   setUsername(username);
  //   localStorage.setItem("token", token);
  //   localStorage.setItem("username", username);
  // };
  const handleLogin = (token, username, role) => {
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("role", role);
  };
  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
  };

  // If not authenticated, show login/register
  if (!token) {
    return (
      <div className="App">
        {showRegister ? (
          <RegisterForm onRegister={handleLogin} />
        ) : (
          <LoginForm onLogin={handleLogin} />
        )}
        <button onClick={() => setShowRegister(prev => !prev)} style={{ marginTop: 10 }}>
          {showRegister ? "Back to Login" : "Register"}
        </button>
      </div>
    );
  }

  // Derive role and username after login
  const role = localStorage.getItem("role") || "manager";
  const username = localStorage.getItem("username") || "";

  // Function to trigger refresh in ClientList
  const refreshClients = () => {
    if (listRef.current && listRef.current.reload) {
      listRef.current.reload();
    }
  };


  // Monitoring Manager UI (all-in-one tabbed page)
  if (role === "manager") {
    return (
      <div className="App" style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #f0f4f8 0%, #e0e7ef 100%)' }}>
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
              // Optionally handle tabIndex for EntitiesTab
            }} />}
            {activeTab === "entities" && <><h1 style={{ color: '#2a4365' }}>Entities Management</h1><React.Suspense fallback={<div>Loading entities...</div>}><EntitiesTab /></React.Suspense></>}
            {activeTab === "campaigns" && <><h1 style={{ color: '#2a4365' }}>Campaign Management</h1><CampaignForm /><CampaignList /></>}
            {activeTab === "assignments" && <>
              <h1 style={{ color: '#2a4365' }}>Assignments</h1>
              <AssignmentForm />
              <React.Suspense fallback={<div>Loading assignments...</div>}><AssignmentList /></React.Suspense>
            </>}
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

  // Media Analyst UI
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

  // Fallback for unknown or unsupported roles
  return <div>No access or unknown role.</div>;
}

export default App;
