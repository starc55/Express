import React, { useState, useEffect } from "react";
import { CiStar } from "react-icons/ci";
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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  const routeText = loadingRoute
    ? "Loading route..."
    : primaryRoute
    ? `${primaryRoute.from_location} → ${primaryRoute.to_location}`
    : city && state
    ? `${city}, ${state}`
    : "N/A";

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.companyInfo}>
          <div>
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
          </div>

          <div className={styles.companyDetails}>
            <h3 className={styles.companyName}>{name}</h3>
            <div className={styles.meta}>
              <span className={styles.location}>{routeText}</span>
              <span className={styles.separator}>•</span>
              <div className={styles.rating}>
                <CiStar size={16} className={styles.star} />
                <span>{rating ? rating.toFixed(1) : "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnView}`}
            onClick={() => onViewDetails(id)}
          >
            View Details
          </button>

          {isAdmin && onEdit && (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnEdit}`}
              onClick={() => onEdit(id)}
            >
              Edit
            </button>
          )}

          {isAdmin && (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnEdit}`}
              onClick={() => setIsModalOpen(true)}
            >
              Add Review
            </button>
          )}
        </div>
      </div>

      <div className={styles.body}>
        <p className={styles.reviewText}>"{reviewText || "No reviews yet"}"</p>
      </div>

      {isAdmin && (
        <ReviewModal
          companyName={name}
          companyId={Number(id)}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default CompanyCard;
