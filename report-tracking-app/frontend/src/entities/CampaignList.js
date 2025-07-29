// Completely rebuilt CampaignList.js for admin/manager portal, no filters, simple list
import React, { useEffect, useState } from "react";
import { authFetch } from "../utils/api";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";

const API_URL = "/api/campaigns/";
const CLIENTS_API_URL = "/api/clients/";
const STATIONS_API_URL = "/api/stations/";
const MONITORING_PERIODS_API_URL = "/api/monitoring-periods/";

function CampaignList({ refresh }) {
  const [campaigns, setCampaigns] = useState([]);
  const [clients, setClients] = useState([]);
  const [stations, setStations] = useState([]);
  const [monitoringPeriods, setMonitoringPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  // Filter states
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [descFilter, setDescFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      authFetch(API_URL).then((res) => res.ok ? res.json() : []),
      authFetch(CLIENTS_API_URL).then((res) => res.ok ? res.json() : []),
      authFetch(STATIONS_API_URL).then((res) => res.ok ? res.json() : []),
      authFetch(MONITORING_PERIODS_API_URL).then((res) => res.ok ? res.json() : []),
    ])
      .then(([campaignsData, clientsData, stationsData, monitoringPeriodsData]) => {
        setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
        setClients(Array.isArray(clientsData) ? clientsData : []);
        setStations(Array.isArray(stationsData) ? stationsData : []);
        setMonitoringPeriods(Array.isArray(monitoringPeriodsData) ? monitoringPeriodsData : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [refresh]);

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.name : "Unknown";
  };
  const getStationNames = (stationIds) => {
    return stations.filter(s => stationIds.includes(s.id)).map(s => s.name);
  };
  const getMonitoringPeriods = (campaignId) => {
    return monitoringPeriods.filter(mp => mp.campaign === campaignId);
  };

  if (loading) return <div>Loading campaigns...</div>;

  // Filtering logic
  const filteredCampaigns = campaigns.filter(campaign => {
    // Name filter
    if (nameFilter && !campaign.name.toLowerCase().includes(nameFilter.toLowerCase())) return false;
    // Status filter
    if (statusFilter && campaign.status !== statusFilter) return false;
    // Client filter
    if (clientFilter && String(campaign.client) !== String(clientFilter)) return false;
    // Description filter
    if (descFilter && (!campaign.description || !campaign.description.toLowerCase().includes(descFilter.toLowerCase()))) return false;
    // Start/End date filter (based on monitoring periods)
    const periods = monitoringPeriods.filter(mp => mp.campaign === campaign.id);
    let campaignStart = periods.length > 0 ? periods.map(p => p.monitoring_start).sort()[0] : null;
    let campaignEnd = periods.length > 0 ? periods.map(p => p.monitoring_end).sort().reverse()[0] : null;
    if (startDate && (!campaignStart || new Date(campaignStart) < new Date(startDate))) return false;
    if (endDate && (!campaignEnd || new Date(campaignEnd) > new Date(endDate))) return false;
    return true;
  });

  return (
    <>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, mt: 2, justifyContent: 'center', alignItems: 'center' }}>
        <TextField label="Name" value={nameFilter} onChange={e => setNameFilter(e.target.value)} size="small" sx={{ minWidth: 160 }} />
        <TextField label="Status" select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} size="small" sx={{ minWidth: 120 }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="ACTIVE">Active</MenuItem>
          <MenuItem value="COMPLETED">Completed</MenuItem>
          <MenuItem value="CLOSED">Closed</MenuItem>
        </TextField>
        <TextField label="Client" select value={clientFilter} onChange={e => setClientFilter(e.target.value)} size="small" sx={{ minWidth: 160 }}>
          <MenuItem value="">All</MenuItem>
          {clients.map(client => (
            <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>
          ))}
        </TextField>
        <TextField label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} size="small" InputLabelProps={{ shrink: true }} />
        <TextField label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} size="small" InputLabelProps={{ shrink: true }} />
        <TextField label="Description" value={descFilter} onChange={e => setDescFilter(e.target.value)} size="small" sx={{ minWidth: 160 }} />
        <Button variant="outlined" color="secondary" size="small" sx={{ ml: 2, height: 40 }}
          onClick={() => {
            setNameFilter("");
            setStatusFilter("");
            setClientFilter("");
            setDescFilter("");
            setStartDate("");
            setEndDate("");
          }}
        >
          Reset
        </Button>
      </Box>
      <div>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Campaigns</h2>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 24,
          marginTop: 16
        }}>
          {filteredCampaigns.length === 0 && <div style={{ color: '#888', fontStyle: 'italic' }}>No campaigns match the filter.</div>}
          {filteredCampaigns.map((campaign, idx) => {
            const stationIds = Array.isArray(campaign.stations)
              ? (typeof campaign.stations[0] === 'object' ? campaign.stations.map(s => s.id) : campaign.stations)
              : [];
            const stationNames = getStationNames(stationIds);
            const periods = getMonitoringPeriods(campaign.id);
            const campaignStart = periods.length > 0 ? periods.map(p => p.monitoring_start).sort()[0] : null;
            // Pastel card backgrounds
            const pastelColors = ['#fff2eb', '#eaf6ff', '#eafff3', '#f6eaff', '#fffbe6', '#eafcff'];
            const cardBg = pastelColors[idx % pastelColors.length];
            return (
              <div
                key={campaign.id}
                style={{
                  background: cardBg,
                  borderRadius: 'var(--radius)',
                  boxShadow: 'var(--color-shadow)',
                  border: '1px solid var(--color-border)',
                  padding: '24px 32px',
                  minWidth: 320,
                  maxWidth: 400,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  fontSize: 16,
                  fontWeight: 500,
                  color: '#222',
                  border: '1px solid #e2e8f0',
                  marginBottom: 8,
                  position: 'relative'
                }}
              >
                <button
                  style={{ position: 'absolute', top: 8, right: 8, fontSize: 12, zIndex: 2 }}
                  onClick={() => {
                    window.open(`/edit-campaign/${campaign.id}?token=${localStorage.getItem('token')}`, 'EditCampaign', 'width=600,height=800');
                  }}
                >
                  Edit
                </button>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{campaign.name}</div>
                {campaign.description && (
                  <div style={{ color: '#555', fontSize: 15, marginBottom: 8 }}>{campaign.description}</div>
                )}
                <div style={{ color: '#666', fontSize: 14, marginBottom: 4 }}>
                  <b>Client:</b> {getClientName(campaign.client)}
                </div>
                <div style={{ color: '#666', fontSize: 14, marginBottom: 4 }}>
                  <b>Associated Stations:</b> {stationNames.length > 0 ? stationNames.join(', ') : 'None'}
                </div>
                {campaignStart && (
                  <div style={{ color: '#666', fontSize: 14, marginBottom: 4 }}>
                    <b>Campaign Start Date:</b> {campaignStart}
                  </div>
                )}
                {periods.length > 0 && (
                  <div style={{ width: '100%', marginTop: 8 }}>
                    <b>Monitoring & Authentication Periods:</b>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {periods.map((p, i) => (
                        <li key={i} style={{ fontSize: 13, margin: '4px 0', borderRadius: 6, padding: 6 }}>
                          <div><b>Monitoring:</b> {p.monitoring_start} to {p.monitoring_end}</div>
                          <div><b>Authentication:</b> {p.authentication_start} to {p.authentication_end}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default CampaignList;
