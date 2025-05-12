
import React, { useEffect, useState } from "react";
import { authFetch } from "../utils/api";

const API_URL = "/api/clients/";

function ClientList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);


  // Helper to ensure data is always an array
  const safeArray = (data) => (Array.isArray(data) ? data : []);

  useEffect(() => {
    authFetch(API_URL)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        setClients(safeArray(data));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading clients...</div>;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
      {clients.map((client) => (
        <div
          key={client.id}
          style={{
            background: '#f8f9fa',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            boxShadow: 'none',
            padding: 6,
            minWidth: 70,
            maxWidth: 90,
            flex: '0 0 60px',
            fontSize: 11,
            textAlign: 'center',
            marginBottom: 6,
            color: '#222',
          }}
        >
          <div style={{ fontWeight: 600 }}>{client.name}</div>
          {client.description && <div style={{ color: '#888', fontSize: 10 }}>{client.description}</div>}
        </div>
      ))}
    </div>
  );
}

export default ClientList;
