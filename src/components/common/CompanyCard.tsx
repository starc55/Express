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
  route?: { from_location: string; to_location: string };
  routeId?: number;
}

interface Route {
  from_location: string;
  to_location: string;
}

const CompanyCard: React.FC<CompanyCardProps> = ({
  id,
  name,
  rating,
  reviewText,
  reviewerImage,
  reviewerName,
  isAdmin = false,
  onViewDetails,
  onEdit,
  route,
  routeId,
}) => {
  const [fetchedRoute, setFetchedRoute] = useState<Route | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchRoute = async () => {
      if (routeId) {
        try {
          const res = await axiosInstance.get(
            `/api/v1/company-route/${routeId}/`
          );
          setFetchedRoute(res.data);
        } catch (err) {
          console.warn("Company route not loaded:", err);
          setFetchedRoute(null);
        } finally {
          setLoadingRoute(false);
        }
      } else {
        setLoadingRoute(false);
      }
    };
    fetchRoute();
  }, [routeId]);

  const routeText = loadingRoute
    ? "Loading route..."
    : fetchedRoute
    ? `${fetchedRoute.from_location} → ${fetchedRoute.to_location}`
    : route
    ? `${route.from_location} → ${route.to_location}`
    : "Route not available";

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
