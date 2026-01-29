import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CiStar } from "react-icons/ci";
import {
  BsCheckCircle,
  BsTrash,
  BsTelephone,
  BsEnvelope,
  BsDownload,
  BsEye,
  BsFileEarmark,
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
  const [additionalDetails, setAdditionalDetails] = useState<any>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
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

        try {
          const additionalRes = await axiosInstance.get(
            `/api/v1/additional-detail/${id}/`
          );
          setAdditionalDetails(additionalRes.data);
        } catch (addErr) {
          console.warn("Additional details not loaded", addErr);
          setAdditionalDetails(null);
        }

        try {
          const driversRes = await axiosInstance.get(`/api/v1/driver/${id}/`);
          const driversData = driversRes.data.results || driversRes.data || [];
          setDrivers(Array.isArray(driversData) ? driversData : []);
        } catch (drvErr) {
          console.warn("Drivers not loaded", drvErr);
          setDrivers([]);
        }

        try {
          const routesRes = await axiosInstance.get(
            `/api/v1/company-route/${id}/`
          );
          const routesData = routesRes.data.results || routesRes.data || [];
          setRoutes(Array.isArray(routesData) ? routesData : []);
        } catch (routeErr) {
          console.warn("Routes not loaded", routeErr);
          setRoutes([]);
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

  const handleDownloadFile = async (fileUrl: string, fileName: string) => {
    try {
      const response = await axiosInstance.get(fileUrl, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download file");
    }
  };

  const handleViewFile = (fileUrl: string) => {
    window.open(fileUrl, "_blank");
  };

  const getFileNameFromUrl = (url: string) => {
    const parts = url.split("/");
    return parts[parts.length - 1] || "file";
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

  const getLocationLabel = (location: string) => {
    const locationMap: { [key: string]: string } = {
      Alabama: "Alabama",
      Alaska: "Alaska",
      Arizona: "Arizona",
      Arkansas: "Arkansas",
      California: "California",
      Colorado: "Colorado",
      Connecticut: "Connecticut",
      Delaware: "Delaware",
      Florida: "Florida",
      Georgia: "Georgia",
      Hawaii: "Hawaii",
      Idaho: "Idaho",
      Illinois: "Illinois",
      Indiana: "Indiana",
      Iowa: "Iowa",
      Kansas: "Kansas",
      Kentucky: "Kentucky",
      Louisiana: "Louisiana",
      Maine: "Maine",
      Maryland: "Maryland",
      Massachusetts: "Massachusetts",
      Michigan: "Michigan",
      Minnesota: "Minnesota",
      Mississippi: "Mississippi",
      Missouri: "Missouri",
      Montana: "Montana",
      Nebraska: "Nebraska",
      Nevada: "Nevada",
      "New Hampshire": "New Hampshire",
      "New Jersey": "New Jersey",
      "New Mexico": "New Mexico",
      "New York": "New York",
      "North Carolina": "North Carolina",
      "North Dakota": "North Dakota",
      Ohio: "Ohio",
      Oklahoma: "Oklahoma",
      Oregon: "Oregon",
      Pennsylvania: "Pennsylvania",
      "Rhode Island": "Rhode Island",
      "South Carolina": "South Carolina",
      "South Dakota": "South Dakota",
      Tennessee: "Tennessee",
      Texas: "Texas",
      Utah: "Utah",
      Vermont: "Vermont",
      Virginia: "Virginia",
      Washington: "Washington",
      "West Virginia": "West Virginia",
      Wisconsin: "Wisconsin",
      Wyoming: "Wyoming",
    };
    return locationMap[location] || location;
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
              <h3 className={styles.cardTitle}>Equipment</h3>
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
                ].map((item) => (
                  <div key={item.label} className={styles.routeItem}>
                    <span className={styles.checkLabel}>{item.label}</span>
                    <span className={styles.checkValue}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.infoCard}>
              <h3 className={styles.cardTitle}>Routes</h3>
              {routes.length === 0 ? (
                <p className={styles.noData}>No routes available</p>
              ) : (
                <div className={styles.routeList}>
                  {routes.map((route: any, index: number) => (
                    <div key={route.id} className={styles.routeItem}>
                      <span className={styles.checkLabel}>
                        Route {index + 1}
                      </span>
                      <span className={styles.checkValue}>
                        {getLocationLabel(route.from_location)} →{" "}
                        {getLocationLabel(route.to_location)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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

          <div className={styles.filesSection}>
            <h2 className={styles.sectionTitle}>Company Files</h2>

            <div className={styles.fileCard}>
              <h3 className={styles.fileCardTitle}>
                <BsFileEarmark size={20} />
                Additional Details Files
              </h3>
              {!additionalDetails || additionalDetails.files?.length === 0 ? (
                <p className={styles.noFiles}>No additional files available</p>
              ) : (
                <div className={styles.filesList}>
                  {additionalDetails.files.map((file: any) => (
                    <div key={file.id} className={styles.fileItem}>
                      <div className={styles.fileInfo}>
                        <BsFileEarmark size={18} />
                        <div className={styles.fileDetails}>
                          <span className={styles.fileName}>
                            {getFileNameFromUrl(file.file)}
                          </span>
                          <span className={styles.fileDate}>
                            {new Date(file.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className={styles.fileActions}>
                        <button
                          type="button"
                          onClick={() => handleViewFile(file.file)}
                          className={styles.fileActionBtn}
                          title="View file"
                        >
                          <BsEye size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDownloadFile(
                              file.file,
                              getFileNameFromUrl(file.file)
                            )
                          }
                          className={styles.fileActionBtn}
                          title="Download file"
                        >
                          <BsDownload size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.fileCard}>
              <h3 className={styles.fileCardTitle}>
                <BsFileEarmark size={20} />
                Insurance Files
              </h3>
              {!insurance || insurance.files?.length === 0 ? (
                <p className={styles.noFiles}>No insurance files available</p>
              ) : (
                <div className={styles.filesList}>
                  {insurance.files.map((file: any) => (
                    <div key={file.id} className={styles.fileItem}>
                      <div className={styles.fileInfo}>
                        <BsFileEarmark size={18} />
                        <div className={styles.fileDetails}>
                          <span className={styles.fileName}>
                            {getFileNameFromUrl(file.file)}
                          </span>
                          <span className={styles.fileDate}>
                            {new Date(file.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className={styles.fileActions}>
                        <button
                          type="button"
                          onClick={() => handleViewFile(file.file)}
                          className={styles.fileActionBtn}
                          title="View file"
                        >
                          <BsEye size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDownloadFile(
                              file.file,
                              getFileNameFromUrl(file.file)
                            )
                          }
                          className={styles.fileActionBtn}
                          title="Download file"
                        >
                          <BsDownload size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.fileCard}>
              <h3 className={styles.fileCardTitle}>
                <BsFileEarmark size={20} />
                Driver License Files
              </h3>
              {drivers.length === 0 ? (
                <p className={styles.noFiles}>No driver files available</p>
              ) : (
                <div className={styles.driversList}>
                  {drivers.map((driver: any) => (
                    <div key={driver.id} className={styles.driverSection}>
                      <div className={styles.driverHeader}>
                        <h4 className={styles.driverName}>
                          {driver.name || "Unnamed Driver"}
                        </h4>
                        <span className={styles.driverPhone}>
                          {driver.phone || "No phone"}
                        </span>
                      </div>
                      {driver.license_files?.length === 0 ? (
                        <p className={styles.noFiles}>
                          No license files for this driver
                        </p>
                      ) : (
                        <div className={styles.filesList}>
                          {driver.license_files.map((file: any) => (
                            <div key={file.id} className={styles.fileItem}>
                              <div className={styles.fileInfo}>
                                <BsFileEarmark size={18} />
                                <div className={styles.fileDetails}>
                                  <span className={styles.fileName}>
                                    {getFileNameFromUrl(file.file)}
                                  </span>
                                  <span className={styles.fileDate}>
                                    {new Date(
                                      file.created_at
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <div className={styles.fileActions}>
                                <button
                                  type="button"
                                  onClick={() => handleViewFile(file.file)}
                                  className={styles.fileActionBtn}
                                  title="View file"
                                >
                                  <BsEye size={18} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDownloadFile(
                                      file.file,
                                      getFileNameFromUrl(file.file)
                                    )
                                  }
                                  className={styles.fileActionBtn}
                                  title="Download file"
                                >
                                  <BsDownload size={18} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
