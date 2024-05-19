import "./ModalOverlay.css";

const ModalOverlay = ({ zIndex = 0 }) => {
  return (
    <div
      className='modal-overlay'
      style={{
        ...(zIndex && {
          zIndex,
        }),
      }}
    ></div>
  );
};
export default ModalOverlay;
