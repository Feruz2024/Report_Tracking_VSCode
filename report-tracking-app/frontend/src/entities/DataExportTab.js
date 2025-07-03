import React from "react";
import ImportExportPanel from "./ImportExportPanel";
import CampaignExecutionExportPanel from "./CampaignExecutionExportPanel";

export default function DataExportTab() {
  return (
    <div style={{ padding: 24, background: "#f9f9f9", borderRadius: 12, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: 32 }}>Data Import & Export</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 32, justifyContent: "center" }}>
        <div style={{ flex: 1, minWidth: 350, maxWidth: 500 }}>
          <ImportExportPanel />
        </div>
        <div style={{ flex: 1, minWidth: 350, maxWidth: 500 }}>
          <CampaignExecutionExportPanel />
        </div>
      </div>
    </div>
  );
}
