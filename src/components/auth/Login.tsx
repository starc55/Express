import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "@/styles/auth/login.css";
import { GoHome, GoEye, GoEyeClosed } from "react-icons/go";
import logoUrl from "@/assets/images/logo.svg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const Login = () => {
  const [selectedType, setSelectedType] = useState<"User" | "Admin">("User");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://52.91.170.2/api/v1/login/",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { access, refresh } = response.data;

      localStorage.setItem("access_token", access || "");
      localStorage.setItem("refresh_token", refresh || "");

      const userData = {
        id: "temp-" + Date.now(),
        name: selectedType === "Admin" ? "Admin" : "User",
        email,
        role: selectedType.toLowerCase() as "user" | "admin",
      };

      login(userData);

      toast.success("Login successful!");

      if (selectedType === "Admin") {
        navigate("/");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      let errMsg = "Incorrect email or password. Please try again.";

      if (err.response?.status === 401) {
        const detail = err.response.data?.detail || "";
        if (detail.includes("No active account") || detail.includes("active")) {
          errMsg =
            "Account is not active. Please set is_active to True in the backend!";
        } else if (detail) {
          errMsg = detail;
        } else {
          errMsg = "401 Unauthorized – invalid credentials";
        }
      } else if (
        err.message?.includes("Network") ||
        err.message?.includes("CORS")
      ) {
        errMsg = "Could not connect to the server (CORS or server issue)";
      }

      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="back-home-wrapper">
        <GoHome size={24} className="back-home" onClick={() => navigate("/")} />
      </div>

      <div className="login-container">
        <form onSubmit={handleLogin}>
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="logo"
          >
            <img src={logoUrl} alt="Xpress logo" className="logo-image" />
          </motion.div>

          <motion.h2
            className="subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Select account type to sign in
          </motion.h2>

          <div className="login-options">
            <div className="toggle-container">
              <button
                type="button"
                className={`login-button ${
                  selectedType === "User" ? "active" : ""
                }`}
                onClick={() => setSelectedType("User")}
              >
                User
              </button>
              <button
                type="button"
                className={`login-button ${
                  selectedType === "Admin" ? "active" : ""
                }`}
                onClick={() => setSelectedType("Admin")}
              >
                Admin
              </button>

              <motion.div
                className="slider"
                layout
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                animate={{ x: selectedType === "User" ? 0 : "100%" }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedType}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="input-fields"
            >
              <div className="input-group">
                <label htmlFor="email">Email*</label>
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
                <label htmlFor="password">Password*</label>
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
                      right: "1.5rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.2rem",
                      color: "#6B7280",
                    }}
                  >
                    {showPassword ? <GoEyeClosed /> : <GoEye />}
                  </button>
                </div>
              </div>

              <div className="login-footer">
                <div className="remember-me">
                  <input type="checkbox" id="remember" />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <a href="#" className="forgot-password">
                  Forgot password?
                </a>
              </div>
            </motion.div>
          </AnimatePresence>

          <motion.button
            type="submit"
            className="submit-button"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.03 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </motion.button>
        </form>
      </div>
    </>
  );
};

export default Login;
