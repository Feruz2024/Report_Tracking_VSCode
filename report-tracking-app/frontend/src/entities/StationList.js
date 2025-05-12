import React, { useEffect, useState } from "react";
import { authFetch } from "../utils/api";

const API_URL = "/api/stations/";

function StationList() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to ensure data is always an array
  const safeArray = (data) => (Array.isArray(data) ? data : []);

  useEffect(() => {
    authFetch(API_URL)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        setStations(safeArray(data));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading stations...</div>;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8, justifyContent: 'center' }}>
      {stations.map((station) => (
        <div
          key={station.id}
          style={{
            background: '#f8f9fa',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            boxShadow: 'none',
            padding: 12,
            minWidth: 220,
            maxWidth: 320,
            flex: '0 1 260px',
            fontSize: 13,
            textAlign: 'left',
            marginBottom: 12,
            color: '#222',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 4,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 15 }}>{station.name}</div>
          {station.type && <div><b>Type:</b> {station.type === 'radio' ? 'Radio' : station.type === 'tv' ? 'TV' : station.type}</div>}
          {station.frequency && <div><b>Frequency:</b> {station.frequency}</div>}
          {station.location && <div><b>Location:</b> {station.location}</div>}
          {station.contacts && Array.isArray(station.contacts) && station.contacts.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <b>Contacts:</b>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {station.contacts.map((c, i) => (
                  <li key={i} style={{ fontSize: 12 }}>
                    <b>{c.type}:</b> {c.name} {c.email && <>| <a href={`mailto:${c.email}`}>{c.email}</a></>} {c.phone && <>| {c.phone}</>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default StationList;
