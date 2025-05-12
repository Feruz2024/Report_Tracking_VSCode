import React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import ClientForm from "./ClientForm";
import ClientList from "./ClientList";
import AnalystForm from "./AnalystForm";
import AnalystList from "./AnalystList";
import StationForm from "./StationForm";
import StationList from "./StationList";


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
        <Tab label="Analysts" />
        <Tab label="Stations" />
      </Tabs>
      {tab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <h2 style={{ textAlign: 'center', width: '100%' }}>Client Management</h2>
          <ClientForm />
          <ClientList />
        </Box>
      )}
      {tab === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <h2 style={{ textAlign: 'center', width: '100%' }}>Media Analyst Management</h2>
          <AnalystForm />
          <AnalystList />
        </Box>
      )}
      {tab === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <h2 style={{ textAlign: 'center', width: '100%' }}>Station Management</h2>
          <StationForm />
          <StationList />
        </Box>
      )}
    </Box>
  );
}

export default EntitiesTab;
