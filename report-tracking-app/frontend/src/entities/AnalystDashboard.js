import React, { useEffect, useState } from "react";
import Footer from "./Footer";
import { authFetch } from "../utils/api";
import { Card, CardContent, Typography, Grid, Box, CircularProgress, Button, Badge } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

/**
 * Analyst dashboard: shows summary of my completed assignments,
 * campaigns worked on, stations worked on, and assigned campaigns.
 */
export default function AnalystDashboard({ username, onNavigateTab }) {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [stations, setStations] = useState([]);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      authFetch(`/api/assignments/`).then(res => res.ok ? res.json() : []),
      authFetch(`/api/campaigns/`).then(res => res.ok ? res.json() : []),
      authFetch(`/api/stations/`).then(res => res.ok ? res.json() : []),
      authFetch('/api/messages/?view_type=inbox').then(res => res.ok ? res.json() : []),
    ])
      .then(([asgmt, camps, stats, messages]) => {
        // filter assignments for this analyst
        const mine = asgmt.filter(a => {
          // a.analyst is MediaAnalystProfile id, need to match by user
          return a.analyst_user === username || a.analyst_user === null;
        });
        setAssignments(mine);
        setCampaigns(camps);
        setStations(stats);
        // Count unread messages
        setUnreadCount(Array.isArray(messages) ? messages.filter(m => !m.read).length : 0);
      })
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  // compute stats
  const uniqueCampaigns = [...new Set(assignments.map(a => a.campaign))];
  const completedCount = assignments.filter(a => a.status !== 'WIP').length;
  const uniqueStations = [...new Set(assignments.map(a => a.station).filter(Boolean))];

  return (
    <>
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">My Dashboard</Typography>
          <Box>
            <Button variant="outlined" sx={{ mr: 1 }} onClick={() => onNavigateTab ? onNavigateTab('assignments') : navigate('/assignments')}>Assignments</Button>
            <Badge badgeContent={unreadCount} color="error" invisible={unreadCount === 0} sx={{ mr: 1 }}>
              <Button variant="outlined" onClick={() => onNavigateTab ? onNavigateTab('messages') : navigate('/dashboard/messages')}>Messages</Button>
            </Badge>
          </Box>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => onNavigateTab ? onNavigateTab('assignments') : navigate('/assignments')}>
              <CardContent>
                <Typography>Completed Assignments</Typography>
                <Typography variant="h4">{completedCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => onNavigateTab ? onNavigateTab('campaigns') : navigate('/dashboard/campaigns')}>
              <CardContent>
                <Typography>Campaigns Worked On</Typography>
                <Typography variant="h4">{uniqueCampaigns.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => onNavigateTab ? onNavigateTab('stations') : navigate('/dashboard/stations')}>
              <CardContent>
                <Typography>Stations Worked On</Typography>
                <Typography variant="h4">{uniqueStations.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Assigned Campaigns</Typography>
          <ul>
            {uniqueCampaigns.map(cid => {
              const c = campaigns.find(x => x.id === cid);
              return (
                <li key={cid} style={{ marginBottom: 4, cursor: 'pointer', color: '#1976d2', textDecoration: 'underline' }}
                    onClick={() => onNavigateTab ? onNavigateTab('assignments') : navigate('/assignments?campaign=' + encodeURIComponent(cid) + '&tab=0')}>
                  {c ? c.name : `Campaign ${cid}`}
                </li>
              );
            })}
          </ul>
        </Box>
        {/* Active Assignments section removed as requested */}
      </Box>
      <Footer />
    </>
  );
}
