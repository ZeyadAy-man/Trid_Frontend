import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserEdit, FaSave, FaArrowLeft, FaUser } from "react-icons/fa";
import styles from "./Profile.module.css";
import { AuthContext } from "../../../Context/AuthContext";

const Profile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [currentlyEditing, setCurrentlyEditing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { auth, setAuth, logout } = useContext(AuthContext);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (!auth || auth.username !== parsedUser.username) {
        setAuth(parsedUser);
        setFormData({
          username: parsedUser.username,
          email: parsedUser.email,
          roles: parsedUser.roles,
        });
        setIsLoading(false);
      } else {
        setFormData({
          username: auth.username,
          email: auth.email,
          roles: auth.roles,
        });
        setIsLoading(false);
      }
    } else {
      navigate("/login", { replace: true });
    }
  }, [auth, navigate, setAuth]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditClick = (field) => {
    if (field === "roles") return;

    if (currentlyEditing === field) {
      setAuth({
        ...auth,
        ...formData,
      });
      setCurrentlyEditing(null);
    } else {
      setCurrentlyEditing(field);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return <div className={styles.loadingSpinner}>Loading...</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.header}>
        <button
          className={styles.homeBtn}
          onClick={() => navigate("/home", { replace: true })}
          aria-label="Back to home"
        >
          <FaArrowLeft />
        </button>
        <h1 className={styles.profileTitle}>My Profile</h1>
      </div>

      <div className={styles.profileContent}>
        <div className={styles.profileHeader}>
          <div className={styles.profileImageContainer}>
            <img
              src="./unknown-person.png"
              alt="Profile"
              className={styles.profileImage}
            />
            <div className={styles.profileBadge}>
              <FaUser />
            </div>
          </div>
          <h2 className={styles.infoTitle}>Personal Information</h2>
        </div>

        <div className={styles.profileFields}>
          {Object.keys(formData).map((field) => (
            <div key={field} className={styles.profileField}>
              <div className={styles.fieldLabel}>
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </div>
              <div className={styles.fieldContent}>
                {currentlyEditing === field ? (
                  <input
                    type="text"
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    readOnly={field === "roles"}
                    className={styles.fieldInput}
                    autoFocus
                  />
                ) : (
                  <span className={styles.fieldValue}>
                    {Array.isArray(formData[field])
                      ? formData[field].join(", ")
                      : formData[field]}
                  </span>
                )}
                <button
                  className={`${styles.editButton} ${
                    field === "roles" ? styles.disabled : ""
                  }`}
                  onClick={() => handleEditClick(field)}
                  disabled={field === "roles"}
                  aria-label={
                    currentlyEditing === field ? "Save changes" : "Edit field"
                  }
                >
                  {currentlyEditing === field ? <FaSave /> : <FaUserEdit />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.actionButtons}>
        <button className={styles.signoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
