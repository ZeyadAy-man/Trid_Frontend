import React, { useState, useEffect } from "react";
import { Search, User, ShoppingBag, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./Nav.module.css";
import useCart from "../../../Pages/useCart.jsx";

const Navbar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const { getCartItemCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}>
      <div className={styles.navContainer}>
        <div className={styles.navContent}>
          <div className={styles.logo}>
            <img className={styles.logoIcon} src="/logo.jpeg" alt="Trid Logo" />
            <span className={styles.logoText}>Trid</span>
          </div>

          <div className={styles.searchContainer}>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                placeholder="Search for products, brands, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${styles.searchInput} ${
                  isScrolled ? styles.scrolled : ""
                }`}
              />
              <Search className={styles.searchIcon} />
            </div>
          </div>

          <div className={styles.rightSection}>
            <button
              className={styles.navButton}
              onClick={() => navigate("/account")}
            >
              <User className={styles.navButtonIcon} />
            </button>

            <button
              className={styles.cartButton}
              onClick={() => navigate("/cart")}
            >
              <ShoppingBag className={styles.navButtonIcon} />
              <span className={styles.cartBadge}>{getCartItemCount()}</span>
            </button>

            <button
              className={styles.cartButton}
              onClick={() => navigate("/wish")}
            >
              <Heart className={styles.navButtonIcon} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
