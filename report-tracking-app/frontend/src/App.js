import React, { useRef, useState, useEffect } from "react";
import { MessageProvider } from "./entities/MessageContext";
import { EntityProvider } from "./entities/EntityContext";
import NotificationPanel from "./entities/NotificationPanel";
import TopNavBar from "./entities/TopNavBar";
import MessageBadge from "./entities/MessageBadge";
import Footer from "./entities/Footer";
import MessagePanel from "./entities/MessagePanel";
import MessagesPage from "./entities/MessagesPage";
import LoginForm from "./entities/LoginForm";
import CampaignForm from "./entities/CampaignForm";
import CampaignList from "./entities/CampaignList";
import CompletedCampaignList from "./entities/CompletedCampaignList";
import EntitiesTab from "./entities/EntitiesTab";
import AssignmentForm from "./entities/AssignmentForm";
import AssignmentList from "./entities/AssignmentList";
import DashboardSummary from "./entities/DashboardSummary";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import EditClientPage from "./EditClientPage";
import EditCampaignPage from "./EditCampaignPage";
import EditStationPage from "./EditStationPage";
import EditUserPage from "./EditUserPage";
import EditAnalystPage from "./EditAnalystPage";
import EditAssignmentPage from "./EditAssignmentPage";
import AnalystDashboard from "./entities/AnalystDashboard";
import CampaignDetail from "./entities/CampaignDetail";
import AccountantCampaignList from "./entities/AccountantCampaignList";
import AccountantDashboardSummary from "./entities/AccountantDashboardSummary";
import InboxPage from "./entities/InboxPage";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

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


  // Dedicated edit popup route: only render EditClientPage, not the full app/tabs
  return (
    <MessageProvider>
      <EntityProvider>
        <Routes>
          <Route path="/edit-client/:id" element={<EditClientPage />} />
          <Route path="/edit-campaign/:id" element={<EditCampaignPage />} />
          <Route path="/edit-station/:id" element={<EditStationPage />} />
          <Route path="/edit-user/:id" element={<EditUserPage />} />
          <Route path="/edit-analyst/:id" element={<EditAnalystPage />} />
          <Route path="/edit-assignment/:id" element={<EditAssignmentPage />} />
          <Route path="/*" element={<MainApp token={token} handleLogin={handleLogin} handleLogout={handleLogout} />} />
        </Routes>
      </EntityProvider>
    </MessageProvider>
  );
}

function MainApp({ token, handleLogin, handleLogout }) {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("activeTab") || "dashboard");
  const [messagePanelContext, setMessagePanelContext] = useState({ contextId: "general", recipientId: null });

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  if (!token) {
    return (
      <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: 0 }}>
          <div style={{ marginTop: '8vh', minWidth: 320, maxWidth: 400, width: '100%' }}>
            <LoginForm onLogin={handleLogin} />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");

  // Admin Portal
  if (role === "admin") {
    return (
      <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopNavBar
          username={username}
          onLogout={handleLogout}
          showNotifications={true}
        >
          {['dashboard', 'entities', 'campaigns', 'assignments', 'messages'].map(tab => (
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
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'messages' && <MessageBadge username={username} />}
            </button>
          ))}
        </TopNavBar>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: 32, flex: 1 }}>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 32, border: '1px solid #e3e8ee', minHeight: 400, maxWidth: 1500, margin: '0 auto', position: 'relative' }}>
            {activeTab === "dashboard" && <DashboardSummary onNavigateTab={setActiveTab} />}
            {activeTab === "entities" && <EntitiesTab />}
            {activeTab === "campaigns" && (
              <div style={{ marginTop: 24, padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <CampaignForm />
                <CampaignTabs />
              </div>
            )}
            {activeTab === "assignments" && (
              <div style={{ marginTop: 24, padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <AssignmentForm />
                <AssignmentList analystView={role === "analyst"} username={username} />
              </div>
            )}
            {activeTab === "messages" && (
              <div style={{ marginTop: 24, padding: 24, background: '#f7fafc', borderRadius: 12, boxShadow: '0 4px 12px rgba(49,130,206,0.08)' }}>
                <MessagesPage username={username} role="admin" />
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Manager Portal
  if (role === "manager") {
    return (
      <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopNavBar
          username={username}
          onLogout={handleLogout}
          showNotifications={true}
        >
          {["dashboard", "entities", "campaigns", "assignments", "messages"].map(tab => (
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
        </TopNavBar>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: 32, flex: 1 }}>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 32, border: '1px solid #e3e8ee', minHeight: 400, maxWidth: 1500, margin: '0 auto', position: 'relative' }}>
            {activeTab === "dashboard" && <DashboardSummary onNavigateTab={setActiveTab} />}
            {activeTab === "entities" && <EntitiesTab />}
            {activeTab === "campaigns" && (
              <div style={{ marginTop: 24, padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <CampaignForm />
                <CampaignTabs />
              </div>
            )}
            {activeTab === "assignments" && (
              <div style={{ marginTop: 24, padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <AssignmentForm />
                <AssignmentList analystView={role === "analyst"} username={username} />
              </div>
            )}
            {activeTab === "messages" && (
              <div style={{ marginTop: 24, padding: 24, background: '#f7fafc', borderRadius: 12, boxShadow: '0 4px 12px rgba(49,130,206,0.08)' }}>
                <MessagesPage username={username} role="manager" />
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Accountant Portal
  if (role === "accountant") {
    return (
      <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopNavBar
          username={username}
          onLogout={handleLogout}
          showNotifications={true}
        >
          {[{ label: 'Dashboard', tab: 'dashboard' }, { label: 'Campaign Details', tab: 'campaign_summary' }].map(tab => (
            <button
              key={tab.tab}
              onClick={() => setActiveTab(tab.tab)}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: activeTab === tab.tab ? '2px solid #3182ce' : '1px solid #cbd5e1',
                background: activeTab === tab.tab ? '#ebf8ff' : '#fff',
                color: activeTab === tab.tab ? '#2b6cb0' : '#2a4365',
                fontWeight: activeTab === tab.tab ? 700 : 500,
                cursor: 'pointer',
                boxShadow: activeTab === tab.tab ? '0 2px 8px rgba(49,130,206,0.08)' : 'none',
                outline: 'none',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </TopNavBar>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: 32, flex: 1 }}>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 32, border: '1px solid #e3e8ee', minHeight: 400, maxWidth: 1500, margin: '0 auto', position: 'relative' }}>
            {activeTab === "dashboard" && <AccountantDashboardSummary />}
            {activeTab === "campaign_summary" && <AccountantCampaignList />}
          </div>
        </div>
        <Footer />
      </div>
    );
  }


// Analyst Portal
if (role === "analyst") {
  return (
    <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopNavBar
        username={username}
        onLogout={handleLogout}
        showNotifications={true}
      >
        {[{ label: 'Dashboard', tab: 'dashboard' }, { label: 'Active Assignments', tab: 'assignments' }, { label: 'Messages', tab: 'messages' }].map(tab => (
          <button
            key={tab.tab}
            onClick={() => setActiveTab(tab.tab)}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: activeTab === tab.tab ? '2px solid #3182ce' : '1px solid #cbd5e1',
              background: activeTab === tab.tab ? '#ebf8ff' : '#fff',
              color: activeTab === tab.tab ? '#2b6cb0' : '#2a4365',
              fontWeight: activeTab === tab.tab ? 700 : 500,
              cursor: 'pointer',
              boxShadow: activeTab === tab.tab ? '0 2px 8px rgba(49,130,206,0.08)' : 'none',
              outline: 'none',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </TopNavBar>
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: 32, flex: 1 }}>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 32, border: '1px solid #e3e8ee', minHeight: 400, maxWidth: 1500, margin: '0 auto', position: 'relative' }}>
          {activeTab === "dashboard" && <AnalystDashboard username={username} onNavigateTab={setActiveTab} />}
          {activeTab === "assignments" && <React.Suspense fallback={<div>Loading assignments...</div>}><AssignmentList analystView={true} username={username} /></React.Suspense>}
          {activeTab === "messages" && <MessagesPage username={username} />}
        </div>
      </div>
      <Footer />
    </div>
  );
}

  // Fallback
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No access or unknown role.</div>
      <Footer />
    </div>
  );
}


// Tabbed campaigns view for admin/manager
function CampaignTabs() {
  const [tab, setTab] = React.useState(0);
  return (
    <>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} centered>
        <Tab label="Active Campaigns" />
        <Tab label="Completed Campaigns" />
      </Tabs>
      {tab === 0 && <CampaignList />}
      {tab === 1 && <CompletedCampaignList />}
    </>
  );
}

export default App2;
