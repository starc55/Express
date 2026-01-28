import React from "react";
import { motion } from "framer-motion";
import styles from "@/styles/layouts/footer.module.css";
import logo from "@/assets/images/logo.svg";
import { FiPhone } from "react-icons/fi";
import { MdOutlineEmail } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";

import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa";

const footerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut", staggerChildren: 0.12 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      className={styles.footer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={footerVariants}
    >
      <div className={styles.container}>
        <div className={styles.top}>
          <motion.div className={styles.logoBlock} variants={itemVariants}>
            <img
              src={logo}
              alt="Xpress Auto Transportation Logo"
              className={styles.logoImg}
            />
          </motion.div>

          <motion.div className={styles.contact} variants={itemVariants}>
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
          </motion.div>
        </div>

        <motion.div className={styles.bottom} variants={itemVariants}>
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
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
