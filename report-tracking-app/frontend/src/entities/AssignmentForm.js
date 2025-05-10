import React, { useEffect, useState } from "react";
import { authFetch } from "../utils/api";

const API_URL = "/api/assignments/";
const CAMPAIGNS_API_URL = "/api/campaigns/";
const STATIONS_API_URL = "/api/stations/";
const ANALYSTS_API_URL = "/api/analysts/";

function AssignmentForm({ onAssignmentCreated }) {
  const [campaigns, setCampaigns] = useState([]);
  const [stations, setStations] = useState([]);
  const [analysts, setAnalysts] = useState([]);
  const [campaignId, setCampaignId] = useState("");
  const [stationId, setStationId] = useState("");
  const [analystId, setAnalystId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper to ensure data is always an array
  const safeArray = (data) => (Array.isArray(data) ? data : []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body = { campaign: campaignId, analyst: analystId };
      if (stationId) body.station = stationId;
      const res = await authFetch(API_URL, {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create assignment");
      setCampaignId("");
      setStationId("");
      setAnalystId("");
      if (onAssignmentCreated) onAssignmentCreated();
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Assign Campaign/Station to Analyst</h3>
      <div>
        <label>
          Campaign:{" "}
          <select
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            required
            disabled={loading}
          >
            <option value="">Select a campaign</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <label>
          Station (optional):{" "}
          <select
            value={stationId}
            onChange={(e) => setStationId(e.target.value)}
            disabled={loading}
          >
            <option value="">None</option>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <label>
          Analyst:{" "}
          <select
            value={analystId}
            onChange={(e) => setAnalystId(e.target.value)}
            required
            disabled={loading}
          >
            <option value="">Select an analyst</option>
            {analysts.map((analyst) => (
              <option key={analyst.id} value={analyst.id}>
                {analyst.user}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button type="submit" disabled={loading || !campaignId || !analystId}>
        {loading ? "Assigning..." : "Assign"}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}

export default AssignmentForm;
