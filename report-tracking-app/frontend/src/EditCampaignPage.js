import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CampaignForm from "./entities/CampaignForm";
import { authFetch } from "./utils/api";

export default function EditCampaignPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(`/api/campaigns/${id}/`).then(res => res.ok ? res.json() : null).then(data => {
      setCampaign(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!campaign) return <div>Campaign not found.</div>;

  return (
    <div style={{ padding: 24, background: '#fff', minWidth: 350, maxWidth: 600 }}>
      <CampaignForm editMode={true} initialData={campaign} onCampaignUpdated={() => window.close()} onClose={() => window.close()} />
    </div>
  );
}
