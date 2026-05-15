import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Spin,
  Space,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";

import { authAPI } from "../services/api/apiClient";
import { CookieService } from "../services/cookies/cookie";

import "../styles/auth.css";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(false);

  const onFinish = async (values: {
    username: string;
    password: string;
  }) => {
    setLoading(true);

    try {
      const response =
        await authAPI.login(
          values.username,
          values.password
        );

      console.log(
        "Login response:",
        response.data
      );

      if (response.data.success) {
        // Backend ส่ง token มาเป็น string ตรง ๆ
        const token =
          response.data.data.token;

        if (!token) {
          message.error(
            "Token not found"
          );
          return;
        }

        // Save token
        localStorage.setItem(
          "token",
          token
        );

        // Optional
        CookieService.set(
          "access_token",
          token
        );

        // Decode JWT
        try {
          const base64Payload =
            token.split(".")[1];

          const decodedPayload =
            atob(base64Payload);

          const decoded = JSON.parse(
            decodedPayload
          );

          console.log(
            "Decoded JWT:",
            decoded
          );

          // Save user info
          localStorage.setItem(
            "user_id",
            decoded.user_id || ""
          );

          localStorage.setItem(
            "user_role",
            response.data.data.role || ""
          );
        } catch (jwtError) {
          console.error(
            "JWT decode error:",
            jwtError
          );
        }

        message.success(
          "Login successful!"
        );

        navigate("/dashboard");
      } else {
        message.error(
          response.data.message ||
            "Login failed"
        );
      }
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      message.error(
        "Login failed. Invalid credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card
        title="Login"
        className="auth-card"
      >
        <Spin spinning={loading}>
          <Form
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message:
                    "Please enter your username",
                },
              ]}
            >
              <Input
                prefix={
                  <UserOutlined />
                }
                placeholder="Username"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message:
                    "Please enter your password",
                },
              ]}
            >
              <Input.Password
                prefix={
                  <LockOutlined />
                }
                placeholder="Password"
                size="large"
              />
            </Form.Item>

            <Space
              style={{
                width: "100%",
              }}
              direction="vertical"
            >
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
              >
                Login
              </Button>

              <Button
                type="link"
                block
                onClick={() =>
                  navigate(
                    "/register"
                  )
                }
              >
                Don't have an
                account? Register
                here
              </Button>
            </Space>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default Login;