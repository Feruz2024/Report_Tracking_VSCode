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
    <div>
      <h2>Stations</h2>
      <ul>
        {stations.map((station) => (
          <li key={station.id}>
            <strong>{station.name}</strong>
            {station.location && <> - {station.location}</>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StationList;
