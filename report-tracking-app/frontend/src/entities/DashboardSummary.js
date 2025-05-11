import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Grid, Box, CircularProgress } from "@mui/material";
import AssignmentCalendar from "./AssignmentCalendar";
import { authFetch } from "../utils/api";

const API_CLIENTS = "/api/clients/";
const API_CAMPAIGNS = "/api/campaigns/";
const API_STATIONS = "/api/stations/";
const API_ANALYSTS = "/api/analysts/";
const API_ASSIGNMENTS = "/api/assignments/";

function DashboardSummary({ onNavigateTab }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    clients: 0,
    campaigns: 0,
    activeCampaigns: 0,
    stations: 0,
    analysts: 0,
    scheduledSpots: 0,
    transmittedSpots: 0,
    missedSpots: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      authFetch(API_CLIENTS).then(res => res.ok ? res.json() : []),
      authFetch(API_CAMPAIGNS).then(res => res.ok ? res.json() : []),
      authFetch(API_STATIONS).then(res => res.ok ? res.json() : []),
      authFetch(API_ANALYSTS).then(res => res.ok ? res.json() : []),
      authFetch(API_ASSIGNMENTS).then(res => res.ok ? res.json() : []),
    ]).then(([clients, campaigns, stations, analysts, assignments]) => {
      // Active campaigns: status is not 'COMPLETED' or 'CLOSED'
      const activeCampaigns = campaigns.filter(c => !c.status || !["COMPLETED", "CLOSED"].includes(c.status)).length;
      // Spots
      let scheduledSpots = 0, transmittedSpots = 0, missedSpots = 0;
      assignments.forEach(a => {
        scheduledSpots += Number(a.planned_spots) || 0;
        transmittedSpots += Number(a.transmitted_spots) || 0;
        missedSpots += Number(a.missed_spots) || 0;
      });
      setStats({
        clients: clients.length,
        campaigns: campaigns.length,
        activeCampaigns,
        stations: stations.length,
        analysts: analysts.length,
        scheduledSpots,
        transmittedSpots,
        missedSpots,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: "Clients",
      value: stats.clients,
      color: "#3182ce",
      onClick: () => onNavigateTab ? onNavigateTab("entities") : navigate("/entities"),
    },
    {
      label: "Campaigns",
      value: `${stats.activeCampaigns} / ${stats.campaigns}`,
      color: "#38a169",
      onClick: () => onNavigateTab ? onNavigateTab("campaigns") : navigate("/campaigns"),
      sub: "Active / Total"
    },
    {
      label: "Stations",
      value: stats.stations,
      color: "#805ad5",
      onClick: () => onNavigateTab ? onNavigateTab("entities",2) : navigate("/entities",{state:{tab:2}}),
    },
    {
      label: "Analysts",
      value: stats.analysts,
      color: "#d69e2e",
      onClick: () => onNavigateTab ? onNavigateTab("entities",1) : navigate("/entities",{state:{tab:1}}),
    },
    {
      label: "Scheduled Spots",
      value: stats.scheduledSpots,
      color: "#4299e1",
      onClick: () => onNavigateTab ? onNavigateTab("assignments") : navigate("/assignments"),
    },
    {
      label: "Transmitted Spots",
      value: stats.transmittedSpots,
      color: "#48bb78",
      onClick: () => onNavigateTab ? onNavigateTab("assignments") : navigate("/assignments"),
    },
    {
      label: "Missed Spots",
      value: stats.missedSpots,
      color: "#e53e3e",
      onClick: () => onNavigateTab ? onNavigateTab("assignments") : navigate("/assignments"),
      sub: stats.scheduledSpots ? `${Math.round(100*stats.missedSpots/(stats.scheduledSpots||1))}%` : undefined
    },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', mt: 2 }}>
      <Typography variant="h4" sx={{ color: '#2a4365', mb: 3, fontWeight: 700, textAlign: 'center' }}>Dashboard Overview</Typography>
      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}><CircularProgress /></Box> : (
        <Grid container spacing={3} justifyContent="center" alignItems="stretch" sx={{ mb: 4 }}>
          {cards.map((card, idx) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={card.label}>
              <Card
                onClick={card.onClick}
                sx={{
                  cursor: 'pointer',
                  borderLeft: `8px solid ${card.color}`,
                  borderRadius: 3,
                  boxShadow: '0 2px 12px rgba(44,62,80,0.08)',
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: '0 6px 24px rgba(49,130,206,0.18)' },
                  minHeight: 120,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <CardContent sx={{ width: '100%' }}>
                  <Typography variant="h6" sx={{ color: card.color, fontWeight: 700 }}>{card.label}</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#2a4365' }}>{card.value}</Typography>
                  {card.sub && <Typography variant="body2" sx={{ color: '#718096' }}>{card.sub}</Typography>}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Box sx={{ mt: 4 }}>
        <AssignmentCalendar />
      </Box>
    </Box>
  );
}

export default DashboardSummary;
