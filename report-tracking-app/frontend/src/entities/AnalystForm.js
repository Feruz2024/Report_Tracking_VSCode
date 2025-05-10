import React, { useState } from "react";

const API_URL = "/api/analysts/";

function AnalystForm({ onAnalystCreated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error("Failed to create analyst");
      setUsername("");
      setPassword("");
      if (onAnalystCreated) onAnalystCreated();
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Media Analyst</h3>
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
      <button type="submit" disabled={loading || !username || !password}>
        {loading ? "Adding..." : "Add Analyst"}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}

export default AnalystForm;
