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
      <Spinner />
      {message && <p>{message}</p>}
    </div>
  );
};
export default LoadingOverlay;
