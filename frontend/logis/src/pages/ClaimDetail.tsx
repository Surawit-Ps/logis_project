import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Spin, message, Tag, Row, Col, Modal, Input, Divider, Timeline } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { fuelClaimAPI } from "../services/api/apiClient";
import type { FuelClaimDetail } from "../interfaces";
import "../styles/claim-detail.css";

const ClaimDetail: React.FC = () => {
  const { claimId } = useParams<{ claimId: string }>();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<FuelClaimDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [remarksVisible, setRemarksVisible] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const userRole = localStorage.getItem("user_role");

  useEffect(() => {
    loadClaim();
  }, [claimId]);

  const loadClaim = async () => {
    if (!claimId) return;
    setLoading(true);
    try {
      const response = await fuelClaimAPI.getClaimWithAuditTrail(claimId);
      if (response.data.success && response.data.data) {
        setClaim(response.data.data);
      }
    } catch (error) {
      message.error("Failed to load claim details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!claimId) return;

    setActionLoading(true);
    try {
      if (userRole?.toLowerCase() === "supervisor") {
        await fuelClaimAPI.approveBySupervisor(claimId, remarks);
      } else if (userRole?.toLowerCase() === "finance") {
        await fuelClaimAPI.approveByFinance(claimId, remarks);
      }
      message.success("Claim approved successfully!");
      setRemarksVisible(false);
      setRemarks("");
      loadClaim();
    } catch (error) {
      message.error("Failed to approve claim");
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!claimId || !remarks) {
      message.warning("Please provide rejection reason");
      return;
    }

    setActionLoading(true);
    try {
      if (userRole?.toLowerCase() === "supervisor") {
        await fuelClaimAPI.rejectBySupervisor(claimId, remarks);
      } else if (userRole?.toLowerCase() === "finance") {
        await fuelClaimAPI.rejectByFinance(claimId, remarks);
      }
      message.success("Claim rejected successfully!");
      setRemarksVisible(false);
      setRemarks("");
      loadClaim();
    } catch (error) {
      message.error("Failed to reject claim");
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const canApprove = () => {
    if (!claim) return false;
    if (userRole?.toLowerCase() === "supervisor" && claim.status === "Pending") return true;
    if (userRole?.toLowerCase() === "finance" && claim.status === "Approved by Supervisor") return true;
    return false;
  };

  const getStatusColor = (status: string) => {
    if (status.includes("Approved by Finance")) return "success";
    if (status.includes("Rejected")) return "error";
    if (status.includes("Supervisor")) return "processing";
    return "default";
  };

  return (
    <div className="claim-detail-container">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        Back
      </Button>

      <Spin spinning={loading}>
        {claim ? (
          <Card title={`Claim Details - ${claim.id}`}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="detail-section">
                  <h3>Claim Information</h3>
                  <Row gutter={[8, 8]}>
                    <Col span={24}>
                      <strong>Status:</strong>{" "}
                      <Tag color={getStatusColor(claim.status)}>
                        {claim.status}
                      </Tag>
                    </Col>
                    <Col span={24}>
                      <strong>Amount:</strong> ฿{claim.amount.toFixed(2)}
                    </Col>
                    <Col span={24}>
                      <strong>Receipt Ref:</strong> {claim.receipt_ref}
                    </Col>
                    <Col span={24}>
                      <strong>Receipt:</strong>

                      <div style={{ marginTop: 10 }}>
                        <img
                          src={claim.receipt_url}
                          alt="Receipt"
                          style={{
                            width: "100%",
                            maxWidth: 400,
                            borderRadius: 8,
                            border: "1px solid #ddd",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            window.open(
                              claim.receipt_url,
                              "_blank"
                            )
                          }
                        />
                      </div>
                    </Col>
                  </Row>
                </div>
              </Col>

              <Col span={12}>
                <div className="detail-section">
                  <h3>Trip & Driver Information</h3>
                  <Row gutter={[8, 8]}>
                    <Col span={24}>
                      <strong>Driver:</strong> {claim.driver.username}
                    </Col>
                    <Col span={24}>
                      <strong>Origin:</strong> {claim.trip.origin}
                    </Col>
                    <Col span={24}>
                      <strong>Destination:</strong> {claim.trip.destination}
                    </Col>
                    <Col span={24}>
                      <strong>Trip Status:</strong> {claim.trip.status}
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>

            <Divider />

            <div className="detail-section">
              <h3>Audit Trail</h3>
              <Timeline
                items={claim.audit_trail.map((log) => ({
                  label: new Date(log.created_at).toLocaleString(),
                  children: (
                    <div>
                      <strong>{log.action}</strong>
                      <br />
                      {log.from_status && `From: ${log.from_status}`}
                      {log.from_status && log.to_status && <br />}
                      {log.to_status && `To: ${log.to_status}`}
                      {log.remarks && (
                        <>
                          <br />
                          Remarks: <em>{log.remarks}</em>
                        </>
                      )}
                    </div>
                  ),
                }))}
              />
            </div>

            {canApprove() && (
              <>
                <Divider />
                <div style={{ textAlign: "center" }}>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => {
                      setAction("approve");
                      setRemarksVisible(true);
                    }}
                    loading={actionLoading}
                  >
                    ✓ Approve Claim
                  </Button>
                  <Button
                    danger
                    size="large"
                    onClick={() => {
                      setAction("reject");
                      setRemarksVisible(true);
                    }}
                    loading={actionLoading}
                    style={{ marginLeft: 8 }}
                  >
                    ✗ Reject Claim
                  </Button>
                </div>
              </>
            )}
          </Card>
        ) : (
          <Card>
            <p>Claim not found</p>
          </Card>
        )}
      </Spin>

      <Modal
        title={action === "approve" ? "Approve Claim" : "Reject Claim"}
        open={remarksVisible}
        onCancel={() => {
          setRemarksVisible(false);
          setRemarks("");
          setAction(null);
        }}
        footer={[
          <Button key="cancel" onClick={() => setRemarksVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={actionLoading}
            onClick={action === "approve" ? handleApprove : handleReject}
          >
            {action === "approve" ? "Approve" : "Reject"}
          </Button>,
        ]}
      >
        <Input.TextArea
          placeholder={
            action === "approve"
              ? "Optional remarks (e.g., Receipt verified)"
              : "Required: Please provide rejection reason"
          }
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={4}
        />
      </Modal>
    </div>
  );
};

export default ClaimDetail;
