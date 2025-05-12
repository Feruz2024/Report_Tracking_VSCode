
import React, { useState, useEffect } from "react";
import { authFetch } from "../utils/api";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";

const API_URL = "/api/campaigns/";
const CLIENTS_API_URL = "/api/clients/";
const STATIONS_API_URL = "/api/stations/";
const MONITORING_PERIODS_API_URL = "/api/monitoring-periods/";

function CampaignForm({ onCampaignCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [clients, setClients] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedStations, setSelectedStations] = useState([]);
  const [monitoringPeriods, setMonitoringPeriods] = useState([
    { monitoring_start: "", monitoring_end: "", authentication_start: "", authentication_end: "" }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleStationChange = (event) => {
    const value = event.target.value;
    setSelectedStations(typeof value === 'string' ? value.split(',') : value);
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
      // 1. Create campaign
      const res = await authFetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
          name,
          description,
          client: clientId,
          stations: selectedStations
        }),
      });
      if (!res.ok) throw new Error("Failed to create campaign");
      const campaign = await res.json();
      // 2. Create monitoring periods
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
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', marginBottom: '16px', maxWidth: '600px', margin: '0 auto' }}>
        <h3>Add Campaign</h3>
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
              disabled={loading}
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
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
              {stations.map((station) => (
                <MenuItem key={station.id} value={station.id}>
                  <Checkbox checked={selectedStations.indexOf(station.id) > -1} />
                  <ListItemText primary={station.name} />
                </MenuItem>
              ))}
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
      <button type="submit" disabled={loading || !name || !clientId || selectedStations.length === 0}>
        {loading ? "Adding..." : "Add Campaign"}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}

export default CampaignForm;
