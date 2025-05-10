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
    <div>
      <h2>Media Analysts</h2>
      <ul>
        {analysts.map((analyst) => (
          <li key={analyst.id}>
            <strong>{analyst.user}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AnalystList;
