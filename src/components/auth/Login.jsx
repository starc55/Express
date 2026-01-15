import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "@/styles/auth/login.css";

const Login = () => {
  const [selectedType, setSelectedType] = useState("User");

  const handleTypeChange = (type) => {
    setSelectedType(type);
  };

  return (
    <div className="login-container">
      <form action="submit">
        <motion.h2
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          XPRESS
        </motion.h2>

        <motion.h2
          className="subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          To log in the system select the type
        </motion.h2>

        <div className="login-options">
          <div className="toggle-container">
            <button
              type="button"
              className={`login-button ${
                selectedType === "User" ? "active" : ""
              }`}
              onClick={() => handleTypeChange("User")}
            >
              User
            </button>
            <button
              type="button"
              className={`login-button ${
                selectedType === "Admin" ? "active" : ""
              }`}
              onClick={() => handleTypeChange("Admin")}
            >
              Admin
            </button>

            {/* Slider animatsiyasi biroz yumshoqroq */}
            <motion.div
              className="slider"
              layout
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
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
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password*</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="login-footer">
              <div className="remember-me">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <a href="#" className="forgot-pasword">
                Forgot password
              </a>
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.button
          type="submit"
          className="submit-button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          Enter
        </motion.button>
      </form>
    </div>
  );
};

export default Login;
