import React, { useState } from "react";
import { authFetch } from "../utils/api";

const API_URL = "/api/clients/";

function ClientForm({ onClientCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) throw new Error("Failed to create client");
      setName("");
      setDescription("");
      if (onClientCreated) onClientCreated();
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Client</h3>
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
          Description:{" "}
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </label>
      </div>
      <button type="submit" disabled={loading || !name}>
        {loading ? "Adding..." : "Add Client"}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}

export default ClientForm;
