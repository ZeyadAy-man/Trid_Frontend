/* eslint-disable react/prop-types */
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import {
  MdClose,
  MdMyLocation,
  MdEdit,
  MdLocationOn,
  MdArrowBack,
  MdSearch,
} from "react-icons/md";
import styles from "./addressModel.module.css";

const libraries = ["places"];
const defaultCenter = { lat: 30.0131, lng: 31.2089 };
const mapContainerStyle = { width: "100%", height: "100%" };

export default function AddressModal({
  isOpen,
  onClose,
  onAddressSelect,
  initialAddress = null,
}) {
  const [showMap, setShowMap] = useState(false);
  const [savedAddress, setSavedAddress] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [markerPos, setMarkerPos] = useState(defaultCenter);
  const [address, setAddress] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
    preventGoogleFontsLoading: true,
  });

  const mapRef = useRef();
  const placesServiceRef = useRef();
  const geocoderRef = useRef();
  const searchTimeoutRef = useRef();

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    placesServiceRef.current = new window.google.maps.places.PlacesService(map);
    geocoderRef.current = new window.google.maps.Geocoder();
  }, []);

  useEffect(() => {
    if (isOpen) {
      const saved =
        initialAddress || JSON.parse(localStorage.getItem("selectedAddress"));
      if (saved) {
        setSavedAddress(saved);
        setAddress(saved.address);
        setSearchInput(saved.address);
        setCenter(saved.coordinates);
        setMarkerPos(saved.coordinates);
        setShowMap(false);
      } else {
        setShowMap(true);
      }
    }
  }, [isOpen, initialAddress]);

  useEffect(() => {
    if (!isOpen) {
      setShowMap(false);
      setSavedAddress(null);
      setPredictions([]);
      setShowPredictions(false);
      setSearchInput("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchInput || !isLoaded || !showMap) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        {
          input: searchInput,
          componentRestrictions: { country: "eg" },
        },
        (predictions, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            setPredictions(predictions.slice(0, 5));
            setShowPredictions(true);
          } else {
            setPredictions([]);
            setShowPredictions(false);
          }
        }
      );
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchInput, isLoaded, showMap]);

  const handleChangeAddress = () => {
    setShowMap(true);
  };

  const handleBackToAddress = () => {
    setShowMap(false);
    setShowPredictions(false);
  };

  const handlePredictionSelect = (prediction) => {
    setSearchInput(prediction.description);
    setShowPredictions(false);

    if (placesServiceRef.current) {
      placesServiceRef.current.getDetails(
        { placeId: prediction.place_id },
        (place, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            place.geometry
          ) {
            const loc = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            };
            setCenter(loc);
            setMarkerPos(loc);
            setAddress(place.formatted_address);
          }
        }
      );
    }
  };

  const handleMapClick = (e) => {
    const loc = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setMarkerPos(loc);
    setCenter(loc);

    if (geocoderRef.current) {
      geocoderRef.current.geocode({ location: loc }, (results, status) => {
        if (status === "OK" && results[0]) {
          const formattedAddress = results[0].formatted_address;
          setAddress(formattedAddress);
          setSearchInput(formattedAddress);
        }
      });
    }
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCenter(loc);
        setMarkerPos(loc);

        // Reverse geocode using the initialized geocoder
        if (geocoderRef.current) {
          geocoderRef.current.geocode({ location: loc }, (results, status) => {
            if (status === "OK" && results[0]) {
              const formattedAddress = results[0].formatted_address;
              setAddress(formattedAddress);
              setSearchInput(formattedAddress);
            }
          });
        }
      });
    }
  };

  const handleConfirm = () => {
    const data = {
      address,
      coordinates: markerPos,
      timestamp: new Date().toISOString(),
    };
    const saved = JSON.parse(localStorage.getItem("savedAddresses")) || [];
    localStorage.setItem("savedAddresses", JSON.stringify([...saved, data]));
    localStorage.setItem("selectedAddress", JSON.stringify(data));
    setSavedAddress(data);
    onAddressSelect?.(data);
    onClose();
  };

  const handleUseSavedAddress = () => {
    if (savedAddress) {
      onAddressSelect?.(savedAddress);
      onClose();
    }
  };

  const AddressView = () => (
    <div className={styles.addressView}>
      <div className={styles.header}>
        <h3 className={styles.heading}>📍 Delivery Address</h3>
        <button onClick={onClose} className={styles.closeButton}>
          <MdClose size={20} />
        </button>
      </div>

      <div className={styles.savedAddressCard}>
        <div className={styles.addressIcon}>
          <MdLocationOn size={24} color="#10B981" />
        </div>
        <div className={styles.addressInfo}>
          <h4 className={styles.addressTitle}>Current Address</h4>
          <p className={styles.addressText}>{savedAddress?.address}</p>
          <small className={styles.addressCoords}>
            {savedAddress?.coordinates.lat.toFixed(6)},{" "}
            {savedAddress?.coordinates.lng.toFixed(6)}
          </small>
        </div>
      </div>

      <div className={styles.addressActions}>
        <button
          onClick={handleUseSavedAddress}
          className={styles.useAddressButton}
        >
          Use This Address
        </button>
        <button
          onClick={handleChangeAddress}
          className={styles.changeAddressButton}
        >
          <MdEdit size={16} />
          Change Address
        </button>
      </div>
    </div>
  );

  const MapView = () => {
    if (loadError) return <div className={styles.error}>Map load error</div>;
    if (!isLoaded) return <div className={styles.loading}>Loading map...</div>;

    return (
      <div className={styles.mapView}>
        <div className={styles.sidebar}>
          <div className={styles.header}>
            {savedAddress && (
              <button
                onClick={handleBackToAddress}
                className={styles.backButton}
              >
                <MdArrowBack size={20} />
              </button>
            )}
            <h3 className={styles.heading}>
              {savedAddress ? "Change Address" : "Select Address"}
            </h3>
            <button onClick={onClose} className={styles.closeButton}>
              <MdClose size={20} />
            </button>
          </div>

          <div className={styles.searchContainer}>
            <div className={styles.searchInputContainer}>
              <MdSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search address..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className={styles.searchInput}
                onFocus={() =>
                  predictions.length > 0 && setShowPredictions(true)
                }
              />
            </div>

            {showPredictions && predictions.length > 0 && (
              <div className={styles.predictionsContainer}>
                {predictions.map((prediction) => (
                  <button
                    key={prediction.place_id}
                    onClick={() => handlePredictionSelect(prediction)}
                    className={styles.predictionItem}
                  >
                    <MdLocationOn size={16} className={styles.predictionIcon} />
                    <div className={styles.predictionText}>
                      <div className={styles.predictionMain}>
                        {prediction.structured_formatting.main_text}
                      </div>
                      <div className={styles.predictionSecondary}>
                        {prediction.structured_formatting.secondary_text}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleGeolocation} className={styles.geoButton}>
            <MdMyLocation className={styles.geoIcon} />
            Use My Location
          </button>

          <div className={styles.coordinates}>
            <small>
              {markerPos.lat.toFixed(6)}, {markerPos.lng.toFixed(6)}
            </small>
          </div>

          <button
            onClick={handleConfirm}
            className={styles.confirmButton}
            disabled={!address}
          >
            Confirm Address
          </button>
        </div>

        <div className={styles.mapSection}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={15}
            onClick={handleMapClick}
            onLoad={onMapLoad}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
              zoomControl: true,
            }}
          >
            {/* Using regular Marker - it's deprecated but still works and more reliable than AdvancedMarkerElement */}
            <div
              style={{
                position: "absolute",
                transform: "translate(-50%, -100%)",
                left: "50%",
                top: "50%",
                width: "30px",
                height: "30px",
                backgroundColor: "#10B981",
                borderRadius: "50%",
                border: "3px solid white",
                boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                zIndex: 1000,
              }}
            />
          </GoogleMap>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className={styles.dialog}>
      <div className={styles.overlay} />
      <div className={styles.container}>
        <Dialog.Panel className={styles.panel}>
          {!showMap && savedAddress ? <AddressView /> : <MapView />}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
