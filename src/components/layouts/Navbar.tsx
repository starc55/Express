import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "@/styles/layouts/navbar.css";
import logo from "@/assets/images/logo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { MdOutlineArrowDropDown } from "react-icons/md";
import { HiOutlineUserPlus, HiOutlineBuildingOffice } from "react-icons/hi2";
import { RiLogoutCircleLine } from "react-icons/ri";
import CreateCompanyModal from "../modal/CreateCompanyModal";
import AddEmployeeModal from "@/components/modal/AddEmployeeModal";

const navVariants = {
  hidden: { y: -100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.97 },
};

const Navbar = () => {
  const [visible, setVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreateCompanyModalOpen, setIsCreateCompanyModalOpen] =
    useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 80);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/login");
  };

  return (
    <>
      <motion.nav
        className={`navbar-container ${visible ? "visible" : "hidden"}`}
        initial="hidden"
        animate="visible"
        variants={navVariants}
      >
        <motion.div className="navbar-logo" variants={childVariants}>
          <img src={logo} alt="Xpress logo" />
        </motion.div>

        <motion.span variants={childVariants}>Navigo</motion.span>

        <div className="navbar-right">
          {isAuthenticated ? (
            <div className="user-dropdown">
              <motion.button
                type="button"
                className="navbar-button user-button"
                onClick={toggleDropdown}
                variants={buttonVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                {isAdmin ? "Admin" : "User"}{" "}
                <MdOutlineArrowDropDown size={20} />
              </motion.button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    className="dropdown-menu"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          className="dropdown-item"
                          onClick={() => {
                            setIsAddModalOpen(true);
                            setDropdownOpen(false);
                          }}
                        >
                          <HiOutlineUserPlus size={20} />
                          Add Employee
                        </button>
                        <button
                          type="button"
                          className="dropdown-item"
                          onClick={() => {
                            setIsCreateCompanyModalOpen(true);
                            setDropdownOpen(false);
                          }}
                        >
                          <HiOutlineBuildingOffice size={20} />
                          Create Company
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      className="dropdown-item logout"
                      onClick={handleLogout}
                    >
                      <RiLogoutCircleLine size={20} />
                      Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              type="button"
              className="navbar-button"
              onClick={() => navigate("/login")}
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              Login
            </motion.button>
          )}
        </div>
      </motion.nav>

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={(data) => {
          console.log("New employee added::", data);
        }}
      />
      <CreateCompanyModal
        isOpen={isCreateCompanyModalOpen}
        onClose={() => setIsCreateCompanyModalOpen(false)}
        onSuccess={() => {
          console.log("Company created!");
        }}
      />
    </>
  );
};

export default Navbar;
