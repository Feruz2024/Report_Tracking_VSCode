
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Grid, Box, CircularProgress, Tooltip, Fade } from "@mui/material";
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
    gainedSpots: 0,
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
      let gainedSpots = 0;
      assignments.forEach(a => {
        scheduledSpots += Number(a.planned_spots) || 0;
        transmittedSpots += Number(a.transmitted_spots) || 0;
        missedSpots += Number(a.missed_spots) || 0;
        gainedSpots += Number(a.gain_spots) || 0;
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
        gainedSpots,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Share calculations
  const share = (num) => stats.scheduledSpots ? ((num / stats.scheduledSpots) * 100).toFixed(1) : "0.0";
  // Modern Material icons (using emoji as fallback, but you can swap for MUI icons if desired)
  const cards = [
    {
      label: "Total Clients",
      value: stats.clients,
      icon: <span className="material-icons" style={{ fontSize: 22 }} aria-label="" title=""></span>,
      onClick: () => onNavigateTab ? onNavigateTab("entities", 0) : navigate("/entities", { state: { tab: 0 } }),
      tooltip: "View all clients"
    },
    {
      label: "Active Campaigns",
      value: stats.activeCampaigns,
      icon: <span className="material-icons" style={{ fontSize: 22 }} aria-label="" title=""></span>,
      onClick: () => onNavigateTab ? onNavigateTab("campaigns") : navigate("/campaigns"),
      sub: `of ${stats.campaigns} total`,
      tooltip: "View all campaigns"
    },
    {
      label: "Total Stations",
      value: stats.stations,
      icon: <span className="material-icons" style={{ fontSize: 22 }} aria-label="" title=""></span>,
      onClick: () => onNavigateTab ? onNavigateTab("entities", 2) : navigate("/entities", { state: { tab: 2 } }),
      tooltip: "View all stations"
    },
    {
      label: "Total Analysts",
      value: stats.analysts,
      icon: <span className="material-icons" style={{ fontSize: 22 }} aria-label="" title=""></span>,
      onClick: () => onNavigateTab ? onNavigateTab("entities", 1) : navigate("/entities", { state: { tab: 1 } }),
      tooltip: "View all analysts"
    },
    {
      label: "Scheduled Spots",
      value: stats.scheduledSpots,
      icon: <span className="material-icons" style={{ fontSize: 22 }} aria-label="" title=""></span>,
      onClick: () => onNavigateTab ? onNavigateTab("assignments") : navigate("/assignments"),
      tooltip: "Total scheduled spots"
    },
    {
      label: "Transmitted Spots",
      value: `${stats.transmittedSpots}  (${share(stats.transmittedSpots)}%)`,
      icon: <span className="material-icons" style={{ fontSize: 22 }} aria-label="" title=""></span>,
      onClick: () => onNavigateTab ? onNavigateTab("assignments") : navigate("/assignments"),
      tooltip: "Total transmitted spots and share of scheduled"
    },
    {
      label: "Missed Spots",
      value: `${stats.missedSpots}  (${share(stats.missedSpots)}%)`,
      icon: <span className="material-icons" style={{ fontSize: 22 }} aria-label="" title=""></span>,
      onClick: () => onNavigateTab ? onNavigateTab("assignments") : navigate("/assignments"),
      tooltip: "Total missed spots and share of scheduled"
    },
    {
      label: "Gained Spots",
      value: `${stats.gainedSpots}  (${share(stats.gainedSpots)}%)`,
      icon: <span className="material-icons" style={{ fontSize: 22 }} aria-label="" title=""></span>,
      onClick: () => onNavigateTab ? onNavigateTab("assignments") : navigate("/assignments"),
      tooltip: "Total gained spots and share of scheduled"
    },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: 1300, mx: 'auto', mt: 2, mb: 4 }}>
      <Typography variant="h4" sx={{ color: '#2a4365', mb: 3, fontWeight: 700, textAlign: 'center', letterSpacing: 1 }}>
        <span style={{ filter: 'drop-shadow(0 2px 8px #bee3f8)' }}>📊</span> Dashboard Overview
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={1} justifyContent="center" alignItems="stretch" sx={{ mb: 2 }}>
          {cards.map((card, idx) => (
            <Grid item xs={12} sm={6} md={3} lg={3} key={card.label} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Fade in timeout={600 + idx * 100}>
                <div style={{ width: 220 }}>
                  <Tooltip title={card.tooltip} arrow placement="top">
                    <Card
                      onClick={card.onClick}
                      sx={{
                        cursor: 'pointer',
                        borderRadius: 2,
                        boxShadow: 'none',
                        border: '1px solid #e2e8f0',
                        background: '#f8f9fa',
                        minHeight: 120,
                        height: 120,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'visible',
                        p: 0.5,
                        m: '0 auto',
                      }}
                    >
                      <CardContent sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.5, p: 0.5 }}>
                        <span>{card.icon}</span>
                        <Typography variant="h6" sx={{ color: '#222', fontWeight: 600, letterSpacing: 0.5, fontSize: 14 }}>{card.label}</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#2a4365', mt: 0.2, fontSize: 18 }}>{card.value}</Typography>
                        {card.sub && <Typography variant="body2" sx={{ color: '#888', fontWeight: 500, fontSize: 11 }}>{card.sub}</Typography>}
                      </CardContent>
                    </Card>
                  </Tooltip>
                </div>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
        <AssignmentCalendar />
      </Box>
    </Box>
  );
}

export default DashboardSummary;
