import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Input, InputNumber, Button, Card, message, Spin, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { RcFile } from "antd/es/upload";
import { fuelClaimAPI } from "../services/api/apiClient";
import "../styles/forms.css";

const SubmitClaim: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [receiptBase64, setReceiptBase64] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const tripId = location.state?.tripId || "";

  const handleImageUpload = (file: RcFile) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      setReceiptBase64(base64String);
      setPreviewUrl(base64String);
    };
    return false; // Prevent auto upload
  };

  const onFinish = async (values: {
    receiptRef: string;
    amount: number;
  }) => {
    if (!tripId) {
      message.error("Trip ID is required");
      return;
    }

    if (!receiptBase64) {
      message.error("Please upload a receipt image");
      return;
    }

    setLoading(true);
    try {
      const response = await fuelClaimAPI.submitClaim({
        trip_id: tripId,
        amount: values.amount,
        receipt_ref: values.receiptRef,
        receipt_url: receiptBase64,
      });

      // Response structure: { success: boolean, message: string, data: {...} }
      if (response.status === 200 && response.data?.success) {
        message.success("Fuel claim submitted successfully!");
        // Reset form
        setReceiptBase64("");
        setPreviewUrl("");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        message.error(response.data?.message || "Failed to submit fuel claim");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message?.[0] || 
                      error.response?.data?.message || 
                      "Failed to submit fuel claim";
      message.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
      console.error("Full error:", error);
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
              label="Receipt Image"
              required
            >
              <Upload
                maxCount={1}
                accept="image/*"
                beforeUpload={handleImageUpload}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />} size="large" block>
                  Click to Upload Receipt Image
                </Button>
              </Upload>
              {previewUrl && (
                <div style={{ marginTop: "16px" }}>
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "4px" }}
                  />
                </div>
              )}
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
