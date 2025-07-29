import React, { useEffect, useState } from "react";
import { authFetch } from "../utils/api";

const STATIONS_API_URL = "/api/stations/";

function CompletedStationList({ refresh }) {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    authFetch(STATIONS_API_URL)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        setStations(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [refresh]);

  if (loading) return <div>Loading stations...</div>;

  // Only show stations that are not active
  const completedStations = stations.filter(s => !s.is_active);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginTop: 16, justifyContent: 'center' }}>
      {completedStations.length === 0 && <div style={{ color: '#888', fontStyle: 'italic' }}>No completed stations found.</div>}
      {completedStations.map((station) => (
        <div
          key={station.id}
          style={{
            background: '#f8f9fa',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            boxShadow: '0 2px 8px rgba(49,130,206,0.08)',
            padding: '24px 32px',
            minWidth: 260,
            maxWidth: 340,
            flex: '0 1 320px',
            fontSize: 15,
            textAlign: 'left',
            marginBottom: 16,
            color: '#222',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 8,
            position: 'relative',
            transition: 'box-shadow 0.2s',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>{station.name}</div>
          {station.type && <div style={{ fontSize: 15 }}><b>Type:</b> {station.type}</div>}
          {station.frequency && <div style={{ fontSize: 15 }}><b>Frequency:</b> {station.frequency}</div>}
          {station.location && <div style={{ fontSize: 15 }}><b>Location:</b> {station.location}</div>}
        </div>
      ))}
    </div>
  );
}

export default CompletedStationList;
