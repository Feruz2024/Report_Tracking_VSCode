
import React, { useState, useEffect } from "react";
import { authFetch } from "../utils/api";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";

const API_URL = "/api/campaigns/";
const CLIENTS_API_URL = "/api/clients/";
const STATIONS_API_URL = "/api/stations/";
const MONITORING_PERIODS_API_URL = "/api/monitoring-periods/";

// (Removed duplicate function definition. Only the editMode-supporting CampaignForm remains below.)

function CampaignForm({ onCampaignCreated, onCampaignUpdated, onClose, editMode = false, initialData = {} }) {
  const [name, setName] = useState(initialData.name || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [clientId, setClientId] = useState(initialData.client || "");
  const [clients, setClients] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedStations, setSelectedStations] = useState(
    initialData.stations ? (Array.isArray(initialData.stations) ? (typeof initialData.stations[0] === 'object' ? initialData.stations.map(s => s.id) : initialData.stations) : []) : []
  );
  const [monitoringPeriods, setMonitoringPeriods] = useState([]);
  const [status, setStatus] = useState(initialData.status || "ACTIVE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch monitoring periods for edit mode
  useEffect(() => {
    if (editMode && initialData.id) {
      authFetch(`/api/monitoring-periods/?campaign=${initialData.id}`)
        .then(res => res.ok ? res.json() : [])
        .then(periods => {
          if (Array.isArray(periods) && periods.length > 0) {
            setMonitoringPeriods(periods.map(mp => ({
              monitoring_start: mp.monitoring_start || "",
              monitoring_end: mp.monitoring_end || "",
              authentication_start: mp.authentication_start || "",
              authentication_end: mp.authentication_end || ""
            })));
          } else {
            setMonitoringPeriods([{ monitoring_start: "", monitoring_end: "", authentication_start: "", authentication_end: "" }]);
          }
        })
        .catch(() => setMonitoringPeriods([{ monitoring_start: "", monitoring_end: "", authentication_start: "", authentication_end: "" }]));
    } else {
      setMonitoringPeriods(
        initialData.monitoring_periods && Array.isArray(initialData.monitoring_periods) && initialData.monitoring_periods.length > 0
          ? initialData.monitoring_periods.map(mp => ({
              monitoring_start: mp.monitoring_start || "",
              monitoring_end: mp.monitoring_end || "",
              authentication_start: mp.authentication_start || "",
              authentication_end: mp.authentication_end || ""
            }))
          : [{ monitoring_start: "", monitoring_end: "", authentication_start: "", authentication_end: "" }]
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode, initialData.id]);

  // Helper to ensure data is always an array
  const safeArray = (data) => (Array.isArray(data) ? data : []);

  useEffect(() => {
    authFetch(CLIENTS_API_URL)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setClients(safeArray(data)))
      .catch(() => setClients([]));
    authFetch(STATIONS_API_URL)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setStations(safeArray(data)))
      .catch(() => setStations([]));
  }, []);

  // Helper: group stations by medium
  const groupStationsByMedium = (stations) => {
    const groups = { radio: [], tv: [], other: [] };
    stations.forEach(station => {
      if (station.type === 'radio') groups.radio.push(station);
      else if (station.type === 'tv') groups.tv.push(station);
      else groups.other.push(station);
    });
    return groups;
  };

  // Select All logic
  const allStationIds = stations.map(s => s.id);
  const isAllSelected = selectedStations.length === allStationIds.length && allStationIds.length > 0;
  const handleStationChange = (event) => {
    const value = event.target.value;
    if (value.includes('all')) {
      setSelectedStations(isAllSelected ? [] : allStationIds);
    } else {
      setSelectedStations(typeof value === 'string' ? value.split(',') : value);
    }
  };

  const handlePeriodChange = (idx, field, value) => {
    setMonitoringPeriods(periods => periods.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const addPeriod = () => {
    setMonitoringPeriods(periods => [
      ...periods,
      { monitoring_start: "", monitoring_end: "", authentication_start: "", authentication_end: "" }
    ]);
  };

  const removePeriod = (idx) => {
    setMonitoringPeriods(periods => periods.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let campaign = null;
      if (editMode && initialData.id) {
        // Update campaign
        const res = await authFetch(`${API_URL}${initialData.id}/`, {
          method: "PATCH",
          body: JSON.stringify({
            name,
            description,
            client: clientId,
            stations: selectedStations,
            status,
          }),
        });
        if (!res.ok) throw new Error("Failed to update campaign");
        campaign = await res.json();

        // 1. Fetch all old monitoring periods for this campaign
        const mpListRes = await authFetch(`${MONITORING_PERIODS_API_URL}?campaign=${campaign.id}`);
        if (!mpListRes.ok) throw new Error("Failed to fetch monitoring periods");
        const oldPeriods = await mpListRes.json();

        // 2. Delete all old monitoring periods
        for (const old of oldPeriods) {
          await authFetch(`${MONITORING_PERIODS_API_URL}${old.id}/`, { method: "DELETE" });
        }

        // 3. Create new monitoring periods from form
        for (const period of monitoringPeriods) {
          if (
            period.monitoring_start && period.monitoring_end &&
            period.authentication_start && period.authentication_end
          ) {
            const mpRes = await authFetch(MONITORING_PERIODS_API_URL, {
              method: "POST",
              body: JSON.stringify({
                campaign: campaign.id,
                monitoring_start: period.monitoring_start,
                monitoring_end: period.monitoring_end,
                authentication_start: period.authentication_start,
                authentication_end: period.authentication_end
              })
            });
            if (!mpRes.ok) throw new Error("Failed to create monitoring period");
          }
        }

        if (onCampaignUpdated) onCampaignUpdated(campaign);
      } else {
        // Create campaign
        const res = await authFetch(API_URL, {
          method: "POST",
          body: JSON.stringify({
            name,
            description,
            client: clientId,
            stations: selectedStations
            // status is not set on create, always ACTIVE
          }),
        });
        if (!res.ok) throw new Error("Failed to create campaign");
        campaign = await res.json();
        // Create monitoring periods
        for (const period of monitoringPeriods) {
          if (
            period.monitoring_start && period.monitoring_end &&
            period.authentication_start && period.authentication_end
          ) {
            const mpRes = await authFetch(MONITORING_PERIODS_API_URL, {
              method: "POST",
              body: JSON.stringify({
                campaign: campaign.id,
                monitoring_start: period.monitoring_start,
                monitoring_end: period.monitoring_end,
                authentication_start: period.authentication_start,
                authentication_end: period.authentication_end
              })
            });
            if (!mpRes.ok) throw new Error("Failed to create monitoring period");
          }
        }
        setName("");
        setDescription("");
        setClientId("");
        setSelectedStations([]);
        setMonitoringPeriods([
          { monitoring_start: "", monitoring_end: "", authentication_start: "", authentication_end: "" }
        ]);
        if (onCampaignCreated) onCampaignCreated();
      }
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  // Remove blocking UI if no clients; allow form to render regardless
  return (
    <form onSubmit={handleSubmit}>
      <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', marginBottom: '16px', maxWidth: '600px', margin: '0 auto' }}>
        <h3>Add Campaign</h3>
        <h3>{editMode ? 'Edit Campaign' : 'Add Campaign'}</h3>
        <div>
          <label>
            Name:{" "}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </label>
        </div>
        {/* Completed checkbox for admin/manager in edit mode */}
        {editMode && (
          <div style={{ margin: '12px 0' }}>
            <label style={{ fontWeight: 500, color: '#22577a' }}>
              <input
                type="checkbox"
                checked={status === 'COMPLETED'}
                onChange={e => setStatus(e.target.checked ? 'COMPLETED' : 'ACTIVE')}
                disabled={loading}
                style={{ marginRight: 8 }}
              />
              Mark campaign as completed
            </label>
            <span style={{ marginLeft: 12, color: status === 'COMPLETED' ? 'green' : '#718096', fontWeight: 600 }}>
              {status === 'COMPLETED' ? 'Completed' : 'Active'}
            </span>
          </div>
        )}
        <div>
          <label>
            Description:{" "}
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </label>
        </div>
        <div>
          <label>
            Client:{" "}
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              disabled={loading || clients.length === 0}
            >
              <option value="">{clients.length === 0 ? "No clients available" : "Select a client"}</option>
              {/* Only show clients that are not completed */}
              {clients
                .filter(client => !client.status || client.status !== 'COMPLETED')
                .map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
            </select>
          </label>
        </div>
        <Box sx={{ mt: 2, mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="stations-multiselect-label">Stations (multi-select)</InputLabel>
            <Select
              labelId="stations-multiselect-label"
              multiple
              value={selectedStations}
              onChange={handleStationChange}
              renderValue={(selected) =>
                stations
                  .filter((s) => selected.includes(s.id))
                  .map((s) => s.name)
                  .join(', ')
              }
              disabled={loading}
              label="Stations (multi-select)"
            >
              <MenuItem value="all">
                <Checkbox checked={isAllSelected} indeterminate={selectedStations.length > 0 && !isAllSelected} />
                <ListItemText primary="Select All" />
              </MenuItem>
              {(() => {
                const groups = groupStationsByMedium(stations);
                const items = [];
                if (groups.radio.length) {
                  items.push(<ListSubheader key="radio">Radio Stations</ListSubheader>);
                  groups.radio.forEach(station => {
                    items.push(
                      <MenuItem key={station.id} value={station.id}>
                        <Checkbox checked={selectedStations.indexOf(station.id) > -1} />
                        <ListItemText primary={station.name} />
                      </MenuItem>
                    );
                  });
                }
                if (groups.tv.length) {
                  items.push(<ListSubheader key="tv">TV Stations</ListSubheader>);
                  groups.tv.forEach(station => {
                    items.push(
                      <MenuItem key={station.id} value={station.id}>
                        <Checkbox checked={selectedStations.indexOf(station.id) > -1} />
                        <ListItemText primary={station.name} />
                      </MenuItem>
                    );
                  });
                }
                if (groups.other.length) {
                  items.push(<ListSubheader key="other">Other Stations</ListSubheader>);
                  groups.other.forEach(station => {
                    items.push(
                      <MenuItem key={station.id} value={station.id}>
                        <Checkbox checked={selectedStations.indexOf(station.id) > -1} />
                        <ListItemText primary={station.name} />
                      </MenuItem>
                    );
                  });
                }
                return items;
              })()}
            </Select>
          </FormControl>
        </Box>
      </div>
      <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
        <label>Monitoring & Authentication Periods:</label>
        {monitoringPeriods.map((period, idx) => (
          <div key={idx} style={{ border: '1px solid #ccc', margin: 4, padding: 4, borderRadius: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center' }}>
              <span>Monitoring Start:</span>
              <input
                type="date"
                value={period.monitoring_start}
                onChange={(e) => handlePeriodChange(idx, 'monitoring_start', e.target.value)}
                required
              />
              <span>End:</span>
              <input
                type="date"
                value={period.monitoring_end}
                onChange={(e) => handlePeriodChange(idx, 'monitoring_end', e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center', marginTop: 4 }}>
              <span>Authentication Start:</span>
              <input
                type="date"
                value={period.authentication_start}
                onChange={(e) => handlePeriodChange(idx, 'authentication_start', e.target.value)}
                required
              />
              <span>End:</span>
              <input
                type="date"
                value={period.authentication_end}
                onChange={(e) => handlePeriodChange(idx, 'authentication_end', e.target.value)}
                required
              />
            </div>
            {monitoringPeriods.length > 1 && (
              <button
                type="button"
                onClick={() => removePeriod(idx)}
                disabled={loading}
                style={{ marginTop: 6 }}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addPeriod}
          disabled={loading}
          style={{ marginTop: 6 }}
        >
          Add Period
        </button>
      </div>
      <button type="submit" disabled={loading || !name || selectedStations.length === 0}>
        {loading ? (editMode ? "Saving..." : "Adding...") : (editMode ? "Save Changes" : "Add Campaign")}
      </button>
      {onClose && (
        <button type="button" onClick={onClose} style={{ marginLeft: 8 }} disabled={loading}>Cancel</button>
      )}
      {(!clientId || clients.length === 0) && (
        <div style={{ color: '#e53e3e', fontWeight: 600, padding: 8, textAlign: 'center', marginTop: 8 }}>
          Warning: You must select a client to create a campaign.
        </div>
      )}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}

export default CampaignForm;
