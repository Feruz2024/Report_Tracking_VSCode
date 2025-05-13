
// AssignmentForm allows a manager to assign a campaign's station to an analyst, with due date and memo
import React, { useEffect, useState } from "react";
import { authFetch } from "../utils/api";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const API_URL = "/api/assignments/";
const CAMPAIGNS_API_URL = "/api/campaigns/";
const STATIONS_API_URL = "/api/stations/";
const ANALYSTS_API_URL = "/api/analysts/";

function AssignmentForm({ onAssignmentCreated }) {
  // State for campaigns, stations, analysts, and form fields
  const [campaigns, setCampaigns] = useState([]);
  const [stations, setStations] = useState([]);
  const [analysts, setAnalysts] = useState([]);
  const [campaignId, setCampaignId] = useState("");
  const [stationId, setStationId] = useState("");
  const [analystId, setAnalystId] = useState("");
  const [dueDate, setDueDate] = useState(null); // For report submission date
  const [memo, setMemo] = useState(""); // For assignment memo
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper to ensure data is always an array
  const safeArray = (data) => (Array.isArray(data) ? data : []);

  // Fetch campaigns, stations, and analysts on mount
  useEffect(() => {
    authFetch(CAMPAIGNS_API_URL)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setCampaigns(safeArray(data)))
      .catch(() => setCampaigns([]));
    authFetch(STATIONS_API_URL)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setStations(safeArray(data)))
      .catch(() => setStations([]));
    authFetch(ANALYSTS_API_URL)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setAnalysts(safeArray(data)))
      .catch(() => setAnalysts([]));
  }, []);

  // Get stations associated with the selected campaign
  const getCampaignStations = () => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign || !campaign.stations) return [];
    // campaign.stations may be array of ids or objects
    return Array.isArray(campaign.stations)
      ? (typeof campaign.stations[0] === 'object' ? campaign.stations.map(s => s.id) : campaign.stations)
      : [];
  };

  // Handle form submission for assignment
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Prepare assignment body
      const body = {
        campaign: campaignId,
        analyst: analystId,
        station: stationId,
        due_date: dueDate ? new Date(dueDate).toISOString().split('T')[0] : undefined,
        memo,
      };
      const res = await authFetch(API_URL, {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create assignment");
      setCampaignId("");
      setStationId("");
      setAnalystId("");
      setDueDate(null);
      setMemo("");
      if (onAssignmentCreated) onAssignmentCreated();
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  // Render the assignment form
  return (
    <form onSubmit={handleSubmit}>
      <h3>Assign Campaign Station to Analyst</h3>
      {/* Campaign selection dropdown */}
      <Box sx={{ mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel id="campaign-select-label">Campaign</InputLabel>
          <Select
            labelId="campaign-select-label"
            value={campaignId}
            label="Campaign"
            onChange={e => {
              setCampaignId(e.target.value);
              setStationId(""); // Reset station when campaign changes
            }}
            required
            disabled={loading}
          >
            {campaigns.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {/* Station selection dropdown, filtered by campaign */}
      <Box sx={{ mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel id="station-select-label">Station</InputLabel>
          <Select
            labelId="station-select-label"
            value={stationId}
            label="Station"
            onChange={e => setStationId(e.target.value)}
            required
            disabled={loading || !campaignId}
          >
            {getCampaignStations().map(stId => {
              const st = stations.find(s => s.id === stId);
              return st ? <MenuItem key={st.id} value={st.id}>{st.name}</MenuItem> : null;
            })}
          </Select>
        </FormControl>
      </Box>
      {/* Analyst selection dropdown */}
      <Box sx={{ mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel id="analyst-select-label">Analyst</InputLabel>
          <Select
            labelId="analyst-select-label"
            value={analystId}
            label="Analyst"
            onChange={e => setAnalystId(e.target.value)}
            required
            disabled={loading}
          >
            {analysts.map((analyst) => (
              <MenuItem key={analyst.id} value={analyst.id}>{analyst.user}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {/* Due date picker for report submission */}
      <Box sx={{ mb: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Report Submission Due Date"
            value={dueDate}
            onChange={setDueDate}
            minDate={new Date()}
            renderInput={(params) => <TextField fullWidth {...params} />}
            disabled={loading}
          />
        </LocalizationProvider>
      </Box>
      {/* Memo field for assignment notes */}
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Memo (optional)"
          value={memo}
          onChange={e => setMemo(e.target.value)}
          fullWidth
          multiline
          minRows={2}
          disabled={loading}
        />
      </Box>
      <button type="submit" disabled={loading || !campaignId || !stationId || !analystId || !dueDate}>
        {loading ? "Assigning..." : "Assign"}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}

export default AssignmentForm;
