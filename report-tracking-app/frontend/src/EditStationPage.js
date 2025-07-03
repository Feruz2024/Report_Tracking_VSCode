import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StationForm from "./entities/StationForm";
import { authFetch } from "./utils/api";

export default function EditStationPage() {
  const { id } = useParams();
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(`/api/stations/${id}/`).then(res => res.ok ? res.json() : null).then(data => {
      setStation(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!station) return <div>Station not found.</div>;

  return (
    <div style={{ padding: 24, background: '#fff', minWidth: 350, maxWidth: 600 }}>
      <StationForm editMode={true} initialData={station} onStationUpdated={() => window.close()} onClose={() => window.close()} />
    </div>
  );
}
