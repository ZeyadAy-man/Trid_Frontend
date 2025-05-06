import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { resetPassword } from "../../../Service/authService";
import styles from "./ResetPassword.module.css";

function ResetPassword() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setStatus("error");
      setMessage("Password should be at least 6 characters long");
      return;
    }

    if (!token) {
      setStatus("error");
      setMessage("Token is required");
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      const { success, error, data } = await resetPassword(token, { password });

      if (success) {
        setStatus("success");
        setMessage(
          "Your password has been successfully reset. You can now log in with your new password."
        );

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setStatus("error");

        if (error && error.validationErrors) {
          setMessage(error.validationErrors.join(", "));
        } else {
          setMessage(
            error.message ||
              "Failed to reset your password. The reset link may have expired."
          );
        }
      }
    } catch (error) {
      setStatus("error");
      setMessage("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <div className={styles.resetPasswordPage}>
      <div className={styles.resetPasswordContainer}>
        <h2>Reset Your Password</h2>

        {status === "success" ? (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>✓</div>
            <p>{message}</p>
            <p className={styles.redirectText}>Redirecting to login page...</p>
          </div>
        ) : (
          <>
            <p className={styles.instructions}>
              Please enter the token and your new password below.
            </p>

            <form className={styles.resetPasswordForm} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Reset code"
                  disabled={status === "submitting"}
                  required
                />
              </div>

              <div className={`${styles.formGroup} ${styles.inputIcon}`}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
                  disabled={status === "submitting"}
                  required
                />
                {showPassword ? (
                  <FaEyeSlash
                    className={`${styles.icon} ${styles.eyeIcon}`}
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <FaEye
                    className={`${styles.icon} ${styles.eyeIcon}`}
                    onClick={() => setShowPassword(true)}
                  />
                )}
              </div>

              {status === "error" && (
                <div className={styles.errorMessage}>{message}</div>
              )}

              <button
                type="submit"
                className={styles.resetBtn}
                disabled={status === "submitting"}
              >
                {status === "submitting" ? "Resetting..." : "Reset Password"}
              </button>

              <div
                className={styles.loginLink}
                onClick={() => navigate("/login")}
              >
                Back to Login
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
