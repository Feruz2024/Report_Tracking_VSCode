import React, { useEffect, useState } from "react";
import { authFetch } from "../utils/api";

const API_URL = "/api/analysts/";

function AnalystList() {
  const [analysts, setAnalysts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to ensure data is always an array
  const safeArray = (data) => (Array.isArray(data) ? data : []);

  useEffect(() => {
    authFetch(API_URL)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        setAnalysts(safeArray(data));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading analysts...</div>;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
      {analysts.map((analyst) => (
        <div
          key={analyst.id}
          style={{
            background: '#f8f9fa',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            boxShadow: 'none',
            padding: 6,
            minWidth: 70,
            maxWidth: 70,
            flex: '0 0 60px',
            fontSize: 11,
            textAlign: 'center',
            marginBottom: 6,
            color: '#222',
          }}
        >
          <div style={{ fontWeight: 600 }}>{analyst.user}</div>
        </div>
      ))}
    </div>
  );
}

export default AnalystList;
