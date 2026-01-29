import React from "react";
import styles from "@/styles/layouts/footer.module.css";
import logo from "@/assets/images/logo.svg";
import { FiPhone } from "react-icons/fi";
import { MdOutlineEmail } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";
import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.logoBlock}>
            <img
              src={logo}
              alt="Xpress Auto Transportation Logo"
              className={styles.logoImg}
            />
          </div>

          <div className={styles.contact}>
            <div className={styles.contactItem}>
              <FiPhone className={styles.icon} />
              <a href="tel:+19295665040" className={styles.value}>
                +1 (929) 566-5040
              </a>
            </div>

            <div className={styles.contactItem}>
              <MdOutlineEmail className={styles.icon} />
              <a
                href="mailto:info@xpresstransportation.org"
                className={styles.value}
              >
                info@xpresstransportation.org
              </a>
            </div>

            <div className={styles.contactItem}>
              <IoLocationOutline className={styles.icon} />
              <address className={styles.value}>
                3073 Allendale Dr, Indian Land, SC 29707, USA
              </address>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <span className={styles.copyright}>
            © {currentYear} Xpress Auto Transportation Inc. All rights reserved.
          </span>

          <div className={styles.legalLinks}>
            <a href="/terms-and-conditions" className={styles.link}>
              Terms & Conditions
            </a>
            <a href="/privacy-policy" className={styles.link}>
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
