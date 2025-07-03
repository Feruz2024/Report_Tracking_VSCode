import React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";


import ClientForm from "./ClientForm";
import ClientList from "./ClientList";
import UserForm from "./UserForm"; // Changed from AnalystForm
import AnalystList from "./AnalystList";
import UserList from "./UserList";
import StationForm from "./StationForm";
import StationList from "./StationList";
import ImportExportPanel from "./ImportExportPanel";
import StationMuxInfo from "./StationMuxInfo";
import DataExportTab from "./DataExportTab";


import { useLocation } from "react-router-dom";

function EntitiesTab() {
  const location = useLocation();
  // Pick up initial tab from navigation state if present
  const initialTab = location.state && typeof location.state.tab === 'number' ? location.state.tab : 0;
  const [tab, setTab] = React.useState(initialTab);
  React.useEffect(() => {
    if (typeof location.state?.tab === 'number' && location.state.tab !== tab) {
      setTab(location.state.tab);
    }
    // eslint-disable-next-line
  }, [location.state?.tab]);
  const handleChange = (event, newValue) => setTab(newValue);

  // Get role from localStorage (set in App.js after login)
  const role = localStorage.getItem("role") || "analyst";
  // Helper: is admin (superuser or in Admins group)
  const isAdmin = role === 'admin';
  // Helper: is manager (in Managers group)
  const isManager = role === 'manager';

  // --- ADDED: State to trigger entity list refreshes ---
  const [clientListRefresh, setClientListRefresh] = React.useState(0);
  const [userListRefresh, setUserListRefresh] = React.useState(0);
  const [stationListRefresh, setStationListRefresh] = React.useState(0);
  const handleClientCreated = () => setClientListRefresh(r => r + 1);
  const handleUserCreated = () => setUserListRefresh(r => r + 1);
  const handleStationCreated = () => setStationListRefresh(r => r + 1);

  return (
    <Box sx={{ width: "100%", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Tabs
        value={tab}
        onChange={handleChange}
        aria-label="Entities Tabs"
        sx={{ mb: 2, alignSelf: 'center' }}
        centered
      >
        <Tab label="Clients" />
        <Tab label="Users" />
        <Tab label="Stations" />
        <Tab label="Station Mux Info" />
        {isAdmin && <Tab label="Data Import/Export" />}
      </Tabs>
      {tab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <h2 style={{ textAlign: 'center', width: '100%' }}>Client Management</h2>
          {(isManager || isAdmin) && <ClientForm onClientCreated={handleClientCreated} />}
          <ClientList refresh={clientListRefresh} />
        </Box>
      )}
      {tab === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <h2 style={{ textAlign: 'center', width: '100%' }}>User Management</h2>
          {isAdmin && <UserForm onUserCreated={handleUserCreated} />}
          {/* Removed debug JSON block if present */}
          <UserList />
        </Box>
      )}
      {tab === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <h2 style={{ textAlign: 'center', width: '100%' }}>Station Management</h2>
          {(isManager || isAdmin) && <StationForm onStationCreated={handleStationCreated} />}
          <StationList refresh={stationListRefresh} />
        </Box>
      )}
      {tab === 3 && (
        <StationMuxInfo />
      )}
      {isAdmin && tab === 4 && (
        <DataExportTab />
      )}
    </Box>
  );
}

export default EntitiesTab;
