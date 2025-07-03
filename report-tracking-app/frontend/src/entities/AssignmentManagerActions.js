import React, { useState } from "react";
import { sendMessage } from "../utils/api";

const API_URL = "/api/assignments/";

function AssignmentManagerActions({ assignment, onAction }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");

  const handleAction = async (status) => {
    setLoading(true);
    setError("");
    try {
      // Use authFetch to include Authorization header
      const { authFetch } = await import("../utils/api");
      const res = await authFetch(`${API_URL}${assignment.id}/`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          manager_comment: status === "REJECTED" ? comment : undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      // Send message to analyst
      if (assignment.analyst_user_id) {
        let msg = `Your assignment for campaign '${assignment.campaign_name || assignment.campaign}' has been ${status === "APPROVED" ? "approved" : "rejected"}.`;
        if (status === "REJECTED" && comment) msg += ` Reason: ${comment}`;
        try {
          await sendMessage({
            recipient_id: assignment.analyst_user_id,
            content: msg,
            context_id: `assignment:${assignment.id}`
          });
        } catch (e) {
          // Optionally handle message send error
          console.error("Failed to send message to analyst", e);
        }
      }
      setComment("");
      if (onAction) {
        setTimeout(() => onAction(), 100); // Ensure parent refreshes after backend update
      }
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 8 }}>
      <button onClick={() => handleAction("APPROVED")}
        disabled={loading || assignment.status !== "SUBMITTED"}>
        Approve
      </button>
      <button onClick={() => handleAction("REJECTED")}
        disabled={loading || assignment.status !== "SUBMITTED"}>
        Reject
      </button>
      {assignment.status === "SUBMITTED" && (
        <input
          type="text"
          placeholder="Rejection reason (optional)"
          value={comment}
          onChange={e => setComment(e.target.value)}
          style={{ marginLeft: 8 }}
        />
      )}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}

export default AssignmentManagerActions;
