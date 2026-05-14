import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, message, Spin, Space } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { authAPI } from "../services/api/apiClient";
import { CookieService } from "../services/cookies/cookie";
import { UserService } from "../services/user/user";
import "../styles/auth.css";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const response = await authAPI.login(values.username, values.password);
      if (response.data.success) {
        console.log(response.data.data);
        const token = response.data.data;
        // Store token in both localStorage and cookies
        localStorage.setItem("token", token || "");
        CookieService.set("access_token", token || "");
        
        if (token) {
          const base64Payload = token.split(".")[1];
          const decoded = JSON.parse(atob(base64Payload));
          
          // Store user_id and user_role
          localStorage.setItem("user_id", decoded.user_id || "");
          localStorage.setItem("user_role", decoded.role || "");
        }
        
        message.success("Login successful!");
        navigate("/dashboard");
      }
    } catch (error) {
      message.error("Login failed. Invalid credentials.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card title="Login" className="auth-card">
        <Spin spinning={loading}>
          <Form onFinish={onFinish} layout="vertical">
            <Form.Item
              name="username"
              rules={[{ required: true, message: "Please enter your username" }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Username"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Please enter your password" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                size="large"
              />
            </Form.Item>

            <Space style={{ width: "100%" }} direction="vertical">
              <Button type="primary" htmlType="submit" block size="large">
                Login
              </Button>
              <Button
                type="link"
                block
                onClick={() => navigate("/register")}
              >
                Don't have an account? Register here
              </Button>
            </Space>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default Login;
