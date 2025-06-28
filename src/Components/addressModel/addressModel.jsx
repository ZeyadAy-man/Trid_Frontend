/* eslint-disable react/prop-types */
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MdClose,
  MdMyLocation,
  MdSearch,
  MdHome,
  MdCheck,
} from "react-icons/md";
import styles from "./addressModel.module.css";
import {
  searchLocations,
  reverseGeocode,
} from "../../Service/addressService";

const AddressDetailsModal = React.memo(
  ({
    isOpen,
    onClose,
    address,
    addressDetails,
    onPhoneChange,
    onLandmarkChange,
    onConfirm,
    phoneError,
    isLoading,
  }) => {
    return (
      <Dialog open={isOpen} onClose={onClose} className={styles.dialog}>
        <div className={styles.overlay} />
        <div className={styles.container}>
          <Dialog.Panel className={styles.panel}>
            <div className={styles.detailsModal}>
              <div className={styles.header}>
                <button
                  onClick={onClose}
                  className={styles.closeButton}
                  type="button"
                  disabled={isLoading}
                >
                  <MdClose size={24} />
                </button>
                <h2>Address Details</h2>
              </div>

              <div className={styles.content}>
                <div className={styles.selectedAddress}>
                  <h3>Selected Location:</h3>
                  <p className={styles.addressText}>{address}</p>
                </div>

                <div className={styles.addressForm}>
                  <h3>Additional Information (Optional)</h3>

                  <div className={styles.inputGroup}>
                    <label htmlFor="phone">
                      Phone Number <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="Enter phone number"
                      value={addressDetails.phoneNumber}
                      onChange={onPhoneChange}
                      className={styles.formInput}
                      autoComplete="tel"
                      disabled={isLoading}
                    />
                    {phoneError && (
                      <p
                        style={{
                          color: "red",
                          fontSize: "0.85rem",
                          marginBottom: "6px",
                        }}
                      >
                        Phone number is required
                      </p>
                    )}
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="landmark">Nearby Landmark</label>
                    <input
                      id="landmark"
                      type="text"
                      placeholder="Enter nearby landmark"
                      value={addressDetails.landmark}
                      onChange={onLandmarkChange}
                      className={styles.formInput}
                      autoComplete="off"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className={styles.buttonGroup}>
                  <button
                    onClick={onConfirm}
                    className={styles.confirmButton}
                    type="button"
                    disabled={isLoading}
                  >
                    <MdCheck size={20} />
                    {isLoading ? "Saving..." : "Save Address"}
                  </button>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    );
  }
);

AddressDetailsModal.displayName = "AddressDetailsModal";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const defaultCenter = [30.0131, 31.2089]; // Cairo, Egypt
const mapContainerStyle = { width: "100%", height: "100%" };

export default function AddressModal({
  isOpen,
  onClose,
  onAddressSelect,
  initialAddress = null,
}) {
  const [showMap, setShowMap] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [center, setCenter] = useState(defaultCenter);
  const [markerPos, setMarkerPos] = useState(defaultCenter);
  const [address, setAddress] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [addressDetails, setAddressDetails] = useState({
    phoneNumber: "",
    landmark: "",
  });

  const mapRef = useRef();
  const searchTimeoutRef = useRef();

  const MapEvents = () => {
    const map = useMapEvents({
      click(e) {
        handleMapClick(e.latlng);
      },
    });
    useEffect(() => {
      mapRef.current = map;
    }, [map]);
    return null;
  };

  useEffect(() => {
    if (isOpen && initialAddress) {
      setAddress(initialAddress.address);
      setSearchInput(initialAddress.address);
      setCenter([
        initialAddress.coordinates.lat,
        initialAddress.coordinates.lng,
      ]);
      setMarkerPos([
        initialAddress.coordinates.lat,
        initialAddress.coordinates.lng,
      ]);
      setAddressDetails(
        initialAddress.details || {
          phoneNumber: "",
          landmark: "",
        }
      );
      setShowMap(true);
    }
  }, [isOpen, initialAddress]);

  useEffect(() => {
    if (!isOpen) {
      setShowMap(true);
      setShowDetailsModal(false);
      setPredictions([]);
      setShowPredictions(false);
      setSearchInput("");
      setAddress("");
      setCenter(defaultCenter);
      setMarkerPos(defaultCenter);
      setAddressDetails({
        phoneNumber: "",
        landmark: "",
      });
      setPhoneError(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchInput || !showMap || showDetailsModal) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    if (searchInput === address) {
      setShowPredictions(false);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const locations = await searchLocations(searchInput);
        setPredictions(locations);
        setShowPredictions(locations.length > 0);
      } catch (error) {
        console.error("Search error:", error);
        setPredictions([]);
        setShowPredictions(false);
        handleLocationError(error);
      }
    }, 300);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchInput, showMap, address, showDetailsModal]);

  const handleLocationError = (error) => {
    if (error.message.includes("401")) {
      alert("Please check your LocationIQ API key");
    } else if (error.message.includes("403")) {
      alert(
        "LocationIQ API access denied. Please check your API key and usage limits."
      );
    } else {
      alert("Error fetching location data. Please try again.");
    }
  };

  const handlePredictionSelect = (prediction) => {
    setSearchInput(prediction.description);
    setShowPredictions(false);
    const loc = [prediction.lat, prediction.lng];
    setCenter(loc);
    setMarkerPos(loc);
    setAddress(prediction.description);
  };

  const handleMapClick = async (latlng) => {
    const loc = [latlng.lat, latlng.lng];
    setMarkerPos(loc);
    setCenter(loc);

    try {
      const addressString = await reverseGeocode(latlng.lat, latlng.lng);
      if (addressString) {
        setAddress(addressString);
        setSearchInput(addressString);
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      handleLocationError(error);
    }
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = [pos.coords.latitude, pos.coords.longitude];
        setCenter(loc);
        setMarkerPos(loc);

        try {
          const addressString = await reverseGeocode(
            pos.coords.latitude,
            pos.coords.longitude
          );
          if (addressString) {
            setAddress(addressString);
            setSearchInput(addressString);
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          handleLocationError(error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert(
          "Unable to get your location. Please check your browser settings."
        );
        setLoading(false);
      }
    );
  };

  const handleLocationConfirm = () => {
    setShowDetailsModal(true);
  };

  const handleFinalConfirm = useCallback(async () => {
    if (!addressDetails.phoneNumber.trim()) {
      setPhoneError(true);
      return;
    }

    setIsSubmitting(true);

    const addressData = {
      address,
      coordinates: {
        lat: markerPos[0],
        lng: markerPos[1],
      },
      details: {
        phoneNumber: addressDetails.phoneNumber.trim(),
        landmark: addressDetails.landmark.trim(),
      },
    };

    try {
      onAddressSelect?.(addressData);
      setShowDetailsModal(false);
      onClose();
    } catch (error) {
      console.error("Error in address confirmation:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [address, markerPos, addressDetails, onAddressSelect, onClose]);

  const handlePhoneChange = useCallback((e) => {
    const value = e.target.value;
    setPhoneError(false);
    setAddressDetails((prev) => ({
      ...prev,
      phoneNumber: value,
    }));
  }, []);

  const handleLandmarkChange = useCallback((e) => {
    const value = e.target.value;
    setAddressDetails((prev) => ({
      ...prev,
      landmark: value,
    }));
  }, []);

  const MapView = () => (
    <div className={styles.mapView}>
      <div className={styles.sidebar}>
        <div className={styles.searchContainer}>
          <MdSearch size={20} className={styles.searchIcon} />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for a location..."
            className={styles.searchInput}
            disabled={loading}
          />
          <button
            onClick={onClose}
            className={styles.backButton}
            type="button"
            disabled={loading}
          >
            <MdClose size={20} />
          </button>
        </div>

        {showPredictions && predictions.length > 0 && (
          <ul className={styles.predictionsList}>
            {predictions.map((prediction) => (
              <li
                key={prediction.place_id}
                onClick={() => handlePredictionSelect(prediction)}
                className={styles.predictionItem}
              >
                <MdHome size={20} />
                <div>
                  <div className={styles.predictionMain}>
                    {prediction.description.split(",")[0]}
                  </div>
                  <div className={styles.predictionSub}>
                    {prediction.description.split(",").slice(1, 3).join(",")}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={handleGeolocation}
          className={styles.geolocationButton}
          disabled={loading}
          type="button"
        >
          <MdMyLocation size={20} />
          {loading ? "Getting Location..." : "Use My Location"}
        </button>
        <button
          onClick={handleLocationConfirm}
          className={styles.confirmButton}
          disabled={!address || loading}
          type="button"
        >
          <MdCheck size={20} />
          Confirm Location
        </button>
        <button
          onClick={onClose}
          className={styles.ModelcloseButton}
          type="button"
        >
          Cancel
        </button>
      </div>

      <div className={styles.mapSection}>
        <MapContainer
          center={center}
          zoom={15}
          style={mapContainerStyle}
          whenCreated={(map) => {
            mapRef.current = map;
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={markerPos} />
          <MapEvents />
        </MapContainer>
      </div>
    </div>
  );

  const handleDetailsModalClose = useCallback(() => {
    if (!isSubmitting) {
      setShowDetailsModal(false);
    }
  }, [isSubmitting]);

  const handleDetailsConfirm = useCallback(() => {
    handleFinalConfirm();
  }, [handleFinalConfirm]);

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className={styles.dialog}>
        <div className={styles.overlay} />
        <div className={styles.container}>
          <Dialog.Panel className={styles.panel}>
            <MapView />
          </Dialog.Panel>
        </div>
      </Dialog>

      <AddressDetailsModal
        isOpen={showDetailsModal}
        onClose={handleDetailsModalClose}
        address={address}
        addressDetails={addressDetails}
        onPhoneChange={handlePhoneChange}
        onLandmarkChange={handleLandmarkChange}
        onConfirm={handleDetailsConfirm}
        phoneError={phoneError}
        isLoading={isSubmitting}
      />
    </>
  );
}
