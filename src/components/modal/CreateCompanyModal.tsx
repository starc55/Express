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

  const [contacts, setContacts] = useState<
    { name: string; email: string; phone: string }[]
  >([{ name: "", email: "", phone: "" }]);

  const [routes, setRoutes] = useState<
    { from_location: string; to_location: string }[]
  >([{ from_location: "", to_location: "" }]);

  const locations = [
    "USA",
    "Uzbekistan",
    "Russia",
    "Kazakhstan",
    "Turkey",
    "China",
    "Germany",
    "South Korea",
    "Canada",
    "India",
    "Dubai",
    "Tashkent",
    "Samarkand",
    "Bukhara",
    "Fergana",
    "Andijan",
    "Namangan",
    "Khorezm",
    "Qarshi",
    "Termez",
  ];

  const [drivers, setDrivers] = useState<
    { name: string; phone: string; license_files: File[] }[]
  >([{ name: "", phone: "", license_files: [] }]);

  const [additionalImages, setAdditionalImages] = useState<File[]>([]);

  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);

  const enclosedOptions = ["open", "enclosed", "flatbed", "inoperable"];

  const [selectedEnclosed, setSelectedEnclosed] = useState<string[]>([]);

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

  const handleEnclosedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value && !selectedEnclosed.includes(value)) {
      setSelectedEnclosed((prev) => [...prev, value]);
    }
  };

  const removeEnclosed = (value: string) => {
    setSelectedEnclosed((prev) => prev.filter((v) => v !== value));
  };

  const handleContactChange = (
    index: number,
    field: "name" | "email" | "phone",
    value: string
  ) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setContacts(newContacts);
  };

  const addContact = () => {
    setContacts([...contacts, { name: "", email: "", phone: "" }]);
  };

  const removeContact = (index: number) => {
    if (contacts.length === 1) return;
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const handleRouteChange = (
    index: number,
    field: "from_location" | "to_location",
    value: string
  ) => {
    const newRoutes = [...routes];
    newRoutes[index] = { ...newRoutes[index], [field]: value };
    setRoutes(newRoutes);
  };

  const addRoute = () => {
    setRoutes([...routes, { from_location: "", to_location: "" }]);
  };

  const removeRoute = (index: number) => {
    if (routes.length === 1) return;
    setRoutes(routes.filter((_, i) => i !== index));
  };

  const handleDriverChange = (
    index: number,
    field: "name" | "phone",
    value: string
  ) => {
    const newDrivers = [...drivers];
    newDrivers[index] = { ...newDrivers[index], [field]: value };
    setDrivers(newDrivers);
  };

  const handleDriverFileChange = (index: number, files: FileList | null) => {
    if (!files) return;
    const newDrivers = [...drivers];
    newDrivers[index].license_files = [
      ...newDrivers[index].license_files,
      ...Array.from(files),
    ];
    setDrivers(newDrivers);
  };

  const removeDriverFile = (driverIndex: number, fileIndex: number) => {
    const newDrivers = [...drivers];
    newDrivers[driverIndex].license_files = newDrivers[
      driverIndex
    ].license_files.filter((_, i) => i !== fileIndex);
    setDrivers(newDrivers);
  };

  const addDriver = () => {
    setDrivers([...drivers, { name: "", phone: "", license_files: [] }]);
  };

  const removeDriver = (index: number) => {
    if (drivers.length === 1) return;
    setDrivers(drivers.filter((_, i) => i !== index));
  };

  const handleAdditionalImagesChange = (files: FileList | null) => {
    if (!files) return;
    setAdditionalImages((prev) => [...prev, ...Array.from(files)]);
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInsuranceFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setInsuranceFile(e.target.files[0]);
    }
  };

  const validateForm = () => {
    const requiredFields = [
      "name",
      "usdot",
      "mc_number",
      "business_address",
      "insurance_company",
      "insurance_agent",
      "insurance_phone",
      "number_of_trucks",
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]?.toString().trim()) {
        setError(`${field.replace(/_/g, " ")} field is required`);
        return false;
      }
    }

    const hasValidContact = contacts.some(
      (c) => c.name.trim() && c.email.trim() && c.phone.trim()
    );
    if (!hasValidContact) {
      setError("At least one valid contact (name, email, phone) is required");
      return false;
    }

    const hasValidDriver = drivers.some(
      (d) => d.name.trim() && d.phone.trim() && d.license_files.length > 0
    );
    if (!hasValidDriver) {
      setError(
        "At least one valid driver (name, phone, license file) is required"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const companyFormData = new FormData();
      companyFormData.append("name", formData.name.trim());
      companyFormData.append("usdot", formData.usdot.trim());
      companyFormData.append("mc_number", formData.mc_number.trim());
      companyFormData.append("status", formData.status);
      selectedEnclosed.forEach((value) => {
        companyFormData.append("enclosed", value);
      });
      companyFormData.append(
        "business_address",
        formData.business_address.trim()
      );
      companyFormData.append(
        "insurance_company",
        formData.insurance_company.trim()
      );
      companyFormData.append(
        "insurance_agent",
        formData.insurance_agent.trim()
      );
      companyFormData.append(
        "insurance_phone",
        formData.insurance_phone.trim()
      );
      companyFormData.append(
        "number_of_trucks",
        formData.number_of_trucks || "0"
      );

      if (formData.physical_damage_limit.trim()) {
        companyFormData.append(
          "physical_damage_limit",
          formData.physical_damage_limit
        );
      }
      if (formData.insurance_deductible.trim()) {
        companyFormData.append(
          "insurance_deductible",
          formData.insurance_deductible
        );
      }
      if (formData.equipment_description.trim()) {
        companyFormData.append(
          "equipment_description",
          formData.equipment_description.trim()
        );
      }
      if (formData.route_description.trim()) {
        companyFormData.append(
          "route_description",
          formData.route_description.trim()
        );
      }

      // if (photoFile) companyFormData.append("photo", photoFile);

      const companyResponse = await axiosInstance.post(
        "/api/v1/company/create/",
        companyFormData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const companyId = companyResponse.data.id;

      const insuranceFormData = new FormData();
      insuranceFormData.append("company", companyId.toString());
      insuranceFormData.append(
        "insurance_company",
        formData.insurance_company.trim()
      );
      if (formData.insurance_expiration_date) {
        insuranceFormData.append(
          "expiration_date",
          formData.insurance_expiration_date
        );
      }
      insuranceFormData.append("agent", formData.insurance_agent.trim());
      if (formData.insurance_deductible.trim()) {
        insuranceFormData.append(
          "insurance_deductible",
          formData.insurance_deductible
        );
      }
      insuranceFormData.append(
        "insurance_phone",
        formData.insurance_phone.trim()
      );
      if (formData.physical_damage_limit.trim()) {
        insuranceFormData.append(
          "physical_damage_limit",
          formData.physical_damage_limit
        );
      }
      if (insuranceFile) {
        insuranceFormData.append("file", insuranceFile);
      }

      await axiosInstance.post(
        "/api/v1/insurance-details/",
        insuranceFormData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const contactsPayload = {
        company_id: companyId,
        contacts: contacts
          .filter((c) => c.name.trim() && c.email.trim() && c.phone.trim())
          .map((c) => ({
            name: c.name.trim(),
            email: c.email.trim(),
            phone: c.phone.trim(),
          })),
      };

      if (contactsPayload.contacts.length > 0) {
        await axiosInstance.post("/api/v1/contacts/create/", contactsPayload);
      }

      for (const driver of drivers) {
        if (
          !driver.name.trim() ||
          !driver.phone.trim() ||
          driver.license_files.length === 0
        ) {
          continue;
        }

        const driverFormData = new FormData();
        driverFormData.append("name", driver.name.trim());
        driverFormData.append("phone", driver.phone.trim());
        driver.license_files.forEach((file) => {
          driverFormData.append("files", file);
        });

        await axiosInstance.post("/api/v1/driver/create/", driverFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      const validRoutes = routes.filter(
        (r) => r.from_location.trim() && r.to_location.trim()
      );

      if (validRoutes.length > 0) {
        const routesPayload = {
          company_id: companyId,
          routes: validRoutes.map((r) => ({
            from_location: r.from_location.trim(),
            to_location: r.to_location.trim(),
          })),
        };

        await axiosInstance.post(
          "/api/v1/company-route/create/",
          routesPayload
        );
      }

      if (additionalImages.length > 0) {
        const additionalFormData = new FormData();
        additionalFormData.append("company_id", companyId.toString());

        additionalImages.forEach((file) => {
          additionalFormData.append("images", file);
        });

        await axiosInstance.post(
          "/api/v1/additional-detail/create/",
          additionalFormData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error:", err);
      console.log("Backend full error response:", err.response?.data);
      let errMsg = "Error adding the company.";

      if (err.response?.status === 400) {
        const data = err.response.data;
        if (data.detail) errMsg = data.detail;
        else if (typeof data === "object") {
          errMsg = Object.entries(data)
            .map(
              ([key, val]) =>
                `${key}: ${Array.isArray(val) ? val.join(", ") : val}`
            )
            .join("\n");
        }
      } else if (err.response?.status === 401) {
        errMsg = "Authorization error. Please log in again.";
      } else if (err.message?.includes("Network")) {
        errMsg = "Network disconnected. Please check your connection.";
      }

      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.85, y: 80 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.1, ease: "easeOut", staggerChildren: 0.08 },
    },
    exit: { opacity: 0, scale: 0.85, y: 80, transition: { duration: 0.1 } },
  } as const;

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.1 } },
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.04, transition: { duration: 0.1 } },
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
              <h2>Add new company</h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={onClose}
              >
                ×
              </button>
            </motion.div>

            {error && (
              <motion.p className={styles.errorMsg} variants={childVariants}>
                {error}
              </motion.p>
            )}

            <motion.form onSubmit={handleSubmit} variants={childVariants}>
              <div className={styles.sectionHeader}>
                <h3>Company Information</h3>
              </div>
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
                <label className={styles.formLabel}>Status*</label>
                <select
                  title="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={styles.select}
                  required
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
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

              <div className={styles.sectionHeader}>
                <h3>Contact information</h3>
              </div>
              <motion.div className={styles.formGroup} variants={childVariants}>
                <label className={styles.formLabel}>Contacts</label>

                {contacts.map((contact, index) => (
                  <div key={index} className={styles.contactRow}>
                    <input
                      type="text"
                      placeholder="Name"
                      value={contact.name}
                      onChange={(e) =>
                        handleContactChange(index, "name", e.target.value)
                      }
                      className={styles.input}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={contact.email}
                      onChange={(e) =>
                        handleContactChange(index, "email", e.target.value)
                      }
                      className={styles.input}
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={contact.phone}
                      onChange={(e) =>
                        handleContactChange(index, "phone", e.target.value)
                      }
                      className={styles.input}
                      required
                    />

                    {contacts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeContact(index)}
                        className={styles.contactremoveBtn}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addContact}
                  className={styles.addBtn}
                >
                  <FaPlus /> Add Contact
                </button>
              </motion.div>

              <div className={styles.sectionHeader}>
                <h3>Driver Information</h3>
              </div>
              <motion.div className={styles.formGroup} variants={childVariants}>
                <label className={styles.formLabel}>Driver Information</label>

                {drivers.map((driver, index) => (
                  <div key={index} className={styles.driverRow}>
                    <input
                      type="text"
                      placeholder="Driver Name"
                      value={driver.name}
                      onChange={(e) =>
                        handleDriverChange(index, "name", e.target.value)
                      }
                      className={styles.input}
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Driver Phone"
                      value={driver.phone}
                      onChange={(e) =>
                        handleDriverChange(index, "phone", e.target.value)
                      }
                      className={styles.input}
                      required
                    />

                    <div className={styles.fileUploadSection}>
                      <label className={styles.fileLabel}>
                        <TbFileUpload size={20} /> Upload License Files
                        (multiple)
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) =>
                            handleDriverFileChange(index, e.target.files)
                          }
                          style={{ display: "none" }}
                        />
                      </label>

                      {driver.license_files.length > 0 && (
                        <div className={styles.fileList}>
                          {driver.license_files.map((file, fileIndex) => (
                            <div key={fileIndex} className={styles.fileItem}>
                              <span>{file.name}</span>
                              <button
                                title="Remove File"
                                type="button"
                                onClick={() =>
                                  removeDriverFile(index, fileIndex)
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

                    {drivers.length > 1 && (
                      <button
                        title="Remove Driver"
                        type="button"
                        onClick={() => removeDriver(index)}
                        className={styles.removeBtn}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addDriver}
                  className={styles.addBtn}
                >
                  <FaPlus /> Add Driver
                </button>
              </motion.div>

              <div className={styles.sectionHeader}>
                <h3>Insurance Information</h3>
              </div>

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
                <label className={styles.formLabel}>Expiration Date</label>
                <input
                  title="Expiration Date"
                  type="date"
                  name="insurance_expiration_date"
                  value={formData.insurance_expiration_date}
                  onChange={handleChange}
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
                <label className={styles.formLabel}>Insurance Document</label>
                <div className={styles.fileUploadSection}>
                  <label className={styles.fileLabel}>
                    <TbFileUpload size={20} /> Upload file
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleInsuranceFileChange}
                      style={{ display: "none" }}
                    />
                  </label>

                  {insuranceFile && (
                    <div className={styles.fileList}>
                      <div className={styles.fileItem}>
                        <span>{insuranceFile.name}</span>
                        <button
                          title="Remove File"
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
              </motion.div>

              <div className={styles.sectionHeader}>
                <h3>Equipment and Route</h3>
              </div>

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

              <motion.div className={styles.formGroup} variants={childVariants}>
                <label className={styles.formLabel}>Enclosed</label>
                <select
                  title="Enclosed"
                  onChange={handleEnclosedChange}
                  value=""
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
                          onClick={() => removeEnclosed(item)}
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
              </motion.div>

              <motion.div className={styles.formGroup} variants={childVariants}>
                <label className={styles.formLabel}>Routes</label>

                {routes.map((route, index) => (
                  <div key={index} className={styles.routeRow}>
                    <select
                      title="From Location"
                      value={route.from_location}
                      onChange={(e) =>
                        handleRouteChange(
                          index,
                          "from_location",
                          e.target.value
                        )
                      }
                      className={styles.select}
                      required
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
                        handleRouteChange(index, "to_location", e.target.value)
                      }
                      className={styles.select}
                      required
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
                        title="Remove Route"
                        type="button"
                        onClick={() => removeRoute(index)}
                        className={styles.contactremoveBtn}
                      >
                        Remove
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
              </motion.div>

              <motion.div className={styles.formGroup} variants={childVariants}>
                <label className={styles.formLabel}>Additional Details</label>

                <div className={styles.fileUploadSection}>
                  <label className={styles.fileLabel}>
                    <TbFileUpload size={20} /> Upload Images / PDFs (multiple
                    allowed)
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={(e) =>
                        handleAdditionalImagesChange(e.target.files)
                      }
                      style={{ display: "none" }}
                    />
                  </label>

                  {additionalImages.length > 0 && (
                    <div className={styles.fileList}>
                      {additionalImages.map((file, index) => (
                        <div key={index} className={styles.fileItem}>
                          <span>{file.name}</span>
                          <button
                            title="Remove File"
                            type="button"
                            onClick={() => removeAdditionalImage(index)}
                            className={styles.fileRemoveBtn}
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div
                className={styles.modalActions}
                variants={childVariants}
              >
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
