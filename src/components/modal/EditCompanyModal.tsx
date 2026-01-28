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
  status: "open" | "closed" | "";
  enclosed: string[];
  routeId?: number;
  from_location?: string;
  to_location?: string;
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
    status: "open",
    enclosed: [],
    from_location: "",
    to_location: "",
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
        status: company.status || "open",
        enclosed: Array.isArray(company.enclosed) ? company.enclosed : [],
        from_location: company.from_location || "",
        to_location: company.to_location || "",
        routeId: company.routeId,
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

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = [...e.target.selectedOptions];
    const values = options.map((opt) => opt.value);
    setFormData((prev) => ({ ...prev, enclosed: values }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const companyPayload = {
        name: formData.name.trim() || null,
        photo: null,
        usdot: formData.usdot.trim() || null,
        mc_number: formData.mc_number.trim() || null,
        status: formData.status || "open",
        enclosed: formData.enclosed.length > 0 ? formData.enclosed : [],
        business_address: formData.business_address.trim() || null,
        insurance_company: formData.insurance_company.trim() || null,
        physical_damage_limit: formData.physical_damage_limit
          ? Number(formData.physical_damage_limit)
          : null,
        insurance_agent: formData.insurance_agent.trim() || null,
        insurance_deductible: formData.insurance_deductible
          ? Number(formData.insurance_deductible)
          : null,
        insurance_phone: formData.insurance_phone.trim() || null,
        number_of_trucks: formData.number_of_trucks
          ? Number(formData.number_of_trucks)
          : 0,
        equipment_description: formData.equipment_description.trim() || null,
        route_description: formData.route_description.trim() || null,
      };

      await axiosInstance.put(
        `/api/v1/company/update/${company.id}/`,
        companyPayload
      );

      if (formData.routeId) {
        const routePayload = {
          company: Number(company.id),
          from_location: formData.from_location?.trim() || null,
          to_location: formData.to_location?.trim() || null,
        };

        await axiosInstance.put(
          `/api/v1/company-route/update/${formData.routeId}/`,
          routePayload
        );
      }

      onSave(formData);
      onClose();
    } catch (err: any) {
      console.error("Update error:", err);
      let errMsg = "Failed to update company information.";

      if (err.response?.status === 400) {
        const data = err.response.data;
        if (data.detail) {
          errMsg = data.detail;
        } else if (typeof data === "object") {
          const errors = Object.entries(data)
            .map(
              ([key, val]) =>
                `${key}: ${Array.isArray(val) ? val.join(", ") : String(val)}`
            )
            .join("\n");
          errMsg = errors || "Invalid data provided.";
        }
      } else if (err.response?.status === 404) {
        errMsg = "Company or route not found.";
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

                <div className={styles.mt4}>
                  <label className={styles.label}>Status</label>
                  <select
                    title="Select Status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={styles.input}
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className={styles.mt4}>
                  <label className={styles.label}>
                    Enclosed / Trailer Type
                  </label>
                  <select
                    title="Select Enclosed / Trailer Type"
                    multiple
                    value={formData.enclosed}
                    onChange={handleMultiSelectChange}
                    className={`${styles.input} ${styles.multiSelect}`}
                    size={5}
                  >
                    <option value="open">Open</option>
                    <option value="enclosed">Enclosed</option>
                    <option value="flatbed">Flatbed</option>
                    <option value="inoperable">Inoperable</option>
                    <option value="closed">Closed</option>
                  </select>
                  <small className={styles.helperText}>
                    Hold Ctrl (or Cmd) to select multiple options
                  </small>
                </div>

                <div className={styles.mt4}>
                  <label className={styles.label}>From Location</label>
                  <input
                    type="text"
                    name="from_location"
                    value={formData.from_location || ""}
                    onChange={handleChange}
                    placeholder="From location"
                    className={styles.input}
                  />
                </div>

                <div className={styles.mt4}>
                  <label className={styles.label}>To Location</label>
                  <input
                    type="text"
                    name="to_location"
                    value={formData.to_location || ""}
                    onChange={handleChange}
                    placeholder="To location"
                    className={styles.input}
                  />
                </div>

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
