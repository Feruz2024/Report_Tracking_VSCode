import React, { useState, useEffect } from "react";
import { authFetch } from "../utils/api";

const API_URL = "/api/stations/";

function StationForm({ onStationCreated, onStationUpdated, onClose, editMode = false, initialData = {} }) {
  const [name, setName] = useState(initialData.name || "");
  const [location, setLocation] = useState(initialData.location || "");
  const [frequency, setFrequency] = useState(initialData.frequency || "");
  const [type, setType] = useState(initialData.type || "");
  const [contacts, setContacts] = useState(
    initialData.contacts && Array.isArray(initialData.contacts) && initialData.contacts.length > 0
      ? initialData.contacts
      : [
          { type: "Management", name: "", email: "", phone: "" },
          { type: "Technical", name: "", email: "", phone: "" }
        ]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editMode && initialData) {
      setName(initialData.name || "");
      setLocation(initialData.location || "");
      setFrequency(initialData.frequency || "");
      setType(initialData.type || "");
      setContacts(
        initialData.contacts && Array.isArray(initialData.contacts) && initialData.contacts.length > 0
          ? initialData.contacts
          : [
              { type: "Management", name: "", email: "", phone: "" },
              { type: "Technical", name: "", email: "", phone: "" }
            ]
      );
    }
  }, [editMode, initialData]);

  const handleContactChange = (idx, field, value) => {
    setContacts(contacts => contacts.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (editMode && initialData.id) {
        // PATCH update
        const res = await authFetch(`${API_URL}${initialData.id}/`, {
          method: "PATCH",
          body: JSON.stringify({ name, location, frequency, type, contacts }),
        });
        if (!res.ok) throw new Error("Failed to update station");
        if (onStationUpdated) onStationUpdated();
      } else {
        // POST create
        const res = await authFetch(API_URL, {
          method: "POST",
          body: JSON.stringify({ name, location, frequency, type, contacts }),
        });
        if (!res.ok) throw new Error("Failed to create station");
        setName("");
        setLocation("");
        setFrequency("");
        setType("");
        setContacts([
          { type: "Management", name: "", email: "", phone: "" },
          { type: "Technical", name: "", email: "", phone: "" }
        ]);
        if (onStationCreated) onStationCreated();
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
      <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
        <h3>{editMode ? "Edit Station" : "Add Station"}</h3>
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
        <div>
          <label>
            Frequency:{" "}
            <input
              value={frequency}
              onChange={e => setFrequency(e.target.value)}
              disabled={loading}
            />
          </label>
        </div>
        <div>
          <label>
            Type:{" "}
            <select value={type} onChange={e => setType(e.target.value)} disabled={loading} required>
              <option value="">Select type</option>
              <option value="radio">Radio</option>
              <option value="tv">TV</option>
            </select>
          </label>
        </div>
      </div>
      <div>
        <label>Contacts:</label>
        {contacts.map((contact, idx) => (
          <div key={idx} style={{ border: '1px solid #ccc', margin: 4, padding: 4, borderRadius: 6 }}>
            <strong>{contact.type}</strong>
            <div>
              Name: <input value={contact.name} onChange={e => handleContactChange(idx, 'name', e.target.value)} disabled={loading} />
            </div>
            <div>
              Email: <input value={contact.email} onChange={e => handleContactChange(idx, 'email', e.target.value)} disabled={loading} />
            </div>
            <div>
              Phone: <input value={contact.phone} onChange={e => handleContactChange(idx, 'phone', e.target.value)} disabled={loading} />
            </div>
          </div>
        ))}
      </div>
      <button type="submit" disabled={loading || !name}>
        {loading ? (editMode ? "Saving..." : "Adding...") : (editMode ? "Save Changes" : "Add Station")}
      </button>
      {onClose && (
        <button type="button" onClick={onClose} style={{ marginLeft: 8 }} disabled={loading}>Cancel</button>
      )}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}

export default StationForm;
