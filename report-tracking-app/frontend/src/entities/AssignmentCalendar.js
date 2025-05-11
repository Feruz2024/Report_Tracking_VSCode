

import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from "react-router-dom";

const API_URL = "/api/assignments/";

function getStatusColor(status, dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  if (status === "APPROVED") return "green";
  if (status === "WIP" && due < now) return "red"; // Overdue
  if (status === "WIP" && due >= now) return "gold"; // Upcoming
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

  // Render colored dots for each assignment on the calendar
  function tileContent({ date, view }) {
    if (view !== 'month') return null;
    const day = date.toISOString().slice(0, 10);
    const todaysAssignments = assignmentsByDate[day] || [];
    return (
      <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
        {todaysAssignments.map((a, idx) => (
          <span
            key={idx}
            title={a.status}
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: getStatusColor(a.status, a.due_date),
              border: '1px solid #fff',
              cursor: 'pointer'
            }}
            onClick={e => {
              e.stopPropagation();
              // Navigate to assignments view, scroll to assignment card
              navigate('/assignments', { state: { assignmentId: a.id, assignmentDate: day } });
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 32 }}>
      <h2>Assignment Calendar</h2>
      <Calendar
        value={date}
        onChange={setDate}
        tileContent={tileContent}
        prev2Label={null}
        next2Label={null}
      />
      <div style={{ marginTop: 16 }}>
        <span style={{ color: 'red', marginRight: 16 }}>● Overdue</span>
        <span style={{ color: 'gold', marginRight: 16 }}>● Upcoming</span>
        <span style={{ color: 'green' }}>● Approved</span>
      </div>
    </div>
  );
}

export default AssignmentCalendar;
