import React, { useState } from "react";
import { authFetch } from "../utils/api";

const API_BASE = "/api/import_export";

const options = [
  { key: "settings", label: "System Settings" },
  { key: "entities", label: "Modules & User Data" },
  { key: "analysis", label: "Analysis Data" },
];

export default function ImportExportPanel() {
  const [selected, setSelected] = useState([]);
  const [format, setFormat] = useState("json");
  const [importFiles, setImportFiles] = useState({});
  const [status, setStatus] = useState("");

  const handleSelect = (key) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleFileChange = (key, file) => {
    setImportFiles((prev) => ({ ...prev, [key]: file }));
  };

  const handleExport = async () => {
    setStatus("");
    for (const key of selected) {
      const url = `${API_BASE}/${key}/export/?format=${format}`;
      const res = await authFetch(url);
      if (res.ok) {
        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob);
        a.download = `${key}_export.${format}`;
        a.click();
      } else {
        setStatus(`Export failed for ${key}`);
      }
    }
  };

  const handleImport = async () => {
    setStatus("");
    for (const key of selected) {
      const file = importFiles[key];
      if (!file) {
        setStatus(`No file selected for ${key}`);
        continue;
      }
      const formData = new FormData();
      formData.append("file", file);
      const res = await authFetch(`${API_BASE}/${key}/import/`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setStatus((s) => s + `\nImported ${key} successfully.`);
      } else {
        setStatus((s) => s + `\nImport failed for ${key}`);
      }
    }
  };

  return (
    <div style={{ padding: 24, background: "#fff", borderRadius: 12, maxWidth: 600 }}>
      <h2>Import/Export Data</h2>
      <div style={{ marginBottom: 16 }}>
        <b>Select Data Types:</b>
        {options.map((opt) => (
          <label key={opt.key} style={{ marginLeft: 16 }}>
            <input
              type="checkbox"
              checked={selected.includes(opt.key)}
              onChange={() => handleSelect(opt.key)}
            />
            {opt.label}
          </label>
        ))}
      </div>
      <div style={{ marginBottom: 16 }}>
        <b>File Format:</b>
        <label style={{ marginLeft: 16 }}>
          <input
            type="radio"
            checked={format === "json"}
            onChange={() => setFormat("json")}
          />
          JSON
        </label>
        <label style={{ marginLeft: 16 }}>
          <input
            type="radio"
            checked={format === "csv"}
            onChange={() => setFormat("csv")}
          />
          CSV
        </label>
      </div>
      <div style={{ marginBottom: 16 }}>
        <b>Import Files:</b>
        {selected.map((key) => (
          <div key={key} style={{ marginTop: 8 }}>
            <label>
              {options.find((o) => o.key === key).label}: 
              <input
                type="file"
                accept={format === "json" ? ".json" : ".csv"}
                onChange={(e) => handleFileChange(key, e.target.files[0])}
              />
            </label>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 16 }}>
        <button onClick={handleExport} disabled={selected.length === 0}>
          Export Selected
        </button>
        <button onClick={handleImport} disabled={selected.length === 0} style={{ marginLeft: 16 }}>
          Import Selected
        </button>
      </div>
      {status && <div style={{ color: "#b22222", whiteSpace: "pre-line" }}>{status}</div>}
    </div>
  );
}
