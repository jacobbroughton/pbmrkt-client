import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import { smoothScrollOptions } from "../../../utils/constants";
import { supabase } from "../../../utils/supabase";
import { isValidEmail } from "../../../utils/usefulFunctions";
import { FieldErrorButtons } from "../FieldErrorButtons/FieldErrorButtons";
import { ModalOverlay } from "../ModalOverlay/ModalOverlay";
import { LoginPrompt } from "../LoginPrompt/LoginPrompt";
import "./ContactBuyerModal.css";
import { useNotification } from "../../../hooks/useNotification";
import { ErrorBanner } from "../ErrorBanner/ErrorBanner";

const ContactBuyerModal = ({ contactInfo }) => {
  const { createNotification } = useNotification();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [fullName, setFullName] = useState(
    user ? user.first_name + " " + user.last_name : ""
  );
  const [email, setEmail] = useState(user ? user.email : "");
  const [price, setPrice] = useState(Math.floor(Math.random() * 1000));
  const [message, setMessage] = useState("Hi, i would like to buy this");
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [markedFieldKey, setMarkedFieldKey] = useState(null);

  const fullNameRef = useRef(null);
  const emailRef = useRef(null);
  const priceRef = useRef(null);
  const messageRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!price || !email || !name || !message) return;

    setSubmitLoading(true);
    try {
      const response = await fetch("http://localhost:4000/add-wanted-inquiry", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          email: email,
          price: price,
          message: message,
          user_id: user?.auth_id,
          buyer_id: contactInfo.created_by_id,
        }),
      });

      if (!response.ok) {
        throw new Error(
          response.statusText || "There was a problem at add-wanted-inquiry"
        );
      }

      await createNotification(
        user?.auth_id,
        contactInfo.created_by_id,
        contactInfo.id,
        5
      );

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
        {error && (
          <ErrorBanner
            error={error.toString()}
            handleCloseBanner={() => setError(null)}
          />
        )}
        <div className="header">
          <h3>Contact this Buyer</h3>
        </div>
        <div className="content">
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

            {user ? (
              <button type="submit" disabled={submitDisabled}>
                {submitLoading ? "Submitting..." : "Submit"}
              </button>
            ) : (
              <LoginPrompt message={"to contact this buyer"} />
            )}
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
