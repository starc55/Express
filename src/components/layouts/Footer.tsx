import React from "react";
import { motion } from "framer-motion";
import styles from "@/styles/layouts/footer.module.css";
import logo from "@/assets/images/logo.png";

const footerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut" as const,
      when: "beforeChildren",
      staggerChildren: 0.14,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const linkVariants = {
  rest: { y: 0 },
  hover: {
    y: -3,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      className={styles.footer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={footerVariants}
    >
      <div className={styles.container}>
        <div className={styles.topSection}>
          <motion.div className={styles.logoSection} variants={itemVariants}>
            <img src={logo} alt="" className={styles.footerImg} />
            <div className={styles.navigato}>Navigato</div>
          </motion.div>

          <motion.div className={styles.contactColumn} variants={itemVariants}>
            <div className={styles.contactItem}>
              <span className={styles.label}>Phone number:</span>
              <strong className={styles.value}>+998 90 000 00 00</strong>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.label}>Address:</span>
              <strong className={styles.value}>Name of address</strong>
            </div>
          </motion.div>
        </div>

        <motion.div className={styles.bottomSection} variants={itemVariants}>
          <span className={styles.year}>
            © {currentYear} Untitled UI. All rights reserved
          </span>

          <div className={styles.links}>
            <motion.a
              href="#"
              className={styles.link}
              variants={linkVariants}
              initial="rest"
              whileHover="hover"
            >
              Terms
            </motion.a>

            <motion.a
              href="#"
              className={styles.link}
              variants={linkVariants}
              initial="rest"
              whileHover="hover"
            >
              Privacy
            </motion.a>

            <motion.a
              href="#"
              className={styles.link}
              variants={linkVariants}
              initial="rest"
              whileHover="hover"
            >
              Cookies
            </motion.a>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
