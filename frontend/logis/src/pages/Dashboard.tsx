import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Spin,
  message,
  Empty,
  Space,
  Row,
  Col,
  Tag,
  Input,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { fuelClaimAPI, tripAPI } from "../services/api/apiClient";
import type { FuelClaimDetail, Trip } from "../interfaces";
import "../styles/dashboard.css";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [claims, setClaims] = useState<FuelClaimDetail[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState("");

  const userRole = localStorage.getItem("user_role");
  console.log("User role from localStorage:", userRole);

  

  useEffect(() => {
    loadClaimsByRole();
  }, []);

  const loadClaimsByRole = async () => {
    setLoading(true);

    try {
      let response;
      let tripsResponse;

      console.log("Loading claims for role:", userRole);

      if (userRole?.toLowerCase() === "driver") {
  
        try {
          response =
            await fuelClaimAPI.getClaimsByDriver();
        } catch (err) {
          console.error("Claims error:", err);
        }

        // โหลด trips ของ driver
        try {
          tripsResponse =
            await tripAPI.getAllTripsByDriverID();

          console.log(
            "Trips response:",
            tripsResponse.data
          );

          if (
            tripsResponse?.data?.success &&
            tripsResponse.data.data
          ) {
            setTrips(
              Array.isArray(
                tripsResponse.data.data
              )
                ? tripsResponse.data.data
                : [tripsResponse.data.data]
            );
          }
        } catch (err) {
          console.error("Trips error:", err);
        }
      } else if (userRole?.toLowerCase() === "supervisor") {
        response =
          await fuelClaimAPI.getClaimsForSupervisor();

        console.log(
          "Supervisor claims response:",
          response
        );
      } else if (userRole?.toLowerCase() === "finance") {
        response =
          await fuelClaimAPI.getClaimsForFinance();

        console.log(
          "Finance claims response:",
          response
        );
      } else {
        message.warning("Unknown user role");
        return;
      }

      // set claims
      if (
        response?.data?.success &&
        response.data.data
      ) {
        setClaims(
          Array.isArray(response.data.data)
            ? response.data.data
            : [response.data.data]
        );
      }
    } catch (error) {
      message.error(
        "Failed to load dashboard data"
      );

      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadClaim = async (
    claimId: string
  ) => {
    if (!claimId.trim()) {
      message.warning(
        "Please enter a claim ID"
      );

      return;
    }

    setLoading(true);

    try {
      const response =
        await fuelClaimAPI.getClaimWithAuditTrail(
          claimId
        );

      if (
        response?.data?.success &&
        response.data.data
      ) {
        // ถ้ายังไม่มี claim นี้ใน state ค่อยเพิ่ม
        if (
          !claims.find(
            (c) =>
              c.id ===
              response.data.data?.id
          )
        ) {
          setClaims([
            response.data.data,
            ...claims,
          ]);
        }

        setSearchId("");

        message.success("Claim loaded!");
      }
    } catch (error) {
      message.error("Claim not found");

      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (
    status: string
  ) => {
    if (
      status.includes(
        "Approved by Finance"
      )
    )
      return "success";

    if (status.includes("Rejected"))
      return "error";

    if (status.includes("Supervisor"))
      return "processing";

    return "default";
  };

  return (
    <div className="dashboard-container">
      <Card
        title="📊 Fuel Claims Dashboard"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() =>
              navigate("/trip")
            }
          >
            New Trip & Claim
          </Button>
        }
      >
        {/* Search */}
        <Space
          style={{
            width: "100%",
            marginBottom: 20,
          }}
          direction="vertical"
        >
          <div
            style={{
              display: "flex",
              gap: 10,
            }}
          >
            <Input
              placeholder="Enter Claim ID to search..."
              value={searchId}
              onChange={(e) =>
                setSearchId(
                  e.target.value
                )
              }
              onPressEnter={() =>
                loadClaim(searchId)
              }
              style={{ flex: 1 }}
            />

            <Button
              onClick={() =>
                loadClaim(searchId)
              }
              loading={loading}
            >
              Search
            </Button>
          </div>
        </Space>

        <Spin spinning={loading}>
          {/* DRIVER TRIPS */}
          {userRole === "driver" && (
            <>
              <h3
                style={{
                  marginBottom: 16,
                }}
              >
                🚗 Your Trips
              </h3>

              {trips.length === 0 ? (
                <Empty
                  description="No trips found"
                  style={{
                    marginBottom: 30,
                  }}
                />
              ) : (
                <Space
                  direction="vertical"
                  style={{
                    width: "100%",
                    marginBottom: 30,
                  }}
                >
                  {trips.map((trip) => {
                    // เช็คว่า trip นี้มี claim แล้วหรือยัง
                    const hasClaim =
                      claims.some(
                        (claim) =>
                          claim.trip?.id ===
                          trip.id
                      );

                    return (
                      <Card
                        key={trip.id}
                        hoverable={!hasClaim}
                        onClick={() => {
                          if (!hasClaim) {
                            navigate(
                              "/submit-claim",
                              {
                                state: {
                                  tripId:
                                    trip.id,
                                },
                              }
                            );
                          }
                        }}
                      >
                        <Row gutter={16}>
                          <Col span={6}>
                            <strong>
                              ID:
                            </strong>{" "}
                            {trip.id}
                          </Col>

                          <Col span={10}>
                            <strong>
                              Route:
                            </strong>{" "}
                            {trip.origin} →{" "}
                            {
                              trip.destination
                            }
                          </Col>

                          <Col span={4}>
                            <Tag color="blue">
                              {trip.status}
                            </Tag>
                          </Col>

                          <Col span={4}>
                            {hasClaim ? (
                              <Tag color="green">
                                Claim
                                Submitted
                              </Tag>
                            ) : (
                              <Button
                                type="primary"
                                onClick={(
                                  e
                                ) => {
                                  e.stopPropagation();

                                  navigate(
                                    "/submit-claim",
                                    {
                                      state:
                                        {
                                          tripId:
                                            trip.id,
                                        },
                                    }
                                  );
                                }}
                              >
                                Submit
                                Claim
                              </Button>
                            )}
                          </Col>
                        </Row>
                      </Card>
                    );
                  })}
                </Space>
              )}
            </>
          )}

          {/* CLAIMS */}
          {claims.length === 0 ? (
            <Empty
              description="No claims found"
              style={{ marginTop: 50 }}
            />
          ) : (
            <Space
              direction="vertical"
              style={{ width: "100%" }}
              size="large"
            >
              {claims.map((claim) => (
                <Card
                  key={claim.id}
                  className="claim-card"
                  onClick={() =>
                    navigate(
                      `/claim/${claim.id}`
                    )
                  }
                  hoverable
                >
                  <Row gutter={16}>
                    <Col span={6}>
                      <div className="claim-info">
                        <label>
                          Claim ID:
                        </label>

                        <strong>
                          {claim.id}
                        </strong>
                      </div>
                    </Col>

                    <Col span={6}>
                      <div className="claim-info">
                        <label>
                          Amount:
                        </label>

                        <strong>
                          ฿
                          {claim.amount.toFixed(
                            2
                          )}
                        </strong>
                      </div>
                    </Col>

                    <Col span={6}>
                      <div className="claim-info">
                        <label>
                          Receipt:
                        </label>

                        <strong>
                          {
                            claim.receipt_ref
                          }
                        </strong>
                      </div>
                    </Col>

                    <Col span={6}>
                      <div className="claim-info">
                        <label>
                          Status:
                        </label>

                        <Tag
                          color={getStatusColor(
                            claim.status
                          )}
                        >
                          {claim.status}
                        </Tag>
                      </div>
                    </Col>
                  </Row>

                  <Row
                    gutter={16}
                    style={{
                      marginTop: 10,
                    }}
                  >
                    <Col span={12}>
                      <div className="claim-info small">
                        <label>
                          Trip:
                        </label>

                        <span>
                          {
                            claim.trip
                              ?.origin
                          }{" "}
                          →{" "}
                          {
                            claim.trip
                              ?.destination
                          }
                        </span>
                      </div>
                    </Col>

                    <Col span={12}>
                      <div className="claim-info small">
                        <label>
                          Driver:
                        </label>

                        <span>
                          {
                            claim.driver
                              ?.username
                          }
                        </span>
                      </div>
                    </Col>
                  </Row>
                </Card>
              ))}
            </Space>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default Dashboard;