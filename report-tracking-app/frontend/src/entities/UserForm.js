import React, { useState } from "react";

const API_URL = process.env.REACT_APP_API_URL + "/api/register/"; // Use backend API base URL for user creation


function UserForm({ onUserCreated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); // Default to empty (no selection)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roleError, setRoleError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRoleError("");
    setError("");
    if (!role) {
      setRoleError("Please select a user role/group.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`
        },
  // Ensure role is 'Analysts' for analyst registration
  body: JSON.stringify({ username, password, role: role === 'analyst' ? 'Analysts' : role }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create user");
      }
      setUsername("");
      setPassword("");
      setRole(""); // Reset role to default (no selection)
      if (onUserCreated) onUserCreated();
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add User</h3> {/* Changed title to Add User */}
      <div>
        <label>
          Username:{" "}
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
        </label>
      </div>
      <div>
        <label>
          Password:{" "}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </label>
      </div>
      <div>
        <label>
          Role: {" "}
          <select value={role} onChange={(e) => setRole(e.target.value)} disabled={loading} required>
            <option value="">Select user</option>
            <option value="Admins">Admins</option>
            <option value="Analysts">Analysts</option>
            <option value="Managers">Managers</option>
            <option value="Accountants">Accountants</option>
          </select>
        </label>
        {roleError && <div style={{ color: "red" }}>{roleError}</div>}
      </div>
      <button type="submit" disabled={loading || !username || !password}>
        {loading ? "Adding..." : "Add User"} {/* Changed button text */}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}

export default UserForm; // Changed from AnalystForm
