import { useDispatch, useSelector } from "react-redux";
import { ModalOverlay } from "../ModalOverlay/ModalOverlay";
import "./ContactBuyerModal.css";
import { toggleModal } from "../../../redux/modals";
import { useRef, useState } from "react";
import { isValidEmail } from "../../../utils/usefulFunctions";
import { supabase } from "../../../utils/supabase";
import { PhotoUpload } from "../PhotoUpload/PhotoUpload";
import { FieldErrorButtons } from "../FieldErrorButtons/FieldErrorButtons";
import { smoothScrollOptions } from "../../../utils/constants";

const ContactBuyerModal = ({ contactInfo }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [fullName, setFullName] = useState(
    user ? user.first_name + " " + user.last_name : ""
  );
  const [email, setEmail] = useState(user ? user.email : "");
  const [price, setPrice] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [markedFieldKey, setMarkedFieldKey] = useState(null);

  const fullNameRef = useRef(null);
  const emailRef = useRef(null);
  const priceRef = useRef(null);
  const messageRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();

    setSubmitLoading(true);
    try {
      const { data, error } = await supabase.rpc("add_wanted_contact_inquiry", {
        p_full_name: fullName,
        p_email: email,
        p_price: price,
        p_message: message,
        p_user_id: user?.auth_id,
        p_related_user_id: contactInfo.created_by_id,
      });

      if (error) throw error.message;

      setFullName("");
      setEmail("");
      setPrice(0);
      setMessage("");
      dispatch(toggleModal({ key: "contactBuyerModal", value: false }));
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }

    setSubmitLoading(false);
  }

  const fieldErrors = [
    {
      fieldKey: "fullName",
      warningText: "Add your name",
      active: fullName === "",
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
      fieldKey: "price",
      warningText: "Add a price",
      active: !price || price == 0,
      onClick: (e) => {
        e.preventDefault();
        priceRef.current.scrollIntoView(smoothScrollOptions);
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

  const submitDisabled = !fullName || !isValidEmail(email) || !price || submitLoading;

  return (
    <>
      <div className="contact-buyer modal">
        <div className="header">
          <h3>Contact this Buyer</h3>
        </div>
        <div className="content">
          {error && <p className="error-text small-text">{error.toString()}</p>}
          <form className="standard" onSubmit={handleSubmit}>
            <div
              ref={fullNameRef}
              className={`form-group ${markedFieldKey == "fullName" ? "marked" : ""}`}
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
              className={`form-group ${markedFieldKey == "email" ? "marked" : ""}`}
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
              ref={priceRef}
              className={`form-group ${markedFieldKey == "price" ? "marked" : ""}`}
            >
              <label htmlFor="price">Your Price</label>
              <div className="input-container">
                <input
                  onChange={(e) => setPrice(parseFloat(e.target.value))}
                  type="number"
                  step={0.01}
                  value={price}
                  placeholder="Your Price"
                  className="dollars"
                  id="price"
                  required
                />
              </div>
            </div>
            <div
              ref={messageRef}
              className={`form-group ${markedFieldKey == "message" ? "marked" : ""}`}
            >
              <label htmlFor="message">Message to buyer about this listing</label>
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

            <button type="submit" disabled={submitDisabled}>
              {submitLoading ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
      <ModalOverlay
        onClick={() => dispatch(toggleModal({ key: "contactBuyerModal", value: false }))}
        zIndex={6}
      />
    </>
  );
};
export default ContactBuyerModal;
