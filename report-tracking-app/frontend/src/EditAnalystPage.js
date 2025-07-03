import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AnalystForm from "./entities/AnalystForm";
import { authFetch } from "./utils/api";

export default function EditAnalystPage() {
  const { id } = useParams();
  const [analyst, setAnalyst] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(`/api/analysts/${id}/`).then(res => res.ok ? res.json() : null).then(data => {
      setAnalyst(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!analyst) return <div>Analyst not found.</div>;

  return (
    <div style={{ padding: 24, background: '#fff', minWidth: 350, maxWidth: 600 }}>
      <AnalystForm editMode={true} initialData={analyst} onAnalystUpdated={() => window.close()} onClose={() => window.close()} />
    </div>
  );
}
