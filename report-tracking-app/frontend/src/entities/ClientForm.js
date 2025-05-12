import React, { useState } from "react";
import { authFetch } from "../utils/api";

const API_URL = "/api/clients/";

function ClientForm({ onClientCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [contractSignedDate, setContractSignedDate] = useState("");
  const [contractStart, setContractStart] = useState("");
  const [contractEnd, setContractEnd] = useState("");
  const [contractValue, setContractValue] = useState("");
  const [contacts, setContacts] = useState([
    { type: "Management", name: "", email: "", phone: "" },
    { type: "Marketing", name: "", email: "", phone: "" }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContactChange = (idx, field, value) => {
    setContacts(contacts => contacts.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
          name,
          description,
          business_category: businessCategory,
          contract_signed_date: contractSignedDate,
          contract_start: contractStart,
          contract_end: contractEnd,
          contract_value: contractValue,
          contacts,
        }),
      });
      if (!res.ok) throw new Error("Failed to create client");
      setName("");
      setDescription("");
      setBusinessCategory("");
      setContractSignedDate("");
      setContractStart("");
      setContractEnd("");
      setContractValue("");
      setContacts([
        { type: "Management", name: "", email: "", phone: "" },
        { type: "Marketing", name: "", email: "", phone: "" }
      ]);
      if (onClientCreated) onClientCreated();
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
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
        <div>
          <label>
            Business Category:{" "}
            <input
              value={businessCategory}
              onChange={e => setBusinessCategory(e.target.value)}
              disabled={loading}
            />
          </label>
        </div>
        <div>
          <label>
            Contract Signed Date:{" "}
            <input
              type="date"
              value={contractSignedDate}
              onChange={e => setContractSignedDate(e.target.value)}
              disabled={loading}
            />
          </label>
        </div>
        <div>
          <label>
            Contract Period Start:{" "}
            <input
              type="date"
              value={contractStart}
              onChange={e => setContractStart(e.target.value)}
              disabled={loading}
            />
          </label>
          <label style={{ marginLeft: 8 }}>
            End:{" "}
            <input
              type="date"
              value={contractEnd}
              onChange={e => setContractEnd(e.target.value)}
              disabled={loading}
            />
          </label>
        </div>
        <div>
          <label>
            Contract Value:{" "}
            <input
              type="number"
              value={contractValue}
              onChange={e => setContractValue(e.target.value)}
              disabled={loading}
              min="0"
              step="0.01"
            />
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
        {loading ? "Adding..." : "Add Client"}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}

export default ClientForm;
