import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layouts/Navbar";
import Header from "./Header";
import CompanyCard from "@/components/common/CompanyCard";
import Footer from "@/components/layouts/Footer";
import EditCompanyModal from "@/components/modal/EditCompanyModal";
import axiosInstance from "@/api/axiosInstance";
import { useAuth } from "@/context/AuthContext";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.2 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.1, ease: "easeOut" as const },
  },
  hover: { scale: 1.01, y: -3, transition: { duration: 0.1 } },
};

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

  useEffect(() => {
    fetchData();
  }, [isAuthenticated, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "") params[key] = value;
      });

      const companiesResponse = await axiosInstance.get("/api/v1/companies/", {
        params,
      });
      const companiesData =
        companiesResponse.data.results || companiesResponse.data || [];

      const reviewsResponse = await axiosInstance.get("/api/v1/reviews/", {
        params: { page_size: 100 },
      });
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

        const latestReview = companyReviews.sort((a: any, b: any) => {
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        })[0];

        return {
          ...company,
          rating,
          reviewText: latestReview?.comment || "",
          reviewerName: latestReview?.reviewer_name || "",
        };
      });

      setCompanies(enhancedCompanies);

      if (enhancedCompanies.length === 0) {
        setError("No companies found");
      }
      console.log("Fetched companies:", enhancedCompanies);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError("Please login to view companies.");
    } finally {
      setLoading(false);
    }
  };

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

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <Header onSearch={handleSearch} />
      </motion.div>

      <section className="companies-section py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-20 text-gray-600">Loading...</div>
          ) : error ? (
            <div className="text-center py-20 text-red-600 font-medium text-xl">
              {error}
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-20 text-gray-500 text-xl">
              No companies found
              <br />
              <span className="text-lg">
                Try changing the search term or filter.
              </span>
            </div>
          ) : (
            <>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="section-subtitle text-center text-lg font-medium text-gray-600 mb-10"
              >
                Found {companies.length} companies
              </motion.p>

              <motion.div
                className="companies-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {companies.map((company) => (
                  <motion.div
                    key={company.id}
                    variants={cardVariants}
                    whileHover="hover"
                  >
                    <CompanyCard
                      id={company.id}
                      name={company.name}
                      rating={company.rating}
                      city={company.city || "N/A"}
                      state={company.state || "N/A"}
                      reviewText={company.reviewText}
                      reviewerName={company.reviewer_name}
                      reviewerImage={company.reviewerImage}
                      isAdmin={isAdmin}
                      onViewDetails={() => navigate(`/company/${company.id}`)}
                      onEdit={() => handleEditClick(company)}
                    />
                  </motion.div>
                ))}
              </motion.div>
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
