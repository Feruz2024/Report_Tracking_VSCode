import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { authFetch } from "../utils/api";
import ClientForm from "./ClientForm";

const API_URL = "/api/clients/";

function ClientList({ refresh }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  // Filter states
  const [nameFilter, setNameFilter] = useState("");
  const [signedStart, setSignedStart] = useState("");
  const [signedEnd, setSignedEnd] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [contactFilter, setContactFilter] = useState("");

  // Helper to ensure data is always an array
  const safeArray = (data) => (Array.isArray(data) ? data : []);

  useEffect(() => {
    setLoading(true);
    authFetch(API_URL)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        setClients(safeArray(data));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [refresh]);

  // Filtering logic
  const filteredClients = clients.filter(client => {
    // Name filter
    if (nameFilter && !client.name.toLowerCase().includes(nameFilter.toLowerCase())) return false;
    // Contract signed date range
    if (signedStart && (!client.contract_signed_date || new Date(client.contract_signed_date) < new Date(signedStart))) return false;
    if (signedEnd && (!client.contract_signed_date || new Date(client.contract_signed_date) > new Date(signedEnd))) return false;
    // Contract period date range
    if (periodStart && (!client.contract_start || new Date(client.contract_start) < new Date(periodStart))) return false;
    if (periodEnd && (!client.contract_end || new Date(client.contract_end) > new Date(periodEnd))) return false;
    // Contact person filter
    if (contactFilter) {
      const match = (client.contacts || []).some(c =>
        (c.name && c.name.toLowerCase().includes(contactFilter.toLowerCase())) ||
        (c.email && c.email.toLowerCase().includes(contactFilter.toLowerCase()))
      );
      if (!match) return false;
    }
    return true;
  });

  if (loading) return <div>Loading clients...</div>;

  return (
    <>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, mt: 2, justifyContent: 'center', alignItems: 'center' }}>
        <TextField label="Name" value={nameFilter} onChange={e => setNameFilter(e.target.value)} size="small" sx={{ minWidth: 180 }} />
        <TextField label="Signed Start" type="date" value={signedStart} onChange={e => setSignedStart(e.target.value)} size="small" InputLabelProps={{ shrink: true }} />
        <TextField label="Signed End" type="date" value={signedEnd} onChange={e => setSignedEnd(e.target.value)} size="small" InputLabelProps={{ shrink: true }} />
        <TextField label="Contract Start" type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} size="small" InputLabelProps={{ shrink: true }} />
        <TextField label="Contract End" type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} size="small" InputLabelProps={{ shrink: true }} />
        <TextField label="Contact Person" value={contactFilter} onChange={e => setContactFilter(e.target.value)} size="small" sx={{ minWidth: 180 }} />
        <Button variant="outlined" color="secondary" size="small" sx={{ ml: 2, height: 40 }}
          onClick={() => {
            setNameFilter("");
            setSignedStart("");
            setSignedEnd("");
            setPeriodStart("");
            setPeriodEnd("");
            setContactFilter("");
          }}
        >
          Reset
        </Button>
      </Box>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginTop: 16, justifyContent: 'center' }}>
        {filteredClients.map((client) => (
        <div
          key={client.id}
          style={{
            background: '#f8f9fa',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            boxShadow: '0 4px 16px rgba(44,62,80,0.08)',
            padding: '32px 28px 24px 28px',
            minWidth: 260,
            maxWidth: 340,
            flex: '0 1 320px',
            fontSize: 15,
            textAlign: 'left',
            marginBottom: 18,
            color: '#222',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 8,
            transition: 'box-shadow 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(44,62,80,0.13)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(44,62,80,0.08)'}
        >
          <button
            style={{ position: 'absolute', top: 14, right: 16, fontSize: 13, background: '#3182ce', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', zIndex: 2 }}
            onClick={() => {
              window.open(`/edit-client/${client.id}?token=${localStorage.getItem('token')}`, 'EditClient', 'width=500,height=700');
            }}
          >
            Edit
          </button>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 4 }}>{client.name}</div>
          {client.description && <div style={{ color: '#555', fontSize: 15, marginBottom: 4 }}>{client.description}</div>}
          {client.contract_signed_date && (
            <div style={{ color: '#444', fontSize: 14, marginBottom: 2 }}>
              <b>First Contract Signed:</b> {new Date(client.contract_signed_date).toLocaleDateString()}
            </div>
          )}
          {(client.contract_start || client.contract_end) && (
            <div style={{ color: '#444', fontSize: 14, marginBottom: 2 }}>
              <b>Contract Period:</b> {client.contract_start ? new Date(client.contract_start).toLocaleDateString() : 'N/A'}
              {client.contract_end && ` - ${new Date(client.contract_end).toLocaleDateString()}`}
            </div>
          )}
          {typeof client.contract_value !== 'undefined' && client.contract_value !== null && (
            <div style={{ color: '#1976d2', fontWeight: 700, fontSize: 16, marginTop: 6 }}>
              {Number(client.contract_value).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </div>
          )}
          {Array.isArray(client.contacts) && client.contacts.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <b>Contacts:</b>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {client.contacts.map((c, i) => (
                  <li key={i} style={{ fontSize: 13 }}>
                    <b>{c.type}:</b> {c.name} {c.email && <>| <a href={`mailto:${c.email}`}>{c.email}</a></>} {c.phone && <>| {c.phone}</>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
      {/* Edit popup now handled in a new window, not inline */}
    </div>
    </>
  );
}

export default ClientList;
