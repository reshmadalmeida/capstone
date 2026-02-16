import React from "react";

export default function PolicyHistory({ history }) {
  return (
    <div>
      <h3>Policy History</h3>
      {history.map((h, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <strong>{h.action}</strong> — v{h.version} — {h.actor}
          <br />
          <small>{h.timestamp}</small>
          {h.notes && <div>Notes: {h.notes}</div>}
        </div>
      ))}
    </div>
  );
}