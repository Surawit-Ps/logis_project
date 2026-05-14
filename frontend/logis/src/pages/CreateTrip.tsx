import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, message, Spin, DatePicker } from "antd";
import { tripAPI } from "../services/api/apiClient";
import "../styles/forms.css";
import {UserService} from "../services/user/user";

const CreateTrip: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("user_id");

  const onFinish = async (values: { origin: string; destination: string; start_time: string }) => {
    if (!userId) {
      console.log(userId);
      message.error("Please login first");
      navigate("/");
      return;
    }

    setLoading(true);
    try {
      const response = await tripAPI.createTrip(
        userId,
        values.origin,
        values.destination,
        values.start_time
      );

      if (response.data.success) {
        message.success("Trip created successfully!");
        navigate("/submit-claim", { state: { tripId: response.data.data?.id } });
      }
    } catch (error) {
      message.error("Failed to create trip");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <Card title="🚗 Create New Trip" className="form-card">
        <Spin spinning={loading}>
          <Form onFinish={onFinish} layout="vertical">
            <Form.Item
              label="Origin (Starting Point)"
              name="origin"
              rules={[
                { required: true, message: "Please enter the origin location" },
              ]}
            >
              <Input placeholder="e.g., Bangkok" size="large" />
            </Form.Item>

            <Form.Item
              label="Destination"
              name="destination"
              rules={[
                { required: true, message: "Please enter the destination location" },
              ]}
            >
              <Input placeholder="e.g., Pattaya" size="large" />
            </Form.Item>

            <Form.Item
              label="Start Time"
              name="start_time"
              rules={[
                { required: true, message: "Please select start time" },
              ]}
            >
              <Input type="datetime-local" size="large" />
            </Form.Item>

            <Button type="primary" htmlType="submit" block size="large">
              Create Trip
            </Button>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default CreateTrip;
