import React, { useEffect, useState, useRef } from "react";
import { authFetch } from "../utils/api";
import { useLocation } from "react-router-dom";
const AssignmentManagerActions = React.lazy(() => import("./AssignmentManagerActions"));
const AssignmentSummaryForm = React.lazy(() => import("./AssignmentSummaryForm"));

const API_URL = "/api/assignments/";
const CAMPAIGNS_API_URL = "/api/campaigns/";
const STATIONS_API_URL = "/api/stations/";



function AssignmentList({ analystView = false, username = null }) {
  const [assignments, setAssignments] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [stations, setStations] = useState([]);
  // analysts state will now store user objects { id, user (username) }
  const [analysts, setAnalysts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const location = useLocation();
  // Get ?date=YYYY-MM-DD from query params
  const queryDate = (() => {
    try {
      const params = new URLSearchParams(location.search);
      return params.get('date');
    } catch {
      return null;
    }
  })();
  const assignmentRefs = useRef({});
  // Removed filter state


  // Helper to ensure data is always an array
  const safeArray = (data) => (Array.isArray(data) ? data : []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      authFetch(API_URL).then((res) => (res.ok ? res.json() : [])),
      authFetch(CAMPAIGNS_API_URL).then((res) => (res.ok ? res.json() : [])),
      authFetch(STATIONS_API_URL).then((res) => (res.ok ? res.json() : [])),
      // Fetch users who are analysts
      authFetch("/api/users/?is_analyst=true").then((res) => (res.ok ? res.json() : [])),
    ])
      .then(([assignmentsData, campaignsData, stationsData, usersData]) => {
        setAssignments(safeArray(assignmentsData));
        setCampaigns(safeArray(campaignsData));
        setStations(safeArray(stationsData));
        // Map usersData to the structure expected by the rest of the component: { id, user (username), full_name }
        setAnalysts(safeArray(usersData).map(user => ({ id: user.id, user: user.username, full_name: user.full_name || user.username })));
        // DEBUG: Log assignments and analysts
        console.log('[AssignmentList] assignments:', assignmentsData);
        console.log('[AssignmentList] analysts:', usersData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching initial data:", error);
        setLoading(false);
      });
  }, []); // Initial fetch, backend handles user-specific assignment filtering

  useEffect(() => {
    if (refresh) {
      setLoading(true);
      Promise.all([
        authFetch(API_URL).then((res) => (res.ok ? res.json() : [])),
        authFetch(CAMPAIGNS_API_URL).then((res) => (res.ok ? res.json() : [])),
        authFetch(STATIONS_API_URL).then((res) => (res.ok ? res.json() : [])),
        authFetch("/api/users/?is_analyst=true").then((res) => (res.ok ? res.json() : [])),
      ])
        .then(([assignmentsData, campaignsData, stationsData, usersData]) => {
          setAssignments(safeArray(assignmentsData));
          setCampaigns(safeArray(campaignsData));
          setStations(safeArray(stationsData));
          setAnalysts(safeArray(usersData).map(user => ({ id: user.id, user: user.username, full_name: user.full_name || user.username })));
          setLoading(false);
          setRefresh(false);
        })
        .catch((error) => {
          console.error("Error refreshing data:", error);
          setLoading(false);
          setRefresh(false);
        });
    }
  }, [refresh]);

  const handleSummarySubmitted = () => setRefresh(true); // Changed to setRefresh(true)

  // Removed unused getCampaignName
  const getStationName = (id) => {
    if (!id) return null;
    const s = stations.find((s) => s.id === id);
    return s ? s.name : id;
  };
  // Removed unused getAnalystName


  // Scroll to assignment card if assignmentId is passed in location.state
  useEffect(() => {
    if (location.state && location.state.assignmentId) {
      const id = location.state.assignmentId;
      setTimeout(() => {
        if (assignmentRefs.current[id]) {
          assignmentRefs.current[id].scrollIntoView({ behavior: "smooth", block: "center" });
          assignmentRefs.current[id].style.boxShadow = "0 0 0 4px #3182ce";
          setTimeout(() => {
            if (assignmentRefs.current[id]) assignmentRefs.current[id].style.boxShadow = "";
          }, 2000);
        }
      }, 500);
    }
  }, [loading, location.state]);

  if (loading) return <div>Loading assignments...</div>;


  // Filter by date if ?date=YYYY-MM-DD is present
  let filteredAssignments = assignments;
  if (queryDate) {
    filteredAssignments = assignments.filter(a => {
      const due = a.due_date || a.assigned_at;
      return due && due.slice(0, 10) === queryDate;
    });
  }

  // For manager view: group assignments by analyst and sort horizontally by performance
  let analystCards = [];
  if (!analystView) {
    // Use the `analysts` state (list of user objects {id, user})
    analystCards = analysts.map(analystUser => { // analystUser is { id, user (username) }
      // Filter `filteredAssignments` (which are already role-appropriate) for this specific analyst
      const analystAssignments = filteredAssignments.filter(a => a.analyst === analystUser.id);
      
      const now = new Date();
      let wipCount = 0, overdueCount = 0;
      analystAssignments.forEach(a => {
        if (a.status === 'WIP') wipCount++;
        let due = a.due_date || a.expiry || a.assigned_at;
        if (a.status === 'WIP' && due && new Date(due) < now) overdueCount++;
      });
      
      const sortedAssignments = [...analystAssignments].sort((a, b) => {
        let ad = new Date(a.due_date || a.expiry || a.assigned_at);
        let bd = new Date(b.due_date || b.expiry || b.assigned_at);
        return ad - bd;
      });
      
      return {
        analyst: analystUser, // Pass the whole analystUser object { id, user (username) }
        assignments: sortedAssignments,
        wipCount,
        overdueCount,
      };
    });

    analystCards.sort((a, b) => {
      if (b.overdueCount !== a.overdueCount) return b.overdueCount - a.overdueCount;
      if (b.wipCount !== a.wipCount) return b.wipCount - a.wipCount;
      // Access username via a.analyst.user
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
        maxWidth: 1400,
        minWidth: 340,
        width: '100%',
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
        {/* Removed filter controls */}
        {/* Colorful cards grouped by analyst for manager/admin view */}
        {!analystView ? (
          <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: 32 }}>
            {/* Group assignments by analyst */}
            {(() => {
              if (filteredAssignments.length === 0) {
                return <div style={{ color: '#a0aec0', fontStyle: 'italic', padding: 8 }}>No assignments.</div>;
              }
              // Group assignments by analyst user id (from assignment.analyst_user_id), then campaign, then sort by due date desc
              const analystMap = {};
              filteredAssignments.forEach(a => {
                // Use the new analyst_user_id and analyst_user_full_name fields from the backend
                const analystId = a.analyst_user_id;
                const analystName = a.analyst_user_full_name || a.analyst_user || a.analyst;
                if (!analystId || !analystName) return; // skip if missing
                if (!analystMap[analystId]) analystMap[analystId] = { name: analystName, assignments: [] };
                analystMap[analystId].assignments.push(a);
              });
              // Color palette
              const colors = [
                '#e3f2fd', // blue
                '#fce4ec', // pink
                '#e8f5e9', // green
                '#fffde7', // yellow
                '#f3e5f5', // purple
                '#fbe9e7', // orange
                '#ede7f6', // indigo
                '#e0f2f1', // teal
                '#f0f4c3', // lime
                '#ffe0b2', // amber
              ];
              const analystIds = Object.keys(analystMap);
              return analystIds.map((analystId, idx) => {
                const { name: analystName, assignments: group } = analystMap[analystId];
                const color = colors[idx % colors.length];
                // Group by campaign
                const campaignMap = {};
                group.forEach(a => {
                  if (!campaignMap[a.campaign]) campaignMap[a.campaign] = [];
                  campaignMap[a.campaign].push(a);
                });
                const campaignIds = Object.keys(campaignMap);
                return (
                  <div key={analystId} style={{
                    flex: `1 1 auto`,
                    minWidth: Math.max(220, analystName.length * 13),
                    maxWidth: 420,
                    width: 'auto',
                    background: color,
                    border: '2px solid #cbd5e1',
                    borderRadius: 16,
                    boxShadow: '0 4px 16px rgba(44,62,80,0.06)',
                    padding: 24,
                    marginBottom: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 18,
                    transition: 'min-width 0.2s, max-width 0.2s',
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 20, color: '#2b6cb0', marginBottom: 8, letterSpacing: 1 }}>{analystName}</div>
                    {campaignIds.map((cid, cidx) => {
                      const campaignAssignments = campaignMap[cid];
                      const campaign = campaigns.find(c => c.id === Number(cid));
                      // Sort by due date descending
                      campaignAssignments.sort((a, b) => {
                        const ad = new Date(a.due_date || a.expiry || a.assigned_at);
                        const bd = new Date(b.due_date || b.expiry || b.assigned_at);
                        return bd - ad;
                      });
                      return (
                        <div key={cid} style={{ marginBottom: 8 }}>
                          <div style={{ fontWeight: 600, fontSize: 16, color: '#22577a', marginBottom: 6 }}>{campaign ? campaign.name : `Campaign ${cid}`}</div>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {campaignAssignments.map((assignment) => {
                              const due = assignment.due_date || assignment.expiry || assignment.assigned_at;
                              return (
                                <li
                                  key={assignment.id}
                                  ref={el => assignmentRefs.current[assignment.id] = el}
                                  style={{
                                    background: '#fff',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: 8,
                                    padding: 12,
                                    marginBottom: 10,
                                    boxShadow: '0 1px 4px rgba(44,62,80,0.03)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 4,
                                    height: 'auto',
                                    minHeight: 0,
                                    wordBreak: 'break-word',
                                  }}
                                >
                                  <div style={{ fontWeight: 600, color: '#2b6cb0', fontSize: 15 }}>{assignment.station && <span style={{ color: '#718096' }}>Station: {getStationName(assignment.station)}</span>}</div>
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
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                );
              });
            })()}
          </div>
        ) : (
          // Analyst view: group assignments by campaign
          (() => {
            if (filteredAssignments.length === 0) {
              return <ul style={{listStyle: 'none', padding: 0, margin: 0}}><li style={{ color: '#718096', fontStyle: 'italic', padding: 16 }}>No assignments found.</li></ul>;
            }
            // Group assignments by campaign
            const campaignMap = {};
            filteredAssignments.forEach(a => {
              if (!campaignMap[a.campaign]) campaignMap[a.campaign] = [];
              campaignMap[a.campaign].push(a);
            });
            // Washed color palette
            const colors = [
              '#e3f2fd', // blue
              '#fce4ec', // pink
              '#e8f5e9', // green
              '#fffde7', // yellow
              '#f3e5f5', // purple
              '#fbe9e7', // orange
              '#ede7f6', // indigo
              '#e0f2f1', // teal
            ];
            const campaignIds = Object.keys(campaignMap);
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {campaignIds.map((cid, idx) => {
                  const group = campaignMap[cid];
                  const campaign = campaigns.find(c => c.id === Number(cid));
                  const color = colors[idx % colors.length];
                  return (
                    <div key={cid} style={{
                      border: '3px solid #2b6cb0',
                      borderRadius: 18,
                      background: color,
                      padding: 24,
                      marginBottom: 8,
                      boxShadow: '0 4px 16px rgba(44,62,80,0.06)',
                    }}>
                      <div style={{ fontWeight: 700, fontSize: 22, color: '#2b6cb0', marginBottom: 16, letterSpacing: 1 }}>
                        {campaign ? campaign.name : `Campaign ${cid}`}
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {group.map((assignment) => (
                          <li
                            key={assignment.id}
                            ref={el => assignmentRefs.current[assignment.id] = el}
                            style={{
                              background: '#fff',
                              border: '2px solid #cbd5e1',
                              borderRadius: 10,
                              marginBottom: 16,
                              padding: 18,
                              boxShadow: '0 2px 8px rgba(44,62,80,0.04)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 8,
                            }}
                          >
                            <div style={{ fontSize: 17, fontWeight: 600, color: '#2b6cb0' }}>
                              {assignment.station && (
                                <>
                                  <span style={{ color: '#718096' }}>Station: </span>
                                  <span style={{ color: '#4a5568' }}>{getStationName(assignment.station)}</span>
                                </>
                              )}
                            </div>
                            <div style={{ color: '#4a5568', fontSize: 15 }}>
                              <span style={{ color: '#718096' }}>Assigned: {assignment.assigned_at?.slice(0, 10)}</span>
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
                    </div>
                  );
                })}
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}


// Named export for direct AssignmentList usage
export default AssignmentList;

