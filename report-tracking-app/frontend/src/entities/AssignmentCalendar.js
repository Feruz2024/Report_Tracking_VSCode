import React, { useEffect, useState } from "react";

const API_URL = "/api/assignments/";

function AssignmentCalendar() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(setAssignments)
      .catch(() => setAssignments([]))
      .finally(() => setLoading(false));
  }, []);

  // Simple calendar: group assignments by date (assigned_at)
  const grouped = assignments.reduce((acc, a) => {
    const date = a.assigned_at ? a.assigned_at.slice(0, 10) : "Unknown";
    if (!acc[date]) acc[date] = [];
    acc[date].push(a);
    return acc;
  }, {});

  if (loading) return <div>Loading calendar...</div>;

  return (
    <div style={{
      background: 'linear-gradient(120deg, #f0f4f8 0%, #e0e7ef 100%)',
      minHeight: '100vh',
      padding: '32px 0',
    }}>
      <div style={{
        maxWidth: 800,
        margin: '0 auto',
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        padding: 32,
        border: '1px solid #e3e8ee',
      }}>
        <h2 style={{
          color: '#2a4365',
          borderBottom: '2px solid #bee3f8',
          paddingBottom: 8,
          marginBottom: 24,
          fontWeight: 700,
          letterSpacing: 1,
        }}>Assignment Calendar (by Assigned Date)</h2>
        {Object.keys(grouped).sort().map(date => (
          <div key={date} style={{ marginBottom: 28 }}>
            <div style={{
              fontWeight: 600,
              fontSize: 18,
              color: '#2b6cb0',
              marginBottom: 10,
              borderLeft: '4px solid #63b3ed',
              paddingLeft: 12,
            }}>{date}</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {grouped[date].map(a => (
                <li key={a.id} style={{
                  background: '#f7fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 10,
                  marginBottom: 12,
                  padding: 16,
                  boxShadow: '0 2px 8px rgba(44,62,80,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}>
                  <span style={{
                    display: 'inline-block',
                    minWidth: 90,
                    fontWeight: 600,
                    color: '#2a4365',
                  }}>#{a.id}</span>
                  <span style={{
                    background: a.status === 'WIP' ? '#f6e05e' : a.status === 'SUBMITTED' ? '#bee3f8' : '#c6f6d5',
                    color: a.status === 'WIP' ? '#744210' : a.status === 'SUBMITTED' ? '#2b6cb0' : '#22543d',
                    borderRadius: 8,
                    padding: '2px 10px',
                    fontSize: 13,
                    fontWeight: 600,
                  }}>{a.status}</span>
                  <span style={{ color: '#4a5568', fontSize: 15 }}>
                    Campaign <strong>{a.campaign}</strong>, Station <strong>{a.station || '-'}</strong>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AssignmentCalendar;
