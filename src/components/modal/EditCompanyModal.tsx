import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import axiosInstance from "@/api/axiosInstance";
import styles from "@/styles/modal/editCompanyModal.module.css";

interface CompanyFormData {
  id: string | number;
  name: string;
  allowed_to_operate: boolean;
  usdot: string;
  mc_number: string;
  business_type: string;
  business_address: string;
  mcs_150_outdated: boolean;
  out_of_service_date: string;
  carrier_operation: string;
  authority_status: string;
  insurance_company: string;
  insurance_agent: string;
  insurance_phone: string;
  physical_damage_limit: string | number;
  insurance_deductible: string | number;
  number_of_trucks: string | number;
  equipment_description: string;
  route_description: string;
}

interface EditCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyFormData | null;
  onSave: (data: CompanyFormData) => void;
}

const carrierOptions = ["interstate", "intrastate"];
const authorityOptions = ["broker", "common", "contract"];

export default function EditCompanyModal({
  isOpen,
  onClose,
  company,
  onSave,
}: EditCompanyModalProps) {
  const [formData, setFormData] = useState<CompanyFormData>({
    id: "",
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
    insurance_agent: "",
    insurance_phone: "",
    physical_damage_limit: "",
    insurance_deductible: "",
    number_of_trucks: "",
    equipment_description: "",
    route_description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (company) {
      setFormData({
        ...company,
        number_of_trucks: company.number_of_trucks?.toString() || "",
        physical_damage_limit: company.physical_damage_limit?.toString() || "",
        insurance_deductible: company.insurance_deductible?.toString() || "",
      });
    }
  }, [company]);

  if (!isOpen || !company) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        ...formData,
        number_of_trucks: formData.number_of_trucks
          ? Number(formData.number_of_trucks)
          : 0,
        physical_damage_limit: formData.physical_damage_limit
          ? Number(formData.physical_damage_limit)
          : null,
        insurance_deductible: formData.insurance_deductible
          ? Number(formData.insurance_deductible)
          : null,
        out_of_service_date: formData.out_of_service_date || null,
      };

      await axiosInstance.put(`/api/v1/company/update/${company.id}/`, payload);

      onSave(formData);
      onClose();
    } catch (err: any) {
      console.error("Update company error:", err);
      let errMsg = "An error occurred while updating company information.";

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.modalOverlay}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 30 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={styles.modalContent}
          >
            <div className={styles.modalInner}>
              <div className={styles.header}>
                <h2 className={styles.title}>Edit company information</h2>
                <button
                  onClick={onClose}
                  className={styles.closeBtn}
                  aria-label="Close"
                >
                  <IoClose />
                </button>
              </div>

              {error && <div className={styles.errorMsg}>{error}</div>}

              <form onSubmit={handleSubmit} className={styles.form}>
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Basic Information</h3>
                  <div className={styles.grid}>
                    <div>
                      <label className={`${styles.label} ${styles.required}`}>
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Company name"
                        required
                        className={styles.input}
                      />
                    </div>

                    <div>
                      <label className={`${styles.label} ${styles.required}`}>
                        USDOT
                      </label>
                      <input
                        type="text"
                        name="usdot"
                        value={formData.usdot}
                        onChange={handleChange}
                        placeholder="USDOT number"
                        required
                        className={styles.input}
                      />
                    </div>

                    <div>
                      <label className={styles.label}>MC Number</label>
                      <input
                        type="text"
                        name="mc_number"
                        value={formData.mc_number}
                        onChange={handleChange}
                        placeholder="MC number"
                        className={styles.input}
                      />
                    </div>
                  </div>
                </section>

                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Business Details</h3>
                  <div className={styles.grid}>
                    <div>
                      <label className={`${styles.label} ${styles.required}`}>
                        Business Type
                      </label>
                      <input
                        type="text"
                        name="business_type"
                        value={formData.business_type}
                        onChange={handleChange}
                        placeholder="Business type"
                        required
                        className={styles.input}
                      />
                    </div>

                    <div>
                      <label className={`${styles.label} ${styles.required}`}>
                        Business Address
                      </label>
                      <input
                        type="text"
                        name="business_address"
                        value={formData.business_address}
                        onChange={handleChange}
                        placeholder="Business address"
                        required
                        className={styles.input}
                      />
                    </div>
                  </div>
                </section>

                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>FMCSA Verification</h3>
                  <div className={styles.grid}>
                    <div>
                      <label className={styles.label}>Allowed to operate</label>
                      <select
                        title="Operate"
                        name="allowed_to_operate"
                        value={formData.allowed_to_operate ? "Yes" : "No"}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            allowed_to_operate: e.target.value === "Yes",
                          }))
                        }
                        className={styles.select}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>

                    <div>
                      <label className={styles.label}>MCS 150 Outdated</label>
                      <select
                        title="Outdated"
                        name="mcs_150_outdated"
                        value={formData.mcs_150_outdated ? "Yes" : "No"}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            mcs_150_outdated: e.target.value === "Yes",
                          }))
                        }
                        className={styles.select}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>

                    <div>
                      <label className={styles.label}>Carrier Operation</label>
                      <select
                        title="Operation"
                        name="carrier_operation"
                        value={formData.carrier_operation}
                        onChange={handleChange}
                        className={styles.select}
                      >
                        <option value="interstate">Interstate</option>
                        <option value="intrastate">Intrastate</option>
                      </select>
                    </div>

                    <div>
                      <label className={styles.label}>Authority Status</label>
                      <select
                        title="Status"
                        name="authority_status"
                        value={formData.authority_status}
                        onChange={handleChange}
                        className={styles.select}
                      >
                        <option value="broker">Broker</option>
                        <option value="common">Common</option>
                        <option value="contract">Contract</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.mt4}>
                    <label className={styles.label}>Out of Service Date</label>
                    <input
                      title="Date"
                      type="date"
                      name="out_of_service_date"
                      value={formData.out_of_service_date}
                      onChange={handleChange}
                      className={styles.input}
                    />
                  </div>
                </section>

                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Cargo Insurance</h3>
                  <div className={styles.grid}>
                    <div>
                      <label className={`${styles.label} ${styles.required}`}>
                        Insurance Company
                      </label>
                      <input
                        type="text"
                        name="insurance_company"
                        value={formData.insurance_company}
                        onChange={handleChange}
                        placeholder="Insurance company name"
                        required
                        className={styles.input}
                      />
                    </div>

                    <div>
                      <label className={styles.label}>Insurance Agent</label>
                      <input
                        type="text"
                        name="insurance_agent"
                        value={formData.insurance_agent}
                        onChange={handleChange}
                        placeholder="Agent name"
                        className={styles.input}
                      />
                    </div>

                    <div>
                      <label className={styles.label}>Insurance Phone</label>
                      <input
                        type="tel"
                        name="insurance_phone"
                        value={formData.insurance_phone}
                        onChange={handleChange}
                        placeholder="Phone number"
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div
                    className={`${styles.grid} ${styles.grid4} ${styles.mt6}`}
                  >
                    <div>
                      <label className={styles.label}>
                        Physical Damage Limit
                      </label>
                      <input
                        type="number"
                        name="physical_damage_limit"
                        value={formData.physical_damage_limit}
                        onChange={handleChange}
                        placeholder="Limit amount"
                        className={styles.input}
                      />
                    </div>

                    <div>
                      <label className={styles.label}>
                        Insurance Deductible
                      </label>
                      <input
                        type="number"
                        name="insurance_deductible"
                        value={formData.insurance_deductible}
                        onChange={handleChange}
                        placeholder="Deductible amount"
                        className={styles.input}
                      />
                    </div>
                  </div>
                </section>

                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Equipment & Route</h3>
                  <div className={styles.grid}>
                    <div>
                      <label className={`${styles.label} ${styles.required}`}>
                        # of Trucks
                      </label>
                      <input
                        type="number"
                        name="number_of_trucks"
                        value={formData.number_of_trucks}
                        onChange={handleChange}
                        placeholder="Number of trucks"
                        min="0"
                        required
                        className={styles.input}
                      />
                    </div>

                    <div>
                      <label className={`${styles.label} ${styles.required}`}>
                        Equipment Description
                      </label>
                      <input
                        type="text"
                        name="equipment_description"
                        value={formData.equipment_description}
                        onChange={handleChange}
                        placeholder="Equipment description"
                        required
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div className={styles.mt4}>
                    <label className={`${styles.label} ${styles.required}`}>
                      Route Description
                    </label>
                    <textarea
                      name="route_description"
                      value={formData.route_description}
                      onChange={handleChange}
                      placeholder="Route description"
                      className={styles.textarea}
                      rows={3}
                      required
                    />
                  </div>
                </section>

                <div className={styles.footer}>
                  <button
                    type="button"
                    onClick={onClose}
                    className={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.saveBtn}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
