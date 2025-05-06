import { useNavigate } from "react-router-dom";
import { FaUser, FaShoppingCart, FaSearch } from "react-icons/fa";
import styles from "./Nav.module.css";
export default function Nav() {
  const navigate = useNavigate();

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <img src="./logo.jpeg" alt="MetaMall Logo" />
      </div>

      <div className={styles.searchBar}>
        <input type="text" placeholder="Search for products..." />
        <FaSearch className={styles.search} />
      </div>

      <div className={styles.rightSection}>
        <div
          className={styles.account}
          onClick={() => navigate("/account", { replace: true })}
        >
          <FaUser />
        </div>
        <div
          className={styles.cart}
          onClick={() => navigate("/cart", { replace: true })}
        >
          <FaShoppingCart className={styles.cartIcon} />
        </div>
      </div>
    </nav>
  );
}
