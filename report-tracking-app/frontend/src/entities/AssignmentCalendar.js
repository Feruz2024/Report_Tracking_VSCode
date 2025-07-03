import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from "react-router-dom";
import { authFetch } from "../utils/api";

// Simple modal for assignment details
function AssignmentModal({ open, onClose, assignments, date }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 12, minWidth: 340, maxWidth: 420, padding: 28, boxShadow: '0 4px 32px #0002', position: 'relative' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: 0, marginBottom: 12, color: '#2a4365', fontWeight: 800, fontSize: 22 }}>Assignments for {date}</h3>
        {assignments.length === 0 ? (
          <div style={{ color: '#888', fontSize: 16 }}>No assignments for this day.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {assignments.map(a => (
              <li key={a.id} style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: '#f7fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{a.title || a.name || 'Untitled Assignment'}</div>
                <div style={{ fontSize: 14, color: '#555', margin: '4px 0' }}>Status: <span style={{ fontWeight: 600, color: getStatusColor(a.status, a.due_date) }}>{a.status}</span></div>
                <div style={{ fontSize: 13, color: '#888' }}>Due: {a.due_date ? a.due_date.slice(0, 10) : 'N/A'}</div>
                {a.description && <div style={{ fontSize: 13, color: '#444', marginTop: 4 }}>{a.description}</div>}
              </li>
            ))}
          </ul>
        )}
        <button onClick={onClose} style={{ marginTop: 18, padding: '8px 18px', borderRadius: 8, background: '#2a4365', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Close</button>
      </div>
    </div>
  );
}

const API_URL = "/api/assignments/";

// Overdue: red, Upcoming: green, Approved: blue
function getStatusColor(status, dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  if (status === "WIP" && due < now) return "red"; // Overdue
  if (status === "WIP" && due >= now) return "green"; // Upcoming
  if (status === "APPROVED") return "#1976d2"; // Approved (blue)
  return "gray";
}


function AssignmentCalendar() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAssignments, setModalAssignments] = useState([]);
  const [modalDate, setModalDate] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    authFetch(API_URL)
      .then(async res => {
        if (!res.ok) {
          if (res.status === 401) {
            setAssignments([]);
            return;
          }
          throw new Error("Failed to fetch assignments");
        }
        const data = await res.json();
        setAssignments(Array.isArray(data) ? data : []);
        console.log('Fetched assignments:', data); // DEBUG LOG
      })
      .catch(() => setAssignments([]))
      .finally(() => setLoading(false));
  }, []);

  // Group assignments by date (YYYY-MM-DD)
  const assignmentsByDate = {};
  if (Array.isArray(assignments)) {
    assignments.forEach(a => {
      const dateField = a.due_date || a.assigned_at;
      const day = dateField ? dateField.slice(0, 10) : null;
      if (day) {
        if (!assignmentsByDate[day]) assignmentsByDate[day] = [];
        assignmentsByDate[day].push(a);
      }
    });
  }

  // Fill the date cell background based on assignment status (priority: Overdue > Upcoming > Approved)
  function tileClassName({ date, view }) {
    if (view !== 'month') return '';
    const day = date.toISOString().slice(0, 10);
    const todaysAssignments = assignmentsByDate[day] || [];
    // Priority: Overdue > Upcoming > Approved
    let hasOverdue = false, hasUpcoming = false, hasApproved = false;
    todaysAssignments.forEach(a => {
      const color = getStatusColor(a.status, a.due_date);
      if (color === 'red') hasOverdue = true;
      else if (color === 'green') hasUpcoming = true;
      else if (color === '#1976d2') hasApproved = true;
    });
    if (hasOverdue) return 'calendar-overdue';
    if (hasUpcoming) return 'calendar-upcoming';
    if (hasApproved) return 'calendar-approved';
    return '';
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 0, background: 'none', fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'Open Sans', Arial, sans-serif" }}>
      <div style={{
        width: '100%',
        maxWidth: 546, // 420 * 1.3 = 546 (30% wider)
        background: 'linear-gradient(120deg, #f8fafc 60%, #e9f5ff 100%)',
        borderRadius: 16,
        boxShadow: '0 2px 16px #bee3f8',
        padding: 32,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <h2 style={{ color: '#2a4365', fontWeight: 800, marginBottom: 16, letterSpacing: 1, textAlign: 'center' }}>Assignment Calendar</h2>
        <Calendar
          value={date}
          onChange={setDate}
          tileClassName={tileClassName}
          prev2Label={null}
          next2Label={null}
          onClickDay={d => {
            const day = d.toISOString().slice(0, 10);
            const todaysAssignments = assignmentsByDate[day] || [];
            setModalAssignments(todaysAssignments);
            setModalDate(day);
            setModalOpen(true);
          }}
        />
        <AssignmentModal open={modalOpen} onClose={() => setModalOpen(false)} assignments={modalAssignments} date={modalDate} />
        <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center', gap: 22 }}>
          <span style={{ color: '#e53935', fontWeight: 700, fontSize: 16 }}>■ Overdue</span>
          <span style={{ color: '#43a047', fontWeight: 700, fontSize: 16 }}>■ Upcoming</span>
          <span style={{ color: '#1976d2', fontWeight: 700, fontSize: 16 }}>■ Approved</span>
        </div>
      </div>
    </div>
  );
}

export default AssignmentCalendar;
