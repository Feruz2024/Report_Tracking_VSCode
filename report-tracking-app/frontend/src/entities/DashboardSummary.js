import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Grid, Box, CircularProgress, Tooltip, Fade } from "@mui/material";
import AssignmentCalendar from "./AssignmentCalendar";
// Icons for dashboard cards
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import DnsIcon from '@mui/icons-material/Dns';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SendIcon from '@mui/icons-material/Send';
import BlockIcon from '@mui/icons-material/Block';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { authFetch } from "../utils/api";

const API_CLIENTS = "/api/clients/";
const API_CAMPAIGNS = "/api/campaigns/";
const API_STATIONS = "/api/stations/";
const API_ANALYSTS = "/api/analysts/";
const API_ASSIGNMENTS = "/api/assignments/";

function DashboardSummary({ onNavigateTab }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    clients: 0,
    campaigns: 0,
    activeCampaigns: 0,
    completedCampaigns: 0,
    stations: 0,
    scheduledSpots: 0,
    transmittedSpots: 0,
    missedSpots: 0,
    gainedSpots: 0,
    activeAssignments: 0,
    completedAssignments: 0,
  });
  const navigate = useNavigate();

  // Helper to calculate share percentage
  const share = (val) => {
    if (!stats.scheduledSpots || stats.scheduledSpots === 0) return 0;
    return Math.round((parseInt(val, 10) / stats.scheduledSpots) * 100);
  };

  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        // Fetch all stats in parallel and parse JSON for each
        const [clientsRes, campaignsRes, stationsRes, analystsRes, assignmentsRes] = await Promise.all([
          authFetch(API_CLIENTS).then(r => r.json()),
          authFetch(API_CAMPAIGNS).then(r => r.json()),
          authFetch(API_STATIONS).then(r => r.json()),
          authFetch(API_ANALYSTS).then(r => r.json()),
          authFetch(API_ASSIGNMENTS).then(r => r.json()),
        ]);
        // Helper: support both array and paginated object (with .results)
        const getArray = (res) => Array.isArray(res) ? res : (res && Array.isArray(res.results) ? res.results : []);
        const clientsArr = getArray(clientsRes);
        const campaignsArr = getArray(campaignsRes);
        const stationsArr = getArray(stationsRes);
        const assignmentsArr = getArray(assignmentsRes);
        // Log for debugging
        if (clientsArr.length === 0) console.warn('Dashboard: No clients data');
        if (campaignsArr.length === 0) console.warn('Dashboard: No campaigns data');
        if (stationsArr.length === 0) console.warn('Dashboard: No stations data');
        if (assignmentsArr.length === 0) console.warn('Dashboard: No assignments data');
        // Calculate stats from responses
        const clients = clientsArr.length || 0;
        const campaigns = campaignsArr.length || 0;
        const activeCampaigns = campaignsArr.filter(c => c.status && c.status.toUpperCase() === 'ACTIVE').length;
        const completedCampaigns = campaignsArr.filter(c => c.status && c.status.toUpperCase() === 'COMPLETED').length;
        const stations = stationsArr.length || 0;
        let scheduledSpots = 0, transmittedSpots = 0, missedSpots = 0, gainedSpots = 0;
        assignmentsArr.forEach(a => {
          scheduledSpots += a.planned_spots || 0;
          transmittedSpots += a.transmitted_spots || 0;
          missedSpots += a.missed_spots || 0;
          gainedSpots += a.gain_spots || 0;
        });
        const activeAssignments = assignmentsArr.filter(a => a.status && a.status.toUpperCase() === 'WIP').length;
        const completedAssignments = assignmentsArr.filter(a => a.status && a.status.toUpperCase() === 'APPROVED').length;
        if (isMounted) {
          setStats({
            clients,
            campaigns,
            activeCampaigns,
            completedCampaigns,
            stations,
            scheduledSpots,
            transmittedSpots,
            missedSpots,
            gainedSpots,
            activeAssignments,
            completedAssignments,
          });
          // Show warning if any data is missing
          if (!clients || !campaigns || !stations) {
            setError('Some dashboard data is missing. Please check backend/API.');
          }
        }
      } catch (e) {
        if (isMounted) setError('Failed to load dashboard data.');
        // Log error for debugging
        console.error('DashboardSummary fetchStats error:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchStats();
    return () => { isMounted = false; };
  }, []);

  // Colorful card backgrounds and faded icon circle colors
  const cardColors = [
    { bg: '#f87171', icon: '#fca5a5' }, // red
    { bg: '#38bdf8', icon: '#bae6fd' }, // blue
    { bg: '#818cf8', icon: '#c7d2fe' }, // indigo
    { bg: '#fbbf24', icon: '#fde68a' }, // yellow
    { bg: '#34d399', icon: '#a7f3d0' }, // green
    { bg: '#f472b6', icon: '#fbcfe8' }, // pink
    { bg: '#60a5fa', icon: '#bfdbfe' }, // sky
    { bg: '#facc15', icon: '#fef08a' }, // amber
    { bg: '#a3e635', icon: '#d9f99d' }, // lime
    { bg: '#f97316', icon: '#fdba74' }, // orange
  ];
  const cardIcons = [
    <PeopleOutlineIcon fontSize="large" />, // clients
    <PlayCircleOutlineIcon fontSize="large" />, // active campaigns
    <CheckCircleOutlineIcon fontSize="large" />, // completed campaigns
    <DnsIcon fontSize="large" />, // stations
    <EventAvailableIcon fontSize="large" />, // scheduled spots
    <SendIcon fontSize="large" />, // transmitted spots
    <BlockIcon fontSize="large" />, // missed spots
    <TrendingUpIcon fontSize="large" />, // gained spots
    <PlayCircleOutlineIcon fontSize="large" />, // active assignments
    <CheckCircleOutlineIcon fontSize="large" />, // completed assignments
  ];
  const cards = [
    {
      label: "Total Clients",
      value: stats.clients,
      sub: null,
      tooltip: "View all clients",
      onClick: () => onNavigateTab ? onNavigateTab("entities", 0) : navigate("/entities", { state: { tab: 0 } })
    },
    {
      label: "Active Campaigns",
      value: stats.activeCampaigns,
      sub: null,
      tooltip: "View active campaigns",
      onClick: () => onNavigateTab ? onNavigateTab("campaigns") : navigate("/campaigns")
    },
    {
      label: "Completed Campaigns",
      value: stats.completedCampaigns,
      sub: null,
      tooltip: "View completed campaigns",
      onClick: () => onNavigateTab ? onNavigateTab("campaigns") : navigate("/campaigns")
    },
    {
      label: "Total Stations",
      value: stats.stations,
      sub: null,
      tooltip: "View all stations",
      onClick: () => onNavigateTab ? onNavigateTab("entities", 2) : navigate("/entities", { state: { tab: 2 } })
    },
    {
      label: "Scheduled Spots",
      value: stats.scheduledSpots,
      sub: null,
      tooltip: "Total scheduled spots",
      onClick: () => onNavigateTab ? onNavigateTab("assignments") : navigate("/assignments")
    },
    {
      label: "Transmitted Spots",
      value: `${stats.transmittedSpots}  (${share(stats.transmittedSpots)}%)`,
      sub: null,
      tooltip: "Total transmitted spots and share of scheduled",
      onClick: () => onNavigateTab ? onNavigateTab("assignments") : navigate("/assignments")
    },
    {
      label: "Missed Spots",
      value: `${stats.missedSpots}  (${share(stats.missedSpots)}%)`,
      sub: null,
      tooltip: "Total missed spots and share of scheduled",
      onClick: () => onNavigateTab ? onNavigateTab("assignments") : navigate("/assignments")
    },
    {
      label: "Gained Spots",
      value: `${stats.gainedSpots}  (${share(stats.gainedSpots)}%)`,
      sub: null,
      tooltip: "Total gained spots and share of scheduled",
      onClick: () => onNavigateTab ? onNavigateTab("assignments") : navigate("/assignments")
    },
    {
      label: "Active Assignments",
      value: stats.activeAssignments,
      sub: null,
      tooltip: "Assignments in progress",
      onClick: () => onNavigateTab ? onNavigateTab("assignments") : navigate("/assignments")
    },
    {
      label: "Completed Assignments",
      value: stats.completedAssignments,
      sub: null,
      tooltip: "Assignments marked as completed/approved",
      onClick: () => onNavigateTab ? onNavigateTab("assignments") : navigate("/assignments")
    },
  ];

  return (
    <Box
      sx={{
        minHeight: 700,
        width: '100vw',
        maxWidth: '1800px', // Increase max width for dashboard view
        height: 'auto',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        background: 'linear-gradient(120deg, #f0f4ff 0%, #e0e7ff 50%, #fdf6f0 100%)',
        py: 6,
        px: 6, // Add horizontal padding for margin between right edge and cards
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        overflowX: 'hidden',
      }}
    >
      {/* Left: Dashboard Cards */}
      <Box
        sx={{
          flex: '0 0 70%',
          maxWidth: '75.6%', // 5% more than 72%
          minWidth: 400,
          pl: 6,
          pr: 3, // Restore right padding
          pt: 4,
          pb: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          height: '100%',
          background: 'rgba(255,255,255,0.85)',
          borderRadius: 6,
          boxShadow: '0 8px 32px 0 rgba(80,80,160,0.08)',
          border: '1.5px solid #e0e7ff',
          mr: 8, // Increase right margin for a larger gap
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 1 }}>
          <Box sx={{ width: 7, height: 44, borderRadius: 2, background: 'linear-gradient(180deg, #38bdf8 0%, #818cf8 100%)', mr: 2, boxShadow: '0 2px 8px #bae6fd' }} />
          <Typography
            variant="h3"
            sx={{
              color: '#2a4365',
              fontWeight: 900,
              letterSpacing: 1,
              textShadow: '0 2px 8px #e0e7ff',
              lineHeight: 1.1,
              fontSize: { xs: 28, sm: 34, md: 38 },
              pr: 2,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            Dashboard Overview
          </Typography>
        </Box>
        {loading ? (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
            <Typography color="error" variant="h6">{error}</Typography>
          </Box>
        ) : (
          <Grid container spacing={2.5} sx={{ width: '100%' }}>
            {cards.map((card, idx) => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={card.label} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Fade in timeout={600 + idx * 100}>
                  <div style={{ width: 240, minWidth: 200, maxWidth: 260 }}>
                    <Tooltip title={card.tooltip} arrow placement="top">
                      <Card
                        onClick={card.onClick}
                        tabIndex={0}
                        role="button"
                        sx={{
                          cursor: 'pointer',
                          borderRadius: 8,
                          boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)',
                          border: 'none',
                          background: cardColors[idx].bg,
                          minHeight: 180,
                          height: 180,
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          position: 'relative',
                          overflow: 'visible',
                          p: 0,
                          m: '0 0 20px 0',
                          transition: 'box-shadow 0.2s, transform 0.2s',
                          '&:hover': {
                            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.12)',
                            transform: 'translateY(-4px) scale(1.03)',
                          },
                        }}
                        onKeyPress={e => {
                          if (e.key === 'Enter' || e.key === ' ') card.onClick();
                        }}
                      >
                        {/* Icon at top, no background */}
                        <Box sx={{
                          position: 'absolute',
                          top: 24,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 64,
                          height: 64,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <span style={{ color: '#fff', fontSize: 36, opacity: 0.85 }}>{cardIcons[idx]}</span>
                        </Box>
                        <CardContent sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: 0.5,
                          p: 0,
                          mt: 7,
                        }}>
                          <Typography sx={{ fontWeight: 800, color: '#fff', fontSize: 14, mb: 0.5 }}>{card.value}</Typography>
                          <Typography sx={{ color: '#f3f4f6', fontWeight: 600, fontSize: 14, mb: 0.5 }}>{card.label}</Typography>
                          {card.sub && <Typography sx={{ color: '#f3f4f6', fontWeight: 400, fontSize: 14 }}>{card.sub}</Typography>}
                        </CardContent>
                      </Card>
                    </Tooltip>
                  </div>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mt: 2, width: '100%' }}>
          <AssignmentCalendar />
        </Box>
      </Box>
    </Box>
  );
}
export default DashboardSummary;
