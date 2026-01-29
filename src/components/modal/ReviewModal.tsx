import React, { useState } from "react";
import { createPortal } from "react-dom";
import { CiStar } from "react-icons/ci";
import axiosInstance from "@/api/axiosInstance";
import styles from "@/styles/modal/reviewModal.module.css";

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

const StarRating: React.FC<{
  name: string;
  value: number;
  onChange: (name: string, value: number) => void;
}> = ({ name, value, onChange }) => {
  return (
    <div className={styles.starRating}>
      {[...Array(5)].map((_, i) => (
        <span key={i}>
          <CiStar
            size={24}
            className={i < value ? styles.filledStar : styles.emptyStar}
            onClick={() => onChange(name, i + 1)}
            style={{ cursor: "pointer" }}
          />
        </span>
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

    try {
      const response = await axiosInstance.post("/api/v1/reviews/", formData);

      if (response.status >= 200 && response.status < 300) {
        alert("Review submitted successfully!");

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
        }, 1500);
      } else {
        alert("Failed to submit review. Please try again.");
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

      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Submit Review for {companyName}</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Your Name:</label>
            <input
              title="Name"
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
              title="Comment"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              required
              className={styles.textarea}
              rows={4}
            />
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>

            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ReviewModal;
