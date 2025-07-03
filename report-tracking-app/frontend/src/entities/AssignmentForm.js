
// AssignmentForm allows a manager to assign a campaign's station to an analyst, with due date and memo

import React, { useEffect, useState } from "react";
import { authFetch, fetchAssignedStationIds } from "../utils/api";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import TextField from "@mui/material/TextField";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// ...existing code...

const API_URL = "/api/assignments/";
const CAMPAIGNS_API_URL = "/api/campaigns/";
const STATIONS_API_URL = "/api/stations/";
const ANALYSTS_API_URL = "/api/analysts/";


function AssignmentForm({
  onAssignmentCreated,
  editMode = false,
  initialData = null,
  onAssignmentUpdated,
  onClose
}) {
  // State for campaigns, stations, analysts, and form fields
  const [campaigns, setCampaigns] = useState([]);
  const [stations, setStations] = useState([]);
  const [analysts, setAnalysts] = useState([]);
  const [campaignId, setCampaignId] = useState("");
  const [stationIds, setStationIds] = useState([]);
  const [multiSelect, setMultiSelect] = useState(!editMode); // single select in edit mode
  const [analystId, setAnalystId] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Assigned station IDs for the selected campaign
  const [assignedStationIds, setAssignedStationIds] = useState([]);

  // Fetch assigned station IDs when campaign changes
  useEffect(() => {
    if (campaignId) {
      fetchAssignedStationIds(campaignId)
        .then(ids => setAssignedStationIds(Array.isArray(ids) ? ids : []))
        .catch(() => setAssignedStationIds([]));
    } else {
      setAssignedStationIds([]);
    }
  }, [campaignId]);

  // Helper to ensure data is always an array
  const safeArray = (data) => (Array.isArray(data) ? data : []);

  // Pre-fill fields in edit mode
  useEffect(() => {
    if (editMode && initialData) {
      setCampaignId(initialData.campaign || "");
      setStationIds(initialData.station ? [initialData.station] : []);
      setAnalystId(initialData.analyst || "");
      // Parse due_date string to Date object if present
      let parsedDueDate = null;
      if (initialData.due_date) {
        const d = new Date(initialData.due_date);
        parsedDueDate = isNaN(d.getTime()) ? null : d;
      }
      setDueDate(parsedDueDate);
      setMemo(initialData.memo || "");
    }
  }, [editMode, initialData]);

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
    return Array.isArray(campaign.stations)
      ? (typeof campaign.stations[0] === 'object' ? campaign.stations.map(s => s.id) : campaign.stations)
      : [];
  };

  // Select All logic (disabled in edit mode)
  // Exclude already assigned stations for this campaign
  const availableStationIds = getCampaignStations().filter(id => !assignedStationIds.includes(id));
  const allStationIds = availableStationIds;
  const isAllSelected = stationIds.length === allStationIds.length && allStationIds.length > 0;
  const handleStationChange = (event) => {
    let value = event.target.value;
    if (editMode) {
      // Only allow single station selection in edit mode
      setStationIds([value[value.length - 1]]);
    } else if (multiSelect) {
      if (value.includes('all')) {
        setStationIds(isAllSelected ? [] : allStationIds);
      } else {
        setStationIds(typeof value === 'string' ? value.split(',') : value);
      }
    } else {
      setStationIds([value[value.length - 1]]);
    }
  };

  // Handle form submission for assignment (create or edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (editMode && initialData) {
        // PATCH/PUT to /api/assignments/:id/
        const body = {
          campaign: campaignId,
          analyst: analystId,
          station: stationIds[0],
          due_date: dueDate ? new Date(dueDate).toISOString().split('T')[0] : undefined,
          memo,
        };
        const res = await authFetch(`${API_URL}${initialData.id}/`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to update assignment");
        }
        if (onAssignmentUpdated) onAssignmentUpdated();
      } else {
        // Create (multi-station, bulk endpoint)
        const body = {
          campaign: campaignId,
          analyst: analystId,
          stations: stationIds,
          due_date: dueDate ? new Date(dueDate).toISOString().split('T')[0] : undefined,
          memo,
        };
        const res = await authFetch(API_URL + "bulk_create/", {
          method: "POST",
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to create assignments");
        }
        setCampaignId("");
        setStationIds([]);
        setAnalystId("");
        setDueDate(null);
        setMemo("");
        if (onAssignmentCreated) onAssignmentCreated();
      }
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  // Render the assignment form
  return (
    <form onSubmit={handleSubmit}>
      <h3>{editMode ? "Edit Assignment" : "Assign Campaign Station to Analyst"}</h3>
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
              setStationIds([]); // Reset stations when campaign changes
            }}
            required
            disabled={loading}
          >
            {campaigns
              .filter(c => !c.status || c.status !== 'COMPLETED')
              .map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
          </Select>
        </FormControl>
      </Box>
      {/* Station selector with Select All, hide already selected, allow single/multi */}
      <Box sx={{ mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel id="station-select-label">Station</InputLabel>
          <Select
            labelId="station-select-label"
            multiple={editMode ? false : multiSelect}
            value={stationIds}
            label="Station"
            onChange={handleStationChange}
            required
            disabled={loading || !campaignId}
            renderValue={(selected) =>
              stations
                .filter((s) => selected.includes(s.id))
                .map((s) => s.name)
                .join(', ')
            }
          >
            {!editMode && multiSelect && (
              <MenuItem value="all">
                <Checkbox checked={isAllSelected} indeterminate={stationIds.length > 0 && !isAllSelected} />
                <ListItemText primary="Select All" />
              </MenuItem>
            )}
            {availableStationIds.map(stId => {
              // Hide already selected stations if multiSelect, or show all if single
              if (!editMode && multiSelect && stationIds.includes(stId)) return null;
              const st = stations.find(s => s.id === stId);
              return st ? (
                <MenuItem key={st.id} value={st.id}>
                  {!editMode && multiSelect && <Checkbox checked={stationIds.indexOf(st.id) > -1} />}
                  <ListItemText primary={st.name} />
                </MenuItem>
              ) : null;
            })}
          </Select>
        </FormControl>
        {!editMode && (
          <div style={{ marginTop: 8 }}>
            <label>
              <input type="checkbox" checked={multiSelect} onChange={e => setMultiSelect(e.target.checked)} /> Multi-select
            </label>
          </div>
        )}
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
            value={dueDate instanceof Date && !isNaN(dueDate) ? dueDate : null}
            onChange={val => setDueDate(val instanceof Date && !isNaN(val) ? val : null)}
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
      <button type="submit" disabled={loading || !campaignId || stationIds.length === 0 || !analystId || !dueDate}>
        {loading ? (editMode ? "Saving..." : "Assigning...") : (editMode ? "Save Changes" : "Assign")}
      </button>
      {onClose && (
        <button type="button" onClick={onClose} style={{ marginLeft: 12 }}>Cancel</button>
      )}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}

export default AssignmentForm;
