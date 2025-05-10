

import React, { useEffect, useState } from "react";
import { authFetch } from "../utils/api";
const AssignmentManagerActions = React.lazy(() => import("./AssignmentManagerActions"));
const AssignmentSummaryForm = React.lazy(() => import("./AssignmentSummaryForm"));

const API_URL = "/api/assignments/";
const CAMPAIGNS_API_URL = "/api/campaigns/";
const STATIONS_API_URL = "/api/stations/";
const ANALYSTS_API_URL = "/api/analysts/";


function AssignmentList({ analystView = false, username = null }) {
  const [assignments, setAssignments] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [stations, setStations] = useState([]);
  const [analysts, setAnalysts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);


  // Helper to ensure data is always an array
  const safeArray = (data) => (Array.isArray(data) ? data : []);

  useEffect(() => {
    Promise.all([
      authFetch(API_URL).then((res) => res.ok ? res.json() : []),
      authFetch(CAMPAIGNS_API_URL).then((res) => res.ok ? res.json() : []),
      authFetch(STATIONS_API_URL).then((res) => res.ok ? res.json() : []),
      authFetch(ANALYSTS_API_URL).then((res) => res.ok ? res.json() : []),
    ])
      .then(([assignmentsData, campaignsData, stationsData, analystsData]) => {
        setAssignments(safeArray(assignmentsData));
        setCampaigns(safeArray(campaignsData));
        setStations(safeArray(stationsData));
        setAnalysts(safeArray(analystsData));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (refresh) {
      setLoading(true);
      Promise.all([
        authFetch(API_URL).then((res) => res.ok ? res.json() : []),
        authFetch(CAMPAIGNS_API_URL).then((res) => res.ok ? res.json() : []),
        authFetch(STATIONS_API_URL).then((res) => res.ok ? res.json() : []),
        authFetch(ANALYSTS_API_URL).then((res) => res.ok ? res.json() : []),
      ])
        .then(([assignmentsData, campaignsData, stationsData, analystsData]) => {
          setAssignments(safeArray(assignmentsData));
          setCampaigns(safeArray(campaignsData));
          setStations(safeArray(stationsData));
          setAnalysts(safeArray(analystsData));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [refresh]);

  const handleSummarySubmitted = () => setRefresh(r => !r);

  const getCampaignName = (id) => {
    const c = campaigns.find((c) => c.id === id);
    return c ? c.name : id;
  };
  const getStationName = (id) => {
    if (!id) return null;
    const s = stations.find((s) => s.id === id);
    return s ? s.name : id;
  };
  const getAnalystName = (id) => {
    const analyst = analysts.find((a) => a.id === id);
    return analyst ? analyst.user : id;
  };

  if (loading) return <div>Loading assignments...</div>;

  // If analystView, filter assignments to only those assigned to the current analyst
  let filteredAssignments = assignments;
  if (analystView && username) {
    // Find analyst id for this username
    const analyst = analysts.find(a => a.user === username);
    const analystId = analyst ? analyst.id : null;
    filteredAssignments = assignments.filter(a => a.analyst === analystId);
  }

  // For manager view: group assignments by analyst and sort horizontally by performance
  let analystCards = [];
  if (!analystView) {
    analystCards = analysts.map(analyst => {
      // Get assignments for this analyst
      const analystAssignments = filteredAssignments.filter(a => a.analyst === analyst.id);
      // Count WIP and overdue assignments (assuming 'due_date' or 'expiry' field, fallback to assigned_at)
      const now = new Date();
      let wipCount = 0, overdueCount = 0;
      analystAssignments.forEach(a => {
        if (a.status === 'WIP') wipCount++;
        // Overdue: status is WIP and due/expiry/assigned_at is in the past
        let due = a.due_date || a.expiry || a.assigned_at;
        if (a.status === 'WIP' && due && new Date(due) < now) overdueCount++;
      });
      // Sort assignments by soonest due/expiry/assigned_at
      const sortedAssignments = [...analystAssignments].sort((a, b) => {
        let ad = new Date(a.due_date || a.expiry || a.assigned_at);
        let bd = new Date(b.due_date || b.expiry || b.assigned_at);
        return ad - bd;
      });
      return {
        analyst,
        assignments: sortedAssignments,
        wipCount,
        overdueCount,
      };
    });
    // Sort analysts: most overdue, then most WIP, then name
    analystCards.sort((a, b) => {
      if (b.overdueCount !== a.overdueCount) return b.overdueCount - a.overdueCount;
      if (b.wipCount !== a.wipCount) return b.wipCount - a.wipCount;
      return a.analyst.user.localeCompare(b.analyst.user);
    });
  }

  return (
    <div style={{
      background: 'linear-gradient(120deg, #f0f4f8 0%, #e0e7ef 100%)',
      minHeight: '100vh',
      padding: '32px 0',
    }}>
      <div style={{
        maxWidth: 1500,
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
        }}>{analystView ? "My Active Assignments" : "Assignments by Analyst (Performance View)"}</h2>
        {analystView ? null : (
          <pre style={{
            background: '#f8fafc',
            color: '#2a4365',
            padding: '8px',
            border: '1px solid #cbd5e1',
            borderRadius: 8,
            maxHeight: '200px',
            overflow: 'auto',
            marginBottom: 24,
          }}>
            {JSON.stringify(assignments, null, 2)}
          </pre>
        )}
        {/* Manager: Analyst cards in a responsive grid */}
        {!analystView ? (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '32px',
            justifyContent: 'flex-start',
            alignItems: 'stretch',
            width: '100%',
          }}>
            {analystCards.map(({ analyst, assignments, wipCount, overdueCount }) => (
              <div
                key={analyst.id}
                style={{
                  flex: '1 1 340px',
                  minWidth: 320,
                  maxWidth: 400,
                  background: overdueCount > 0 ? 'linear-gradient(120deg, #fffbea 0%, #f7fafc 100%)' : '#f7fafc',
                  border: overdueCount > 0 ? '2px solid #ecc94b' : '1px solid #cbd5e1',
                  borderRadius: 14,
                  boxShadow: overdueCount > 0 ? '0 2px 12px rgba(236,201,75,0.08)' : '0 2px 8px rgba(44,62,80,0.04)',
                  padding: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  marginBottom: 24,
                  height: '100%',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 18, color: '#2b6cb0', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {analyst.user}
                  {overdueCount > 0 && <span style={{ background: '#ecc94b', color: '#744210', borderRadius: 6, padding: '2px 8px', fontSize: 13, fontWeight: 600 }}>Overdue: {overdueCount}</span>}
                  {wipCount > 0 && <span style={{ background: '#bee3f8', color: '#2a4365', borderRadius: 6, padding: '2px 8px', fontSize: 13, fontWeight: 600 }}>WIP: {wipCount}</span>}
                </div>
                <div style={{ fontSize: 14, color: '#718096', marginBottom: 8 }}>{assignments.length} assignment{assignments.length !== 1 ? 's' : ''}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {assignments.length === 0 && <div style={{ color: '#a0aec0', fontStyle: 'italic', padding: 8 }}>No assignments.</div>}
                  {assignments.map((assignment) => {
                    const due = assignment.due_date || assignment.expiry || assignment.assigned_at;
                    return (
                      <div key={assignment.id} style={{
                        background: '#fff',
                        border: '1px solid #cbd5e1',
                        borderRadius: 8,
                        padding: 10,
                        marginBottom: 2,
                        boxShadow: '0 1px 4px rgba(44,62,80,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                      }}>
                        <div style={{ fontWeight: 600, color: '#2b6cb0', fontSize: 15 }}>{getCampaignName(assignment.campaign)}{assignment.station && <span style={{ color: '#718096' }}> / {getStationName(assignment.station)}</span>}</div>
                        <div style={{ fontSize: 13, color: '#4a5568' }}>Status: <b>{assignment.status}</b></div>
                        <div style={{ fontSize: 13, color: '#718096' }}>Due: {due ? new Date(due).toLocaleDateString() : 'N/A'}</div>
                        {/* Manager actions only for non-analyst view */}
                        {assignment.status === "SUBMITTED" && (
                          <div style={{ marginTop: 4 }}>
                            <React.Suspense fallback={<div>Loading manager actions...</div>}>
                              <AssignmentManagerActions assignment={assignment} onAction={handleSummarySubmitted} />
                            </React.Suspense>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            ))}
          </div>
        ) : (
          // Analyst view: just show their assignments
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
          }}>
            {filteredAssignments.length === 0 && (
              <li style={{ color: '#718096', fontStyle: 'italic', padding: 16 }}>No assignments found.</li>
            )}
            {filteredAssignments.map((assignment) => (
              <li key={assignment.id} style={{
                background: '#f7fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 10,
                marginBottom: 18,
                padding: 18,
                boxShadow: '0 2px 8px rgba(44,62,80,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#2b6cb0' }}>
                  <span>{getCampaignName(assignment.campaign)}</span>
                  {assignment.station && (
                    <>
                      <span style={{ color: '#718096' }}> / </span>
                      <span style={{ color: '#4a5568' }}>{getStationName(assignment.station)}</span>
                    </>
                  )}
                </div>
                <div style={{ color: '#4a5568', fontSize: 15 }}>
                  <span style={{ marginLeft: 8, color: '#718096' }}>on {assignment.assigned_at?.slice(0, 10)}</span>
                </div>
                {/* Analyst can only submit summary for WIP assignments assigned to them */}
                {analystView && assignment.status === "WIP" && (
                  <div style={{ marginTop: 8 }}>
                    <React.Suspense fallback={<div>Loading summary form...</div>}>
                      <AssignmentSummaryForm assignment={assignment} onSubmitted={handleSummarySubmitted} />
                    </React.Suspense>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default AssignmentList;