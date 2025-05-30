import React, { useState } from "react";

const API_URL = "/api/register/"; // Changed to /api/register/ for general user creation

function UserForm({ onUserCreated }) { // Changed from AnalystForm and onAnalystCreated
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Analysts"); // Default to Analysts (plural)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem('token'); // Get token for authorization
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}` // Add Authorization header
        },
        body: JSON.stringify({ username, password, role }), // Send plural group name
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create user");
      }
      setUsername("");
      setPassword("");
      setRole("analyst"); // Reset role to default
      if (onUserCreated) onUserCreated(); // Changed from onAnalystCreated
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
          Role:{" "}
          <select value={role} onChange={(e) => setRole(e.target.value)} disabled={loading}>
            <option value="Analysts">Analysts</option>
            <option value="Managers">Managers</option>
            <option value="Accountants">Accountants</option>
          </select>
        </label>
      </div>
      <button type="submit" disabled={loading || !username || !password}>
        {loading ? "Adding..." : "Add User"} {/* Changed button text */}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}

export default UserForm; // Changed from AnalystForm
