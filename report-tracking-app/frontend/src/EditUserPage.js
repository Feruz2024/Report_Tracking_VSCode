
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UserForm from "./entities/UserForm";
import { authFetch } from "./utils/api";

// Helper to get query param from URL
function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

export default function EditUserPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    // Try to get token from query string (for popup window auth)
    const tokenFromQuery = getQueryParam('token');
    const token = tokenFromQuery || localStorage.getItem('token');
    // Custom fetch with token
    fetch(`/api/users/${id}/`, {
      headers: token ? { 'Authorization': `Token ${token}` } : {}
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
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
