import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { toggleModal } from "../../../redux/modals.js";
import { smoothScrollOptions } from "../../../utils/constants.js";
import { states, statesAndCities } from "../../../utils/statesAndCities.js";
import { supabase } from "../../../utils/supabase";
import {
  capitalizeWords,
  collapseAllCategoryFolders,
  expandAllCategoryFolders,
  isValidPhoneNumber,
  nestItemCategories,
  setCategoryChecked,
  toggleCategoryFolder,
} from "../../../utils/usefulFunctions.js";
import { CategorySelectorModal } from "../../ui/CategorySelectorModal/CategorySelectorModal.jsx";
import { FieldErrorButtons } from "../../ui/FieldErrorButtons/FieldErrorButtons.jsx";
import { Arrow } from "../../ui/Icons/Arrow";
import { MagicWand } from "../../ui/Icons/MagicWand.jsx";
import { RadioIcon } from "../../ui/Icons/RadioIcon.jsx";
import { SortIcon } from "../../ui/Icons/SortIcon.jsx";
import { LoadingOverlay } from "../../ui/LoadingOverlay/LoadingOverlay.jsx";
import { PhotoUpload } from "../../ui/PhotoUpload/PhotoUpload.jsx";
import { RadioOptions } from "../../ui/RadioOptions/RadioOptions.jsx";
import { SelectCategoryToggle } from "../../ui/SelectCategoryToggle/SelectCategoryToggle.jsx";
import "./Sell.css";

const priceArr = [150, 200, 400, 440, 1300, 1140, 1150, 1900, 800, 241];

const randomPrice = priceArr[Math.floor(Math.random() * priceArr.length)];
const initialRadioOptions = {
  conditionOptions: [
    { id: 0, value: "Brand New", title: "Brand New", description: "", checked: false },
    { id: 1, value: "Like New", title: "Like New", description: "", checked: false },
    { id: 2, value: "Used", title: "Used", description: "", checked: true },
    {
      id: 3,
      value: "Not Functional",
      title: "Not Functional",
      description: "",
      checked: false,
    },
  ],
  shippingOptions: [
    {
      id: 0,
      value: "Willing to Ship",
      title: "Yes, I will ship this item if needed",
      description: "",
      checked: true,
    },
    {
      id: 1,
      value: "Local Only",
      title: "No, local meetups only",
      description: "",
      checked: false,
    },
  ],
  tradeOptions: [
    {
      id: 0,
      value: "No Trades",
      title: "No, for sale only",
      description: "",
      checked: true,
    },
    {
      id: 1,
      value: "Accepting Trades",
      title: "Yes, i would consider trade offers",
      description: "",
      checked: false,
    },
  ],
  negotiableOptions: [
    { id: 0, value: "Firm", title: "No, price is firm", description: "", checked: false },
    {
      id: 1,
      value: "OBO/Negotiable",
      title: "OBO/Negotiable",
      description: "",
      checked: true,
    },
  ],
};

export const Sell = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const filters = useSelector((state) => state.filters);
  const categorySelectorModalToggled = useSelector(
    (state) => state.modals.categorySelectorModalToggled
  );
  const [price, setPrice] = useState(null);
  const [details, setDetails] = useState("");
  const [buyerPaysShipping, setBuyerPaysShipping] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [contactPhoneNumber, setContactPhoneNumber] = useState("");
  const [sellerName, setSellerName] = useState(
    user && user.first_name && user.last_name
      ? user.first_name + " " + user.last_name
      : ""
  );
  const [generatedGroupId, setGeneratedGroupId] = useState(uuidv4());
  const [newCoverPhotoId, setNewCoverPhotoId] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");
  const [listedItemID, setListedItemID] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [whatIsThisItem, setWhatIsThisItem] = useState("");
  const [radioOptions, setRadioOptions] = useState(initialRadioOptions);
  const photosRef = useRef(null);

  const [state, setState] = useState(null);
  const [city, setCity] = useState(null);
  const [markedFieldKey, setMarkedFieldKey] = useState(null);
  const [generatedFilters, setGeneratedFilters] = useState({
    phoneNumber: false,
    city: false,
    state: false,
    shipping: false,
    trades: false,
    negotiable: false,
  });
  const [categories, setCategories] = useState({
    draft: {
      all: null,
      selected: null,
    },
    saved: {
      all: null,
      selected: null,
    },
  });

  const [cantFindCity, setCantFindCity] = useState(false);
  const [acceptedTrades, setAcceptedTrades] = useState("");

  const submitDisabled =
    submitLoading ||
    !isValidPhoneNumber(contactPhoneNumber) ||
    !categories.saved?.selected ||
    photos.length == 0 ||
    !state ||
    !city ||
    !radioOptions.conditionOptions.find((option) => option.checked) ||
    !radioOptions.shippingOptions.find((option) => option.checked) ||
    !radioOptions.tradeOptions.find((option) => option.checked) ||
    !radioOptions.negotiableOptions.find((option) => option.checked);

  // * Form group refs
  const imagesRef = useRef(null);
  const fullNameRef = useRef(null);
  const contactPhoneNumberRef = useRef(null);
  const stateRef = useRef(null);
  const cityRef = useRef(null);
  const whatIsThisRef = useRef(null);
  const categoryRef = useRef(null);
  const shippingRef = useRef(null);
  const tradesRef = useRef(null);
  const conditionRef = useRef(null);
  const negotiableRef = useRef(null);
  const detailsRef = useRef(null);
  const priceRef = useRef(null);
  const shippingCostRef = useRef(null);

  useEffect(() => {
    const getItemCategories = async () => {
      try {
        const { data, error } = await supabase.rpc("get_all_item_categories");

        if (error) throw error.message;

        const nestedItemCategories = nestItemCategories(data, null);

        setCategories({
          draft: {
            ...categories.draft,
            all: nestedItemCategories,
          },
          saved: {
            ...categories.saved,
            all: nestedItemCategories,
          },
        });
      } catch (error) {
        console.error(error);
        setError(error);
      }
    };

    const getDefaultSelections = async () => {
      try {
        const { data, error } = await supabase.rpc("get_default_seller_inputs", {
          p_user_id: user.auth_id,
        });

        if (error) throw error.message;

        if (!data[0]) return;

        const {
          phone_number: defaultPhoneNumber,
          state: defaultState,
          city: defaultCity,
          trades: defaultTrades,
          shipping: defaultShipping,
          negotiable: defaultNegotiable,
        } = data[0];

        let localGeneratedFilters = { ...generatedFilters };
        let localRadioOptions = { ...radioOptions };

        if (defaultPhoneNumber) {
          localGeneratedFilters.phoneNumber = defaultPhoneNumber;
          setContactPhoneNumber(defaultPhoneNumber);
        }

        if (defaultState) {
          localGeneratedFilters.state = true;
          setState(defaultState);
        }
        if (defaultState && defaultCity) {
          localGeneratedFilters.city = true;
          setCity(capitalizeWords(defaultCity));
        }

        setRadioOptions(localRadioOptions);
        setGeneratedFilters(localGeneratedFilters);
      } catch (error) {
        console.error(error);
        setError(error.toString());
      }
    };

    getDefaultSelections();
    getItemCategories();
  }, []);

  useEffect(() => {
    if (
      markedFieldKey == "category" ||
      markedFieldKey == "condition" ||
      details != "" ||
      whatIsThisItem != "" ||
      price != "" ||
      (buyerPaysShipping && !shippingCost)
    ) {
      setMarkedFieldKey(null);
    }
  }, [
    categories.saved.selected,
    radioOptions.conditionOptions,
    details,
    whatIsThisItem,
    price,
    buyerPaysShipping,
    shippingCost,
  ]);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSubmitLoading(true);

      const { data, error } = await supabase.rpc("add_item", {
        p_created_by_id: user.auth_id,
        p_details: details,
        p_state: state,
        p_price: price,
        p_status: "Available",
        p_what_is_this: whatIsThisItem,
        p_shipping: radioOptions.shippingOptions.find((op) => op.checked).value,
        p_trades: radioOptions.tradeOptions.find((op) => op.checked).value,
        p_negotiable: radioOptions.negotiableOptions.find((op) => op.checked).value,
        p_condition: radioOptions.conditionOptions.find((op) => op.checked).value,
        p_shipping_cost: shippingCost,
        p_city: city || null,
        p_category_id: categories.saved?.selected?.id,
        p_accepted_trades: acceptedTrades,
      });

      if (error) {
        console.error(error);
        throw error.message;
      }

      if (!data) throw "no response from 'add_item'";

      if (newCoverPhotoId) {
        const { error } = await supabase.rpc("update_cover_photo", {
          p_item_id: data,
          p_image_id: newCoverPhotoId,
        });

        if (error) {
          console.error(error);
          throw error.message;
        }
      }

      const imagePaths = photos.map(
        (photo) => `${user.auth_id}/${generatedGroupId}/${photo.name}`
      );

      const { data: movedImagesFromTempTableData, error: error2 } = await supabase.rpc(
        "move_item_images_from_temp",
        { p_item_id: data, p_group_id: generatedGroupId }
      );

      if (error2) throw error2.message;

      imagePaths.forEach(async (path) => {
        const { error } = await supabase.storage
          .from("item_images")
          .move(`temp/${path}`, `saved/${path}`);
        if (error) throw error.message;
      });
      setListedItemID(data);
      navigate(`/listing/${data}`);
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }
    finally {
      setSubmitLoading(false)
      setLoading(false);
    }
  }

  function handleStateReset() {
    // setImagesUploading(false);
    setPrice(randomPrice);
    setDetails("");
    setContactPhoneNumber("7047708371");
    setSellerName("Jacob Broughton");
    setGeneratedGroupId(uuidv4());
    setNewCoverPhotoId(null);
    setPhotos([]);
    setError("");
    setListedItemID(false);
    setLoading(false);
    setRadioOptions(initialRadioOptions);
  }

  function handleRadioSelect(optionTypeKey, selectedOption) {
    if (
      optionTypeKey == "shippingOptions" &&
      selectedOption.value == "Local Only" &&
      buyerPaysShipping
    ) {
      setBuyerPaysShipping(false);
      setShippingCost(0);
    }
    setRadioOptions({
      ...radioOptions,
      [optionTypeKey]: radioOptions[optionTypeKey].map((option) => ({
        ...option,
        checked: option.id == selectedOption.id,
      })),
    });
  }

  const currentYear = new Date().getFullYear();
  const yearOptions = [];

  for (let i = currentYear + 2; i > currentYear + 2 - 100; i--) {
    yearOptions.push(i);
  }

  const fieldErrors = [
    {
      fieldKey: "images",
      warningText: "Include at least one photo of the item you're selling",
      active: photos?.length == 0,
      onClick: (e) => {
        e.preventDefault();
        imagesRef.current.scrollIntoView(smoothScrollOptions);
      },
    },
    {
      fieldKey: "fullName",
      warningText: "Include your full name",
      // active: !sellerName,
      active: false,
      onClick: (e) => {
        e.preventDefault();
        fullNameRef.current.scrollIntoView(smoothScrollOptions);
      },
    },
    {
      fieldKey: "contactPhoneNumber",
      warningText: "Include your contact number",
      // active: !contactPhoneNumber,
      active: false,
      onClick: (e) => {
        e.preventDefault();
        contactPhoneNumberRef.current.scrollIntoView(smoothScrollOptions);
      },
    },
    {
      fieldKey: "state",
      warningText: "Include your state",
      active: !state,
      onClick: (e) => {
        e.preventDefault();
        stateRef.current.scrollIntoView(smoothScrollOptions);
      },
    },
    {
      fieldKey: "city",
      warningText: "Include your city",
      active: !city,
      onClick: (e) => {
        e.preventDefault();
        cityRef.current.scrollIntoView(smoothScrollOptions);
      },
    },
    {
      fieldKey: "whatIsThis",
      warningText: 'Include a name for your item (The "What is this" field)',
      active: !whatIsThisItem,
      onClick: (e) => {
        e.preventDefault();
        whatIsThisRef.current.scrollIntoView(smoothScrollOptions);
      },
    },
    {
      fieldKey: "category",
      warningText: "Select the most accurate category for your item",
      active: !categories.saved.selected,
      onClick: (e) => {
        e.preventDefault();
        categoryRef.current.scrollIntoView(smoothScrollOptions);
      },
    },
    {
      fieldKey: "shipping",
      warningText: "Select whether you'll be willing to ship or not",
      active: !radioOptions.shippingOptions.find((option) => option.checked),
      onClick: (e) => {
        e.preventDefault();
        shippingRef.current.scrollIntoView(smoothScrollOptions);
      },
    },
    {
      fieldKey: "trades",
      warningText: "Select an option for 'Trades'",
      active: !radioOptions.tradeOptions.find((option) => option.checked),
      onClick: (e) => {
        e.preventDefault();
        tradesRef.current.scrollIntoView(smoothScrollOptions);
      },
    },
    {
      fieldKey: "condition",
      warningText: "Select an option for 'Condition'",
      active: !radioOptions.conditionOptions.find((option) => option.checked),
      onClick: (e) => {
        e.preventDefault();
        conditionRef.current.scrollIntoView(smoothScrollOptions);
      },
    },
    {
      fieldKey: "negotiable",
      warningText: "Select an option for how negotiable your price is",
      active: !radioOptions.negotiableOptions.find((option) => option.checked),
      onClick: (e) => {
        e.preventDefault();
        negotiableRef.current.scrollIntoView(smoothScrollOptions);
      },
    },
    {
      fieldKey: "price",
      warningText: "Add a price for your item",
      active: !price,
      onClick: (e) => {
        e.preventDefault();
        priceRef.current.scrollIntoView(smoothScrollOptions);
      },
    },
    {
      fieldKey: "shippingCost",
      warningText: "Add the extra cost of shipping that the buyer will need to pay",
      active: buyerPaysShipping && !shippingCost,
      onClick: (e) => {
        e.preventDefault();
        shippingCostRef.current.scrollIntoView(smoothScrollOptions);
      },
    },
    {
      fieldKey: "details",
      warningText: "Add some details about your item",
      active: !details,
      onClick: (e) => {
        e.preventDefault();
        detailsRef.current.scrollIntoView(smoothScrollOptions);
      },
    },
  ];

  let warnings = [];

  const noShipping =
    radioOptions.shippingOptions.find((option) => option.checked)?.value == "Local Only";

  // const tradeWindowShowing =
  //   radioOptions.tradeOptions.find((option) => option.checked)?.value ==
  //   "Accepting Trades";

  const detailsPlaceholderText = `(Example) 
- Planet Eclipse CS1
- Comes with a .685 insert, parts kit, tools, barrel sock.
- Small leak in solenoid area`;

  if (!whatIsThisItem) warnings.push("");

  return (
    <>
      <div className="sell">
        {error && <p className="error-text">{error.toString()}</p>}
        <h1>Create a new listing</h1>
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          // className="standard"
        >
          <PhotoUpload
            ref={photosRef}
            isForWantedItem={false}
            generatedGroupId={generatedGroupId}
            photos={photos}
            setPhotos={setPhotos}
            markedFieldKey={markedFieldKey}
            newCoverPhotoId={newCoverPhotoId}
            setNewCoverPhotoId={setNewCoverPhotoId}
            setError={setError}
          />

          <div className="form-block seller-info">
            <div className="header">
              <h2>Your Info</h2>
            </div>

            <div className="form-content">
              <fieldset>
                <div
                  className={`form-group ${markedFieldKey == "fullName" ? "marked" : ""}`}
                  ref={fullNameRef}
                >
                  <label>Full Name (First/Last)</label>
                  <input
                    onChange={(e) => setSellerName(e.target.value)}
                    value={sellerName}
                    placeholder="Seller's Name"
                    required
                  />
                </div>
                <div
                  className={`form-group ${
                    markedFieldKey == "contactPhoneNumber" ? "marked" : ""
                  }`}
                  ref={contactPhoneNumberRef}
                >
                  <label>Contact Phone Number </label>
                  <input
                    type="tel"
                    onChange={(e) => setContactPhoneNumber(e.target.value)}
                    value={contactPhoneNumber}
                    placeholder="Contact Phone Number"
                    required
                  />
                  {contactPhoneNumber && !isValidPhoneNumber(contactPhoneNumber) && (
                    <p className="small-text error-text">Invalid phone number</p>
                  )}
                </div>
              </fieldset>

              <fieldset>
                <div
                  className={`form-group ${markedFieldKey == "state" ? "marked" : ""}`}
                  ref={stateRef}
                >
                  <label>
                    State
                    {state && generatedFilters.state && (
                      <span
                        className="auto-completed-span"
                        title="This has been automatically filled out based on your last listing"
                      >
                        <MagicWand />
                      </span>
                    )}
                  </label>
                  <div className="select-container">
                    <select
                      onChange={(e) =>
                        setState(
                          ["All", "Select One"].includes(e.target.value)
                            ? null
                            : e.target.value
                        )
                      }
                      value={state}
                    >
                      {["Select One", ...states].map((childState) => (
                        <option value={childState} key={childState}>
                          {childState}
                        </option>
                      ))}
                    </select>
                    <SortIcon />
                  </div>
                </div>
                <div
                  className={`form-group  ${markedFieldKey == "city" ? "marked" : ""} ${
                    !state ? "disabled" : ""
                  }`}
                  ref={cityRef}
                >
                  <label>
                    City
                    {city && generatedFilters.city && (
                      <span
                        className="auto-completed-span"
                        title="This has been automatically filled out based on your last listing"
                      >
                        <MagicWand />
                      </span>
                    )}
                  </label>
                  {cantFindCity ? (
                    <>
                      <input
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Enter your city"
                      />{" "}
                      <button
                        className="cant-find-city-toggle"
                        type="button"
                        onClick={() => setCantFindCity(false)}
                      >
                        <Arrow direction={"left"} /> Go back
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="select-container">
                        <select
                          disabled={!state}
                          onChange={(e) =>
                            setCity(
                              ["All", "Select One"].includes(e.target.value)
                                ? null
                                : e.target.value
                            )
                          }
                          value={city?.toUpperCase()}
                        >
                          {statesAndCities[state]?.map((innerCity) => (
                            <option value={innerCity}>
                              {capitalizeWords(innerCity)}
                            </option>
                          ))}
                        </select>
                        <SortIcon />
                      </div>
                      <button
                        onClick={() => setCantFindCity(true)}
                        className="cant-find-city-toggle"
                      >
                        Can't find your city?
                      </button>
                    </>
                  )}
                </div>
              </fieldset>
            </div>
          </div>

          <div className="form-block item-details">
            <div className="header">
              <h2>Item Details</h2>
            </div>
            <div className="form-content">
              <div
                className={`form-group ${
                  markedFieldKey == "whatIsThis" ? "marked" : ""
                } required`}
                ref={whatIsThisRef}
              >
                <label title="Please be descriptive, but don't keyword-stuff. I recommend using as few words as possible to best describe what you're selling.">
                  What is this item?
                </label>
                <input
                  onChange={(e) => setWhatIsThisItem(e.target.value)}
                  value={whatIsThisItem}
                  placeholder='e.g. "GI Cut Planet Eclipse LV1"'
                />
              </div>
              <fieldset>
                <div
                  className={`form-group ${markedFieldKey == "category" ? "marked" : ""}`}
                  ref={categoryRef}
                >
                  <label>Select the most accurate category for this item</label>

                  <SelectCategoryToggle
                    label={categories.saved?.selected?.plural_name}
                    handleOnClick={() =>
                      dispatch(toggleModal({ key: "categorySelectorModal", value: true }))
                    }
                    noCategorySelected={categories.saved?.selected == null}
                    title="Click this to open a menu and select an item category to filter your results on"
                    emptyLabel="No Category Selected"
                  />
                </div>
              </fieldset>

              <div
                className={`form-group ${markedFieldKey == "condition" ? "marked" : ""}`}
                ref={conditionRef}
              >
                <label>Condition</label>

                <RadioOptions
                  options={radioOptions.conditionOptions}
                  handleRadioOptionClick={(option) =>
                    handleRadioSelect("conditionOptions", option)
                  }
                />
              </div>

              <div
                className={`form-group ${markedFieldKey == "details" ? "marked" : ""}`}
                ref={detailsRef}
              >
                <label>
                  Add some details to help the buyer understand what you're selling.
                  (what's included, condition details, etc.)
                </label>
                <textarea
                  onChange={(e) => setDetails(e.target.value)}
                  value={details}
                  placeholder={detailsPlaceholderText}
                />
              </div>
            </div>
          </div>

          <div className="form-block price">
            <div className="header">
              <h2>Price & Shipping</h2>
            </div>
            <div className="form-content">
              <div
                className={`form-group shipping ${
                  markedFieldKey == "price" ? "marked" : ""
                }`}
                ref={priceRef}
              >
                <label>Price (Not including shipping cost)</label>
                <div className="input-container">
                  <input
                    onChange={(e) => setPrice(e.target.value)}
                    type="number"
                    step={0.01}
                    value={price}
                    placeholder="11.50"
                    className="dollars"
                    required
                  />
                </div>
              </div>

              <div
                className={`form-group ${markedFieldKey == "negotiable" ? "marked" : ""}`}
              >
                <label>
                  Is this price negotiable?{" "}
                  {generatedFilters.negotiable && (
                    <span
                      className="auto-completed-span"
                      title="This has been automatically filled out based on your last listing"
                    >
                      <MagicWand />
                    </span>
                  )}
                </label>

                <RadioOptions
                  options={radioOptions.negotiableOptions}
                  handleRadioOptionClick={(option) =>
                    handleRadioSelect("negotiableOptions", option)
                  }
                />
              </div>
              <div
                className={`form-group ${markedFieldKey == "shipping" ? "marked" : ""}`}
                ref={shippingRef}
              >
                <label>
                  Are you willing to ship this item?{" "}
                  {generatedFilters.shipping && (
                    <span
                      className="auto-completed-span"
                      title="This has been automatically filled out based on your last listing"
                    >
                      <MagicWand />
                    </span>
                  )}
                </label>

                <RadioOptions
                  options={radioOptions.shippingOptions}
                  handleRadioOptionClick={(option) =>
                    handleRadioSelect("shippingOptions", option)
                  }
                />
              </div>

              {!noShipping && (
                <>
                  <div className="form-group shipping">
                    <label>Are you covering the shipping cost?</label>
                    <div className="shipping-selector-and-input">
                      <div className="shipping-selector">
                        <button
                          className={`shipping-toggle-button ${
                            !buyerPaysShipping ? "selected" : ""
                          }`}
                          type="button"
                          onClick={() => setBuyerPaysShipping(false)}
                        >
                          <RadioIcon checked={!buyerPaysShipping} /> Free/Included
                        </button>
                        <button
                          className={`shipping-toggle-button ${
                            buyerPaysShipping ? "selected" : ""
                          }`}
                          type="button"
                          onClick={() => setBuyerPaysShipping(true)}
                        >
                          <RadioIcon checked={buyerPaysShipping} /> Buyer Pays
                        </button>
                      </div>
                    </div>
                  </div>
                  <div
                    ref={shippingCostRef}
                    className={`form-group shipping-cost ${
                      buyerPaysShipping ? "" : "disabled"
                    } ${markedFieldKey == "shippingCost" ? "marked" : ""}`}
                    title={
                      buyerPaysShipping
                        ? "Adjust the cost of shipping for this item"
                        : "Toggle 'buyer pays shipping' for this to be interactive"
                    }
                  >
                    <label>
                      {!buyerPaysShipping ? "(Disabled)" : ""} Added price of shipping
                    </label>
                    <div className="input-container">
                      <input
                        onChange={(e) => {
                          setShippingCost(e.target.value);
                        }}
                        type="number"
                        step={0.01}
                        value={shippingCost}
                        placeholder="$0"
                        required
                        className="dollars"
                        disabled={!buyerPaysShipping}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="form-block price">
            <div className="header">
              <h2>Trades</h2>
            </div>
            <div className="form-content">
              <div
                className={`form-group ${markedFieldKey == "trades" ? "marked" : ""}`}
                ref={tradesRef}
              >
                <RadioOptions
                  options={radioOptions.tradeOptions}
                  handleRadioOptionClick={(option) =>
                    handleRadioSelect("tradeOptions", option)
                  }
                />
                {radioOptions.tradeOptions.find((option) => option.checked)?.value ==
                  "Accepting Trades" && (
                  <div className="accepting-trades-container">
                    <label>What would you trade for? (Optional)</label>

                    <input
                      placeholder="..."
                      value={acceptedTrades}
                      onChange={(e) => setAcceptedTrades(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="submit-container">
            {fieldErrors.filter((fieldError) => fieldError.active).length >= 1 && (
              <FieldErrorButtons
                fieldErrors={fieldErrors}
                setMarkedFieldKey={setMarkedFieldKey}
              />
            )}

            <button type="submit" disabled={submitDisabled}>
              {submitLoading ? "Submitting" : "Submit"}
            </button>
          </div>
        </form>
        {listedItemID && (
          <>
            <div className="success-modal">
              <h2>Success</h2>
              <Link to={`/${listedItemID}`}>Go To Listing</Link>
              <Link to="/">View All Listings</Link>
              <button onClick={() => handleStateReset()}>Create Another Listing</button>
            </div>
            <div className="success-modal-overlay"></div>
          </>
        )}
        {categorySelectorModalToggled && (
          <>
            <CategorySelectorModal
              categories={categories.draft.all}
              setCategories={setCategories}
              handleCategoryClick={(category) => {
                // setSelectedCategory(category);
                if (category.is_folder) {
                  setCategories({
                    ...categories,
                    draft: {
                      ...categories.draft,
                      all: toggleCategoryFolder(category, categories.draft.all),
                    },
                  });
                } else {
                  setCategories({
                    ...categories,
                    draft: {
                      ...categories.draft,
                      selected: category.checked ? null : category,
                      all: setCategoryChecked(category, categories.draft.all),
                    },
                  });
                }
              }}
              handleModalClick={() => {
                // TODO - reset draft categories
              }}
              handleApply={() => {
                setCategories({
                  ...categories,
                  saved: {
                    all: categories.draft.all,
                    selected: categories.draft.selected,
                  },
                });
                dispatch(toggleModal({ key: "categorySelectorModal", value: false }));
              }}
              applyDisabled={
                categories.draft?.selected?.id == categories.saved?.selected?.id
              }
              handleExpandAll={() => {
                setCategories({
                  ...categories,
                  draft: {
                    ...categories.draft,
                    all: expandAllCategoryFolders(categories.draft.all),
                  },
                });
              }}
              handleCollapseAll={() => {
                setCategories({
                  ...categories,
                  draft: {
                    ...categories.draft,
                    all: collapseAllCategoryFolders(categories.draft.all),
                  },
                });
              }}
              showResultNumbers={false}
              zIndex={3}
            />
          </>
        )}
        {loading && <LoadingOverlay message="Listing your item for sale..." />}
      </div>
    </>
  );
};
