import React, { useState } from "react";
import { authFetch } from "../utils/api";

const API_URL = "/api/analysts/";
const USER_API_URL = "/api/users/";

function AnalystForm({ editMode = false, initialData = {}, onAnalystCreated, onAnalystUpdated, onClose }) {
  const [username, setUsername] = useState(initialData.user || "");
  const [email, setEmail] = useState(initialData.email || "");
  const [role, setRole] = useState(initialData.role || "Analysts");
  const [isActive, setIsActive] = useState(
    typeof initialData.is_active === "boolean" ? initialData.is_active : true
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (editMode && initialData.user_id) {
        // PATCH user info
        const res = await authFetch(`${USER_API_URL}${initialData.user_id}/`, {
          method: "PATCH",
          body: JSON.stringify({
            email,
            is_active: isActive,
            // role update logic can be added if backend supports
          }),
        });
        if (!res.ok) throw new Error("Failed to update user");
        if (onAnalystUpdated) onAnalystUpdated();
      } else {
        // Create new analyst (user)
        const res = await authFetch("/api/register/", {
          method: "POST",
          body: JSON.stringify({ username, email, password: "changeme123", role }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to create analyst");
        }
        setUsername("");
        setEmail("");
        setRole("Analysts");
        setIsActive(true);
        if (onAnalystCreated) onAnalystCreated();
      }
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{editMode ? "Edit Analyst" : "Add Analyst"}</h3>
      <div>
        <label>
          Username:{" "}
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={editMode || loading}
          />
        </label>
      </div>
      <div>
        <label>
          Email:{" "}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
      <div>
        <label>
          Active:{" "}
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={loading}
          />
        </label>
      </div>
      <button type="submit" disabled={loading || !username || !email}>
        {loading ? (editMode ? "Saving..." : "Adding...") : (editMode ? "Save Changes" : "Add Analyst")}
      </button>
      {onClose && (
        <button type="button" onClick={onClose} style={{ marginLeft: 8 }} disabled={loading}>Cancel</button>
      )}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}

export default AnalystForm;
