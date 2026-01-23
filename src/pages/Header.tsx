import React from "react";
import { CiSearch, CiStar, CiLocationOn } from "react-icons/ci";
import { motion } from "framer-motion";
import styles from "@/styles/pages/Header.module.css";

interface HeaderProps {
  onSearch: (params: any) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [name, setName] = React.useState("");
  const [usdot, setUsdot] = React.useState("");
  const [mc_number, setMcNumber] = React.useState("");
  const [business_type, setBusinessType] = React.useState("");
  const [business_address, setBusinessAddress] = React.useState("");
  const [carrier_operation, setCarrierOperation] = React.useState("");
  const [authority_status, setAuthorityStatus] = React.useState("");
  const [allowed_to_operate, setAllowedToOperate] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      name: name.trim(),
      usdot: usdot.trim(),
      mc_number: mc_number.trim(),
      business_type: business_type.trim(),
      business_address: business_address.trim(),
      carrier_operation: carrier_operation.trim(),
      authority_status: authority_status.trim(),
      allowed_to_operate: allowed_to_operate.trim() || undefined,
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        damping: 15,
        stiffness: 100,
      },
    },
  };

  const buttonVariants = {
    rest: { scale: 1, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" },
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
      transition: { type: "spring" as const, stiffness: 300, damping: 20 },
    },
  };

  const inputVariants = {
    rest: { scale: 1 },
    focus: { scale: 1.02 },
  };

  return (
    <header className={styles.header}>
      <div className={styles.hero}>
        <div className={styles.overlay}></div>

        <motion.div
          className={styles.content}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 className={styles.title} variants={itemVariants}>
            Find Trusted Auto
            <br />
            Transport Companies
          </motion.h1>

          <motion.p className={styles.subtitle} variants={itemVariants}>
            We help you connect with reliable auto transporters and avoid hidden
            risks.
          </motion.p>
        </motion.div>

        <motion.div
          className={styles.searchContainer}
          variants={containerVariants}
          initial="hidden" 
          animate="visible"
        >
          <form onSubmit={handleSubmit} className={styles.searchBar}>
            <motion.div
              className={styles.inputWrapper}
              variants={itemVariants}
              whileHover="focus"
            >
              <label className={styles.fieldLabel}>Search</label>
              <div className={styles.inputGroup}>
                <motion.input
                  type="text"
                  placeholder="Company name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                  variants={inputVariants}
                  transition={{ duration: 0.3 }}
                />
                <CiSearch className={styles.searchIcon} size={20} />
              </div>
            </motion.div>

            <motion.div
              className={styles.inputWrapper}
              variants={itemVariants}
              whileHover="focus"
            >
              <label className={styles.fieldLabel}>USDOT</label>
              <div className={styles.inputGroup}>
                <motion.input
                  type="text"
                  placeholder="USDOT number"
                  value={usdot}
                  onChange={(e) => setUsdot(e.target.value)}
                  className={styles.input}
                  variants={inputVariants}
                  transition={{ duration: 0.3 }}
                />
                <CiSearch className={styles.searchIcon} size={20} />
              </div>
            </motion.div>

            <motion.div
              className={styles.inputWrapper}
              variants={itemVariants}
              whileHover="focus"
            >
              <label className={styles.fieldLabel}>MC Number</label>
              <div className={styles.inputGroup}>
                <motion.input
                  type="text"
                  placeholder="MC number"
                  value={mc_number}
                  onChange={(e) => setMcNumber(e.target.value)}
                  className={styles.input}
                  variants={inputVariants}
                  transition={{ duration: 0.3 }}
                />
                <CiSearch className={styles.searchIcon} size={20} />
              </div>
            </motion.div>

            <motion.div
              className={styles.inputWrapper}
              variants={itemVariants}
              whileHover="focus"
            >
              <label className={styles.fieldLabel}>Business Address</label>
              <div className={styles.inputGroup}>
                <motion.input
                  type="text"
                  placeholder="Address"
                  value={business_address}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  className={styles.input}
                  variants={inputVariants}
                  transition={{ duration: 0.3 }}
                />
                <CiLocationOn className={styles.searchIcon} size={20} />
              </div>
            </motion.div>

            {/* <motion.div
              className={styles.inputWrapper}
              variants={itemVariants}
              whileHover="focus"
            >
              <label className={styles.fieldLabel}>Authority Status</label>
              <div className={styles.inputGroup}>
                <motion.select
                  value={authority_status}
                  onChange={(e) => setAuthorityStatus(e.target.value)}
                  className={styles.input}
                  variants={inputVariants}
                  transition={{ duration: 0.3 }}
                >
                  <option value="">Select</option>
                  <option value="broker">Broker</option>
                  <option value="common">Common</option>
                  <option value="contract">Contract</option>
                </motion.select>
                <CiLocationOn className={styles.searchIcon} size={20} />
              </div>
            </motion.div> */}

            {/* <motion.div
              className={styles.inputWrapper}
              variants={itemVariants}
              whileHover="focus"
            >
              <label className={styles.fieldLabel}>Allowed to operate</label>
              <div className={styles.inputGroup}>
                <motion.select
                  value={allowed_to_operate}
                  onChange={(e) => setAllowedToOperate(e.target.value)}
                  className={styles.input}
                  variants={inputVariants}
                  transition={{ duration: 0.3 }}
                >
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </motion.select>
                <CiLocationOn className={styles.searchIcon} size={20} />
              </div>
            </motion.div> */}

            <motion.button
              className={styles.searchBtn}
              type="submit"
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
            >
              Search
            </motion.button>
          </form>
        </motion.div>
      </div>
    </header>
  );
};

export default Header;
