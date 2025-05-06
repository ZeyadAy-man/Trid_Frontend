import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { activateAccount } from "../../../Service/authService";
import styles from "./ActivateAccount.module.css";

function ActivateAccount() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token.trim()) {
      setStatus("error");
      setMessage("Please enter the activation code.");
      return;
    }

    setStatus("verifying");
    setMessage("Verifying your account...");

    try {
      const response = await activateAccount(token);

      if (response.success) {
        setStatus("success");
        setMessage(
          "Your account has been successfully activated! You can now log in."
        );
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setStatus("error");
        console.log(response.error);
        setMessage(
          response.error ||
            "Failed to activate your account. Please check the code."
        );
      }
    } catch (error) {
      console.error("Activation error:", error);
      setStatus("error");
      setMessage("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <div className={styles.activateContainer}>
      <div className={styles.activateCard}>
        <h2 className={styles.activateTitle}>Account Activation</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="Enter activation code"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className={styles.inputField}
          />
          <button type="submit" className={styles.submitButton}>
            Verify
          </button>
        </form>

        {status === "verifying" && (
          <p className={styles.verifying}>{message}</p>
        )}
        {status === "success" && <p className={styles.success}>{message}</p>}
        {status === "error" && <p className={styles.error}>{message}</p>}
      </div>
    </div>
  );
}

export default ActivateAccount;
