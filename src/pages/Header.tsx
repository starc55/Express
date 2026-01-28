import React from "react";
import { CiSearch, CiLocationOn } from "react-icons/ci";
import { motion } from "framer-motion";
import styles from "@/styles/pages/Header.module.css";

interface HeaderProps {
  onSearch: (params: any) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [name, setName] = React.useState("");
  const [usdot, setUsdot] = React.useState("");
  const [mc_number, setMcNumber] = React.useState("");
  const [business_address, setBusinessAddress] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      name: name.trim(),
      usdot: usdot.trim(),
      mc_number: mc_number.trim(),
      business_address: business_address.trim(),
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 18,
        stiffness: 120,
      },
    },
  } as const;

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.04, transition: { duration: 0.2 } },
    tap: { scale: 0.97 },
  };

  return (
    <header className={styles.header}>
      <motion.div
        className={styles.searchContainer}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <form onSubmit={handleSubmit} className={styles.searchBar}>
          <motion.div className={styles.inputWrapper} variants={itemVariants}>
            <label className={styles.fieldLabel}>Company name</label>
            <div className={styles.inputGroup}>
              <motion.input
                type="text"
                placeholder="Enter company name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
              />
              <CiSearch className={styles.searchIcon} size={20} />
            </div>
          </motion.div>

          <motion.div className={styles.inputWrapper} variants={itemVariants}>
            <label className={styles.fieldLabel}>USDOT</label>
            <div className={styles.inputGroup}>
              <motion.input
                type="text"
                placeholder="USDOT number"
                value={usdot}
                onChange={(e) => setUsdot(e.target.value)}
                className={styles.input}
              />
              <CiSearch className={styles.searchIcon} size={20} />
            </div>
          </motion.div>

          <motion.div className={styles.inputWrapper} variants={itemVariants}>
            <label className={styles.fieldLabel}>MC Number</label>
            <div className={styles.inputGroup}>
              <motion.input
                type="text"
                placeholder="MC number"
                value={mc_number}
                onChange={(e) => setMcNumber(e.target.value)}
                className={styles.input}
              />
              <CiSearch className={styles.searchIcon} size={20} />
            </div>
          </motion.div>

          <motion.div className={styles.inputWrapper} variants={itemVariants}>
            <label className={styles.fieldLabel}>Business Address</label>
            <div className={styles.inputGroup}>
              <motion.input
                type="text"
                placeholder="City, State or Address"
                value={business_address}
                onChange={(e) => setBusinessAddress(e.target.value)}
                className={styles.input}
              />
              <CiLocationOn className={styles.searchIcon} size={20} />
            </div>
          </motion.div>

          <motion.button
            className={styles.searchBtn}
            type="submit"
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            Search
          </motion.button>
        </form>
      </motion.div>
    </header>
  );
};

export default Header;
