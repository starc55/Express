import React, { useState } from "react";
import { CiStar } from "react-icons/ci";
import { motion } from "framer-motion";

import styles from "@/styles/common/companyCard.module.css";
import ReviewModal from "@/components/modal/ReviewModal";

interface CompanyCardProps {
  id: string | number;
  name: string;
  rating: number | null;
  city: string;
  state: string;
  reviewText: string;
  reviewerName?: string;
  reviewerImage?: string;
  isAdmin?: boolean;
  onViewDetails: (id: string | number) => void;
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
  hover: {
    y: -2,
    scale: 1.01,
    boxShadow:
      "0 25px 50px -12px rgba(0,0,0,0.25), 0 10px 20px -8px rgba(0,0,0,0.15)",
    transition: { duration: 0.4, ease: "easeOut" },
  },
} as const;

const imageVariants = {
  initial: { scale: 1, rotate: 0 },
  hover: { scale: 1.08, rotate: 2, transition: { duration: 0.5 } },
};

const buttonVariants = {
  hover: { scale: 1.06, transition: { duration: 0.25 } },
  tap: { scale: 0.96 },
};

const CompanyCard: React.FC<CompanyCardProps> = ({
  id,
  name,
  rating,
  city,
  state,
  reviewText,
  reviewerImage,
  reviewerName,
  isAdmin = false,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <motion.div
      className={styles.card}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <div className={styles.header}>
        <div className={styles.companyInfo}>
          <motion.div
            variants={imageVariants}
            initial="initial"
            whileHover="hover"
          >
            {reviewerImage ? (
              <img
                src={reviewerImage}
                alt={reviewerName || "Reviewer"}
                className={styles.reviewerImage}
                loading="lazy"
              />
            ) : (
              <div className={styles.reviewerAvatar}>
                {reviewerName?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </motion.div>

          <div className={styles.companyDetails}>
            <h3 className={styles.companyName}>{name}</h3>
            <div className={styles.meta}>
              <span className={styles.location}>
                {city}, {state}
              </span>
              <span className={styles.separator}>•</span>
              <div className={styles.rating}>
                <CiStar size={16} className={styles.star} />
                <span>{rating ? rating.toFixed(1) : "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <motion.button
            type="button"
            className={`${styles.btn} ${styles.btnView}`}
            onClick={() => onViewDetails(id)}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            View Details
          </motion.button>

          {isAdmin && (
            <>
              <motion.button
                type="button"
                className={`${styles.btn} ${styles.btnEdit}`}
                onClick={() => onEdit?.(id)}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Edit
              </motion.button>
              <motion.button
                type="button"
                className={`${styles.btn} ${styles.btnEdit}`}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setIsModalOpen(true)}
              >
                Add Review
              </motion.button>
            </>
          )}
        </div>
      </div>

      <div className={styles.body}>
        <motion.p
          className={styles.reviewText}
          initial={{ opacity: 0.7 }}
          whileHover={{ opacity: 1, y: -2 }}
          transition={{ duration: 0.3 }}
        >
          "{reviewText || "No reviews yet"}"
        </motion.p>
      </div>

      <ReviewModal
        companyName={name}
        companyId={Number(id)}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </motion.div>
  );
};

export default CompanyCard;
