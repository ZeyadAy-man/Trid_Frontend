import React, { useCallback, useContext, useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import styles from "./SellerLayout.module.css";
import { AuthContext } from "../Context/AuthContext";
import { getUserProfile } from "../Service/authService";
import {
  LogOut,
  Menu,
  X,
  Home,
  Package,
  ShoppingCart,
  BarChart3,
  User,
} from "lucide-react";

export default function SellerLayout() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    fullName: "",
  });
  const [profilePicture, setProfilePicture] = useState("/unknown-person.png");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    try {
      const { data, success } = await getUserProfile();

      if (success && data) {

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
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(!sidebarOpen);
      document.body.classList.toggle("sidebar-open", !sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    document.body.classList.remove("sidebar-open");
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape" && window.innerWidth <= 768 && sidebarOpen) {
        closeSidebar();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(false);
        if (sidebarOpen) {
          document.body.classList.add("sidebar-open");
        }
      } else {
        setSidebarOpen(false);
        document.body.classList.remove("sidebar-open");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [sidebarOpen]);

  const navigationItems = [
    { to: "./dashboard", icon: Home, label: "Dashboard" },
    { to: "./products", icon: Package, label: "Products" },
    { to: "./orders", icon: ShoppingCart, label: "Orders" },
    { to: "./analytics", icon: BarChart3, label: "Analytics" },
    { to: "/account", icon: User, label: "Profile" },
  ];

  return (
    <div className={styles.sellerLayout}>
      <div
        className={`${styles.overlay} ${sidebarOpen ? styles.active : ""}`}
        onClick={closeSidebar}
      />

      <aside
        className={`${styles.sidebar} ${
          sidebarCollapsed ? styles.collapsed : ""
        } ${sidebarOpen ? styles.open : ""}`}
      >
        <div className={styles.logoSection}>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>S</div>
            <h1 className={styles.logoText}>Seller Portal</h1>
          </div>
        </div>

        <nav className={styles.navigation}>
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.activeLink : ""}`
                }
                onClick={() => window.innerWidth <= 768 && closeSidebar()}
              >
                <IconComponent className={styles.navIcon} size={20} />
                <span className={styles.navText}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className={styles.userSection}>
          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>
              <img
                src={profilePicture}
                alt="Profile"
                className={styles.profileImage}
              />
              <div className={styles.statusIndicator} />
            </div>
            <div className={styles.userInfo}>
              <p className={styles.userName}>
                {formData.fullName || "Loading..."}
              </p>
              <p className={styles.userRole}>Seller</p>
            </div>
          </div>

          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut className={styles.logoutIcon} size={18} />
            <span className={styles.navText}>Logout</span>
          </button>
        </div>
      </aside>

      <div className={styles.contentWrapper}>
        <header className={styles.header}>
          <button
            className={styles.menuButton}
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>

          {/* <div className={styles.headerContent}> */}
            {/* <h2 className={styles.pageTitle}>Dashboard</h2>
            <div className={styles.headerActions}>
              <div className={styles.userBadge}>
                <img
                  src={profilePicture}
                  alt="Profile"
                  className={styles.headerProfileImage}
                />
                <span className={styles.headerUserName}>
                  {formData.fullName || "User"}
                </span>
              </div>
            </div> */}
          {/* </div> */}
        </header>

        {/* Main Content Area */}
        <main className={styles.main}>
          <Outlet />
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <p className={styles.copyright}>
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
                Support
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
