import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaStore,
  FaMobileAlt,
  FaShoePrints,
  FaRunning,
  FaLaptop,
  FaShoppingBag,
} from "react-icons/fa";
import { MdFastfood } from "react-icons/md";
import styles from "./ShopList.module.css";

export default function ShopList() {
  const [activeShop, setActiveShop] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const path = window.location.pathname.slice(1);
    setActiveShop(path);

    const handleScroll = () => {
      const scrollContainer = document.getElementById("shops-scroll");
      if (scrollContainer) {
        setIsScrolled(scrollContainer.scrollLeft > 0);
      }
    };

    const scrollContainer = document.getElementById("shops-scroll");
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const shops = [
    { id: "/Room", name: "Room", icon: <FaMobileAlt /> },
    { id: "/shoes-shop", name: "Shoes", icon: <FaShoePrints /> },
    { id: "/sports-shop", name: "Sports", icon: <FaRunning /> },
  ];

  return (
    <div className={styles.shopsContainer}>
      <h2 className={styles.shopsHeading}>
        <FaStore className={styles.headingIcon} />
        <span>Popular Shops</span>
      </h2>

      <div
        id="shops-scroll"
        className={`${styles.shopsList} ${
          isScrolled ? styles.hasScrollShadow : ""
        }`}
      >
        <ul>
          {shops.map((shop) => (
            <li key={shop.id}>
              <Link
                to={`${shop.id}`}
                className={`${styles.shopLink} ${
                  activeShop === shop.id ? styles.active : ""
                }`}
                onClick={() => setActiveShop(shop.id)}
              >
                <span className={styles.shopIcon}>{shop.icon}</span>
                <span className={styles.shopName}>{shop.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
