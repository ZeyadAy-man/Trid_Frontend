import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Search,
  User,
  ShoppingBag,
  Heart,
  ChevronDown,
  LogOut,
  Package,
  MapPin,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Nav.module.css";
import useCart from "../../../Pages/useCart.jsx";
import { getWishList } from "../../../Service/productsService.jsx";
import { AuthContext } from "../../../Context/AuthContext";
import AddressModal from "../../addressModel/addressModel.jsx";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [wishItemCount, setWishItemCount] = useState(0);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const { auth, logout } = useContext(AuthContext);
  const dropdownRef = useRef(null);
  const { getCartItemCount } = useCart();

  useEffect(() => {
    const loadSavedAddress = () => {
      try {
        const savedAddress = localStorage.getItem("userAddress");
        if (savedAddress) {
          setSelectedAddress(JSON.parse(savedAddress));
        }
      } catch (error) {
        console.error("Error loading saved address:", error);
      }
    };

    loadSavedAddress();
  }, []);

  const fetchWishItemCount = async () => {
    try {
      const res = await getWishList();
      if (res.success) {
        setWishItemCount(res.data.totalElements || 0);
      } else {
        setWishItemCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist count:", error);
      setWishItemCount(0);
    }
  };

  useEffect(() => {
    fetchWishItemCount();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isHomePage = location.pathname === "/home";
  const isProfile = location.pathname === "/account";
  const isOrder = location.pathname === "/orders";
  const isAddress = location.pathname === "/address";

  const handleLogoClick = () => {
    if (location.pathname === "/home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/home");
    }
  };

  const handleCartClick = () => {
    if (location.pathname === "/cart") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/cart");
    }
  };

  const handleWishClick = () => {
    if (!auth) {
      navigate("/login");
      return;
    }

    if (location.pathname === "/wish") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/wish");
    }
  };

  const handleProfileMenuClick = (action) => {
    setShowProfileDropdown(false);

    switch (action) {
      case "profile":
        navigate("/account");
        break;
      case "orders":
        navigate("/orders");
        break;
      case "address":
        setIsAddressModalOpen(true);
        break;
      case "logout":
        logout();
        localStorage.removeItem("userAddress");
        setSelectedAddress(null);
        break;
      default:
        break;
    }
  };

  const handleAddressSelect = async (addressData) => {
    setAddressLoading(true);

    try {
      localStorage.setItem("userAddress", JSON.stringify(addressData));

      setSelectedAddress(addressData);
    } catch (error) {
      console.error("Error saving address:", error);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleAddressModalClose = () => {
    setIsAddressModalOpen(false);
  };

  const formatAddressForDisplay = (address) => {
    if (!address) return null;

    const addressText = address.address || "";
    const maxLength = 30;

    if (addressText.length > maxLength) {
      return addressText.substring(0, maxLength) + "...";
    }

    return addressText;
  };

  return (
    <>
      <nav
        className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}
        style={{
          background: isHomePage
            ? ""
            : "linear-gradient(135deg, rgba(13, 115, 119, 0.7) 0%, rgba(13, 193, 163, 0.7) 100%)",
          transition: "background 0.3s ease",
        }}
      >
        <div className={styles.navContainer}>
          <div className={styles.navContent}>
            <div className={styles.logo}>
              <img
                onClick={handleLogoClick}
                className={styles.logoIcon}
                src="/logo.jpeg"
                alt="Trid Logo"
              />
              <span className={styles.logoText}>Trid</span>
              {auth ? (
                !isOrder && !isProfile && !isAddress ? (
                  <div
                    onClick={() => handleProfileMenuClick("address")}
                    className={styles.addressMenuItem}
                  >
                    <div className={styles.deliverToSection}>
                      <span className={styles.deliverToLabel}>Deliver to</span>
                    </div>

                    <div className={styles.addressSection}>
                      {selectedAddress ? (
                        <div className={styles.selectedAddress}>
                          <span className={styles.addressText}>
                            {formatAddressForDisplay(selectedAddress)}
                          </span>
                        </div>
                      ) : (
                        <span className={styles.defaultLocation}>Egypt</span>
                      )}
                      <span className={styles.arrow}>
                        <ChevronDown />
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className={styles.accountSection}>
                    <span>account</span>
                  </div>
                )
              ) : null}
            </div>

            <div className={styles.searchContainer}>
              <div className={styles.searchWrapper}>
                <input
                  type="text"
                  placeholder="Search for products...."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim() !== "") {
                      navigate(
                        `/SearchResult?name=${encodeURIComponent(
                          searchQuery.trim()
                        )}`
                      );
                    }
                  }}
                  className={`${styles.searchInput} ${
                    isScrolled ? styles.scrolled : ""
                  }`}
                />

                <Search
                  className={styles.searchIcon}
                  onClick={() => {
                    if (searchQuery.trim() !== "") {
                      navigate(
                        `/SearchResult?name=${encodeURIComponent(
                          searchQuery.trim()
                        )}`
                      );
                    }
                  }}
                  style={{ cursor: "pointer" }}
                />
              </div>
            </div>

            <div className={styles.rightSection}>
              <div className={styles.profileSection} ref={dropdownRef}>
                {auth ? (
                  !isOrder && !isProfile && !isAddress ? (
                    <button
                      className={styles.profileButton}
                      onClick={() =>
                        setShowProfileDropdown(!showProfileDropdown)
                      }
                    >
                      <div className={styles.profileInfo}>
                        <User className={styles.profileIcon} />
                        <div className={styles.profileText}>
                          <span className={styles.welcomeText}>Welcome</span>
                          <span className={styles.userName}>
                            {auth?.firstName ? `${auth.firstName}!` : "Guest!"}
                          </span>
                        </div>
                        <ChevronDown
                          className={`${styles.chevronIcon} ${
                            showProfileDropdown ? styles.rotated : ""
                          }`}
                        />
                      </div>
                    </button>
                  ) : null
                ) : (
                  <div>
                    <button
                      className={styles.profileButton}
                      onClick={() => navigate("/login")}
                    >
                      <User className={styles.profileIcon} />
                      <span className={styles.welcomeText}>Login</span>
                    </button>
                  </div>
                )}

                {showProfileDropdown && (
                  <div className={styles.profileDropdown}>
                    <div className={styles.dropdownHeader}>
                      <User className={styles.dropdownHeaderIcon} />
                      <div>
                        <div className={styles.dropdownUserName}>
                          {auth?.fullName ? `${auth.fullName}` : "Guest User"}
                        </div>
                        <div className={styles.dropdownUserEmail}>
                          {auth?.email || "guest@example.com"}
                        </div>
                      </div>
                    </div>
                    <div className={styles.dropdownDivider}></div>
                    <ul className={styles.dropdownMenu}>
                      <li onClick={() => handleProfileMenuClick("profile")}>
                        <User className={styles.dropdownIcon} />
                        My Profile
                      </li>
                      <li onClick={() => handleProfileMenuClick("orders")}>
                        <Package className={styles.dropdownIcon} />
                        My Orders
                      </li>
                      <li onClick={() => navigate("/address")}>
                        <MapPin className={styles.dropdownIcon} />
                        <div className={styles.addressContent}>
                          <span>Address</span>
                        </div>
                      </li>
                    </ul>
                    <div className={styles.dropdownDivider}></div>
                    <ul className={styles.dropdownMenu}>
                      <li
                        onClick={() => handleProfileMenuClick("logout")}
                        className={styles.logoutItem}
                      >
                        <LogOut className={styles.dropdownIcon} />
                        Sign Out
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <button className={styles.cartButton} onClick={handleWishClick}>
                <Heart className={styles.navButtonIcon} />
                {auth && (
                  <span className={styles.cartBadge}>{wishItemCount}</span>
                )}
              </button>

              <button className={styles.cartButton} onClick={handleCartClick}>
                <ShoppingBag className={styles.navButtonIcon} />
                {auth && (
                  <span className={styles.cartBadge}>{getCartItemCount()}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={handleAddressModalClose}
        onAddressSelect={handleAddressSelect}
        initialAddress={selectedAddress}
      />
    </>
  );
};

export default Navbar;
