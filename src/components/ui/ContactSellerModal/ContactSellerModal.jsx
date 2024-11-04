import { useDispatch, useSelector } from "react-redux";
import { ModalOverlay } from "../ModalOverlay/ModalOverlay";
import "./ContactSellerModal.css";
import { toggleModal } from "../../../redux/modals";
import { useRef, useState } from "react";
import { isValidEmail } from "../../../utils/usefulFunctions";
import { supabase } from "../../../utils/supabase";
import { smoothScrollOptions } from "../../../utils/constants";
import { FieldErrorButtons } from "../FieldErrorButtons/FieldErrorButtons";
import { LoginPrompt } from "../LoginPrompt/LoginPrompt";
import { ErrorBanner } from "../ErrorBanner/ErrorBanner";

const ContactSellerModal = ({ contactInfo }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [fullName, setFullName] = useState(
    user ? user.first_name + " " + user.last_name : ""
  );
  const [email, setEmail] = useState(user ? user.email : "");
  const [offer, setOffer] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [markedFieldKey, setMarkedFieldKey] = useState(null);

  const fullNameRef = useRef(null);
  const emailRef = useRef(null);
  const offerRef = useRef(null);
  const messageRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();

    setSubmitLoading(true);
    try {
      const { data, error } = await supabase.rpc("add_for_sale_inquiry", {
        p_full_name: fullName,
        p_email: email,
        p_offer: offer,
        p_message: message,
        p_user_id: user?.auth_id,
        p_seller_id: contactInfo.created_by_id,
      });

      if (error) throw error.message;

      setFullName("");
      setEmail("");
      setOffer(0);
      setMessage("");
      dispatch(toggleModal({ key: "contactSellerModal", value: false }));
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }

    setSubmitLoading(false);
  }

  const fieldErrors = [
    {
      fieldKey: "fullName",
      warningText:
        fullName.length == 1 ? "C'mon now, that ain't your name" : "Add your name",
      active: fullName === "" || fullName.length == 1,
      onClick: (e) => {
        e.preventDefault();
        fullNameRef.current.scrollIntoView(smoothScrollOptions);
      },
    },
    {
      fieldKey: "email",
      warningText: "Add a valid email",
      active: !isValidEmail(email),
      onClick: (e) => {
        e.preventDefault();
        emailRef.current.scrollIntoView(smoothScrollOptions);
      },
    },
    {
      fieldKey: "offer",
      warningText: offer == 0 ? "Your offer cannot be $0" : "Add your offer",
      active: !offer || offer == 0,
      onClick: (e) => {
        e.preventDefault();
        offerRef.current.scrollIntoView(smoothScrollOptions);
      },
    },
    {
      fieldKey: "message",
      warningText: "Add a message for the buyer",
      active: message === "",
      onClick: (e) => {
        e.preventDefault();
        messageRef.current.scrollIntoView(smoothScrollOptions);
      },
    },
  ];

  const submitDisabled = !fullName || !isValidEmail(email) || !offer || submitLoading;

  return (
    <>
      <div className="contact-seller modal">
        {error && (
          <ErrorBanner
            error={error.toString()}
            handleCloseBanner={() => setError(null)}
          />
        )}
        <div className="header">
          <h3>Contact this Seller</h3>
        </div>
        <div className="content">
          <form className="standard" onSubmit={handleSubmit}>
            <div
              ref={fullNameRef}
              className={`form-group ${markedFieldKey === "fullName" ? "marked" : ""}`}
            >
              <label htmlFor="full-name">Your Full Name</label>
              <input
                placeholder="Full Name"
                id="full-name"
                onChange={(e) => setFullName(e.target.value)}
                value={fullName}
              />
            </div>
            <div
              ref={emailRef}
              className={`form-group ${markedFieldKey === "email" ? "marked" : ""}`}
            >
              <label htmlFor="email">Your Email</label>
              <input
                placeholder="Email"
                id="email"
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>
            <div
              ref={offerRef}
              className={`form-group ${markedFieldKey === "offer" ? "marked" : ""}`}
            >
              <label htmlFor="offer">Offer</label>
              <div className="input-container">
                <input
                  onChange={(e) => setOffer(parseFloat(e.target.value))}
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
            <div
              ref={messageRef}
              className={`form-group ${markedFieldKey === "message" ? "marked" : ""}`}
            >
              <label htmlFor="message">Message to seller about this listing</label>
              <textarea
                placeholder="Message"
                id="message"
                onChange={(e) => setMessage(e.target.value)}
                value={message}
              />
            </div>

            {fieldErrors.filter((fieldError) => fieldError.active).length >= 1 && (
              <FieldErrorButtons
                fieldErrors={fieldErrors}
                setMarkedFieldKey={setMarkedFieldKey}
              />
            )}

            {user ? (
              <button type="submit" disabled={submitDisabled}>
                {submitLoading ? "Submitting..." : "Submit"}
              </button>
            ) : (
              <LoginPrompt message={"to contact this seller"} />
            )}
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
