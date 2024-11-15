import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import "./EditListingModal.css";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../utils/supabase";
import { ModalOverlay } from "../ModalOverlay/ModalOverlay";
import { XIcon } from "../Icons/XIcon";
import { EditIcon } from "../Icons/EditIcon";
import { RadioIcon } from "../Icons/RadioIcon";
import { RadioOptions } from "../RadioOptions/RadioOptions";
import { MagicWand } from "../Icons/MagicWand";
import { useNavigate } from "react-router-dom";
import {
  collapseAllCategoryFolders,
  expandAllCategoryFolders,
  isValidPhoneNumber,
  nestItemCategories,
  nestItemCategoriesExperimental,
  setCategoryChecked,
  toggleCategoryFolder,
} from "../../../utils/usefulFunctions";
import { CategorySelectorModal } from "../CategorySelectorModal/CategorySelectorModal";
import { SortIcon } from "../Icons/SortIcon";
import { SelectCategoryToggle } from "../SelectCategoryToggle/SelectCategoryToggle";
import { ErrorBanner } from "../ErrorBanner/ErrorBanner";

export const EditListingModal = ({ item, setItem }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const formRef = useRef();
  const { user } = useSelector((state) => state.auth);
  const { categorySelectorModalToggled } = useSelector((state) => state.modals);
  const [brand, setBrand] = useState(item.info.brand);
  const [model, setModel] = useState(item.info.model);
  const [price, setPrice] = useState(item.info.price);
  const [condition, setCondition] = useState(item.info.condition);
  const [details, setDetails] = useState(item.info.details);
  const [shipping, setShipping] = useState(item.info.shipping);
  const [trades, setTrades] = useState(item.info.trades);
  const [shippingCost, setShippingCost] = useState(item.info.shipping_cost);
  const [buyerPaysShipping, setBuyerPaysShipping] = useState(item.info.shipping_cost > 0);
  const [negotiable, setNegotiable] = useState(item.info.negotiable);
  const [whatIsThisItem, setWhatIsThisItem] = useState(item.info.what_is_this);
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [radioOptions, setRadioOptions] = useState({
    conditionOptions: [
      { id: 0, value: "Brand New", checked: item.info.condition == "Brand New" },
      { id: 1, value: "Like New", checked: item.info.condition == "Like New" },
      { id: 2, value: "Used", checked: item.info.condition == "Used" },
      {
        id: 3,
        value: "Not Functional",
        checked: item.info.condition == "Not Functional",
      },
    ],
    shippingOptions: [
      {
        id: 0,
        value: "Willing to Ship",
        checked: item.info.shipping == "Willing to Ship",
      },
      { id: 1, value: "Local Only", checked: item.info.shipping == "Local Only" },
    ],
    tradeOptions: [
      {
        id: 0,
        value: "Accepting Trades",
        checked: item.info.trades == "Accepting Trades",
      },
      { id: 1, value: "No Trades", checked: item.info.trades == "No Trades" },
    ],
    negotiableOptions: [
      { id: 0, value: "Firm", checked: item.info.negotiable == "Firm" },
      {
        id: 1,
        value: "OBO/Negotiable",
        checked: item.info.negotiable == "OBO/Negotiable",
      },
    ],
  });
  const [state] = useState(item.info.state);
  const [city] = useState(item.info.city);
  const [newCoverPhotoId, setNewCoverPhotoId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [listedItemID, setListedItemID] = useState(false);
  const [cantFindCity, setCantFindCity] = useState(false);
  const [markedFieldKey, setMarkedFieldKey] = useState(null);

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

  useEffect(() => {
    getItemCategories();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSubmitLoading(true);

      const { data, error } = await supabase.rpc("edit_item", {
        p_item_id: item.info.id,
        p_trades: radioOptions.tradeOptions.find((op) => op.checked).value,
        p_condition: radioOptions.conditionOptions.find((op) => op.checked).value,
        p_details: details,
        p_state: "NC",
        p_model: model,
        p_price: price,
        p_shipping_cost: shippingCost, // TODO - Add this to supabase function
        p_status: "Available",
        p_what_is_this: whatIsThisItem,
        p_shipping: radioOptions.shippingOptions.find((op) => op.checked).value,
        p_negotiable: radioOptions.negotiableOptions.find((op) => op.checked).value,
        p_city: "Matthews",
        p_category_id: categories.saved.selected?.id,
      });

      if (error) throw error.message;

      if (item.info.price != price) {
        // TODO - Add price change here
        const { data, error } = await supabase.rpc("add_price_change", {
          p_item_id: item.info.id,
          p_prev_price: item.info.price,
          p_new_price: price,
          p_prev_shipping_price: item.info.shipping_cost,
          p_new_shipping_price: shippingCost,
          p_user_id: user.auth_id,
        });

        if (error) throw error.message;
      }

      const { data: data2, error: error3 } = supabase.storage
        .from("profile_pictures")
        .getPublicUrl(data[0].profile_picture_path || "placeholders/user-placeholder");

      if (error3) throw error.message;

      setItem({
        info: { ...data[0], profile_picture_url: data2?.publicUrl },
        photos: item.photos,
      });

      setLoading(false);
      dispatch(toggleModal({ key: "editListingModal", value: false }));

      navigate(`/listing/${data[0].id}`);
    } catch (error) {
      console.error(error);
      setError(error.toString());
      setLoading(false);
    }

    // // Old below

    // try {
    //   e.preventDefault();
    //   setLoading(true);

    //   const priceIsNumber = price % 1 != 0 || Number.isInteger(price);

    //   if (!priceIsNumber) throw "Invalid price given";

    //   const { data, error } = await supabase.rpc("edit_item", {
    //     p_item_id: item.info.id,
    //     p_trades: trades,
    //     p_condition: condition,
    //     p_details: details,
    //     p_state: "NC",
    //     p_price: price,
    //     p_shipping_cost: shippingCost, // TODO - Add this to supabase function
    //     p_status: "Available",
    //     p_what_is_this: whatIsThisItem,
    //     p_shipping: shipping,
    //     p_negotiable: negotiable,
    //     p_city: "Matthews",
    //   });

    //   if (error) throw error.message;

    //   if (item.info.price != price) {
    //     // TODO - Add price change here
    //     const { data, error } = await supabase.rpc("add_price_change", {
    //       p_item_id: item.info.id,
    //       p_prev_price: item.info.price,
    //       p_new_price: price,
    //       p_prev_shipping_price: item.info.shipping_cost,
    //       p_new_shipping_price: shippingCost,
    //       p_user_id: user.auth_id,
    //     });

    //     if (error) throw error.message;

    //   }

    //   const { data: data2, error: error3 } = supabase.storage
    //     .from("profile_pictures")
    //     .getPublicUrl(data[0].profile_picture_path || "placeholders/user-placeholder");

    //   if (error3) throw error.message;

    // setItem({
    //   photos: data,
    //   info: { ...data[0], profile_picture_url: data2?.publicUrl },
    // });

    // setItem({
    //   info: { ...data[0], profile_picture_url: data2?.publicUrl },
    //   photos: item.photos,
    // });
    // setLoading(false);
    // dispatch(toggleModal({ key: "editListingModal", value: false }));
    // } catch (error) {
    //   console.error(error);
    //   setError(error.toString());
    // }
  }

  async function getItemCategories() {
    try {
      const { data, error } = await supabase.rpc("get_all_item_categories");

      if (error) throw error.message;

      const { nestedCategories, preSelectedCategory } = nestItemCategoriesExperimental(
        data,
        item.info.category_id
      );

      setCategories({
        draft: {
          ...categories.draft,
          ...(preSelectedCategory && { selected: preSelectedCategory }),
          all: nestedCategories,
        },
        saved: {
          ...categories.saved,
          ...(preSelectedCategory && { selected: preSelectedCategory }),
          all: nestedCategories,
        },
      });

      // setCategories(nestedItemCategories);
    } catch (error) {
      console.error(error);
      setError(error);
    }
  }

  function handleRadioSelect(optionTypeKey, selectedOption) {
    setRadioOptions({
      ...radioOptions,
      [optionTypeKey]: radioOptions[optionTypeKey].map((option) => ({
        ...option,
        checked: option.id == selectedOption.id,
      })),
    });
  }

  const submitDisabled =
    item.info.brand == brand &&
    item.info.model == model &&
    item.info.price == price &&
    item.info.shipping_cost == shippingCost &&
    item.info.condition == condition &&
    item.info.details == details &&
    item.info.shipping == shipping &&
    item.info.trades == trades &&
    item.info.negotiable == negotiable &&
    item.info.what_is_this == whatIsThisItem;

  const noShipping =
    radioOptions.shippingOptions.find((option) => option.checked)?.value == "Local Only";

  const detailsPlaceholderText = `(Example) 
  - Planet Eclipse CS1
  - Comes with a .685 insert, parts kit, tools, barrel sock.
  - Small leak in solenoid area.`;

  return (
    <>
      <div className="modal edit-item">
        {error && (
          <ErrorBanner
            error={error.toString()}
            handleCloseBanner={() => setError(null)}
          />
        )}
        <div className="header">
          <h2>Edit/Modify This Listing</h2>
          <button
            onClick={() => dispatch(toggleModal({ key: "editListingModal", value: false }))}
            type="button"
            className="button close"
          >
            Close <XIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit} id="edit-item-form" ref={formRef}>
          <div className="form-block">
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
                    handleOnClick={() =>
                      dispatch(toggleModal({ key: "categorySelectorModal", value: true }))
                    }
                    label={categories.saved?.selected?.value}
                    noCategorySelected={!categories.saved?.selected}
                    title="Click this to open a menu and select an item category to filter your results on"
                    emptyLabel="No Category Selected"
                  />
                </div>
              </fieldset>

              <fieldset className="radio-form-groups">
                <div
                  className={`form-group ${markedFieldKey == "shipping" ? "marked" : ""}`}
                  ref={shippingRef}
                >
                  <label>
                    Shipping{" "}
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

                <div
                  className={`form-group ${markedFieldKey == "trades" ? "marked" : ""}`}
                  ref={tradesRef}
                >
                  <label>
                    Trades{" "}
                    {generatedFilters.trades && (
                      <span
                        className="auto-completed-span"
                        title="This has been automatically filled out based on your last listing"
                      >
                        <MagicWand />
                      </span>
                    )}
                  </label>

                  <RadioOptions
                    options={radioOptions.tradeOptions}
                    handleRadioOptionClick={(option) =>
                      handleRadioSelect("tradeOptions", option)
                    }
                  />
                </div>
              </fieldset>
              <fieldset className="radio-form-groups">
                <div
                  className={`form-group ${
                    markedFieldKey == "condition" ? "marked" : ""
                  }`}
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
                  className={`form-group ${
                    markedFieldKey == "negotiable" ? "marked" : ""
                  }`}
                >
                  <label>
                    Negotiable{" "}
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
              </fieldset>

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
          <div className="form-block">
            <div className="form-content">
              {noShipping ? (
                <div className="form-group">
                  <label>Shipping</label>
                  <p>No shipping, local only</p>
                </div>
              ) : (
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
              )}

              <fieldset className="prices">
                <div
                  className={`form-group shipping ${
                    markedFieldKey == "price" ? "marked" : ""
                  }`}
                  ref={priceRef}
                >
                  <label>
                    Price of item
                    {noShipping ? "" : ", without shipping"}
                  </label>
                  <div className="input-container">
                    <input
                      onChange={(e) => setPrice(e.target.value)}
                      type="number"
                      step={0.01}
                      value={price}
                      placeholder="Price"
                      className="dollars"
                      required
                    />
                  </div>
                </div>

                {!noShipping && (
                  <div
                    className={`form-group shipping-cost ${
                      buyerPaysShipping ? "" : "disabled"
                    }`}
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
                )}
              </fieldset>
            </div>
          </div>
        </form>
        <div className="controls">
          <button
            type="submit"
            className="button"
            onClick={() => {
              // formRef.current.submit();
            }}
            form="edit-item-form"
          >
            Submit
          </button>
        </div>
      </div>
      {categorySelectorModalToggled && (
        <>
          <CategorySelectorModal
            categories={categories.draft.all}
            setCategories={setCategories}
            handleCategoryClick={(category) => {
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
                saved: categories.draft,
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
            zIndex={7}
            showResultNumbers={false}
          />
          <ModalOverlay
            zIndex={6}
            onClick={() =>
              dispatch(toggleModal({ key: "categorySelectorModal", value: false }))
            }
          />
        </>
      )}
      <ModalOverlay
        zIndex={5}
        onClick={() => {
          dispatch(toggleModal({ key: "editListingModal", value: false }));
        }}
      />
    </>
  );
};
