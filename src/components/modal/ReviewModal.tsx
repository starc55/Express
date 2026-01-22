import React, { useState } from "react";
import { createPortal } from "react-dom";
import { CiStar } from "react-icons/ci";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import styles from "@/styles/modal/reviewModal.module.css";
import axiosInstance from "@/api/axiosInstance";

interface ReviewModalProps {
  companyName: string;
  companyId: number;
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  reviewer_name: string;
  reviewer_email: string;
  timeliness: number;
  communication: number;
  documentation: number;
  payment_terms_met: boolean;
  would_work_again: boolean;
  vehicle_delivered_expected: boolean;
  comment: string;
  company: number;
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.3, ease: "easeOut" },
  },
} as const;

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95 },
};

const StarRating: React.FC<{
  name: string;
  value: number;
  onChange: (name: string, value: number) => void;
}> = ({ name, value, onChange }) => {
  return (
    <div className={styles.starRating}>
      {[...Array(5)].map((_, i) => (
        <motion.span
          key={i}
          whileHover={{ scale: 1.2 }}
          transition={{ duration: 0.2 }}
        >
          <CiStar
            size={24}
            className={i < value ? styles.filledStar : styles.emptyStar}
            onClick={() => onChange(name, i + 1)}
          />
        </motion.span>
      ))}
    </div>
  );
};

const ReviewModal: React.FC<ReviewModalProps> = ({
  companyName,
  companyId,
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState<FormData>({
    reviewer_name: "",
    reviewer_email: "",
    timeliness: 0,
    communication: 0,
    documentation: 0,
    payment_terms_met: false,
    would_work_again: false,
    vehicle_delivered_expected: false,
    comment: "",
    company: companyId,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRatingChange = (name: string, val: number) => {
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    const loadingToast = toast.loading("Submitting review...");

    try {
      const response = await axiosInstance.post("/api/v1/reviews/", formData);

      if (response.status >= 200 && response.status < 300) {
        toast.success("Review submitted successfully!", {
          id: loadingToast,
          duration: 5000,
        });

        setFormData({
          reviewer_name: "",
          reviewer_email: "",
          timeliness: 0,
          communication: 0,
          documentation: 0,
          payment_terms_met: false,
          would_work_again: false,
          vehicle_delivered_expected: false,
          comment: "",
          company: companyId,
        });

        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        toast.error("Failed to submit review. Please try again.", {
          id: loadingToast,
        });
      }
    } catch (err: any) {
      console.error("Review submission error:", err);

      let errorMsg = "An unknown error occurred";

      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "string") errorMsg = data;
        else if (data.detail) errorMsg = data.detail;
        else if (data.non_field_errors) errorMsg = data.non_field_errors[0];
        else if (data.reviewer_email)
          errorMsg = `Email: ${data.reviewer_email[0]}`;
        else errorMsg = JSON.stringify(data);
      } else if (err.message) {
        errorMsg = err.message;
      }

      toast.error(errorMsg, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <motion.div
      className={styles.modalOverlay}
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
    >
      <motion.div
        className={styles.modalContent}
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles.modalTitle}>Submit Review for {companyName}</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Your Name:</label>
            <input
              title="name"
              type="text"
              name="reviewer_name"
              value={formData.reviewer_name}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Your Email:</label>
            <input
              title="email"
              type="email"
              name="reviewer_email"
              value={formData.reviewer_email}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Timeliness:</label>
            <StarRating
              name="timeliness"
              value={formData.timeliness}
              onChange={handleRatingChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Communication:</label>
            <StarRating
              name="communication"
              value={formData.communication}
              onChange={handleRatingChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Documentation:</label>
            <StarRating
              name="documentation"
              value={formData.documentation}
              onChange={handleRatingChange}
            />
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="payment_terms_met"
                checked={formData.payment_terms_met}
                onChange={handleChange}
                className={styles.checkbox}
              />
              Payment Terms Met
            </label>
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="would_work_again"
                checked={formData.would_work_again}
                onChange={handleChange}
                className={styles.checkbox}
              />
              Would Work Again
            </label>
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="vehicle_delivered_expected"
                checked={formData.vehicle_delivered_expected}
                onChange={handleChange}
                className={styles.checkbox}
              />
              Vehicle Delivered as Expected
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Comment:</label>
            <textarea
              title="comment"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              required
              className={styles.textarea}
              rows={4}
            />
          </div>

          <div className={styles.buttonGroup}>
            <motion.button
              type="submit"
              className={styles.submitButton}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </motion.button>

            <motion.button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              disabled={isSubmitting}
            >
              Close
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default ReviewModal;
