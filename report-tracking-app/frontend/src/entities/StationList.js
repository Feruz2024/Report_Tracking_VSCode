import React, { useEffect, useState } from "react";
import { authFetch, toggleStationActive } from "../utils/api";

const API_URL = "/api/stations/";

function StationList({ refresh }) {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('TV'); // 'TV' or 'Radio'

  // Helper to ensure data is always an array
  const safeArray = (data) => (Array.isArray(data) ? data : []);

  useEffect(() => {
    setLoading(true);
    authFetch(API_URL)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        setStations(safeArray(data));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [refresh]);

  const [actionLoading, setActionLoading] = useState({});
  const [actionError, setActionError] = useState("");

  if (loading) return <div>Loading stations...</div>;

  const handleToggleActive = async (stationId, isActive) => {
    setActionLoading((prev) => ({ ...prev, [stationId]: true }));
    setActionError("");
    try {
      await toggleStationActive(stationId, !isActive);
      // Refetch stations
      setLoading(true);
      authFetch(API_URL)
        .then((res) => res.ok ? res.json() : [])
        .then((data) => {
          setStations(safeArray(data));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } catch (err) {
      setActionError(err.message || "Failed to update station status");
    } finally {
      setActionLoading((prev) => ({ ...prev, [stationId]: false }));
    }
  };

  // Tab UI and filtering
  const tabStyle = (active) => ({
    padding: '8px 24px',
    border: 'none',
    borderBottom: active ? '3px solid #1976d2' : '3px solid transparent',
    background: 'none',
    fontWeight: active ? 700 : 400,
    fontSize: 17,
    color: active ? '#1976d2' : '#444',
    cursor: 'pointer',
    outline: 'none',
    marginRight: 16,
    marginBottom: 8,
    transition: 'border-bottom 0.2s, color 0.2s',
  });

  const filteredStations = stations.filter(s => (tab === 'TV' ? s.type === 'TV' : s.type === 'Radio'));

  return (
    <div>
      {/* Tab selector */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: 12 }}>
        <button style={tabStyle(tab === 'TV')} onClick={() => setTab('TV')}>TV Stations</button>
        <button style={tabStyle(tab === 'Radio')} onClick={() => setTab('Radio')}>Radio Stations</button>
      </div>
      {actionError && <div style={{ color: 'red', marginBottom: 8 }}>{actionError}</div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginTop: 16, justifyContent: 'center' }}>
        {filteredStations.length === 0 && (
          <div style={{ color: '#888', fontSize: 16, marginTop: 32 }}>
            No {tab === 'TV' ? 'TV' : 'Radio'} stations found.
          </div>
        )}
        {filteredStations.map((station) => (
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
            <button
              style={{ position: 'absolute', top: 12, right: 12, fontSize: 13, zIndex: 2, background: '#e2e8f0', border: 'none', borderRadius: 6, padding: '2px 10px', cursor: 'pointer' }}
              onClick={() => {
                window.open(`/edit-station/${station.id}?token=${localStorage.getItem('token')}`, 'EditStation', 'width=600,height=700');
              }}
            >
              Edit
            </button>
            {localStorage.getItem('role') === 'admin' && (
              <button
                style={{ position: 'absolute', top: 12, left: 12, fontSize: 13, zIndex: 2, background: '#e57373', color: '#fff', border: 'none', borderRadius: 6, padding: '2px 10px', cursor: 'pointer', opacity: actionLoading[station.id] ? 0.6 : 1 }}
                onClick={async () => {
                  if (window.confirm('Are you sure you want to permanently delete this station? This cannot be undone.')) {
                    setActionLoading((prev) => ({ ...prev, [station.id]: true }));
                    await authFetch(`${API_URL}${station.id}/`, { method: 'DELETE' });
                    setStations((prev) => prev.filter(s => s.id !== station.id));
                    setActionLoading((prev) => ({ ...prev, [station.id]: false }));
                  }
                }}
                disabled={actionLoading[station.id]}
              >
                Delete
              </button>
            )}
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>{station.name}</div>
            {station.type && <div style={{ fontSize: 15 }}><b>Type:</b> {station.type === 'Radio' ? 'Radio' : station.type === 'TV' ? 'TV' : station.type}</div>}
            {station.frequency && <div style={{ fontSize: 15 }}><b>Frequency:</b> {station.frequency}</div>}
            {station.location && <div style={{ fontSize: 15 }}><b>Location:</b> {station.location}</div>}
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
            <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
              <button
                style={{ background: station.is_active ? '#90caf9' : '#81c784', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', opacity: actionLoading[station.id] ? 0.6 : 1 }}
                onClick={() => handleToggleActive(station.id, station.is_active)}
                disabled={actionLoading[station.id]}
              >
                {station.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>

        ))}
      </div>
    </div>
  );
}

export default StationList;
