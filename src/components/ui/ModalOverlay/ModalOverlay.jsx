import "./ModalOverlay.css";

const ModalOverlay = ({ zIndex = 0, onClick }) => {
  return (
    <div
      className="modal-overlay"
      style={{
        ...(zIndex && {
          zIndex,
        }),
      }}
      onClick={onClick}
    ></div>
  );
};
export default ModalOverlay;
