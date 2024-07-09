import { useDispatch, useSelector } from "react-redux";
import { ModalOverlay } from "../ModalOverlay/ModalOverlay";
import "./ContactSellerModal.css";
import { toggleModal } from "../../../redux/modals";
import { useState } from "react";
import { isValidEmail } from "../../../utils/usefulFunctions";
import { supabase } from "../../../utils/supabase";

const ContactSellerModal = ({ contactInfo }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [offer, setOffer] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const { data, error } = await supabase.rpc("add_contact_inquiry", {
        p_full_name: fullName,
        p_email: email,
        p_offer: offer,
        p_message: message,
        p_user_id: user?.auth_id,
        p_related_user_id: contactInfo.created_by_id,
      });

      if (error) throw error.message;

      console.log("add_contact_inquiry", data);

      setFullName("");
      setEmail("");
      setOffer(0);
      setMessage("");
      dispatch(toggleModal({ key: "contactSellerModal", value: false }));
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }
  }

  const submitDisabled = !fullName || !isValidEmail(email) || !offer;

  return (
    <>
      <div className="contact-seller modal">
        <div className="header">
          <h3>Contact this Seller</h3>
        </div>
        <div className="content">
          {error && <p className="error-text small-text">{error.toString()}</p>}
          <form className="standard" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="full-name">Full Name</label>
              <input
                placeholder="Full Name"
                id="full-name"
                onChange={(e) => setFullName(e.target.value)}
                value={fullName}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                placeholder="Email"
                id="email"
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>
            <div className="form-group">
              <label htmlFor="offer">Offer</label>
              <div className="input-container">
                <input
                  onChange={(e) => setOffer(parseInt(e.target.value))}
                  type="number"
                  step={0.01}
                  value={offer}
                  placeholder="Offer"
                  className="dollars"
                  id="offer"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                placeholder="Message"
                id="message"
                onChange={(e) => setMessage(e.target.value)}
                value={message}
              />
            </div>
            <button type="submit" disabled={submitDisabled}>
              Submit
            </button>
          </form>
        </div>
      </div>
      <ModalOverlay
        onClick={() => dispatch(toggleModal({ key: "contactSellerModal", value: false }))}
        zIndex={6}
      />
    </>
  );
};
export default ContactSellerModal;
