import Spinner from "../Icons/Spinner/Spinner";
import "./LoadingOverlay.css";

const LoadingOverlay = ({ message, zIndex }) => {
  return (
    <div
      className="loading-overlay"
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
