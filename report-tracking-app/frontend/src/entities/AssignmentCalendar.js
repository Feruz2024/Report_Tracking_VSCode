

import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from "react-router-dom";

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
  const [assignments, setAssignments] = useState([]);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(setAssignments)
      .catch(() => setAssignments([]))
      .finally(() => setLoading(false));
  }, []);

  // Group assignments by date (YYYY-MM-DD)
  const assignmentsByDate = {};
  assignments.forEach(a => {
    const dateField = a.due_date || a.assigned_at;
    const day = dateField ? dateField.slice(0, 10) : null;
    if (day) {
      if (!assignmentsByDate[day]) assignmentsByDate[day] = [];
      assignmentsByDate[day].push(a);
    }
  });

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
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 0, background: 'none' }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: 'linear-gradient(120deg, #f8fafc 60%, #e9f5ff 100%)',
        borderRadius: 16,
        boxShadow: '0 2px 16px #bee3f8',
        padding: 24,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <h2 style={{ color: '#2a4365', fontWeight: 700, marginBottom: 12, letterSpacing: 1, textAlign: 'center' }}>Assignment Calendar</h2>
        <Calendar
          value={date}
          onChange={setDate}
          tileClassName={tileClassName}
          prev2Label={null}
          next2Label={null}
        />
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center', gap: 18 }}>
          <span style={{ color: 'red', fontWeight: 600 }}>■ Overdue</span>
          <span style={{ color: 'green', fontWeight: 600 }}>■ Upcoming</span>
          <span style={{ color: '#1976d2', fontWeight: 600 }}>■ Approved</span>
        </div>
      </div>
    </div>
  );
}

export default AssignmentCalendar;
