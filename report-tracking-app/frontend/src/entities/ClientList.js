
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
    <div>
      <h2>Clients</h2>
      <ul>
        {clients.map((client) => (
          <li key={client.id}>
            <strong>{client.name}</strong>
            {client.description && <> - {client.description}</>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ClientList;
