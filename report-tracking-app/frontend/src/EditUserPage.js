import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UserForm from "./entities/UserForm";
import { authFetch } from "./utils/api";

export default function EditUserPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(`/api/users/${id}/`).then(res => res.ok ? res.json() : null).then(data => {
      setUser(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found.</div>;

  return (
    <div style={{ padding: 24, background: '#fff', minWidth: 350, maxWidth: 600 }}>
      <UserForm editMode={true} initialData={user} onUserUpdated={() => window.close()} onClose={() => window.close()} />
    </div>
  );
}
