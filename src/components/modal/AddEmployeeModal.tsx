import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiEyeOff, FiEye } from "react-icons/fi";
import axiosInstance from "@/api/axiosInstance";
import styles from "@/styles/modal/addEmployeeModal.module.css";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password.trim(),
      };

      const response = await axiosInstance.post(
        "/api/v1/user/create/",
        payload
      );

      onSave(response.data);
      onClose();
    } catch (err: any) {
      console.error("Error adding new user:", err);
      let errMsg = "An error occurred while adding a user.";

      if (err.response?.status === 400) {
        const data = err.response.data;
        if (data.detail) {
          errMsg = data.detail;
        } else if (typeof data === "object") {
          const errors = Object.entries(data)
            .map(
              ([key, val]) =>
                `${key}: ${Array.isArray(val) ? val.join(", ") : val}`
            )
            .join("\n");
          errMsg = errors || "Incorrect information entered.";
        }
      } else if (err.response?.status === 401) {
        errMsg = "401 Unauthorized – token expired or invalid";
      }

      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.85, y: 80 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const,
        when: "beforeChildren",
        staggerChildren: 0.08,
      },
    },
    exit: { opacity: 0, scale: 0.85, y: 80, transition: { duration: 0.3 } },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.04, transition: { duration: 0.2 } },
    tap: { scale: 0.97 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.modalOverlay} onClick={onClose}>
          <motion.div
            className={styles.modalContent}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div className={styles.modalHeader} variants={childVariants}>
              <h2>Add a new employee</h2>
              <button className={styles.closeBtn} onClick={onClose}>
                ×
              </button>
            </motion.div>

            {error && (
              <motion.p className={styles.errorMsg} variants={childVariants}>
                {error}
              </motion.p>
            )}

            <motion.form onSubmit={handleSubmit} variants={childVariants}>
              <motion.div className={styles.formGroup} variants={childVariants}>
                <label className={styles.formLabel}>First Name*</label>
                <input
                  type="text"
                  value={first_name}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  required
                  className={styles.input}
                />
              </motion.div>

              <motion.div className={styles.formGroup} variants={childVariants}>
                <label className={styles.formLabel}>Last Name*</label>
                <input
                  type="text"
                  value={last_name}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  required
                  className={styles.input}
                />
              </motion.div>

              <motion.div className={styles.formGroup} variants={childVariants}>
                <label className={styles.formLabel}>Email*</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  required
                  className={styles.input}
                />
              </motion.div>

              <motion.div className={styles.formGroup} variants={childVariants}>
                <label className={styles.formLabel}>Phone number*</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  required
                  className={styles.input}
                />
              </motion.div>

              <motion.div className={styles.formGroup} variants={childVariants}>
                <label className={styles.formLabel}>Password*</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className={styles.input}
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEye /> : <FiEyeOff />}
                  </button>
                </div>
              </motion.div>

              <motion.div
                className={styles.modalActions}
                variants={childVariants}
              >
                <motion.button
                  type="submit"
                  className={styles.applyBtn}
                  disabled={loading}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {loading ? "Creating..." : "Apply"}
                </motion.button>
              </motion.div>
            </motion.form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddEmployeeModal;
