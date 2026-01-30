import React, { useState, useEffect } from "react";
import "@/styles/layouts/navbar.css";
import logo from "@/assets/images/logo.svg";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { MdOutlineArrowDropDown } from "react-icons/md";
import { HiOutlineUserPlus, HiOutlineBuildingOffice } from "react-icons/hi2";
import { RiLogoutCircleLine } from "react-icons/ri";
import CreateCompanyModal from "../modal/CreateCompanyModal";
import AddEmployeeModal from "@/components/modal/AddEmployeeModal";

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
      <nav className={`navbar-container ${visible ? "visible" : "hidden"}`}>
        <div className="navbar-logo">
          <img src={logo} alt="Xpress logo" />
        </div>

        {/* <p className="navigo">Navigo</p> */}

        <div className="navbar-right">
          {isAuthenticated ? (
            isAdmin ? (
              <div className="user-dropdown">
                <button
                  type="button"
                  className="navbar-button user-button"
                  onClick={toggleDropdown}
                >
                  Admin
                  <MdOutlineArrowDropDown size={20} />
                </button>

                {dropdownOpen && (
                  <div className="dropdown-menu">
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
                      Add Company
                    </button>

                    <button
                      type="button"
                      className="dropdown-item logout"
                      onClick={handleLogout}
                    >
                      <RiLogoutCircleLine size={20} />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="navbar-button logout-button"
                onClick={handleLogout}
              >
                <RiLogoutCircleLine size={20} style={{ marginRight: "8px" }} />
                Log Out
              </button>
            )
          ) : (
            <button
              type="button"
              className="navbar-button"
              onClick={() => navigate("/login")}
            >
              Dashboard
            </button>
          )}
        </div>
      </nav>

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={(data) => {
          console.log("New employee added:", data);
        }}
      />
      <CreateCompanyModal
        isOpen={isCreateCompanyModalOpen}
        onClose={() => setIsCreateCompanyModalOpen(false)}
        onSuccess={() => {
          console.log("Company created!");
          setIsCreateCompanyModalOpen(false);
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }}
      />
    </>
  );
};

export default Navbar;
