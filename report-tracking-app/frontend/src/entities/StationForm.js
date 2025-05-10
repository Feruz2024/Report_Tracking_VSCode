import React, { useState } from "react";
import { authFetch } from "../utils/api";

const API_URL = "/api/stations/";

function StationForm({ onStationCreated }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ name, location }),
      });
      if (!res.ok) throw new Error("Failed to create station");
      setName("");
      setLocation("");
      if (onStationCreated) onStationCreated();
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Station</h3>
      <div>
        <label>
          Name:{" "}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
        </label>
      </div>
      <div>
        <label>
          Location:{" "}
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={loading}
          />
        </label>
      </div>
      <button type="submit" disabled={loading || !name}>
        {loading ? "Adding..." : "Add Station"}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}

export default StationForm;
