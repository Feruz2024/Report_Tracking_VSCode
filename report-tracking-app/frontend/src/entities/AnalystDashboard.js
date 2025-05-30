import React, { useEffect, useState } from "react";
import Footer from "./Footer";
import { authFetch } from "../utils/api";
import { Card, CardContent, Typography, Grid, Box, CircularProgress, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

/**
 * Analyst dashboard: shows summary of my completed assignments,
 * campaigns worked on, stations worked on, and assigned campaigns.
 */
export default function AnalystDashboard({ username }) {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [stations, setStations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      authFetch(`/api/assignments/`).then(res => res.ok ? res.json() : []),
      authFetch(`/api/campaigns/`).then(res => res.ok ? res.json() : []),
      authFetch(`/api/stations/`).then(res => res.ok ? res.json() : []),
    ])
      .then(([asgmt, camps, stats]) => {
        // filter assignments for this analyst
        const mine = asgmt.filter(a => {
          // a.analyst is MediaAnalystProfile id, need to match by user
          return a.analyst_user === username || a.analyst_user === null;
        });
        setAssignments(mine);
        setCampaigns(camps);
        setStations(stats);
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
            <Button component={Link} to="/assignments" variant="outlined" sx={{ mr: 1 }}>Assignments</Button>
            <Button component={Link} to="/dashboard/messages" variant="outlined">Messages</Button>
          </Box>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Card><CardContent>
              <Typography>Completed Assignments</Typography>
              <Typography variant="h4">{completedCount}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={4}>
            <Card><CardContent>
              <Typography>Campaigns Worked On</Typography>
              <Typography variant="h4">{uniqueCampaigns.length}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={4}>
            <Card><CardContent>
              <Typography>Stations Worked On</Typography>
              <Typography variant="h4">{uniqueStations.length}</Typography>
            </CardContent></Card>
          </Grid>
        </Grid>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Assigned Campaigns</Typography>
          <ul>
            {uniqueCampaigns.map(cid => {
              const c = campaigns.find(x => x.id === cid);
              return (
                <li key={cid} style={{ marginBottom: 4 }}>
                  <Button size="small" onClick={() => navigate(`/dashboard/campaign/${cid}`)}>
                    {c ? c.name : `Campaign ${cid}`}
                  </Button>
                </li>
              );
            })}
          </ul>
        </Box>
      </Box>
      <Footer />
    </>
  );
}
