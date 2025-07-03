import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AssignmentForm from "./entities/AssignmentForm";
import { authFetch } from "./utils/api";

export default function EditAssignmentPage() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(`/api/assignments/${id}/`).then(res => res.ok ? res.json() : null).then(data => {
      setAssignment(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!assignment) return <div>Assignment not found.</div>;

  return (
    <div style={{ padding: 24, background: '#fff', minWidth: 350, maxWidth: 700 }}>
      <AssignmentForm editMode={true} initialData={assignment} onAssignmentUpdated={() => window.close()} onClose={() => window.close()} />
    </div>
  );
}
