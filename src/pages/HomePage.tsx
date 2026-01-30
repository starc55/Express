import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layouts/Navbar";
import Header from "./Header";
import CompanyCard from "@/components/common/CompanyCard";
import Footer from "@/components/layouts/Footer";
import EditCompanyModal from "@/components/modal/EditCompanyModal";
import axiosInstance from "@/api/axiosInstance";
import { useAuth } from "@/context/AuthContext";
import styles from "../styles/pages/Home.module.css";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    name: "",
    usdot: "",
    mc_number: "",
    business_type: "",
    business_address: "",
    carrier_operation: "",
    authority_status: "",
    allowed_to_operate: "",
    mcs_150_outdated: "",
    number_of_trucks_min: "",
    number_of_trucks_max: "",
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  const fetchedOnceRef = useRef(false);
  const debounceRef = useRef<number | null>(null);

  const [driverOrderForm, setDriverOrderForm] = useState({
    company_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    pickup_time: "",
    drop_off_time: "",
    order_id: "",
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDriverOrderForm((prev) => ({
      ...prev,
      [name]: name === "order_id" ? value : value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...driverOrderForm,
      order_id: Number(driverOrderForm.order_id) || 0,
    };

    try {
      await axiosInstance.post("/api/v1/driver-order/create/", payload);
      alert("Order created successfully!");
      setDriverOrderForm({
        company_name: "",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        pickup_time: "",
        drop_off_time: "",
        order_id: "",
      });
    } catch (err: any) {
      console.error("Driver order error:", err);
      alert("An error occurred. Please check the data and try again.");
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "") params[key] = value;
      });

      const [companiesResponse, reviewsResponse] = await Promise.all([
        axiosInstance.get("/api/v1/companies/", { params }),
        axiosInstance.get("/api/v1/reviews/", { params: { page_size: 100 } }),
      ]);

      const companiesData =
        companiesResponse.data.results || companiesResponse.data || [];
      const allReviews = reviewsResponse.data.results || [];

      const enhancedCompanies = companiesData.map((company: any) => {
        const companyReviews = allReviews.filter(
          (r: any) => r.company === company.id
        );

        let rating = null;
        if (companyReviews.length > 0) {
          const totalAvg = companyReviews.reduce((sum: number, r: any) => {
            const reviewAvg =
              (r.timeliness + r.communication + r.documentation) / 3;
            return sum + reviewAvg;
          }, 0);
          rating = totalAvg / companyReviews.length;
        }

        const latestReview = companyReviews.sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

        return {
          ...company,
          rating,
          reviewText: latestReview?.comment || "",
          reviewerName: latestReview?.reviewer_name || "",
          route: company.route || null,
        };
      });

      setCompanies(enhancedCompanies);
      if (enhancedCompanies.length === 0) setError("No companies found");
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Please login to view companies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (!fetchedOnceRef.current) {
        fetchedOnceRef.current = true;
        fetchData();
      } else {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(fetchData, 400);
      }
    } else {
      setLoading(false);
      setError(null);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters, isAuthenticated]);

  const handleSearch = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleEditClick = (company: any) => {
    if (!isAdmin) return;
    setSelectedCompany(company);
    setIsEditModalOpen(true);
  };

  const handleSaveCompany = async (updatedCompany: any) => {
    try {
      const response = await axiosInstance.put(
        `/api/v1/company/update/${updatedCompany.id}/`,
        updatedCompany
      );

      setCompanies((prev) =>
        prev.map((c) => (c.id === updatedCompany.id ? response.data : c))
      );
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save changes.");
    }
  };

  const handleDeleteCompany = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this company?"))
      return;

    try {
      await axiosInstance.delete(`/api/v1/company/update/${id}/`);
      setCompanies((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete company.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {isAuthenticated && <Header onSearch={handleSearch} />}

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          {loading && (
            <p className="text-center py-20 text-gray-600">
              Loading companies...
            </p>
          )}

          {!isAuthenticated && !loading && (
            <div className={styles.guestFormWrapper}>
              <h2 className={styles.formTitle}>Create Driver Order</h2>

              <p className={styles.formDescription}>
                Please fill in the following information
              </p>

              <form
                onSubmit={handleFormSubmit}
                className={styles.driverOrderForm}
              >
                <div className={styles.formGroup}>
                  <label>Order ID</label>
                  <input
                    type="number"
                    name="order_id"
                    value={driverOrderForm.order_id}
                    onChange={handleFormChange}
                    placeholder="123456"
                    required
                    min="1"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Company Name</label>
                  <input
                    type="text"
                    name="company_name"
                    value={driverOrderForm.company_name}
                    onChange={handleFormChange}
                    placeholder="e.g. ABC Logistics"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Contact Name</label>
                  <input
                    type="text"
                    name="contact_name"
                    value={driverOrderForm.contact_name}
                    onChange={handleFormChange}
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    name="contact_email"
                    value={driverOrderForm.contact_email}
                    onChange={handleFormChange}
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="contact_phone"
                    value={driverOrderForm.contact_phone}
                    onChange={handleFormChange}
                    placeholder="+998901234567"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Pickup Time</label>
                  <input
                    type="text"
                    name="pickup_time"
                    value={driverOrderForm.pickup_time}
                    onChange={handleFormChange}
                    placeholder="2025-10-15 14:30"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Drop-off Time</label>
                  <input
                    type="text"
                    name="drop_off_time"
                    value={driverOrderForm.drop_off_time}
                    onChange={handleFormChange}
                    placeholder="2025-10-16 09:00"
                    required
                  />
                </div>

                <button type="submit" className={styles.submitButton}>
                  Submit Order
                </button>
              </form>

              <p className={styles.formNote}>
                After logging in, you will be able to view the list of companies
              </p>
            </div>
          )}

          {isAuthenticated && (
            <>
              {loading && (
                <p className="text-center py-20">Loading companies...</p>
              )}

              {!loading && error && (
                <p className="text-center py-20 text-red-600 text-xl">
                  {error}
                </p>
              )}

              {!loading && !error && companies.length === 0 && (
                <div className="text-center py-20 text-gray-500 text-xl">
                  No companies found <br />
                  <span className="text-lg">Try changing filters</span>
                </div>
              )}

              {!loading && !error && companies.length > 0 && (
                <>
                  <p className="section-subtitle text-center mb-8">
                    Found {companies.length} companies
                  </p>

                  <div className="companies-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {companies.map((company) => (
                      <CompanyCard
                        key={company.id}
                        id={company.id}
                        name={company.name}
                        rating={company.rating}
                        reviewText={company.reviewText}
                        reviewerName={company.reviewerName}
                        isAdmin={isAdmin}
                        onViewDetails={() => navigate(`/company/${company.id}`)}
                        onEdit={() => handleEditClick(company)}
                        routeId={company.route?.id}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

      <EditCompanyModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        company={selectedCompany}
        onSave={handleSaveCompany}
      />

      <Footer />
    </div>
  );
}
