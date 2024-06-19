import ModalOverlay from "../ModalOverlay/ModalOverlay";
import XIcon from "../Icons/XIcon";
import { useDispatch } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import "./FullScreenImageModal.css";

const FullScreenImageModal = ({ image }) => {
  const dispatch = useDispatch();

  return (
    <>
      <div className="modal full-screen-image-modal">
        {/* <div className="header"> */}
        {/* </div> */}
        <div className="image-container">
          <button
            className="close-button"
            onClick={() =>
              dispatch(toggleModal({ key: "fullScreenImageModal", value: false }))
            }
          >
            Close <XIcon />
          </button>
          <img src={image.url} />
        </div>
      </div>
      <ModalOverlay
        zIndex={5}
        onClick={() =>
          dispatch(toggleModal({ key: "fullScreenImageModal", value: false }))
        }
      />
    </>
  );
};
export default FullScreenImageModal;
