import React, { useState, useEffect } from "react";
import { fetchUsers, deleteUser, toggleUserActive } from "../utils/api";



function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [actionError, setActionError] = useState("");

  // Fetch users on mount and after actions
  const refetchUsers = () => {
    setLoading(true);
    fetchUsers()
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load users");
        setLoading(false);
      });
  };

  useEffect(() => {
    refetchUsers();
  }, []);

  // ...existing code...

  if (loading) return <div>Loading users...</div>;
  if (error) return <div style={{ color: 'red' }}>Error loading users: {error}</div>;
  if (!users || users.length === 0) return <div>No users found. (Check API and context.)</div>;

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setActionLoading((prev) => ({ ...prev, [userId]: true }));
    setActionError("");
    try {
      await deleteUser(userId);
      refetchUsers();
    } catch (err) {
      setActionError(err.message || "Failed to delete user");
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    setActionLoading((prev) => ({ ...prev, [userId]: true }));
    setActionError("");
    try {
      await toggleUserActive(userId, !isActive);
      refetchUsers();
    } catch (err) {
      setActionError(err.message || "Failed to update user status");
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <div>
      {actionError && <div style={{ color: 'red', marginBottom: 8 }}>{actionError}</div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginTop: 16, justifyContent: 'center' }}>
        {users.map((user) => (
          <div
            key={user.id}
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
                window.open(`/edit-user/${user.id}`, 'EditUser', 'width=600,height=700');
              }}
            >
              Edit
            </button>
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>{user.username}</div>
            {user.email && <div style={{ fontSize: 15 }}><b>Email:</b> {user.email}</div>}
            {user.role && <div style={{ fontSize: 15 }}><b>Role:</b> {user.role}</div>}
            <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
              <button
                style={{ background: '#e57373', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', opacity: actionLoading[user.id] ? 0.6 : 1 }}
                onClick={() => handleDelete(user.id)}
                disabled={actionLoading[user.id]}
              >
                Delete
              </button>
              <button
                style={{ background: user.is_active ? '#90caf9' : '#81c784', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', opacity: actionLoading[user.id] ? 0.6 : 1 }}
                onClick={() => handleToggleActive(user.id, user.is_active)}
                disabled={actionLoading[user.id]}
              >
                {user.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserList;
