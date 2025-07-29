import React, { useState } from "react";
import { saveAs } from "file-saver";

// Helper to get month options
const monthOptions = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

function AnalystReportExportPanel() {
  const [analyst, setAnalyst] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState("");

  // Fetch analysts for dropdown (could be improved to cache or use context)
  const [analysts, setAnalysts] = useState([]);
  React.useEffect(() => {
    fetch("/api/users/?role=analyst", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setAnalysts(Array.isArray(data) ? data : []));
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setAssignments([]);
    try {
      const res = await fetch(`/api/assignments/?analyst=${analyst}&month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Failed to fetch assignments");
      const data = await res.json();
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Error generating report");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Export as CSV
    const csvRows = [
      ["Assignment ID", "Title", "Completed Date", "Status"],
      ...assignments.map(a => [a.id, a.title, a.completed_date, a.status]),
    ];
    const csvContent = csvRows.map(row => row.map(String).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `analyst_report_${analyst}_${year}_${month}.csv`);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px #e2e8f0', marginTop: 24 }}>
      <h2>Analyst Report Generation & Export</h2>
      <form onSubmit={handleGenerate} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <label>Analyst:&nbsp;
            <select value={analyst} onChange={e => setAnalyst(e.target.value)} required>
              <option value="">Select Analyst</option>
              {analysts.map(a => (
                <option key={a.id} value={a.id}>{a.full_name || a.username}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>Month:&nbsp;
            <select value={month} onChange={e => setMonth(e.target.value)} required>
              <option value="">Select Month</option>
              {monthOptions.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>Year:&nbsp;
            <input type="number" value={year} onChange={e => setYear(e.target.value)} min="2020" max="2100" style={{ width: 80 }} required />
          </label>
        </div>
        <button type="submit" disabled={loading} style={{ padding: '6px 18px', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Generate</button>
      </form>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {loading && <div>Loading assignments...</div>}
      {assignments.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h3>Assignments Completed</h3>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                <th style={{ border: '1px solid #ccc', padding: 6 }}>ID</th>
                <th style={{ border: '1px solid #ccc', padding: 6 }}>Title</th>
                <th style={{ border: '1px solid #ccc', padding: 6 }}>Completed Date</th>
                <th style={{ border: '1px solid #ccc', padding: 6 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(a => (
                <tr key={a.id}>
                  <td style={{ border: '1px solid #ccc', padding: 6 }}>{a.id}</td>
                  <td style={{ border: '1px solid #ccc', padding: 6 }}>{a.title}</td>
                  <td style={{ border: '1px solid #ccc', padding: 6 }}>{a.completed_date}</td>
                  <td style={{ border: '1px solid #ccc', padding: 6 }}>{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleExport} style={{ marginTop: 16, padding: '6px 18px', borderRadius: 6, background: '#388e3c', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Export as CSV</button>
        </div>
      )}
    </div>
  );
}

export default AnalystReportExportPanel;
