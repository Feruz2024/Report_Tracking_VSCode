import React, { useEffect, useState } from "react";
import { authFetch } from "../utils/api";

const API_URL = "/api/analysts/";

function AnalystList({ refresh }) {
  const [analysts, setAnalysts] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role");
  // Deactivate/reactivate user
  const handleToggleActive = async (analyst) => {
    if (!window.confirm(`Are you sure you want to ${analyst.is_active ? 'deactivate' : 'reactivate'} this user?`)) return;
    await authFetch(`/api/users/${analyst.user_id || analyst.id}/`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: !analyst.is_active }),
    });
    setAnalysts((prev) => prev.map(a => a.id === analyst.id ? { ...a, is_active: !analyst.is_active } : a));
  };

  // Delete user
  const handleDelete = async (analyst) => {
    if (!window.confirm("Are you sure you want to permanently delete this user? This cannot be undone.")) return;
    await authFetch(`/api/users/${analyst.user_id || analyst.id}/`, {
      method: "DELETE"
    });
    setAnalysts((prev) => prev.filter(a => a.id !== analyst.id));
  };

  // Helper to ensure data is always an array
  const safeArray = (data) => (Array.isArray(data) ? data : []);

  useEffect(() => {
    setLoading(true);
    authFetch(API_URL)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        setAnalysts(safeArray(data));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [refresh]);

  if (loading) return <div>Loading analysts...</div>;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginTop: 16, justifyContent: 'center' }}>
      {analysts.map((analyst) => (
        <div
          key={analyst.id}
          style={{
            background: '#f8f9fa',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            boxShadow: '0 2px 8px rgba(49,130,206,0.08)',
            padding: '24px 32px',
            minWidth: 260,
            maxWidth: 340,
            flex: '0 1 320px',
            fontSize: 15,
            textAlign: 'left',
            marginBottom: 16,
            color: '#222',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 8,
            position: 'relative',
            transition: 'box-shadow 0.2s',
          }}
        >
          <button
            style={{ position: 'absolute', top: 12, right: 12, fontSize: 13, zIndex: 2, background: '#e2e8f0', border: 'none', borderRadius: 6, padding: '2px 10px', cursor: 'pointer' }}
            onClick={() => {
              window.open(`/edit-analyst/${analyst.id}?token=${localStorage.getItem('token')}`, 'EditAnalyst', 'width=600,height=700');
            }}
          >
            Edit
          </button>
          {role === 'admin' && (
            <>
              <button
                style={{ position: 'absolute', top: 12, left: 12, fontSize: 13, zIndex: 2, background: analyst.is_active ? '#fed7d7' : '#c6f6d5', border: 'none', borderRadius: 6, padding: '2px 10px', cursor: 'pointer' }}
                onClick={() => handleToggleActive(analyst)}
              >
                {analyst.is_active ? 'Deactivate' : 'Reactivate'}
              </button>
              <button
                style={{ position: 'absolute', bottom: 12, left: 12, fontSize: 13, zIndex: 2, background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 6, padding: '2px 10px', cursor: 'pointer' }}
                onClick={() => handleDelete(analyst)}
              >
                Delete
              </button>
            </>
          )}
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>
            {analyst.user} {analyst.is_active === false && <span style={{ color: '#e53e3e', fontWeight: 500, fontSize: 14 }}>(Inactive)</span>}
          </div>
          {analyst.full_name && <div style={{ fontSize: 15 }}><b>Full Name:</b> {analyst.full_name}</div>}
          {analyst.email && <div style={{ fontSize: 15 }}><b>Email:</b> {analyst.email}</div>}
          {analyst.role && <div style={{ fontSize: 15 }}><b>Role:</b> {analyst.role}</div>}
          {typeof analyst.is_staff !== 'undefined' && <div style={{ fontSize: 14 }}><b>Staff:</b> {analyst.is_staff ? 'Yes' : 'No'}</div>}
          {typeof analyst.is_superuser !== 'undefined' && <div style={{ fontSize: 14 }}><b>Superuser:</b> {analyst.is_superuser ? 'Yes' : 'No'}</div>}
        </div>
      ))}
    </div>
  );
}

export default AnalystList;
