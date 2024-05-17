import Spinner from "../Icons/Spinner/Spinner";
import "./LoadingOverlay.css";

const LoadingOverlay = ({ message }) => {
  return (
    <div className="loading-overlay">
      <Spinner />
      {message && <p>{message}</p>}
    </div>
  );
};
export default LoadingOverlay;
