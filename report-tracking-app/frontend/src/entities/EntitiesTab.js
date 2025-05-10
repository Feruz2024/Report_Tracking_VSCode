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

function EntitiesTab() {
  const [tab, setTab] = React.useState(0);
  const handleChange = (event, newValue) => setTab(newValue);

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs value={tab} onChange={handleChange} aria-label="Entities Tabs" sx={{ mb: 2 }}>
        <Tab label="Clients" />
        <Tab label="Analysts" />
        <Tab label="Stations" />
      </Tabs>
      {tab === 0 && (
        <Box>
          <h2>Client Management</h2>
          <ClientForm />
          <ClientList />
        </Box>
      )}
      {tab === 1 && (
        <Box>
          <h2>Media Analyst Management</h2>
          <AnalystForm />
          <AnalystList />
        </Box>
      )}
      {tab === 2 && (
        <Box>
          <h2>Station Management</h2>
          <StationForm />
          <StationList />
        </Box>
      )}
    </Box>
  );
}

export default EntitiesTab;
