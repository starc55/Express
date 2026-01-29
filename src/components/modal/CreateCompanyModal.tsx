import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "@/api/axiosInstance";
import styles from "@/styles/modal/createCompany.module.css";
import { FaPlus, FaTrash } from "react-icons/fa";
import { TbFileUpload } from "react-icons/tb";

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type FormErrors = {
  [key: string]: string | undefined;
  contacts?: string;
  drivers?: string;
  general?: string;
};

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
    insurance_expiration_date: "",
    insurance_agent: "",
    insurance_deductible: "",
    insurance_phone: "",
    physical_damage_limit: "",
    number_of_trucks: "",
    equipment_description: "",
    route_description: "",
    status: "open",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const [contacts, setContacts] = useState<
    { name: string; email: string; phone: string }[]
  >([{ name: "", email: "", phone: "" }]);

  const [routes, setRoutes] = useState<
    { from_location: string; to_location: string }[]
  >([{ from_location: "", to_location: "" }]);

  const [drivers, setDrivers] = useState<
    { name: string; phone: string; license_files: File[] }[]
  >([{ name: "", phone: "", license_files: [] }]);

  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
  const [selectedEnclosed, setSelectedEnclosed] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

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

  const enclosedOptions = ["open", "enclosed", "flatbed", "inoperable"];

  if (!isOpen) return null;

  const getFriendlyName = (field: string): string => {
    const map: Record<string, string> = {
      name: "Company Name",
      usdot: "USDOT Number",
      mc_number: "MC Number",
      business_address: "Business Address",
      insurance_company: "Insurance Company",
      insurance_agent: "Insurance Agent",
      insurance_phone: "Insurance Phone",
      number_of_trucks: "Number of Trucks",
      insurance_deductible: "Insurance Deductible",
      physical_damage_limit: "Physical Damage Limit",
    };
    return (
      map[field] ||
      field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    );
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = "Company name is required";
    if (!formData.usdot.trim()) newErrors.usdot = "USDOT is required";
    if (!formData.mc_number.trim())
      newErrors.mc_number = "MC Number is required";
    if (!formData.business_address.trim())
      newErrors.business_address = "Business address is required";

    if (!formData.insurance_company.trim())
      newErrors.insurance_company = "Insurance company is required";
    if (!formData.insurance_agent.trim())
      newErrors.insurance_agent = "Insurance agent is required";
    if (!formData.insurance_phone.trim())
      newErrors.insurance_phone = "Insurance phone is required";

    const trucks = Number(formData.number_of_trucks);
    if (formData.number_of_trucks === "" || isNaN(trucks) || trucks < 1) {
      newErrors.number_of_trucks =
        "Enter a valid number of trucks (at least 1)";
    }

    if (
      !contacts.some((c) => c.name.trim() && c.email.trim() && c.phone.trim())
    ) {
      newErrors.contacts =
        "At least one complete contact (name + email + phone) is required";
    }

    if (
      !drivers.some(
        (d) => d.name.trim() && d.phone.trim() && d.license_files.length > 0
      )
    ) {
      newErrors.drivers =
        "At least one driver with name, phone and license file is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      setTimeout(() => {
        const firstError = document.querySelector(`.${styles.errorText}`);
        firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      return;
    }

    setLoading(true);

    try {
      const companyFormData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          companyFormData.append(key, String(value));
        }
      });
      selectedEnclosed.forEach((v) => companyFormData.append("enclosed", v));

      const companyResponse = await axiosInstance.post(
        "/api/v1/company/create/",
        companyFormData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const companyId = companyResponse.data?.id;
      if (!companyId) throw new Error("Company ID not returned from server");

      const insuranceFormData = new FormData();
      insuranceFormData.append("company_id", String(companyId));
      insuranceFormData.append("insurance_company", formData.insurance_company);
      insuranceFormData.append("agent", formData.insurance_agent);
      insuranceFormData.append("insurance_phone", formData.insurance_phone);

      if (formData.insurance_expiration_date) {
        insuranceFormData.append(
          "expiration_date",
          formData.insurance_expiration_date
        );
      }
      if (formData.insurance_deductible) {
        insuranceFormData.append(
          "insurance_deductible",
          formData.insurance_deductible
        );
      }
      if (formData.physical_damage_limit) {
        insuranceFormData.append(
          "physical_damage_limit",
          formData.physical_damage_limit
        );
      }
      if (insuranceFile) {
        insuranceFormData.append("files", insuranceFile);
      }

      await axiosInstance.post("/api/v1/insurance-details/", insuranceFormData);

      const validContacts = contacts.filter(
        (c) => c.name.trim() && c.email.trim() && c.phone.trim()
      );
      if (validContacts.length > 0) {
        await axiosInstance.post("/api/v1/contacts/create/", {
          company_id: companyId,
          contacts: validContacts.map((c) => ({
            name: c.name.trim(),
            email: c.email.trim(),
            phone: c.phone.trim(),
          })),
        });
      }

      const validRoutes = routes.filter(
        (r) => r.from_location.trim() && r.to_location.trim()
      );
      if (validRoutes.length > 0) {
        await axiosInstance.post(
          "/api/v1/company-route/create/",
          {
            company_id: Number(companyId),
            routes: validRoutes.map((r) => ({
              from_location: r.from_location,
              to_location: r.to_location,
            })),
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      for (const driver of drivers) {
        if (
          !driver.name.trim() ||
          !driver.phone.trim() ||
          driver.license_files.length === 0
        )
          continue;

        const driverForm = new FormData();
        driverForm.append("name", driver.name.trim());
        driverForm.append("phone", driver.phone.trim());
        driverForm.append("company_id", String(companyId));

        driver.license_files.forEach((file) => {
          driverForm.append("files", file);
        });

        await axiosInstance.post("/api/v1/driver/create/", driverForm);
      }

      if (additionalImages.length > 0) {
        const additionalForm = new FormData();
        additionalForm.append("company_id", String(companyId));
        additionalImages.forEach((file) => {
          additionalForm.append("images", file);
        });
        await axiosInstance.post(
          "/api/v1/additional-detail/create/",
          additionalForm
        );
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Company creation error:", err);

      const newErrors: FormErrors = {};

      if (err.response?.data) {
        const data = err.response.data;

        if (
          data.mc_number?.some((m: string) => /already|exists|unique/i.test(m))
        ) {
          newErrors.mc_number = "This MC Number is already registered";
        }
        if (data.usdot?.some((m: string) => /already|exists|unique/i.test(m))) {
          newErrors.usdot = "This USDOT is already in use";
        }

        Object.entries(data).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            newErrors[key] = value.join(" • ");
          } else if (typeof value === "string") {
            newErrors[key] = value;
          }
        });
      }

      if (Object.keys(newErrors).length === 0) {
        newErrors.general =
          "Failed to create company. Please check your connection or try again later.";
      }

      setErrors(newErrors);

      setTimeout(() => {
        const firstError = document.querySelector(`.${styles.errorText}`);
        firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (field: string) =>
    errors[field] ? `${styles.input} ${styles.inputError || ""}` : styles.input;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.modalOverlay} onClick={onClose}>
          <motion.div
            className={styles.modalContent}
            variants={{
              hidden: { opacity: 0, scale: 0.85, y: 80 },
              visible: {
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { duration: 0.2 },
              },
              exit: { opacity: 0, scale: 0.85, y: 80 },
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Add new company</h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={onClose}
              >
                ×
              </button>
            </div>

            {errors.general && (
              <div className={styles.errorMsg}>{errors.general}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className={styles.sectionHeader}>
                <h3>Company Information</h3>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Name*</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={getInputClass("name")}
                  placeholder="Company name"
                />
                {errors.name && (
                  <div className={styles.errorText}>{errors.name}</div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>USDOT*</label>
                <input
                  type="text"
                  value={formData.usdot}
                  onChange={(e) =>
                    setFormData({ ...formData, usdot: e.target.value })
                  }
                  className={getInputClass("usdot")}
                  placeholder="USDOT number"
                />
                {errors.usdot && (
                  <div className={styles.errorText}>{errors.usdot}</div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>MC Number*</label>
                <input
                  type="text"
                  value={formData.mc_number}
                  onChange={(e) =>
                    setFormData({ ...formData, mc_number: e.target.value })
                  }
                  className={getInputClass("mc_number")}
                  placeholder="MC number"
                />
                {errors.mc_number && (
                  <div className={styles.errorText}>{errors.mc_number}</div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Business Address*</label>
                <input
                  type="text"
                  value={formData.business_address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      business_address: e.target.value,
                    })
                  }
                  className={getInputClass("business_address")}
                  placeholder="Business address"
                />
                {errors.business_address && (
                  <div className={styles.errorText}>
                    {errors.business_address}
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Status*</label>
                <select
                  title="Status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className={styles.select}
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className={styles.sectionHeader}>
                <h3>Contact information</h3>
              </div>

              {contacts.map((contact, index) => (
                <div key={index} className={styles.contactRow}>
                  <input
                    type="text"
                    placeholder="Name"
                    value={contact.name}
                    onChange={(e) => {
                      const newContacts = [...contacts];
                      newContacts[index].name = e.target.value;
                      setContacts(newContacts);
                    }}
                    className={styles.input}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={contact.email}
                    onChange={(e) => {
                      const newContacts = [...contacts];
                      newContacts[index].email = e.target.value;
                      setContacts(newContacts);
                    }}
                    className={styles.input}
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={contact.phone}
                    onChange={(e) => {
                      const newContacts = [...contacts];
                      newContacts[index].phone = e.target.value;
                      setContacts(newContacts);
                    }}
                    className={styles.input}
                  />
                  {contacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setContacts(contacts.filter((_, i) => i !== index))
                      }
                      className={styles.contactremoveBtn}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              {errors.contacts && (
                <div className={styles.errorText}>{errors.contacts}</div>
              )}

              <button
                type="button"
                onClick={() =>
                  setContacts([...contacts, { name: "", email: "", phone: "" }])
                }
                className={styles.addBtn}
              >
                <FaPlus /> Add Contact
              </button>

              <div className={styles.sectionHeader}>
                <h3>Driver Information</h3>
              </div>

              {drivers.map((driver, index) => (
                <div key={index} className={styles.driverRow}>
                  <input
                    type="text"
                    placeholder="Driver Name"
                    value={driver.name}
                    onChange={(e) => {
                      const newDrivers = [...drivers];
                      newDrivers[index].name = e.target.value;
                      setDrivers(newDrivers);
                    }}
                    className={styles.input}
                  />
                  <input
                    type="tel"
                    placeholder="Driver Phone"
                    value={driver.phone}
                    onChange={(e) => {
                      const newDrivers = [...drivers];
                      newDrivers[index].phone = e.target.value;
                      setDrivers(newDrivers);
                    }}
                    className={styles.input}
                  />

                  <div className={styles.fileUploadSection}>
                    <label className={styles.fileLabel}>
                      <TbFileUpload size={20} /> Upload License Files (multiple)
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          if (!e.target.files) return;
                          const newDrivers = [...drivers];
                          newDrivers[index].license_files = [
                            ...newDrivers[index].license_files,
                            ...Array.from(e.target.files),
                          ];
                          setDrivers(newDrivers);
                        }}
                        style={{ display: "none" }}
                      />
                    </label>

                    {driver.license_files.length > 0 && (
                      <div className={styles.fileList}>
                        {driver.license_files.map((file, fileIndex) => (
                          <div key={fileIndex} className={styles.fileItem}>
                            <span>{file.name}</span>
                            <button
                              title="Remove file"
                              type="button"
                              onClick={() => {
                                const newDrivers = [...drivers];
                                newDrivers[index].license_files = newDrivers[
                                  index
                                ].license_files.filter(
                                  (_, fi) => fi !== fileIndex
                                );
                                setDrivers(newDrivers);
                              }}
                              className={styles.fileRemoveBtn}
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {drivers.length > 1 && (
                    <button
                      title="Remove Driver"
                      type="button"
                      onClick={() =>
                        setDrivers(drivers.filter((_, i) => i !== index))
                      }
                      className={styles.removeBtn}
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}

              {errors.drivers && (
                <div className={styles.errorText}>{errors.drivers}</div>
              )}

              <button
                type="button"
                onClick={() =>
                  setDrivers([
                    ...drivers,
                    { name: "", phone: "", license_files: [] },
                  ])
                }
                className={styles.addBtn}
              >
                <FaPlus /> Add Driver
              </button>

              <div className={styles.sectionHeader}>
                <h3>Insurance Information</h3>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Insurance Company*</label>
                <input
                  type="text"
                  value={formData.insurance_company}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      insurance_company: e.target.value,
                    })
                  }
                  className={getInputClass("insurance_company")}
                  placeholder="Insurance company name"
                />
                {errors.insurance_company && (
                  <div className={styles.errorText}>
                    {errors.insurance_company}
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Expiration Date</label>
                <input
                  title="Expiration Date"
                  type="date"
                  value={formData.insurance_expiration_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      insurance_expiration_date: e.target.value,
                    })
                  }
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Insurance Agent*</label>
                <input
                  type="text"
                  value={formData.insurance_agent}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      insurance_agent: e.target.value,
                    })
                  }
                  className={getInputClass("insurance_agent")}
                  placeholder="Insurance agent name"
                />
                {errors.insurance_agent && (
                  <div className={styles.errorText}>
                    {errors.insurance_agent}
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Insurance Deductible</label>
                <input
                  type="number"
                  value={formData.insurance_deductible}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      insurance_deductible: e.target.value,
                    })
                  }
                  className={styles.input}
                  placeholder="Insurance deductible"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Insurance Phone*</label>
                <input
                  type="tel"
                  value={formData.insurance_phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      insurance_phone: e.target.value,
                    })
                  }
                  className={getInputClass("insurance_phone")}
                  placeholder="Insurance phone number"
                />
                {errors.insurance_phone && (
                  <div className={styles.errorText}>
                    {errors.insurance_phone}
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Insurance Document</label>
                <div className={styles.fileUploadSection}>
                  <label className={styles.fileLabel}>
                    <TbFileUpload size={20} /> Upload file
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setInsuranceFile(e.target.files[0]);
                        }
                      }}
                      style={{ display: "none" }}
                    />
                  </label>

                  {insuranceFile && (
                    <div className={styles.fileList}>
                      <div className={styles.fileItem}>
                        <span>{insuranceFile.name}</span>
                        <button
                          title="Remove file"
                          type="button"
                          onClick={() => setInsuranceFile(null)}
                          className={styles.fileRemoveBtn}
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.sectionHeader}>
                <h3>Equipment and Route</h3>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Physical Damage Limit
                </label>
                <input
                  type="number"
                  value={formData.physical_damage_limit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      physical_damage_limit: e.target.value,
                    })
                  }
                  className={styles.input}
                  placeholder="Physical damage limit"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Number of Trucks*</label>
                <input
                  type="number"
                  value={formData.number_of_trucks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      number_of_trucks: e.target.value,
                    })
                  }
                  className={getInputClass("number_of_trucks")}
                  placeholder="Number of trucks"
                />
                {errors.number_of_trucks && (
                  <div className={styles.errorText}>
                    {errors.number_of_trucks}
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Equipment Description
                </label>
                <input
                  type="text"
                  value={formData.equipment_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      equipment_description: e.target.value,
                    })
                  }
                  className={styles.input}
                  placeholder="Equipment description"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Route Description</label>
                <input
                  type="text"
                  value={formData.route_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      route_description: e.target.value,
                    })
                  }
                  className={styles.input}
                  placeholder="Route description"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Enclosed</label>
                <select
                  title="Enclosed"
                  value=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && !selectedEnclosed.includes(val)) {
                      setSelectedEnclosed((prev) => [...prev, val]);
                    }
                  }}
                  className={styles.select}
                >
                  <option value="">Select enclosed...</option>
                  {enclosedOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                {selectedEnclosed.length > 0 && (
                  <div
                    style={{
                      marginTop: "8px",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    {selectedEnclosed.map((item) => (
                      <div
                        key={item}
                        style={{
                          background: "#e0e0e0",
                          padding: "4px 10px",
                          borderRadius: "16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedEnclosed((prev) =>
                              prev.filter((v) => v !== item)
                            )
                          }
                          style={{
                            background: "none",
                            border: "none",
                            fontSize: "16px",
                            cursor: "pointer",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Routes</label>

                {routes.map((route, index) => (
                  <div key={index} className={styles.routeRow}>
                    <select
                      title="From Location"
                      value={route.from_location}
                      onChange={(e) => {
                        const newRoutes = [...routes];
                        newRoutes[index].from_location = e.target.value;
                        setRoutes(newRoutes);
                      }}
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
                      onChange={(e) => {
                        const newRoutes = [...routes];
                        newRoutes[index].to_location = e.target.value;
                        setRoutes(newRoutes);
                      }}
                      className={styles.select}
                    >
                      <option value="">To</option>
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>

                    {routes.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setRoutes(routes.filter((_, i) => i !== index))
                        }
                        className={styles.contactremoveBtn}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setRoutes([
                      ...routes,
                      { from_location: "", to_location: "" },
                    ])
                  }
                  className={styles.addBtn}
                >
                  <FaPlus /> Add Route
                </button>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Additional Details</label>

                <div className={styles.fileUploadSection}>
                  <label className={styles.fileLabel}>
                    <TbFileUpload size={20} /> Upload Images / PDFs (multiple
                    allowed)
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        if (!e.target.files) return;
                        setAdditionalImages((prev) => [
                          ...prev,
                          ...Array.from(e.target.files ?? []),
                        ]);
                      }}
                      style={{ display: "none" }}
                    />
                  </label>

                  {additionalImages.length > 0 && (
                    <div className={styles.fileList}>
                      {additionalImages.map((file, index) => (
                        <div key={index} className={styles.fileItem}>
                          <span>{file.name}</span>
                          <button
                            title="Remove file"
                            type="button"
                            onClick={() =>
                              setAdditionalImages((prev) =>
                                prev.filter((_, i) => i !== index)
                              )
                            }
                            className={styles.fileRemoveBtn}
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.modalActions}>
                <motion.button
                  type="submit"
                  className={styles.applyBtn}
                  disabled={loading}
                  variants={{
                    rest: { scale: 1 },
                    hover: { scale: 1.04 },
                    tap: { scale: 0.97 },
                  }}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {loading ? "Creating..." : "Create Company"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateCompanyModal;
