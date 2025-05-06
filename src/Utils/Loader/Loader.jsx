import { Html, useProgress } from "@react-three/drei";
import "./Loader.css";

const Loader = () => {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="loader-container">
        <div
          style={{
            color: "white",
            fontSize: "24px",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Loading... {Math.round(progress)}%
        </div>
        <div className="loader">
          <div
            style={{ width: `${Math.min(100, Math.round(progress) + 10)}%` }}
          ></div>
        </div>
      </div>
    </Html>
  );
};

export default Loader;
