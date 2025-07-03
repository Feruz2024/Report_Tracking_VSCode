import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ClientForm from "./entities/ClientForm";
import { authFetch } from "./utils/api";

export default function EditClientPage() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(`/api/clients/${id}/`).then(res => res.ok ? res.json() : null).then(data => {
      setClient(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!client) return <div>Client not found.</div>;

  return (
    <div style={{ padding: 24, background: '#fff', minWidth: 350, maxWidth: 500 }}>
      <ClientForm editMode={true} initialData={client} onClientUpdated={() => window.close()} onClose={() => window.close()} />
    </div>
  );
}
