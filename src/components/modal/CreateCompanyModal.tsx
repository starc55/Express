import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "@/api/axiosInstance";
import styles from "@/styles/modal/createCompany.module.css";

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCompanyModal: React.FC<CreateCompanyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    allowed_to_operate: true,
    usdot: "",
    mc_number: "",
    business_type: "",
    business_address: "",
    mcs_150_outdated: false,
    out_of_service_date: "",
    carrier_operation: "interstate",
    authority_status: "broker",
    insurance_company: "",
    physical_damage_limit: "",
    insurance_agent: "",
    insurance_deductible: "",
    insurance_phone: "",
    number_of_trucks: "",
    equipment_description: "",
    route_description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      "name",
      "usdot",
      "mc_number",
      "business_type",
      "business_address",
      "insurance_company",
      "insurance_agent",
      "insurance_phone",
      "number_of_trucks",
    ];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]?.toString().trim()) {
        setError(`${field.replace(/_/g, " ")} field is mandatory`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        ...formData,
        number_of_trucks: Number(formData.number_of_trucks) || 0,
        physical_damage_limit: formData.physical_damage_limit
          ? Number(formData.physical_damage_limit)
          : null,
        insurance_deductible: formData.insurance_deductible
          ? Number(formData.insurance_deductible)
          : null,
        out_of_service_date: formData.out_of_service_date || null,
      };

      const response = await axiosInstance.post(
        "/api/v1/company/create/",
        payload
      );

      console.log("Created successfully:", response.data);

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Create company error:", err);

      let errMsg = "There was an error adding the company.";

      if (err.response?.status === 400) {
        const data = err.response.data;
        if (data.detail) {
          errMsg = data.detail;
        } else if (typeof data === "object") {
          const errors = Object.entries(data)
            .map(
              ([key, val]) =>
                `${key}: ${Array.isArray(val) ? val.join(", ") : val}`
            )
            .join("\n");
          errMsg = errors || "Incorrect information entered.";
        }
      }

      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      allowed_to_operate: true,
      usdot: "",
      mc_number: "",
      business_type: "",
      business_address: "",
      mcs_150_outdated: false,
      out_of_service_date: "",
      carrier_operation: "interstate",
      authority_status: "broker",
      insurance_company: "",
      physical_damage_limit: "",
      insurance_agent: "",
      insurance_deductible: "",
      insurance_phone: "",
      number_of_trucks: "",
      equipment_description: "",
      route_description: "",
    });
    setError(null);
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.85, y: 80 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const,
        when: "beforeChildren",
        staggerChildren: 0.08,
      },
    },
    exit: { opacity: 0, scale: 0.85, y: 80, transition: { duration: 0.3 } },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.04, transition: { duration: 0.2 } },
    tap: { scale: 0.97 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.modalOverlay} onClick={onClose}>
          <motion.div
            className={styles.modalContent}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div className={styles.modalHeader} variants={childVariants}>
              <h2>Create a new company</h2>
              <button className={styles.closeBtn} onClick={onClose}>
                ×
              </button>
            </motion.div>

            {error && (
              <motion.p className={styles.errorMsg} variants={childVariants}>
                {error}
              </motion.p>
            )}

            <motion.form onSubmit={handleSubmit} variants={childVariants}>
              <motion.div className={styles.formGroup} variants={childVariants}>
                <label className={styles.formLabel}>Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Company name"
                  required
                  className={styles.input}
                />
              </motion.div>

              <motion.div className={styles.formGroup} variants={childVariants}>
                <label className={styles.formLabel}>USDOT*</label>
                <input
                  type="text"
                  name="usdot"
                  value={formData.usdot}
                  onChange={handleChange}
                  placeholder="USDOT number"
                  required
                  className={styles.input}
                />
              </motion.div>

              <motion.div className={styles.formGroup} variants={childVariants}>
                <label className={styles.formLabel}>MC Number*</label>
                <input
                  type="text"
                  name="mc_number"
                  value={formData.mc_number}
                  onChange={handleChange}
                  placeholder="MC number"
                  required
                  className={styles.input}
                />
              </motion.div>

              <motion.div className={styles.formGroup} variants={childVariants}>
                <label className={styles.formLabel}>Business Type*</label>
                <input
                  type="text"
                  name="business_type"
                  value={formData.business_type}
                  onChange={handleChange}
                  placeholder="Business type"
                  required
                  className={styles.input}
                />
              </motion.div>

              <motion.div className={styles.formGroup} variants={childVariants}>
                <label className={styles.formLabel}>Business Address*</label>
                <input
                  type="text"
                  name="business_address"
                  value={formData.business_address}
                  onChange={handleChange}
                  placeholder="Business address"
                  required
                  className={styles.input}
                />
              </motion.div>

              <motion.div className={styles.formGroup} variants={childVariants}>
                <label className={styles.operate}>Allowed to operate</label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="allowed_to_operate"
                    checked={formData.allowed_to_operate}
                    onChange={handleChange}
                  />
                  <span>Yes</span>
                </label>
              </motion.div>

              <motion.div className={styles.formGroup} variants={childVariants}>
                <label className={styles.operate}>MCS 150 Outdated</label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="mcs_150_outdated"
                    checked={formData.mcs_150_outdated}
                    onChange={handleChange}
                  />
                  <span>Yes</span>
                </label>
              </motion.div>

              <motion.div className={styles.formGroup} variants={childVariants}>
                <label className={styles.formLabel}>Out of Service Date</label>
                <input
                  title="date"
                  type="date"
                  name="out_of_service_date"
                  value={formData.out_of_service_date}
                  onChange={handleChange}
                  className={styles.input}
                />
              </motion.div>

              <motion.div className={styles.formGroup} variants={childVariants}>
                <label className={styles.formLabel}>Carrier Operation*</label>
                <select
                  title="operation"
                  name="carrier_operation"
                  value={formData.carrier_operation}
                  onChange={handleChange}
                  required
                  className={styles.select}
                >
                  <option value="interstate">Interstate</option>
                  <option value="intrastate">Intrastate</option>
                </select>
              </motion.div>

              <motion.div className={styles.formGroup} variants={childVariants}>
                <label className={styles.formLabel}>Authority Status*</label>
                <input
                  type="text"
                  name="authority_status"
                  value={formData.authority_status}
                  onChange={handleChange}
                  placeholder="Broker, Common, Contract..."
                  required
                  className={styles.input}
                />
              </motion.div>

              <motion.div className={styles.formGroup} variants={childVariants}>
                <label className={styles.formLabel}>Insurance Company*</label>
                <input
                  type="text"
                  name="insurance_company"
                  value={formData.insurance_company}
                  onChange={handleChange}
                  placeholder="Insurance company name"
                  required
                  className={styles.input}
                />
              </motion.div>

              <motion.div className={styles.formGroup} variants={childVariants}>
                <label className={styles.formLabel}>
                  Physical Damage Limit
                </label>
                <input
                  type="number"
                  name="physical_damage_limit"
                  value={formData.physical_damage_limit}
                  onChange={handleChange}
                  placeholder="Physical damage limit"
                  className={styles.input}
                />
              </motion.div>

              <motion.div className={styles.formGroup} variants={childVariants}>
                <label className={styles.formLabel}>Insurance Agent*</label>
                <input
                  type="text"
                  name="insurance_agent"
                  value={formData.insurance_agent}
                  onChange={handleChange}
                  placeholder="Insurance agent name"
                  required
                  className={styles.input}
                />
              </motion.div>

              <motion.div className={styles.formGroup} variants={childVariants}>
                <label className={styles.formLabel}>Insurance Deductible</label>
                <input
                  type="number"
                  name="insurance_deductible"
                  value={formData.insurance_deductible}
                  onChange={handleChange}
                  placeholder="Insurance deductible"
                  className={styles.input}
                />
              </motion.div>

              <motion.div className={styles.formGroup} variants={childVariants}>
                <label className={styles.formLabel}>Insurance Phone*</label>
                <input
                  type="tel"
                  name="insurance_phone"
                  value={formData.insurance_phone}
                  onChange={handleChange}
                  placeholder="Insurance phone number"
                  required
                  className={styles.input}
                />
              </motion.div>

              <motion.div className={styles.formGroup} variants={childVariants}>
                <label className={styles.formLabel}>Number of Trucks*</label>
                <input
                  type="number"
                  name="number_of_trucks"
                  value={formData.number_of_trucks}
                  onChange={handleChange}
                  placeholder="Number of trucks"
                  required
                  className={styles.input}
                />
              </motion.div>

              <motion.div className={styles.formGroup} variants={childVariants}>
                <label className={styles.formLabel}>
                  Equipment Description
                </label>
                <input
                  type="text"
                  name="equipment_description"
                  value={formData.equipment_description}
                  onChange={handleChange}
                  placeholder="Equipment description"
                  className={styles.input}
                />
              </motion.div>

              <motion.div className={styles.formGroup} variants={childVariants}>
                <label className={styles.formLabel}>Route Description</label>
                <input
                  type="text"
                  name="route_description"
                  value={formData.route_description}
                  onChange={handleChange}
                  placeholder="Route description"
                  className={styles.input}
                />
              </motion.div>

              <motion.div
                className={styles.modalActions}
                variants={childVariants}
              >
                <motion.button
                  type="button"
                  className={styles.resetBtn}
                  onClick={handleReset}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Reset
                </motion.button>

                <motion.button
                  type="submit"
                  className={styles.applyBtn}
                  disabled={loading}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {loading ? "Creating..." : "Create Company"}
                </motion.button>
              </motion.div>
            </motion.form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateCompanyModal;
