import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

// eslint-disable-next-line react/prop-types
const Navbar = ({ shopName, cartItems = 0 }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartBadgeAnimated, setCartBadgeAnimated] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  useEffect(() => {
    if (cartItems > 0) {
      setCartBadgeAnimated(true);
      const timer = setTimeout(() => setCartBadgeAnimated(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [cartItems]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleClickOutside = (event) => {
      if (
        !event.target.closest(`.${styles.mobileMenu}`) &&
        !event.target.closest(`.${styles.mobileToggle}`)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: "Home", path: "/home" },
    { name: "Sports", path: `/sports/34` },
    { name: "Shoes", path: `/shoes/23` },
    { name: "Bags", path: `/bags/30` },
  ];

  return (
    <>
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
        <div className={styles.container}>
          <div
            className={styles.brand}
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            <img className={styles.logo} src="/logo.jpeg" alt="Logo" />
            <span className={styles.title}>{shopName}</span>
          </div>

          <div className={styles.navLinks}>
            {navLinks.map((link) => (
              <div
                key={link.name}
                className={styles.navLink}
                onClick={() => {
                  navigate(link.path);
                  setMobileMenuOpen(false);
                }}
                style={{ cursor: "pointer" }}
              >
                {link.name}
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <button
              className={styles.iconBtn}
              aria-label="User Account"
              onClick={() => navigate("/account")}
            >
              <svg
                className={styles.icon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>

            <button
              className={styles.iconBtn}
              aria-label="Shopping Cart"
              onClick={() => navigate("/cart")}
            >
              {cartItems > 0 && (
                <span
                  className={`${styles.badge} ${
                    cartBadgeAnimated ? styles.animated : ""
                  }`}
                >
                  {cartItems}
                </span>
              )}
              <svg
                className={styles.icon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className={styles.mobileToggle}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg
              className={mobileMenuOpen ? styles.hidden : styles.icon}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg
              className={mobileMenuOpen ? styles.icon : styles.hidden}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </nav>

      <div
        className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ""}`}
      >
        {navLinks.map((link) => (
          <div
            key={link.name}
            className={styles.mobileLink}
            onClick={() => {
              navigate(link.path);
              setMobileMenuOpen(false);
            }}
            style={{ cursor: "pointer" }}
          >
            {link.name}
          </div>
        ))}
      </div>
    </>
  );
};

export default Navbar;
