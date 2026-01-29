import React from "react";
import { CiSearch, CiLocationOn } from "react-icons/ci";
import { MdLocalShipping } from "react-icons/md";
import styles from "@/styles/pages/Header.module.css";

interface HeaderProps {
  onSearch: (params: any) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [name, setName] = React.useState("");
  const [fromLocation, setFromLocation] = React.useState("");
  const [toLocation, setToLocation] = React.useState("");
  const [enclosed, setEnclosed] = React.useState("");

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

  const enclosedOptions = [
    { value: "open", label: "Open" },
    { value: "enclosed", label: "Enclosed" },
    { value: "flatbed", label: "Flatbed" },
    { value: "inoperable", label: "Inoperable" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      name: name.trim(),
      from_location: fromLocation,
      to_location: toLocation,
      enclosed: enclosed,
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
            <label className={styles.fieldLabel}>From Location</label>
            <div className={styles.inputGroup}>
              <select
                title="From Location"
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                className={styles.select}
              >
                <option value=""></option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <CiLocationOn className={styles.searchIcon} size={20} />
            </div>
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.fieldLabel}>To Location</label>
            <div className={styles.inputGroup}>
              <select
                title="To Location"
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                className={styles.select}
              >
                <option value=""></option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <CiLocationOn className={styles.searchIcon} size={20} />
            </div>
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.fieldLabel}>Enclosed</label>
            <div className={styles.inputGroup}>
              <select
                title="Enclosed Type"
                value={enclosed}
                onChange={(e) => setEnclosed(e.target.value)}
                className={styles.select}
              >
                <option value=""></option>
                {enclosedOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <MdLocalShipping className={styles.searchIcon} size={20} />
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
