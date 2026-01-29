import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CiStar } from "react-icons/ci";
import {
  BsCheckCircle,
  BsTrash,
  BsTelephone,
  BsEnvelope,
} from "react-icons/bs";
import Footer from "@/components/layouts/Footer";
import axiosInstance from "@/api/axiosInstance";
import styles from "@/styles/common/companyDetail.module.css";

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState<any>(null);
  const [insurance, setInsurance] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const MIN_VISIBLE_TIME = 400;
        const startTime = Date.now();
        const companyRes = await axiosInstance.get(
          `/api/v1/company/detail/${id}/`
        );
        const companyData = companyRes.data;
        setCompany(companyData);
        setContacts(companyData.contacts || []);

        try {
          const insuranceRes = await axiosInstance.get(
            `/api/v1/insurance-details/`,
            {
              params: { company: id },
            }
          );
          const insuranceData =
            insuranceRes.data.results || insuranceRes.data || [];
          setInsurance(insuranceData.length > 0 ? insuranceData[0] : null);
        } catch (insErr) {
          console.warn("Insurance not loaded", insErr);
          setInsurance(null);
        }

        const reviewsRes = await axiosInstance.get(
          `/api/v1/review/detail/${id}/`
        );
        const reviewsData = reviewsRes.data.results || reviewsRes.data || [];
        const elapsed = Date.now() - startTime;
        const remaining = MIN_VISIBLE_TIME - elapsed;
        setReviews(reviewsData);
      } catch (err: any) {
        console.error("Error loading data:", err);
        setError("Company details could not be loaded. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDeleteContact = async (contactId: number) => {
    if (!window.confirm("Are you sure you want to delete this contact?"))
      return;

    try {
      await axiosInstance.delete(`/api/v1/contact/delete/${contactId}/`);
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
      alert("Contact deleted successfully");
    } catch (err) {
      console.error("Delete contact error:", err);
      alert("Failed to delete contact");
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading company details...</div>;
  }

  if (error || !company) {
    return (
      <div className={styles.notFound}>
        <h2>404 - Company not found</h2>
        <button type="button" onClick={() => navigate("/")}>
          Back to home
        </button>
      </div>
    );
  }

  const reviewCount = reviews.length;

  let overallRating = "N/A";
  let avgTimeliness = "N/A";
  let avgCommunication = "N/A";
  let avgDocumentation = "N/A";
  let paymentsMet = 0;
  let wouldWorkAgain = 0;
  let vehicleCondition = 0;

  if (reviewCount > 0) {
    let totalTimeliness = 0;
    let totalCommunication = 0;
    let totalDocumentation = 0;
    let metCount = 0;
    let againCount = 0;
    let expectedCount = 0;

    reviews.forEach((r) => {
      totalTimeliness += r.timeliness || 0;
      totalCommunication += r.communication || 0;
      totalDocumentation += r.documentation || 0;
      if (r.payment_terms_met) metCount++;
      if (r.would_work_again) againCount++;
      if (r.vehicle_delivered_expected) expectedCount++;
    });

    const avg =
      (totalTimeliness + totalCommunication + totalDocumentation) /
      (reviewCount * 3);
    overallRating = avg.toFixed(1);

    avgTimeliness = (totalTimeliness / reviewCount).toFixed(1);
    avgCommunication = (totalCommunication / reviewCount).toFixed(1);
    avgDocumentation = (totalDocumentation / reviewCount).toFixed(1);

    paymentsMet = Math.round((metCount / reviewCount) * 100);
    wouldWorkAgain = Math.round((againCount / reviewCount) * 100);
    vehicleCondition = Math.round((expectedCount / reviewCount) * 100);
  }

  const renderStars = (rating: number | string) => {
    if (typeof rating === "string") return <span>N/A</span>;

    return [...Array(5)].map((_, i) => (
      <CiStar
        key={i}
        size={24}
        className={
          i < Math.floor(Number(rating)) ? styles.starFilled : styles.starEmpty
        }
      />
    ));
  };

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.main}>
        <div className={styles.container}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate(-1)}
          >
            Back
          </button>

          <h1 className={styles.pageTitle}>{company.name}</h1>

          <div className={styles.ratingCard}>
            <div className={styles.overallSection}>
              <p className={styles.overallLabel}>Overall Rating Average</p>
              <div className={styles.overallNumber}>{overallRating}</div>
              <div className={styles.starsContainer}>
                {renderStars(overallRating)}
              </div>
              <p className={styles.reviewCount}>
                {reviewCount} review{reviewCount !== 1 ? "s" : ""}
              </p>
            </div>

            <div className={styles.barSection}>
              {[5, 4, 3, 2, 1].map((stars) => {
                const widths = [95, 4, 1, 0, 0];
                return (
                  <div key={stars} className={styles.barRow}>
                    <span>{stars}</span>
                    <div className={styles.bar}>
                      <div
                        className={styles.barFill}
                        style={{ width: `${widths[5 - stars]}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.detailSection}>
              <p className={styles.detailLabel}>Avg. Detail Rating</p>

              <div className={styles.detailRatingsGrid}>
                {[
                  { label: "Timeliness", value: avgTimeliness },
                  { label: "Communication", value: avgCommunication },
                  { label: "Documentation", value: avgDocumentation },
                ].map((item) => (
                  <div key={item.label} className={styles.detailItem}>
                    <span className={styles.detailLabelText}>{item.label}</span>
                    <div className={styles.starWithNumber}>
                      <span className={styles.starIcon}>★</span>
                      <span className={styles.starNumber}>{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.statsList}>
                <p>{paymentsMet}% Payments terms met</p>
                <p>{wouldWorkAgain}% Would work again</p>
                <p>
                  {vehicleCondition}% Vehicle delivered in expected conditions
                </p>
              </div>
            </div>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3 className={styles.cardTitle}>FMCSA Verification Checklist</h3>
              <div className={styles.checklistGrid}>
                {[
                  {
                    label: "Allowed to operate",
                    value: company.allowed_to_operate ? "Yes" : "No",
                  },
                  {
                    label: "Business type",
                    value: company.business_type || "N/A",
                  },
                  {
                    label: "MCS 150 Outdated",
                    value: company.mcs_150_outdated ? "Yes" : "No",
                  },
                  { label: "USDOT#", value: company.usdot || "N/A" },
                  {
                    label: "Business Address",
                    value: company.business_address || "N/A",
                  },
                  {
                    label: "Out of Service Date",
                    value: company.out_of_service_date || "None",
                  },
                  { label: "MC#", value: company.mc_number || "N/A" },
                  {
                    label: "Carrier Operation",
                    value: company.carrier_operation || "N/A",
                  },
                ].map((item) => (
                  <div key={item.label} className={styles.gridItem}>
                    <div className={styles.checkLabel}>{item.label}</div>
                    <div className={styles.checkValue}>
                      <BsCheckCircle className={styles.checkIcon} size={18} />
                      <span>{item.value}</span>
                    </div>
                  </div>
                ))}

                <div className={styles.authorityRow}>
                  <div className={styles.checkLabelFull}>
                    <BsCheckCircle className={styles.checkIcon} size={18} />
                    Authority Status
                  </div>
                  <div className={styles.authorityTags}>
                    <span className={styles.tag}>
                      {company.authority_status || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.infoCard}>
              <h3 className={styles.cardTitle}>Cargo Insurance</h3>
              <div className={styles.cargoList}>
                {[
                  {
                    label: "Insurance Company",
                    value:
                      insurance?.insurance_company ||
                      company.insurance_company ||
                      "N/A",
                  },
                  {
                    label: "Expiration Date",
                    value: insurance?.expiration_date
                      ? new Date(insurance.expiration_date).toLocaleDateString()
                      : "N/A",
                  },
                  {
                    label: "Agent",
                    value:
                      insurance?.insurance_agent ||
                      company.insurance_agent ||
                      "N/A",
                  },
                  {
                    label: "Insurance Deductible",
                    value:
                      insurance?.insurance_deductible ??
                      company.insurance_deductible ??
                      "-",
                  },
                  {
                    label: "Phone Number",
                    value:
                      insurance?.insurance_phone ||
                      company.insurance_phone ||
                      "N/A",
                  },
                  {
                    label: "Physical Damage Limit",
                    value:
                      insurance?.physical_damage_limit ??
                      company.physical_damage_limit ??
                      "-",
                  },
                ].map((item) => (
                  <div key={item.label} className={styles.cargoItem}>
                    <span className={styles.checkLabel}>{item.label}</span>
                    <span className={styles.checkValue}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.infoCard}>
              <h3 className={styles.cardTitle}>Equipment & Route</h3>
              <div className={styles.routeList}>
                {[
                  {
                    label: "# of Trucks",
                    value: company.number_of_trucks ?? "--",
                  },
                  {
                    label: "Equipment Description",
                    value: company.equipment_description || "--",
                  },
                  {
                    label: "Route Description",
                    value: company.route_description || "--",
                  },
                ].map((item) => (
                  <div key={item.label} className={styles.routeItem}>
                    <span className={styles.checkLabel}>{item.label}</span>
                    <span className={styles.checkValue}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.infoCard}>
              <h3 className={styles.cardTitle}>Contacts</h3>
              {contacts.length === 0 ? (
                <p className={styles.noData}>No contacts available</p>
              ) : (
                <div className={styles.contactList}>
                  {contacts.map((contact: any) => (
                    <div key={contact.id} className={styles.contactItem}>
                      <div className={styles.contactInfo}>
                        <div className={styles.contactName}>
                          <strong>{contact.name || "Unnamed"}</strong>
                        </div>
                        <div className={styles.contactDetail}>
                          <BsEnvelope size={16} /> {contact.email || "N/A"}
                        </div>
                        <div className={styles.contactDetail}>
                          <BsTelephone size={16} /> {contact.phone || "N/A"}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteContact(contact.id)}
                        className={styles.deleteContactBtn}
                        title="Delete contact"
                      >
                        <BsTrash size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.reviewsSection}>
            <h2 className={styles.sectionTitle}>Reviews</h2>

            {reviews.length === 0 ? (
              <p className={styles.noReviews}>No reviews yet</p>
            ) : (
              reviews.map((review: any) => (
                <div key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewerInfo}>
                      <div className={styles.reviewerAvatar}>
                        {review.reviewer_name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <h4 className={styles.reviewerName}>
                          {review.reviewer_name || "Anonymous"}
                        </h4>
                        <span className={styles.reviewDate}>
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className={styles.reviewRating}>
                      {(
                        (review.timeliness +
                          review.communication +
                          review.documentation) /
                        3
                      ).toFixed(1)}
                      <CiStar size={18} />
                    </div>
                  </div>

                  <p className={styles.reviewText}>{review.comment}</p>

                  <div className={styles.reviewMeta}>
                    <span>
                      {review.payment_terms_met ? "✓" : "✗"} Payment terms met
                    </span>
                    <span>
                      {review.would_work_again ? "✓" : "✗"} Would work again
                    </span>
                    <span>
                      {review.vehicle_delivered_expected ? "✓" : "✗"} Delivered
                      as expected
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
