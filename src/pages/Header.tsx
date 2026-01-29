import React from "react";
import { CiSearch, CiLocationOn } from "react-icons/ci";
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

  return (
    <header className={styles.header}>
      <div className={styles.searchContainer}>
        <form onSubmit={handleSubmit} className={styles.searchBar}>
          <div className={styles.inputWrapper}>
            <label className={styles.fieldLabel}>Company name</label>
            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="Enter company name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
              />
              <CiSearch className={styles.searchIcon} size={20} />
            </div>
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.fieldLabel}>USDOT</label>
            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="USDOT number"
                value={usdot}
                onChange={(e) => setUsdot(e.target.value)}
                className={styles.input}
              />
              <CiSearch className={styles.searchIcon} size={20} />
            </div>
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.fieldLabel}>MC Number</label>
            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="MC number"
                value={mc_number}
                onChange={(e) => setMcNumber(e.target.value)}
                className={styles.input}
              />
              <CiSearch className={styles.searchIcon} size={20} />
            </div>
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.fieldLabel}>Business Address</label>
            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="City, State or Address"
                value={business_address}
                onChange={(e) => setBusinessAddress(e.target.value)}
                className={styles.input}
              />
              <CiLocationOn className={styles.searchIcon} size={20} />
            </div>
          </div>

          <button className={styles.searchBtn} type="submit">
            Search
          </button>
        </form>
      </div>
    </header>
  );
};

export default Header;
