import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { FaPlus, FaTrash } from "react-icons/fa";
import axiosInstance from "@/api/axiosInstance";
import styles from "@/styles/modal/editCompanyModal.module.css";

interface Route {
  id?: number;
  from_location: string;
  to_location: string;
  isNew?: boolean;
  isDeleted?: boolean;
}

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
}

interface EditCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyFormData | null;
  onSave: (data: CompanyFormData) => void;
}

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
  });

  const [routes, setRoutes] = useState<Route[]>([
    { from_location: "", to_location: "", isNew: true },
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locations = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
  ];

  useEffect(() => {
    if (company) {
      setFormData({
        ...company,
        number_of_trucks: company.number_of_trucks?.toString() || "",
        physical_damage_limit: company.physical_damage_limit?.toString() || "",
        insurance_deductible: company.insurance_deductible?.toString() || "",
        status: company.status || "open",
        enclosed: Array.isArray(company.enclosed) ? company.enclosed : [],
      });

      fetchCompanyRoutes(company.id);
    }
  }, [company]);

  const fetchCompanyRoutes = async (companyId: string | number) => {
    setLoadingRoutes(true);
    try {
      const response = await axiosInstance.get("/api/v1/company-routes/", {
        params: { company_id: companyId },
      });

      if (response.data && Array.isArray(response.data)) {
        const existingRoutes = response.data.map((route: any) => ({
          id: route.id,
          from_location: route.from_location || "",
          to_location: route.to_location || "",
          isNew: false,
        }));

        if (existingRoutes.length > 0) {
          setRoutes(existingRoutes);
        } else {
          setRoutes([{ from_location: "", to_location: "", isNew: true }]);
        }
      }
    } catch (err) {
      console.error("Error fetching routes:", err);
      setRoutes([{ from_location: "", to_location: "", isNew: true }]);
    } finally {
      setLoadingRoutes(false);
    }
  };

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

  const handleRouteChange = (
    index: number,
    field: "from_location" | "to_location",
    value: string
  ) => {
    const updatedRoutes = [...routes];
    updatedRoutes[index][field] = value;
    setRoutes(updatedRoutes);
  };

  const addRoute = () => {
    setRoutes([...routes, { from_location: "", to_location: "", isNew: true }]);
  };

  const removeRoute = (index: number) => {
    const routeToRemove = routes[index];

    if (routeToRemove.isNew) {
      setRoutes(routes.filter((_, i) => i !== index));
    } else {
      const updatedRoutes = [...routes];
      updatedRoutes[index].isDeleted = true;
      setRoutes(updatedRoutes);
    }
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

      const routesToDelete = routes.filter(
        (route) => route.isDeleted && route.id
      );
      for (const route of routesToDelete) {
        if (route.id) {
          await axiosInstance.delete(
            `/api/v1/company-route/delete/${route.id}/`
          );
        }
      }

      const routesToUpdate = routes.filter(
        (route) => !route.isNew && !route.isDeleted && route.id
      );
      for (const route of routesToUpdate) {
        if (
          route.id &&
          route.from_location.trim() &&
          route.to_location.trim()
        ) {
          await axiosInstance.put(`/api/v1/company-route/update/${route.id}/`, {
            company: Number(company.id),
            from_location: route.from_location.trim(),
            to_location: route.to_location.trim(),
          });
        }
      }

      const newRoutes = routes.filter(
        (route) =>
          route.isNew &&
          !route.isDeleted &&
          route.from_location.trim() &&
          route.to_location.trim()
      );

      if (newRoutes.length > 0) {
        await axiosInstance.post(
          "/api/v1/company-route/create/",
          {
            company_id: Number(company.id),
            routes: newRoutes.map((route) => ({
              from_location: route.from_location.trim(),
              to_location: route.to_location.trim(),
            })),
          },
          {
            headers: { "Content-Type": "application/json" },
          }
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

  const visibleRoutes = routes.filter((route) => !route.isDeleted);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
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
              <h3 className={styles.sectionTitle}>Insurance Information</h3>
              <div className={styles.grid}>
                <div>
                  <label className={styles.label}>Insurance Company</label>
                  <input
                    type="text"
                    name="insurance_company"
                    value={formData.insurance_company}
                    onChange={handleChange}
                    placeholder="Insurance company"
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
                    placeholder="Insurance agent"
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
                    placeholder="Insurance phone"
                    className={styles.input}
                  />
                </div>

                <div>
                  <label className={styles.label}>Insurance Deductible</label>
                  <input
                    type="number"
                    name="insurance_deductible"
                    value={formData.insurance_deductible}
                    onChange={handleChange}
                    placeholder="Deductible amount"
                    className={styles.input}
                  />
                </div>

                <div>
                  <label className={styles.label}>Physical Damage Limit</label>
                  <input
                    type="number"
                    name="physical_damage_limit"
                    value={formData.physical_damage_limit}
                    onChange={handleChange}
                    placeholder="Damage limit"
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
                  <label className={styles.label}>Equipment Description</label>
                  <input
                    type="text"
                    name="equipment_description"
                    value={formData.equipment_description}
                    onChange={handleChange}
                    placeholder="Equipment description"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.mt4}>
                <label className={styles.label}>Route Description</label>
                <textarea
                  name="route_description"
                  value={formData.route_description}
                  onChange={handleChange}
                  placeholder="Route description"
                  className={styles.textarea}
                  rows={3}
                />
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Routes</h3>
              {loadingRoutes ? (
                <div className={styles.loadingText}>Loading routes...</div>
              ) : (
                <>
                  {visibleRoutes.map((route, index) => (
                    <div key={index} className={styles.routeRow}>
                      <select
                        title="From Location"
                        value={route.from_location}
                        onChange={(e) =>
                          handleRouteChange(
                            routes.indexOf(route),
                            "from_location",
                            e.target.value
                          )
                        }
                        className={styles.select}
                      >
                        <option value="">From</option>
                        {locations.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>

                      <select
                        title="To Location"
                        value={route.to_location}
                        onChange={(e) =>
                          handleRouteChange(
                            routes.indexOf(route),
                            "to_location",
                            e.target.value
                          )
                        }
                        className={styles.select}
                      >
                        <option value="">To</option>
                        {locations.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>

                      {visibleRoutes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRoute(routes.indexOf(route))}
                          className={styles.removeBtn}
                          title="Remove route"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addRoute}
                    className={styles.addBtn}
                  >
                    <FaPlus /> Add Route
                  </button>
                </>
              )}
            </section>

            <div className={styles.mt4}>
              <label className={styles.label}>Status</label>
              <select
                title="Status"
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
              <label className={styles.label}>Enclosed</label>
              <select
                title="Type"
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
              </select>
              <small className={styles.helperText}>
                Hold Ctrl (or Cmd) to select multiple options
              </small>
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
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
