import React, { useState } from "react";
import { ROLES } from "../../app/constants";

export default function PolicyActions({ policy, role, onChange }) {
    // notes not requd
  const [notes, setNotes] = useState("");
  const canUW = ROLES.includes(role);
  const approve = () => {
    if (!canUW) return alert("Access Denied");
    onChange({ ...policy, status: "Approved", notes });
  };

  const reject = () => {
    if (!canUW) return alert("Access Denied");
    onChange({ ...policy, status: "Rejected", notes });
  };

  const endorse = () => {
    onChange({
      ...policy,
      sumInsured: policy.sumInsured * 1.05,
      status: "Active"
    });
  };

  return (
    <div style={{ marginTop: 20 }}>
      {policy.status === "UnderwritingReview" && (
        <>
          {/* <input
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          /> */}
          <button onClick={approve}>Approve</button>
          <button onClick={reject}>Reject</button>
        </>
      )}

      {(policy.status === "Approved" || policy.status === "Active") && (
        <button onClick={endorse}>Endorse</button>
      )}
    </div>
  );
}