import "./ToggleButton.css";

const ToggleButton = ({ text, toggled, onClick }) => {
  return (
    <button
      type="button"
      className={`${toggled ? "activated" : ""} toggle-button`}
      onClick={onClick}
    >
      {text}
    </button>
  );
};
export default ToggleButton;
