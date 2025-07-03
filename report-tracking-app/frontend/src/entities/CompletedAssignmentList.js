import React, { useEffect, useState } from "react";
import { authFetch } from "../utils/api";


const API_URL = "/api/assignments/";


// Accept filter props and pre-fetched lists
function CompletedAssignmentList({
  refresh,
  filterCampaign = "",
  filterAnalyst = "",
  filterStation = "",
  campaigns = [],
  analysts = [],
  stations = [],
}) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    authFetch(API_URL)
      .then((res) => (res.ok ? res.json() : []))
      .then((assignmentsData) => {
        setAssignments(Array.isArray(assignmentsData) ? assignmentsData.filter(a => a.status === "APPROVED") : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [refresh]);

  const getStationName = (id) => {
    if (!id) return null;
    const s = stations.find((s) => s.id === id);
    return s ? s.name : id;
  };
  const getCampaignName = (id) => {
    const c = campaigns.find(c => c.id === id);
    return c ? c.name : id;
  };
  const getAnalystName = (id) => {
    const a = analysts.find(a => a.id === id);
    return a ? a.full_name || a.user : id;
  };

  // Apply filters
  let filteredAssignments = assignments;
  if (filterCampaign) {
    filteredAssignments = filteredAssignments.filter(a => String(a.campaign) === filterCampaign);
  }
  if (filterAnalyst) {
    filteredAssignments = filteredAssignments.filter(a => String(a.analyst) === filterAnalyst);
  }
  if (filterStation) {
    filteredAssignments = filteredAssignments.filter(a => String(a.station) === filterStation);
  }

  if (loading) return <div>Loading approved assignments...</div>;

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'flex-start' }}>
        {filteredAssignments.length === 0 && <div style={{ color: '#888', fontStyle: 'italic' }}>No approved assignments.</div>}
        {filteredAssignments.map((assignment, idx) => {
          const colors = [
            '#e3f2fd', '#fce4ec', '#e8f5e9', '#fffde7', '#f3e5f5', '#fbe9e7', '#ede7f6', '#e0f2f1'
          ];
          const color = colors[idx % colors.length];
          return (
            <div key={assignment.id} style={{
              border: '3px solid #2b6cb0',
              borderRadius: 18,
              background: color,
              padding: 24,
              marginBottom: 8,
              boxShadow: '0 4px 16px rgba(44,62,80,0.06)',
              minWidth: 260,
              maxWidth: 340,
              flex: '1 1 300px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              opacity: 0.7
            }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: '#2b6cb0', marginBottom: 8, letterSpacing: 1 }}>{getAnalystName(assignment.analyst)}</div>
              <div style={{ fontWeight: 600, fontSize: 16, color: '#22577a', marginBottom: 6 }}>{getCampaignName(assignment.campaign)}</div>
              <div style={{ fontSize: 15, color: '#2b6cb0' }}>{assignment.station && `Station: ${getStationName(assignment.station)}`}</div>
              <div style={{ color: '#4a5568', fontSize: 15 }}>Status: <b>{assignment.status}</b></div>
              <div style={{ fontSize: 14, color: '#222', marginTop: 8 }}>
                <div><b>Scheduled (Planned):</b> {assignment.planned_spots ?? 'N/A'}</div>
                <div><b>Transmitted:</b> {assignment.transmitted_spots ?? 'N/A'}</div>
                <div><b>Missed:</b> {assignment.missed_spots ?? 'N/A'}</div>
                <div><b>Gained:</b> {assignment.gain_spots ?? 'N/A'}</div>
              </div>
              <div style={{ color: '#4a5568', fontSize: 15 }}>Due Date: {assignment.due_date ? assignment.due_date.slice(0, 10) : 'N/A'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CompletedAssignmentList;
