

import React, { useEffect, useState } from "react";
import { authFetch } from "../utils/api";
import { FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, OutlinedInput, TextField, Box } from "@mui/material";
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export default function CampaignExecutionExportPanel() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [format, setFormat] = useState("csv");
  const [status, setStatus] = useState("");

  useEffect(() => {
    authFetch("/api/clients/")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setClients(Array.isArray(data) ? data : []));
  }, []);

  const handleClientSelect = (id) => {
    setSelectedClients((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const handleExport = async () => {
    setStatus("");
    if (selectedClients.length === 0) {
      setStatus("Please select at least one client.");
      return;
    }
    let url = `/api/export/campaign-execution/?client_id=${selectedClients.join(",")}&format=${format}`;
    if (startDate) url += `&start_date=${encodeURIComponent(startDate.toISOString().slice(0,10))}`;
    if (endDate) url += `&end_date=${encodeURIComponent(endDate.toISOString().slice(0,10))}`;
    const res = await authFetch(url);
    if (res.ok) {
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = window.URL.createObjectURL(blob);
      a.download = `campaign_execution_export.${format}`;
      a.click();
      setStatus("Export successful.");
    } else {
      setStatus("Export failed. Please try again.");
    }
  };

  return (
    <div style={{ padding: 24, background: "#fff", borderRadius: 12, maxWidth: 600, margin: "0 auto" }}>
      <h2>Export Campaign Execution Data</h2>
      <div style={{ marginBottom: 16 }}>
        <b>Select Client(s):</b>
        <FormControl sx={{ mt: 1, width: '100%' }} size="small">
          <InputLabel id="client-multi-select-label">Clients</InputLabel>
          <Select
            labelId="client-multi-select-label"
            multiple
            value={selectedClients}
            onChange={e => setSelectedClients(e.target.value)}
            input={<OutlinedInput label="Clients" />}
            renderValue={selected =>
              clients
                .filter(c => selected.includes(c.id))
                .map(c => c.name)
                .join(', ')
            }
          >
            {clients.map(client => (
              <MenuItem key={client.id} value={client.id}>
                <Checkbox checked={selectedClients.includes(client.id)} />
                <ListItemText primary={client.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <div style={{ marginBottom: 16 }}>
        <b>Select Period:</b>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              renderInput={(params) => <TextField {...params} size="small" />}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              renderInput={(params) => <TextField {...params} size="small" />}
            />
          </Box>
        </LocalizationProvider>
      </div>
      <div style={{ marginBottom: 16 }}>
        <b>File Format:</b>
        <label style={{ marginLeft: 16 }}>
          <input
            type="radio"
            checked={format === "csv"}
            onChange={() => setFormat("csv")}
          />
          CSV
        </label>
        <label style={{ marginLeft: 16 }}>
          <input
            type="radio"
            checked={format === "json"}
            onChange={() => setFormat("json")}
          />
          JSON
        </label>
      </div>
      <button onClick={handleExport} style={{ marginTop: 8, padding: "8px 20px", borderRadius: 6, background: "#3182ce", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}>
        Export
      </button>
      {status && <div style={{ color: status.includes("success") ? "#228B22" : "#b22222", marginTop: 12 }}>{status}</div>}
    </div>
  );
}
