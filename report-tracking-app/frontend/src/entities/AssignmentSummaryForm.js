import React, { useState, useEffect } from "react";

const API_URL = "/api/assignments/";

function AssignmentSummaryForm({ assignment, onSubmitted }) {
  const [plannedSpots, setPlannedSpots] = useState(assignment.planned_spots || "");
  const [missedSpots, setMissedSpots] = useState(assignment.missed_spots || "");
  const [transmittedSpots, setTransmittedSpots] = useState(assignment.transmitted_spots || "");
  const [gainSpots, setGainSpots] = useState(assignment.gain_spots || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPlannedSpots(assignment.planned_spots || "");
    setMissedSpots(assignment.missed_spots || "");
    setTransmittedSpots(assignment.transmitted_spots || "");
    setGainSpots(assignment.gain_spots || "");
  }, [assignment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const planned = Number(plannedSpots);
    const missed = Number(missedSpots);
    const transmitted = Number(transmittedSpots);
    if (planned !== missed + transmitted) {
      setError("Planned spots must equal missed + transmitted spots.");
      setLoading(false);
      return;
    }
    try {
      // Use authFetch to include Authorization header
      const { authFetch } = await import("../utils/api");
      const res = await authFetch(`${API_URL}${assignment.id}/`, {
        method: "PATCH",
        body: JSON.stringify({
          planned_spots: planned,
          missed_spots: missed,
          transmitted_spots: transmitted,
          gain_spots: gainSpots === "" ? null : Number(gainSpots),
          status: "SUBMITTED",
        }),
      });
      if (!res.ok) throw new Error("Failed to submit summary");
      if (onSubmitted) onSubmitted();
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: "1px solid #ccc", padding: 8, margin: 8 }}>
      <h4>Submit Reconciliation Summary</h4>
      <div style={{ minHeight: 48, marginBottom: 12 }}>
        {assignment.status === "REJECTED" && assignment.manager_comment ? (
          <div className="flashing-rejection">
            🚫 REJECTION REASON: {assignment.manager_comment}
          </div>
        ) : (
          <div style={{ minHeight: 40 }}></div>
        )}
      </div>
      <div>
        <label>Planned Spots: <input type="number" min="0" value={plannedSpots} onChange={e => setPlannedSpots(e.target.value)} required disabled={loading} /></label>
      </div>
      <div>
        <label>Missed Spots: <input type="number" min="0" value={missedSpots} onChange={e => setMissedSpots(e.target.value)} required disabled={loading} /></label>
      </div>
      <div>
        <label>Transmitted Spots: <input type="number" min="0" value={transmittedSpots} onChange={e => setTransmittedSpots(e.target.value)} required disabled={loading} /></label>
      </div>
      <div>
        <label>Gain Spots (Free): <input type="number" min="0" value={gainSpots} onChange={e => setGainSpots(e.target.value)} disabled={loading} /></label>
      </div>
      <button type="submit" disabled={loading}>Submit Summary</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}

export default AssignmentSummaryForm;
