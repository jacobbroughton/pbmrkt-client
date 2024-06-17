import Spinner from "../Icons/Spinner/Spinner";
import "./LoadingOverlay.css";

const LoadingOverlay = ({ message, zIndex, verticalAlignment }) => {
  return (
    <div
      className={`loading-overlay ${
        verticalAlignment ? `vertical-${verticalAlignment}` : ""
      }`}
      style={{
        ...(zIndex && { zIndex }),
      }}
    >
      <div className="spinner-container">
        <Spinner />
      </div>
      {message && <p>{message}</p>}
    </div>
  );
};
export default LoadingOverlay;
