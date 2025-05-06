import { useCallback, useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserEdit,
  FaSave,
  FaArrowLeft,
  FaCamera,
  FaSpinner,
} from "react-icons/fa";
import styles from "./Profile.module.css";
import { AuthContext } from "../../../Context/AuthContext";
import {
  getUserProfile,
  updateProfile,
  uploadUserPhoto,
} from "../../../Service/authService";
import { Snow } from "../../snow";
import { Canvas } from "@react-three/fiber";

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    firstname: "",
    lastname: "",
    gender: "",
    birthDate: "",
  });
  const [currentlyEditing, setCurrentlyEditing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const { setAuth, logout } = useContext(AuthContext);
  const [profilePicture, setProfilePicture] = useState(
    "Assets/textures/unknown-person.png"
  );

  const fetchUserProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, success, error } = await getUserProfile();

      if (success && data) {
        setAuth(data);

        let formattedGender = "";
        if (data.gender) {
          formattedGender = data.gender.toLowerCase();
        }

        let birthDateValue = "";
        if (data.birthDate) {
          birthDateValue = formatDateForInput(data.birthDate);
        } else if (data.age) {
          birthDateValue = data.age;
        }

        setFormData({
          fullName: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
          email: data.email || "",
          firstname: data.firstName || "",
          lastname: data.lastName || "",
          gender: formattedGender,
          birthDate: birthDateValue,
        });

        if (data.photoUrl) {
          setProfilePicture(data.photoUrl);
        }
      } else {
        setError(error?.details || "Failed to load profile data");
      }
    } catch (err) {
      setError("An error occurred while fetching your profile");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [setAuth]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const getBirthDateFromAge = (age) => {
    if (!age || isNaN(age)) return "";

    const today = new Date();
    const birthYear = today.getFullYear() - age;
    const birthMonth = today.getMonth();
    const birthDay = today.getDate();

    const birthDate = new Date(birthYear, birthMonth, birthDay);

    const year = birthDate.getFullYear();
    const month = String(birthDate.getMonth() + 1).padStart(2, "0");
    const day = String(birthDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateForInput = (dateString) => {
    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) return "";

      const today = new Date();
      let age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();
      const dayDiff = today.getDate() - date.getDate();

      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
      }
      return age;
    } catch (err) {
      console.error("Error formatting date:", err);
      return "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditClick = (field) => {
    if (field === "email") return;

    if (currentlyEditing === field) {
      saveChanges(field);
    } else {
      setCurrentlyEditing(field);
    }
  };

  const saveChanges = async (field) => {
    setIsUpdating(true);
    setError(null);

    try {
      let updatedValue = {};

      switch (field) {
        case "fullName": {
          const nameParts = formData.fullName.split(" ");
          updatedValue = {
            firstname: nameParts[0] || "",
            lastname: nameParts.slice(1).join(" ") || "",
          };
          break;
        }
        case "gender": {
          updatedValue = {
            gender: formData.gender ? formData.gender.toUpperCase() : "",
          };
          break;
        }
        case "birthDate": {
          updatedValue = {
            birthDate: formData.birthDate || "",
          };
          break;
        }
        case "firstname":
        case "lastname":
          updatedValue = {
            [field]: formData[field],
          };
          break;
        default:
          break;
      }

      if (Object.keys(updatedValue).length > 0) {
        const completeUpdateData = {
          firstname: formData.firstname || "",
          lastname: formData.lastname || "",
          gender: formData.gender ? formData.gender.toUpperCase() : "",
          birthDate:
            !isNaN(formData.birthDate) && formData.birthDate !== ""
              ? getBirthDateFromAge(Number(formData.birthDate))
              : formData.birthDate || "",
        };

        if (field === "fullName") {
          completeUpdateData.firstname = updatedValue.firstname;
          completeUpdateData.lastname = updatedValue.lastname;
        } else if (field === "gender") {
          completeUpdateData.gender = updatedValue.gender;
        } else if (field === "birthDate") {
          completeUpdateData.birthDate = updatedValue.birthDate;
        } else if (field === "firstname" || field === "lastname") {
          completeUpdateData[field] = updatedValue[field];
        }

        console.log(completeUpdateData);
        const { success, error: updateError } = await updateProfile(
          completeUpdateData
        );

        if (success) {
          setSuccessMessage("Profile updated successfully");
          setTimeout(() => setSuccessMessage(""), 3000);

          await fetchUserProfile();
        } else {
          setError(updateError?.details || "Failed to update profile");
        }
      }
    } catch (err) {
      setError("An error occurred while saving changes");
      console.error(err);
    } finally {
      setIsUpdating(false);
      setCurrentlyEditing(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handlePhotoChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePicture(event.target.result);
      };
      reader.readAsDataURL(file);

      await uploadPhoto(file);
    }
  };

  const uploadPhoto = async (file) => {
    setUploadingPhoto(true);
    setError(null);

    try {
      const { success, data, error } = await uploadUserPhoto(file);

      if (success) {
        setSuccessMessage("Profile photo updated successfully");
        setTimeout(() => setSuccessMessage(""), 3000);

        if (data.photoUrl) {
          setProfilePicture(data.photoUrl);
        }
      } else {
        setError(error?.message || "Failed to upload photo");
        await fetchUserProfile();
      }
    } catch (err) {
      setError("An error occurred while uploading your photo");
      console.error(err);
      await fetchUserProfile();
    } finally {
      setUploadingPhoto(false);
    }
  };

  const formatGenderDisplay = (gender) => {
    if (!gender) return "Not specified";

    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.loadingSpinner} />
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.header}>
        <button
          className={styles.homeBtn}
          onClick={() => navigate("/home")}
          aria-label="Back to home"
        >
          <FaArrowLeft />
        </button>
        <h1 className={styles.profileTitle}>My Profile</h1>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {successMessage && (
        <div className={styles.successMessage}>{successMessage}</div>
      )}

      <div className={styles.profileContent}>
        <div className={styles.profileHeader}>
          <div
            className={styles.profileImageContainer}
            onClick={handlePhotoClick}
          >
            <img
              src={profilePicture}
              alt="Profile"
              className={`${styles.profileImage} ${
                uploadingPhoto ? styles.uploading : ""
              }`}
            />
            <div className={styles.profileBadge}>
              {uploadingPhoto ? (
                <FaSpinner className={styles.spinnerIcon} />
              ) : (
                <FaCamera />
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              className={styles.fileInput}
            />
            <div className={styles.photoOverlay}>
              <span>Change Photo</span>
            </div>
          </div>
          <h2 className={styles.infoTitle}>Personal Information</h2>
        </div>

        <div className={styles.profileFields}>
          {/* Personal Information Section */}
          <div className={styles.fieldSection}>
            <div className={styles.profileField}>
              <div className={styles.fieldLabel}>Full Name</div>
              <div className={styles.fieldContent}>
                {currentlyEditing === "fullName" ? (
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={styles.fieldInput}
                    autoFocus
                  />
                ) : (
                  <span className={styles.fieldValue}>{formData.fullName}</span>
                )}
                <button
                  className={styles.editButton}
                  onClick={() => handleEditClick("fullName")}
                  disabled={isUpdating}
                  aria-label={
                    currentlyEditing === "fullName"
                      ? "Save changes"
                      : "Edit full name"
                  }
                >
                  {currentlyEditing === "fullName" ? (
                    isUpdating ? (
                      <FaSpinner className={styles.spinnerIcon} />
                    ) : (
                      <FaSave />
                    )
                  ) : (
                    <FaUserEdit />
                  )}
                </button>
              </div>
            </div>

            <div className={styles.profileField}>
              <div className={styles.fieldLabel}>Email</div>
              <div className={styles.fieldContent}>
                <span className={styles.fieldValue}>{formData.email}</span>
                <button
                  className={`${styles.editButton} ${styles.disabled}`}
                  disabled={true}
                  aria-label="Email cannot be edited"
                >
                  <FaUserEdit />
                </button>
              </div>
            </div>

            <div className={styles.profileField}>
              <div className={styles.fieldLabel}>Gender</div>
              <div className={styles.fieldContent}>
                {currentlyEditing === "gender" ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={styles.fieldInput}
                    autoFocus
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                ) : (
                  <span className={styles.fieldValue}>
                    {formatGenderDisplay(formData.gender)}
                  </span>
                )}
                <button
                  className={styles.editButton}
                  onClick={() => handleEditClick("gender")}
                  disabled={isUpdating}
                  aria-label={
                    currentlyEditing === "gender"
                      ? "Save changes"
                      : "Edit gender"
                  }
                >
                  {currentlyEditing === "gender" ? (
                    isUpdating ? (
                      <FaSpinner className={styles.spinnerIcon} />
                    ) : (
                      <FaSave />
                    )
                  ) : (
                    <FaUserEdit />
                  )}
                </button>
              </div>
            </div>

            <div className={styles.profileField}>
              <div className={styles.fieldLabel}>Birth Date</div>
              <div className={styles.fieldContent}>
                {currentlyEditing === "birthDate" ? (
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className={styles.fieldInput}
                    autoFocus
                  />
                ) : (
                  <span className={styles.fieldValue}>
                    {formData.birthDate}
                  </span>
                )}
                <button
                  className={styles.editButton}
                  onClick={() => handleEditClick("birthDate")}
                  disabled={isUpdating}
                  aria-label={
                    currentlyEditing === "birthDate"
                      ? "Save changes"
                      : "Edit birth date"
                  }
                >
                  {currentlyEditing === "birthDate" ? (
                    isUpdating ? (
                      <FaSpinner className={styles.spinnerIcon} />
                    ) : (
                      <FaSave />
                    )
                  ) : (
                    <FaUserEdit />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.actionButtons}>
        <button className={styles.signoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className={styles.snowContainer}>
        <Canvas>
          <Snow />
        </Canvas>
      </div>
    </div>
  );
};

export default Profile;
