import { useEffect, useState } from "react";
import api from "../../services/apiClient";
import Loader from "../../shared/Loader";
import ErrorState from "../../shared/ErrorState";
import Badge from "../../shared/Badge";
import DataTable from "../../shared/DataTable";
import {
  CLAIM_TABLE_COLUMNS,
  CLAIMS_ADJUSTER_LINKS,
} from "../../common/constants";
import Alert from "../../shared/Alert";
import { useAuth } from "../../hooks/useAuth";
import { isAllowed, toDDMMMYYYY } from "../../common/utils";
import AppShell from "../../layouts/AppShell";
import EmptyState from "../../shared/EmptyState";
import ClaimsForm from "./ClaimsForm";
import TimelineModal from "../../shared/TimelineModal";
import ConfirmDialog from "../../shared/ConfirmDialog";

export default function ClaimsList() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [timelineData, setTimelineData] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [mode, setMode] = useState("create");

  const { loggedInUser } = useAuth();

  const isCreateAllowed = isAllowed(loggedInUser?.user?.permissions, "CREATE");
  const isEditAllowed = isAllowed(loggedInUser?.user?.permissions, "UPDATE");
  const isReviewAllowed = isAllowed(loggedInUser?.user?.permissions, "APPROVE");

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await api.get("/claims");
      setClaims(res.data || []);
    } catch {
      setError("Failed to fetch claims.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const onCreate = () => {
    setMode("create");
    setSelectedItem(null);
    setShowModal(true);
  };

  const onEdit = (claim) => {
    if (!claim?._id) return;
    setMode("edit");
    setSelectedItem(claim);
    setShowModal(true);
  };

  const onApprove = (claim) => {
    if (!claim?._id) return;
    setMode("approve");
    setSelectedItem(claim);
    setShowModal(true);
  };

  const onReject = async () => {
    if (!selectedItem?._id) return;

    setAlertMessage("");
    try {
      await api.put(`/claims/${selectedItem._id}`, {
        status: "REJECTED",
      });
      fetchClaims();
    } catch (error) {
      setAlertMessage(error.message || "Failed to reject claim.");
    } finally {
      setShowConfirmModal(false);
      setSelectedItem(null);
    }
  };

  const onSettle = async (claimId) => {
    if (!claimId) return;

    setAlertMessage("");
    try {
      await api.put(`/claims/${claimId}`, {
        status: "SETTLED",
      });
      fetchClaims();
    } catch (error) {
      setAlertMessage(error.message || "Failed to settle claim.");
    }
  };

  const onModalClose = (reload = false) => {
    setShowModal(false);
    setSelectedItem(null);
    if (reload) fetchClaims();
  };

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} />;

  return (
    <AppShell links={CLAIMS_ADJUSTER_LINKS}>
      <div className="container py-4">
        {!!alertMessage && (
          <Alert
            alertMessage={alertMessage}
            onDismiss={() => setAlertMessage("")}
          />
        )}

        <div className="card shadow-lg border-0 rounded-3">
          <div className="card-header bg-dark bg-gradient text-white py-3 px-4 d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">Claims</h5>
              <small className="opacity-75">
                Manage claim lifecycle and approvals
              </small>
            </div>

            {isCreateAllowed && (
              <button className="btn btn-success" onClick={onCreate}>
                <i className="bi bi-plus-lg me-1"></i>
                Create Claim
              </button>
            )}
          </div>

          <div className="card-body p-4">
            {!claims.length && (
              <EmptyState title="No claims found. Create one to get started." />
            )}

            {claims.length > 0 && (
              <DataTable
                columns={CLAIM_TABLE_COLUMNS}
                data={claims}
                renderRow={(claim) => (
                  <tr key={claim._id} className="align-middle">
                    <td className="fw-medium">{claim.claimNumber}</td>
                    <td>{claim.policyId?.policyNumber}</td>
                    <td>₹{claim.claimAmount}</td>
                    <td>₹{claim.approvedAmount}</td>

                    <td>
                      <Badge type={claim.status} badgeText={claim.status} />
                    </td>

                    <td>{toDDMMMYYYY(claim.incidentDate)}</td>
                    <td>{toDDMMMYYYY(claim.reportedDate)}</td>
                    <td>{claim.handledBy?.username || "-"}</td>

                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2 flex-wrap">
                        {isEditAllowed && claim.status === "IN_REVIEW" && (
                          <button
                            className="btn btn-outline-success btn-sm"
                            onClick={() => onEdit(claim)}
                            title="Edit"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                        )}

                        {isReviewAllowed && claim.status === "IN_REVIEW" && (
                          <>
                            <button
                              className="btn btn-outline-success btn-sm"
                              onClick={() => onApprove(claim)}
                              title="Approve"
                            >
                              <i className="bi bi-check-circle"></i>
                            </button>

                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => {
                                setSelectedItem(claim);
                                setShowConfirmModal(true);
                              }}
                              title="Reject"
                            >
                              <i className="bi bi-x-circle"></i>
                            </button>
                          </>
                        )}

                        {isReviewAllowed && claim.status === "APPROVED" && (
                          <button
                            className="btn btn-outline-success btn-sm"
                            onClick={() => onSettle(claim._id)}
                            title="Settle"
                          >
                            <i className="bi bi-cash-coin"></i>
                          </button>
                        )}

                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => setTimelineData(claim.remarks)}
                          title="View history"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              />
            )}
          </div>
        </div>
      </div>

      <ClaimsForm
        mode={mode}
        onClose={onModalClose}
        showModal={showModal}
        claimData={selectedItem}
      />

      <TimelineModal
        show={!!timelineData}
        onClose={() => setTimelineData("")}
        data={timelineData}
      />

      <ConfirmDialog
        showModal={showConfirmModal}
        title="Confirm Rejection"
        message="Are you sure you want to reject this claim?"
        onConfirm={onReject}
        onCancel={() => setShowConfirmModal(false)}
      />
    </AppShell>
  );
}
