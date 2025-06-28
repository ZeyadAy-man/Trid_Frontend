/* eslint-disable react/prop-types */
import React, { useState, useEffect, useContext, Suspense } from "react";
import {
  ArrowLeft,
  MapPin,
  Edit3,
  CreditCard,
  Banknote,
  X,
  Plus,
  Package,
  CheckCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import AddressModal from "../Components/addressModel/addressModel";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import styles from "../Styles/Checkout.module.css";
import { checkoutCart } from "../Service/cartOrderService";
import {
  getAddress,
  createAddress,
  updateAddress,
} from "../Service/addressService";

const ModelViewer = ({ modelUrl }) => {
  const { scene, error } = useGLTF(modelUrl);
  return (
    <>
      <primitive object={scene} scale={0.6} position={[0, -1, 0]} />
      <OrbitControls
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        minDistance={1}
        maxDistance={5}
      />
    </>
  );
};

const CheckoutPage = ({ onOrderComplete }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);

  const checkoutData = location.state;

  const [formData, setFormData] = useState({
    address: "",
    details: {
      phoneNumber: "",
      landmark: "",
    },
    paymentMethod: "",
    creditCard: {
      number: "",
      expiry: "",
      cvv: "",
      name: "",
    },
  });

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showCreditCardModal, setShowCreditCardModal] = useState(false);
  const [hasStoredAddress, setHasStoredAddress] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedAddress, setSelectedAddress] = useState(null);
  const orderData = checkoutData || {
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    items: [],
  };

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response = await getAddress();
        if (response?.success && response.data) {
          const addressData = response?.data[0];

          setSelectedAddress(addressData);
          setFormData((prev) => ({
            ...prev,
            address: addressData.address || "",
            details: {
              phoneNumber: addressData.details?.phoneNumber || "",
              landmark: addressData.details?.landmark || "",
            },
          }));
          setHasStoredAddress(true);
        } else {
          console.warn("No stored address found.");
          setHasStoredAddress(false);
        }
      } catch (error) {
        console.error("Error fetching address:", error);
        setHasStoredAddress(false);
      }
    };

    fetchAddress();
  }, [auth]);

  const handleCreditCardChange = (field, value) => {
    let formattedValue = value;

    if (field === "number") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{4})(?=\d)/g, "$1 ")
        .substr(0, 19);
    }

    if (field === "expiry") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1/$2")
        .substr(0, 5);
    }

    if (field === "cvv") {
      formattedValue = value.replace(/\D/g, "").substr(0, 3);
    }

    setFormData((prev) => ({
      ...prev,
      creditCard: { ...prev.creditCard, [field]: formattedValue },
    }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handlePaymentMethodChange = (method) => {
    setFormData((prev) => ({ ...prev, paymentMethod: method }));
    if (method === "credit") {
      setShowCreditCardModal(true);
    }
    if (errors.paymentMethod) {
      setErrors((prev) => ({ ...prev, paymentMethod: "" }));
    }
  };

  const validateCreditCard = () => {
    const { number, expiry, cvv, name } = formData.creditCard;
    const cardErrors = {};

    if (!number.replace(/\s/g, "") || number.replace(/\s/g, "").length < 16) {
      cardErrors.cardNumber = "Please enter a valid 16-digit card number";
    }

    if (!expiry || expiry.length < 5) {
      cardErrors.expiry = "Please enter a valid expiry date (MM/YY)";
    } else {
      const [month, year] = expiry.split("/");
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;

      if (parseInt(month) < 1 || parseInt(month) > 12) {
        cardErrors.expiry = "Invalid month";
      } else if (
        parseInt(year) < currentYear ||
        (parseInt(year) === currentYear && parseInt(month) < currentMonth)
      ) {
        cardErrors.expiry = "Card has expired";
      }
    }

    if (!cvv || cvv.length < 3) {
      cardErrors.cvv = "Please enter a valid 3-digit CVV";
    }

    if (!name.trim()) {
      cardErrors.name = "Cardholder name is required";
    }

    return cardErrors;
  };

  const saveCreditCard = () => {
    const cardErrors = validateCreditCard();

    if (Object.keys(cardErrors).length > 0) {
      setErrors(cardErrors);
      return;
    }

    setShowCreditCardModal(false);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!hasStoredAddress || !selectedAddress) {
      setErrors({ address: "Please add a shipping address" });
      return;
    }

    if (!formData.paymentMethod) {
      setErrors({ paymentMethod: "Please select a payment method" });
      return;
    }

    if (formData.paymentMethod === "credit") {
      const cardErrors = validateCreditCard();
      if (Object.keys(cardErrors).length > 0) {
        setErrors(cardErrors);
        return;
      }
    }

    setIsProcessing(true);

    try {
      const result = await checkoutCart();

      if (!result.success) {
        throw new Error(result.error || "Unknown checkout error");
      }

      setOrderComplete(true);

      if (onOrderComplete) {
        onOrderComplete({
          orderId: "ORD-" + Date.now(),
          total: orderData.total,
          items: orderData.items,
          shippingAddress: selectedAddress,
          paymentMethod: formData.paymentMethod,
        });
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      setErrors({
        submit: "There was an error processing your payment. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddressSelect = async (addressData) => {
    try {
      let response;
      if (selectedAddress) {
        response = await updateAddress(selectedAddress.id, addressData);
      } else {
        response = await createAddress(addressData);
      }
      if (response.success) {
        setSelectedAddress(addressData);
        setFormData((prev) => ({
          ...prev,
          address: addressData.address || "",
          details: {
            phoneNumber: addressData.details?.phoneNumber || "",
            landmark: addressData.details?.landmark || "",
          },
        }));
        setHasStoredAddress(true);
        setShowAddressForm(false);
      }
      if (errors.address) {
        setErrors((prev) => ({ ...prev, address: "" }));
      }
    } catch (error) {
      console.error("Error saving address:", error);
      setErrors({ address: "Failed to save address. Please try again." });
    }
  };

  const handleAddressModalClose = () => {
    setShowAddressForm(false);
  };

  const handleEditAddress = () => {
    setShowAddressForm(true);
  };

  if (orderComplete) {
    return (
      <div className={styles.orderCompleteContainer}>
        <div className={styles.orderCompleteCard}>
          <div className={styles.successIcon}>
            <CheckCircle size={48} color="#22c55e" />
          </div>
          <h2 className={styles.orderCompleteTitle}>
            Order Placed Successfully!
          </h2>
          <p className={styles.orderCompleteTotal}>
            Order Total: ${orderData.total.toFixed(2)}
          </p>
          <p className={styles.orderCompleteMessage}>
            You will receive a confirmation email shortly.
          </p>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <button
              onClick={() => navigate("/orders")}
              className={styles.viewOrdersButton}
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate("/home")}
              className={styles.viewOrdersButton}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <button
            onClick={() => navigate("/cart")}
            className={styles.backButton}
          >
            <ArrowLeft size={20} className={styles.backButtonIcon} />
            Cart
          </button>
          <div className={styles.logo} onClick={() => navigate("/home")}>
            <img className={styles.logoText} src="/logo.jpeg" alt="Trid Logo" />
          </div>
        </div>
      </nav>

      <div className={styles.maxWidth}>
        <h1 className={styles.title}>Checkout</h1>

        <div className={styles.grid}>
          <div className={styles.leftColumn}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <MapPin size={20} className={styles.sectionIcon} />
                  Shipping Address
                </h2>
              </div>

              <div
                className={`${styles.card} ${
                  errors.address ? styles.cardError : ""
                }`}
              >
                {hasStoredAddress && selectedAddress ? (
                  <div className={styles.addressDisplay}>
                    <div className={styles.addressInfo}>
                      <div className={styles.addressHeader}>
                        <h3 className={styles.addressName}>
                          {auth?.fullName || "Recipient"}
                        </h3>
                        <div className={styles.addressActions}>
                          <button
                            onClick={handleEditAddress}
                            className={styles.addressActionButton}
                            title="Edit Address"
                          >
                            <Edit3 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className={styles.addressDetails}>
                        <p className={styles.addressLine}>
                          {selectedAddress.address}
                        </p>
                        {selectedAddress.details?.landmark && (
                          <p className={styles.addressLandmark}>
                            Near: {selectedAddress.details.landmark}
                          </p>
                        )}
                        <p className={styles.addressPhone}>
                          📞 {selectedAddress.details?.phoneNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.noAddressContainer}>
                    <div className={styles.noAddressIcon}>
                      <MapPin size={32} />
                    </div>
                    <p className={styles.noAddressText}>
                      No shipping address found.
                    </p>
                    <p className={styles.noAddressSubtext}>
                      Please add a shipping address to continue.
                    </p>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className={styles.addAddressButton}
                    >
                      <Plus size={16} className={styles.addAddressIcon} />
                      Add Shipping Address
                    </button>
                  </div>
                )}

                {errors.address && (
                  <div className={styles.errorMessage}>
                    <p className={styles.errorText}>{errors.address}</p>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Package size={20} className={styles.sectionIcon} />
                Your Order ({orderData.items.length} item
                {orderData.items.length !== 1 ? "s" : ""})
              </h2>

              <div className={styles.orderItems}>
                {orderData.items.map((item, index) => {
                  const deliveryDate = new Date();
                  deliveryDate.setDate(deliveryDate.getDate() + 3);
                  const deliveryDateString = deliveryDate.toLocaleDateString(
                    "en-US",
                    {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    }
                  );

                  return (
                    <div
                      key={item.variantId || index}
                      className={styles.orderItem}
                    >
                      {item.model ? (
                        <div className={styles.modelViewer}>
                          <Canvas camera={{ position: [0, 0, 3.5] }}>
                            <ambientLight intensity={0.6} />
                            <directionalLight position={[0, 3, 0]} />
                            <Suspense fallback={null}>
                              <ModelViewer modelUrl={item.model} />
                            </Suspense>
                          </Canvas>
                          <span className={styles.itemQuantity}>
                            x{item.quantity}
                          </span>
                        </div>
                      ) : (
                        <div className={styles.noModelContainer}>
                          <Package size={32} />
                          <p>No 3D model available</p>
                        </div>
                      )}
                      <div className={styles.itemDetails}>
                        <h3 className={styles.itemName}>{item.name}</h3>
                        <p className={styles.itemVariant}>
                          {item.color} • {item.size}
                        </p>
                        <div className={styles.itemFooter}>
                          <span className={styles.itemPrice}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        <p className={styles.deliveryInfo}>
                          Get it by {deliveryDateString}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <CreditCard size={20} className={styles.sectionIcon} />
                  Payment Method
                </h2>
              </div>

              <div
                className={`${styles.card} ${
                  errors.paymentMethod ? styles.cardError : ""
                }`}
              >
                <div className={styles.paymentOptions}>
                  <label
                    className={`${styles.paymentOption} ${
                      formData.paymentMethod === "cash"
                        ? styles.paymentOptionSelected
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={formData.paymentMethod === "cash"}
                      onChange={(e) =>
                        handlePaymentMethodChange(e.target.value)
                      }
                      className={styles.paymentRadio}
                    />
                    <div className={styles.paymentContent}>
                      <Banknote size={24} className={styles.paymentIcon} />
                      <div className={styles.paymentInfo}>
                        <span className={styles.paymentLabel}>
                          Cash on Delivery
                        </span>
                        <span className={styles.paymentDescription}>
                          Pay when your order arrives
                        </span>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`${styles.paymentOption} ${
                      formData.paymentMethod === "credit"
                        ? styles.paymentOptionSelected
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="credit"
                      checked={formData.paymentMethod === "credit"}
                      onChange={(e) =>
                        handlePaymentMethodChange(e.target.value)
                      }
                      className={styles.paymentRadio}
                    />
                    <div className={styles.paymentContent}>
                      <CreditCard size={24} className={styles.paymentIcon} />
                      <div className={styles.paymentInfo}>
                        <span className={styles.paymentLabel}>Credit Card</span>
                        <span className={styles.paymentDescription}>
                          Pay securely with your card
                        </span>
                        {formData.paymentMethod === "credit" &&
                          formData.creditCard.number && (
                            <span className={styles.cardInfo}>
                              •••• •••• ••••{" "}
                              {formData.creditCard.number.slice(-4)}
                            </span>
                          )}
                      </div>
                    </div>
                  </label>
                </div>

                {errors.paymentMethod && (
                  <div className={styles.errorMessage}>
                    <p className={styles.errorText}>{errors.paymentMethod}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className={`${styles.card} ${styles.orderSummary}`}>
              <h3 className={styles.summaryTitle}>Order Summary</h3>

              <div className={styles.summaryDetails}>
                <div className={styles.summaryRow}>
                  <span>Subtotal:</span>
                  <span>${orderData.subtotal.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Tax:</span>
                  <span>${orderData.tax.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping:</span>
                  <span>
                    {orderData.shipping === 0
                      ? "FREE"
                      : `$${orderData.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className={styles.summaryDivider}></div>
                <div className={styles.summaryTotal}>
                  <div className={styles.totalRow}>
                    <span>Total:</span>
                    <span>${orderData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {errors.submit && (
                <div className={styles.errorMessage}>
                  <p className={styles.errorText}>{errors.submit}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={
                  isProcessing || !formData.paymentMethod || !hasStoredAddress
                }
                className={`${styles.placeOrderButton} ${
                  isProcessing || !formData.paymentMethod || !hasStoredAddress
                    ? styles.placeOrderButtonDisabled
                    : styles.placeOrderButtonEnabled
                }`}
              >
                {isProcessing ? (
                  <div className={styles.processingContainer}>
                    <div className={styles.spinner}></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <span>Place Order</span>
                    <span className={styles.orderTotal}>
                      ${orderData.total.toFixed(2)}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCreditCardModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Add Credit Card</h3>
              <button
                onClick={() => {
                  setShowCreditCardModal(false);
                  setFormData((prev) => ({ ...prev, paymentMethod: "" }));
                }}
                className={styles.closeButton}
              >
                <X size={24} />
              </button>
            </div>

            <div className={styles.formFields}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>
                  Cardholder Name <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.creditCard.name}
                  onChange={(e) =>
                    handleCreditCardChange("name", e.target.value)
                  }
                  className={`${styles.formInput} ${
                    errors.name ? styles.formInputError : ""
                  }`}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className={styles.fieldError}>{errors.name}</p>
                )}
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>
                  Card Number <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.creditCard.number}
                  onChange={(e) =>
                    handleCreditCardChange("number", e.target.value)
                  }
                  className={`${styles.formInput} ${
                    errors.cardNumber ? styles.formInputError : ""
                  }`}
                  placeholder="1234 5678 9012 3456"
                />
                {errors.cardNumber && (
                  <p className={styles.fieldError}>{errors.cardNumber}</p>
                )}
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>
                    Expiry Date <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.creditCard.expiry}
                    onChange={(e) =>
                      handleCreditCardChange("expiry", e.target.value)
                    }
                    className={`${styles.formInput} ${
                      errors.expiry ? styles.formInputError : ""
                    }`}
                    placeholder="MM/YY"
                  />
                  {errors.expiry && (
                    <p className={styles.fieldError}>{errors.expiry}</p>
                  )}
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>
                    CVV <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.creditCard.cvv}
                    onChange={(e) =>
                      handleCreditCardChange("cvv", e.target.value)
                    }
                    className={`${styles.formInput} ${
                      errors.cvv ? styles.formInputError : ""
                    }`}
                    placeholder="123"
                  />
                  {errors.cvv && (
                    <p className={styles.fieldError}>{errors.cvv}</p>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button onClick={saveCreditCard} className={styles.saveButton}>
                Save Card
              </button>
            </div>
          </div>
        </div>
      )}

      <AddressModal
        isOpen={showAddressForm}
        onClose={handleAddressModalClose}
        onAddressSelect={handleAddressSelect}
        initialAddress={selectedAddress}
      />
    </div>
  );
};

export default CheckoutPage;
