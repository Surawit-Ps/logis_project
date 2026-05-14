import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Input, InputNumber, Button, Card, message, Spin } from "antd";
import { fuelClaimAPI } from "../services/api/apiClient";
import "../styles/forms.css";

const SubmitClaim: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const tripId = location.state?.tripId || "";

  const onFinish = async (values: {
    receiptRef: string;
    amount: number;
    receiptUrl: string;
  }) => {
    if (!tripId) {
      message.error("Trip ID is required");
      return;
    }

    setLoading(true);
    try {
      const response = await fuelClaimAPI.submitClaim(
        tripId,
        values.amount,
        values.receiptRef,
        values.receiptUrl
      );

      if (response.data.success) {
        message.success("Fuel claim submitted successfully!");
        navigate("/dashboard");
      }
    } catch (error) {
      message.error("Failed to submit fuel claim");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <Card title="⛽ Submit Fuel Claim" className="form-card">
        <Spin spinning={loading}>
          <Form onFinish={onFinish} layout="vertical">
            <Form.Item
              label="Trip ID"
              required
            >
              <Input value={tripId} disabled />
            </Form.Item>

            <Form.Item
              label="Receipt Reference"
              name="receiptRef"
              rules={[
                { required: true, message: "Please enter receipt reference" },
              ]}
            >
              <Input placeholder="e.g., REC001" size="large" />
            </Form.Item>

            <Form.Item
              label="Amount (Baht)"
              name="amount"
              rules={[
                { required: true, message: "Please enter the amount" },
                { type: "number", min: 0.01, message: "Amount must be greater than 0" },
              ]}
            >
              <InputNumber
                placeholder="Enter amount"
                size="large"
                step={0.01}
                min={0.01}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="Receipt URL"
              name="receiptUrl"
              rules={[
                { required: true, message: "Please enter receipt URL" },
                { type: "url", message: "Please enter a valid URL" },
              ]}
            >
              <Input placeholder="https://example.com/receipt.jpg" size="large" />
            </Form.Item>

            <Button type="primary" htmlType="submit" block size="large">
              Submit Claim
            </Button>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default SubmitClaim;
