import React, { useState, useEffect } from "react";
import { CiStar } from "react-icons/ci";
import { motion } from "framer-motion";
import axiosInstance from "@/api/axiosInstance";
import styles from "@/styles/common/companyCard.module.css";
import ReviewModal from "@/components/modal/ReviewModal";

interface CompanyCardProps {
  id: string | number;
  name: string;
  rating: number | null;
  city?: string;
  state?: string;
  reviewText: string;
  reviewerName?: string;
  reviewerImage?: string;
  isAdmin?: boolean;
  onViewDetails: (id: string | number) => void;
  onEdit?: (id: string | number) => void;
}

interface Route {
  from_location: string;
  to_location: string;
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
  city = "",
  state = "",
  reviewText,
  reviewerImage,
  reviewerName,
  isAdmin = false,
  onViewDetails,
  onEdit,
}) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loadingRoute, setLoadingRoute] = useState(true);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const res = await axiosInstance.get(`/api/v1/company-route/${id}`);
        if (res.data && !Array.isArray(res.data)) {
          setRoutes([res.data]);
        } else if (Array.isArray(res.data)) {
          setRoutes(res.data);
        }
      } catch (err) {
        console.warn("Company route not loaded:", err);
        setRoutes([]);
      } finally {
        setLoadingRoute(false);
      }
    };

    fetchRoute();
  }, [id]);

  const primaryRoute = routes[0];
  const routeText = primaryRoute
    ? `${primaryRoute.from_location} → ${primaryRoute.to_location}`
    : city && state
    ? `${city}, ${state}`
    : "N/A";

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
                {loadingRoute ? "Loading route..." : routeText}
              </span>
              <span className={styles.separator}>•</span>
              <div className={styles.rating}>
                <CiStar size={16} className={styles.star} />
                <span>{rating ? rating.toFixed(1) : "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        {isAdmin && (
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

            {onEdit && (
              <motion.button
                type="button"
                className={`${styles.btn} ${styles.btnEdit}`}
                onClick={() => onEdit(id)}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Edit
              </motion.button>
            )}

            <motion.button
              type="button"
              className={`${styles.btn} ${styles.btnEdit}`}
              onClick={() => setIsModalOpen(true)}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Add Review
            </motion.button>
          </div>
        )}
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

      {isAdmin && (
        <ReviewModal
          companyName={name}
          companyId={Number(id)}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </motion.div>
  );
};

export default CompanyCard;
