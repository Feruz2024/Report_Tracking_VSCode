import React from "react";
import { useParams } from "react-router-dom";
import MessagePanel from "./MessagePanel";
import AssignmentSummaryForm from "./AssignmentSummaryForm";

/**
 * Campaign detail page for analysts.
 * Allows sending inquiries and submitting reconciliation data per assignment.
 */
export default function CampaignDetail({ username }) {
  const { id } = useParams();
  // Placeholder: fetch campaign info, assignments etc.
  return (
    <div style={{ padding: 16 }}>
      <h2>Campaign Detail: {id}</h2>
      <p>Options:</p>
      <ul>
        <li>Send inquiry to manager or fellow analyst:</li>
        <MessagePanel contextId={`campaign:${id}`} recipientId={""} />
        <li>Submit reconciled data for assignments:</li>
        {/* Could list assignments and show AssignmentSummaryForm per assignment */}
      </ul>
    </div>
  );
}
