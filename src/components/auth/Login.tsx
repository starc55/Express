import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "@/styles/auth/login.css";
import { GoHome, GoEye, GoEyeClosed } from "react-icons/go";
import logoUrl from "@/assets/images/logo.svg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  user_id?: string | number;
  sub?: string | number;
  exp?: number;
  iat?: number;
  jti?: string;
  token_type?: string;
  [key: string]: any;
}

const Login = () => {
  const [accountType, setAccountType] = useState<"User" | "Admin">("User");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const savedEmail = localStorage.getItem("remember_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://backendcarrier.xpresstransportation.org/api/v1/login/",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { access, refresh, role } = response.data;

      if (!access) {
        throw new Error("Access token not received");
      }

      const decoded = jwtDecode<DecodedToken>(access);

      const userRole = (role || "user").toLowerCase();

      if (accountType === "Admin" && userRole !== "admin") {
        throw new Error(
          "You do not have permission to log in as Admin. Please use the correct account."
        );
      }

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh || "");

      if (rememberMe) {
        localStorage.setItem("remember_email", email.trim().toLowerCase());
      } else {
        localStorage.removeItem("remember_email");
      }

      const userData = {
        id: decoded.user_id || decoded.sub || `temp-${Date.now()}`,
        name: userRole === "admin" ? "Admin" : "User",
        email: email.trim().toLowerCase(),
        role: userRole as "user" | "admin",
      };

      login(userData);

      toast.success("Login successful!");
      navigate("/");
    } catch (err: any) {
      let errorMessage = "Invalid email or password. Please try again.";

      if (err.message?.includes("do not have permission to log in as Admin")) {
        errorMessage = err.message;
      } else if (err.response?.status === 401) {
        const detail = err.response.data?.detail || "";
        errorMessage = detail.includes("active")
          ? "Account is not active. Please contact support."
          : detail || "Unauthorized – invalid credentials";
      } else if (
        err.message?.includes("Network") ||
        err.message?.includes("CORS")
      ) {
        errorMessage =
          "Unable to connect to the server. Check your internet connection.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="back-home-wrapper">
        <GoHome size={24} className="back-home" onClick={() => navigate("/")} />
      </div>

      <div className="login-container">
        <form onSubmit={handleSubmit}>
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="logo"
          >
            <img src={logoUrl} alt="Logo" className="logo-image" />
          </motion.div>

          <motion.h2
            className="subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          >
            Select account type
          </motion.h2>

          <div className="login-options">
            <div className="toggle-container">
              <button
                type="button"
                className={`login-button ${
                  accountType === "User" ? "active" : ""
                }`}
                onClick={() => setAccountType("User")}
              >
                User
              </button>
              <button
                type="button"
                className={`login-button ${
                  accountType === "Admin" ? "active" : ""
                }`}
                onClick={() => setAccountType("Admin")}
              >
                Admin
              </button>

              <motion.div
                className="slider"
                layout
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                animate={{ x: accountType === "User" ? 0 : "100%" }}
              />
            </div>
          </div>

          <div className="input-fields">
            <div className="input-group">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password *</label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "20px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.3rem",
                    color: "#6B7280",
                  }}
                >
                  {showPassword ? <GoEyeClosed /> : <GoEye />}
                </button>
              </div>
            </div>

            <div className="login-footer">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember">Remember me</label>
              </div>
            </div>
          </div>

          <motion.button
            type="submit"
            className="submit-button"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.03 }}
            whileTap={{ scale: isLoading ? 1 : 0.97 }}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </motion.button>
        </form>
      </div>
    </>
  );
};

export default Login;
