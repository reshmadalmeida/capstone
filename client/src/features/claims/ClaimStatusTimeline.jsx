import { useMemo } from "react";
import { toDDMMMYYYY } from "../../common/utils";

export default function ClaimStatusTimeline({ show, onClose, data }) {
  const timeline = useMemo(() => {
    try {
      const parsed = JSON.parse(data || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [data]);

  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show"></div>

      <div className="modal fade show d-block">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-3">
            <div className="modal-header bg-dark text-white py-3 px-4">
              <div>
                <h5 className="modal-title mb-0">Claim Status Timeline</h5>
                <small className="opacity-75">
                  Chronological claim activity
                </small>
              </div>
            </div>

            <div className="modal-body px-5 py-4">
              {timeline.length === 0 ? (
                <div className="text-center text-muted py-5">
                  No remarks available.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "30%" }}>Date</th>
                        <th>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timeline.map((obj, index) => (
                        <tr key={index}>
                          <td className="fw-medium">
                            {obj?.createdAt ? toDDMMMYYYY(obj.createdAt) : "-"}
                          </td>
                          <td>{obj?.message || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer px-4 py-3">
              <button className="btn btn-outline-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
