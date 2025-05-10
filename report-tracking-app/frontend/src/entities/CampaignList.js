import React, { useEffect, useState } from "react";
import { authFetch } from "../utils/api";

const API_URL = "/api/campaigns/";
const CLIENTS_API_URL = "/api/clients/";

function CampaignList() {
  const [campaigns, setCampaigns] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to ensure data is always an array
  const safeArray = (data) => (Array.isArray(data) ? data : []);

  useEffect(() => {
    Promise.all([
      authFetch(API_URL).then((res) => res.ok ? res.json() : []),
      authFetch(CLIENTS_API_URL).then((res) => res.ok ? res.json() : []),
    ])
      .then(([campaignsData, clientsData]) => {
        setCampaigns(safeArray(campaignsData));
        setClients(safeArray(clientsData));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.name : "Unknown";
  };

  if (loading) return <div>Loading campaigns...</div>;

  return (
    <div>
      <h2>Campaigns</h2>
      <ul>
        {campaigns.map((campaign) => (
          <li key={campaign.id}>
            <strong>{campaign.name}</strong>
            {campaign.description && <> - {campaign.description}</>}
            {" | Client: "}
            {getClientName(campaign.client)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CampaignList;
