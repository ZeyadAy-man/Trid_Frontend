import React, { useCallback, useContext, useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import styles from "./SellerLayout.module.css";
import { AuthContext } from "../Context/AuthContext";
import { getUserProfile } from "../Service/authService";
import { LogOut } from "lucide-react";

export default function SellerLayout() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    fullName: "",
  });
  const [profilePicture, setProfilePicture] = useState(
    "Assets/textures/unknown-person.png"
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { setAuth, auth } = useContext(AuthContext);

  const fetchUserProfile = useCallback(async () => {
    try {
      const { data, success } = await getUserProfile();

      if (success && data) {
        setAuth(data);

        setFormData({
          fullName: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
        });

        if (data.photoUrl) {
          setProfilePicture(data.photoUrl);
        }
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  }, [setAuth]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className={styles.sellerLayout}>
      <aside
        className={`${styles.sidebar} ${
          sidebarCollapsed ? styles.collapsed : ""
        }`}
      >
        <div className={styles.logo}>
          {!sidebarCollapsed && <h2>Seller Portal</h2>}
          <button
            className={styles.toggleButton}
            onClick={toggleSidebar}
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            ☰
          </button>
        </div>
        <nav className={styles.navigation}>
          <NavLink
            to="/account"
            className={({ isActive }) =>
              isActive ? styles.activeLink : styles.navLink
            }
          >
            <span className={styles.navIcon}>👤</span>
            <span className={styles.navText}>Profile</span>
          </NavLink>
          <NavLink
            to="./dashboard"
            className={({ isActive }) =>
              isActive ? styles.activeLink : styles.navLink
            }
          >
            <span className={styles.navIcon}>📊</span>
            <span className={styles.navText}>Dashboard</span>
          </NavLink>
          <NavLink
            to="./products"
            className={({ isActive }) =>
              isActive ? styles.activeLink : styles.navLink
            }
          >
            <span className={styles.navIcon}>📦</span>
            <span className={styles.navText}>Products</span>
          </NavLink>
          <NavLink
            to="./orders"
            className={({ isActive }) =>
              isActive ? styles.activeLink : styles.navLink
            }
          >
            <span className={styles.navIcon}>🛒</span>
            <span className={styles.navText}>Orders</span>
          </NavLink>
        </nav>
        <div className={styles.logoutSection}>
          <div onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={18} />
            {!sidebarCollapsed && (
              <span className={styles.navText}>Logout</span>
            )}
          </div>
        </div>

        <div className={styles.userSection}>
          <div className={styles.userAvatar}>
            <img
              src={profilePicture}
              alt="Profile"
              className={styles.profileImage}
            />
            <div className={styles.statusIndicator}></div>
          </div>
          <div className={styles.userInfo}>
            <p className={styles.userName}>Seller Dashboard</p>
            <p className={styles.userRole}>
              {formData.fullName || "Loading..."}
            </p>
          </div>
        </div>
      </aside>

      <div className={styles.contentWrapper}>
        <main className={styles.main}>
          <Outlet />
        </main>

        <footer className={styles.footer}>
          <p>
            © {new Date().getFullYear()} Seller Portal. All rights reserved.
          </p>
          <div className={styles.footerLinks}>
            <a href="#" className={styles.footerLink}>
              Privacy Policy
            </a>
            <a href="#" className={styles.footerLink}>
              Terms of Service
            </a>
            <a href="#" className={styles.footerLink}>
              Contact Support
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
