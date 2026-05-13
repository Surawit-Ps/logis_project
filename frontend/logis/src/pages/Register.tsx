import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, message, Spin, Space } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { authAPI } from "../services/api/apiClient";
import "../styles/auth.css";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { username: string; password: string; confirmPassword: string }) => {
    if (values.password !== values.confirmPassword) {
      message.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register(values.username, values.password);
      if (response.data.success) {
        message.success("Registration successful! Please login.");
        navigate("/");
      }
    } catch (error) {
      message.error("Registration failed. Username may already exist.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card title="Register" className="auth-card">
        <Spin spinning={loading}>
          <Form onFinish={onFinish} layout="vertical">
            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Please enter a username" },
                { min: 3, message: "Username must be at least 3 characters" },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Username (min 3 chars)"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please enter a password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password (min 6 chars)"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              rules={[{ required: true, message: "Please confirm your password" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm Password"
                size="large"
              />
            </Form.Item>

            <Space style={{ width: "100%" }} direction="vertical">
              <Button type="primary" htmlType="submit" block size="large">
                Register
              </Button>
              <Button
                type="link"
                block
                onClick={() => navigate("/")}
              >
                Already have an account? Login here
              </Button>
            </Space>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default Register;
