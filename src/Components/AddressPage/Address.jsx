import { useCallback, useContext, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaSignOutAlt,
  FaSpinner,
  FaUser,
  FaHeart,
  FaEdit,
  FaTrash,
  FaPlus,
} from "react-icons/fa";
import styles from "./Address.module.css";
import Navbar from "../HomePage/Nav/Nav";
import { MapPin, Package, Phone } from "lucide-react";
import { AuthContext } from "../../Context/AuthContext";
import AddressModal from "../addressModel/addressModel";

const Address = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const { logout } = useContext(AuthContext);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
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

  const handleAddAddress = () => {
    setIsAddressModalOpen(true);
  };

  const handleEditAddress = () => {
    setIsAddressModalOpen(true);
  };

  const handleDeleteAddress = () => {
    setSelectedAddress(null);

    try {
      localStorage.removeItem("userAddress");
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  const handleAddressModalClose = () => {
    setIsAddressModalOpen(false);
  };

  useEffect(() => {
    const loadSavedAddress = () => {
      try {
        const savedAddress = localStorage.getItem("userAddress");
        if (savedAddress) {
          setSelectedAddress(JSON.parse(savedAddress));
        }
      } catch (error) {
        console.error("Error loading saved address:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedAddress();
  }, []);

  const formatDate = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.loadingSpinner} />
        <p>Loading your addresses...</p>
      </div>
    );
  }

  return (
    <div className={styles.appContainer}>
      <Navbar />
      <button
        className={`${styles.sidebarToggle} ${
          sidebarOpen ? styles.displayNone : ""
        }`}
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav
        ref={sidebarRef}
        className={`${styles.sidebar} ${sidebarOpen ? styles.open : ""}`}
      >
        <div className={styles.sidebarTop}>
          <div
            className={`${styles.sidebarIcon} ${
              location.pathname === "/account" ? styles.active : ""
            }`}
            onClick={() =>
              location.pathname !== "/account" && navigate("/account")
            }
          >
            <FaUser />
            <span className={styles.iconTooltip}>Profile</span>
          </div>

          <div
            className={`${styles.sidebarIcon} ${
              location.pathname === "/wish" ? styles.active : ""
            }`}
            onClick={() => location.pathname !== "/wish" && navigate("/wish")}
          >
            <FaHeart />
            <span className={styles.iconTooltip}>Wishlist</span>
          </div>

          <div
            className={`${styles.sidebarIcon} ${
              location.pathname === "/address" ? styles.active : ""
            }`}
            onClick={() =>
              location.pathname !== "/address" && navigate("/address")
            }
          >
            <MapPin />
            <span className={styles.iconTooltip}>Address</span>
          </div>

          <div
            className={`${styles.sidebarIcon} ${
              location.pathname === "/order" ? styles.active : ""
            }`}
            onClick={() =>
              location.pathname !== "/order" && navigate("/orders")
            }
          >
            <Package />
            <span className={styles.iconTooltip}>Orders</span>
          </div>
        </div>

        <div className={styles.sidebarBottom}>
          <div
            className={`${styles.sidebarIcon} ${styles.logoutIcon}`}
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            <span className={styles.iconTooltip}>Logout</span>
          </div>
        </div>
      </nav>

      <div className={styles.addressContainer}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.welcomeText}>My Address</h1>
            <p className={styles.dateText}>Manage your delivery address</p>
          </div>
          {!selectedAddress && (
            <button className={styles.addButton} onClick={handleAddAddress}>
              <FaPlus />
              Add New Address
            </button>
          )}
        </div>

        <div className={styles.addressList}>
          {!selectedAddress ? (
            <div className={styles.emptyState}>
              <MapPin size={48} />
              <h3>No address found</h3>
              <p>Add your delivery address Now</p>
            </div>
          ) : (
            <div className={styles.addressCard}>
              <div className={styles.addressHeader}>
                <div className={styles.addressIcon}>
                  <MapPin size={20} />
                </div>
                <div className={styles.addressActions}>
                  <button
                    className={styles.editButton}
                    onClick={handleEditAddress}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={handleDeleteAddress}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className={styles.addressContent}>
                <div className={styles.addressText}>
                  <h3>My Address</h3>
                  <p>{selectedAddress.address}</p>
                </div>

                {selectedAddress.details?.phoneNumber && (
                  <div className={styles.addressDetail}>
                    <Phone size={16} />
                    <span>{selectedAddress.details.phoneNumber}</span>
                  </div>
                )}

                {selectedAddress.details?.landmark && (
                  <div className={styles.addressDetail}>
                    <MapPin size={16} />
                    <span>Landmark: {selectedAddress.details.landmark}</span>
                  </div>
                )}

                {selectedAddress.coordinates && (
                  <div className={styles.coordinates}>
                    <small>
                      Lat: {selectedAddress.coordinates.lat.toFixed(6)}, Lng:{" "}
                      {selectedAddress.coordinates.lng.toFixed(6)}
                    </small>
                  </div>
                )}

                {selectedAddress.timestamp && (
                  <div className={styles.timestamp}>
                    <small>
                      Added: {formatDate(selectedAddress.timestamp)}
                    </small>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {addressLoading && (
        <div className={styles.loadingOverlay}>
          <FaSpinner className={styles.loadingSpinner} />
        </div>
      )}

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={handleAddressModalClose}
        onAddressSelect={handleAddressSelect}
        initialAddress={selectedAddress}
      />
    </div>
  );
};

export default Address;
