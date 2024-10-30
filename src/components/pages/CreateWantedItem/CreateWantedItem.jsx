import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { toggleModal } from "../../../redux/modals";
import { smoothScrollOptions } from "../../../utils/constants";
import { supabase } from "../../../utils/supabase";
import { states, statesAndCities } from "../../../utils/statesAndCities.js";
import {
  capitalizeWords,
  collapseAllCategoryFolders,
  expandAllCategoryFolders,
  isValidPhoneNumber,
  nestItemCategories,
  setCategoryChecked,
  toggleCategoryFolder,
} from "../../../utils/usefulFunctions";
import { CategorySelectorModal } from "../../ui/CategorySelectorModal/CategorySelectorModal";
import { FieldErrorButtons } from "../../ui/FieldErrorButtons/FieldErrorButtons";
import { PhotoUpload } from "../../ui/PhotoUpload/PhotoUpload";
import { RadioOptions } from "../../ui/RadioOptions/RadioOptions";
import { SelectCategoryToggle } from "../../ui/SelectCategoryToggle/SelectCategoryToggle";
import "./CreateWantedItem.css";
import { SortIcon } from "../../ui/Icons/SortIcon";
import { MagicWand } from "../../ui/Icons/MagicWand.jsx";
import { Arrow } from "../../ui/Icons/Arrow.jsx";

export const CreateWantedItem = () => {
  const filters = useSelector((state) => state.filters);
  const { categorySelectorModalToggled } = useSelector((state) => state.modals);
  const { user } = useSelector((state) => state.auth);

  console.log(user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const whatIsItRef = useRef(null);
  const budgetRef = useRef(null);
  const categoryRef = useRef(null);
  const photosRef = useRef(null);
  const fullNameRef = useRef(null);
  const contactPhoneNumberRef = useRef(null);
  const stateRef = useRef(null);
  const cityRef = useRef(null);

  const [state, setState] = useState(null);
  const [city, setCity] = useState(null);
  const [contactPhoneNumber, setContactPhoneNumber] = useState("");
  const [sellerName, setSellerName] = useState(
    user && user.first_name && user.last_name
      ? user.first_name + " " + user.last_name
      : ""
  );
  const [generatedGroupId, setGeneratedGroupId] = useState(uuidv4());
  const [newCoverPhotoId, setNewCoverPhotoId] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [markedFieldKey, setMarkedFieldKey] = useState(null);
  const [whatIsIt, setWhatIsIt] = useState("");
  const [radioOptions, setRadioOptions] = useState({
    shippingOptions: [
      {
        id: 0,
        value: "Ok with shipping",
        title: "I am ok with someone shipping this item to me",
        description: "",
        checked: true,
      },
      {
        id: 1,
        value: "Local Only",
        title: "No, I want to meet up in-person",
        description: "",
        checked: false,
      },
    ],
  });

  const [budget, setBudget] = useState(null);
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
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
  const [generatedFilters, setGeneratedFilters] = useState({
    phoneNumber: false,
    city: false,
    state: false,
    shipping: false,
    trades: false,
    negotiable: false,
  });

  const [cantFindCity, setCantFindCity] = useState(false);

  const fieldErrors = [
    {
      fieldKey: "whatIsIt",
      warningText: "Include a summary (one line) for this item",
      active: !whatIsIt,
      onClick: (e) => {
        e.preventDefault();
        whatIsItRef.current.scrollIntoView(smoothScrollOptions);
      },
    },
    {
      fieldKey: "category",
      warningText: "Select a category",
      active: !categories.saved.selected,
      onClick: (e) => {
        e.preventDefault();
        categoryRef.current.scrollIntoView(smoothScrollOptions);
      },
    },
    {
      fieldKey: "budget",
      warningText: "Add your budget",
      active: !budget,
      onClick: (e) => {
        e.preventDefault();
        budgetRef.current.scrollIntoView(smoothScrollOptions);
      },
    },
  ];

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const checkedShippingValue = radioOptions.shippingOptions.find((op) => op.checked);
      let okWithShipping = checkedShippingValue.value === "Ok with shipping";
      const {
        data: [createdWantedItem],
        error,
      } = await supabase.rpc("add_wanted_item", {
        p_title: whatIsIt,
        p_description: description,
        p_budget: budget,
        p_shipping_ok: okWithShipping,
        p_category_id: categories.saved.selected?.id,
        p_created_by_id: user.auth_id,
        p_state: state,
        p_city: city,
      });

      if (error) throw error.message;

      if (!createdWantedItem) throw new Error("No new wanted post was created");

      if (newCoverPhotoId) {
        const { error } = await supabase.rpc("update_wanted_cover_photo", {
          p_item_id: createdWantedItem.id,
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
        "move_wanted_item_images_from_temp",
        { p_item_id: createdWantedItem.id, p_group_id: generatedGroupId }
      );

      if (error2) throw error2.message;

      imagePaths.forEach(async (path) => {
        const { error } = await supabase.storage
          .from("wanted_item_images")
          .move(`temp/${path}`, `saved/${path}`);
        if (error) throw error.message;
      });

      console.log("add_item_request", createdWantedItem);
      navigate(`/wanted/${createdWantedItem.id}`);
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }
  }

  useEffect(() => {
    console.log(markedFieldKey);
    if (
      (markedFieldKey == "whatIsIt" && whatIsIt != "") ||
      (markedFieldKey == "budget" && budget) ||
      (markedFieldKey == "category" && categories.saved.selected)
    )
      setMarkedFieldKey(null);
  }, [whatIsIt, budget, categories.saved.selected?.id, markedFieldKey]);

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

  const submitDisabled = !whatIsIt || !budget;

  return (
    <div className="create-wanted-item">
      {error && <p className="error-text small-text">{error}</p>}
      <h1>Create Wanted Post</h1>
      <form onSubmit={handleSubmit}>
        <PhotoUpload
          ref={photosRef}
          isForWantedItem={true}
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
                          <option value={innerCity}>{capitalizeWords(innerCity)}</option>
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
        <div className="form-block">
          <div className="header">
            <h2>Item Info</h2>
          </div>
          <div className="form-content">
            <div
              className={`form-group ${markedFieldKey == "whatIsIt" ? "marked" : ""}`}
              ref={whatIsItRef}
            >
              <label>What are you looking for?</label>
              <input
                placeholder="What you're looking for"
                value={whatIsIt}
                onChange={(e) => setWhatIsIt(e.target.value)}
              />
            </div>

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

            <div
              className={`form-group ${markedFieldKey == "budget" ? "marked" : ""}`}
              ref={budgetRef}
            >
              <label>Enter your budget (optional)</label>
              <div className="input-container">
                <input
                  onChange={(e) => setBudget(parseFloat(e.target.value))}
                  type="number"
                  step={0.01}
                  value={budget}
                  placeholder="Budget"
                  className="dollars"
                  id="budget"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Describe what you're looking for (optional)</label>
              <textarea
                placeholder="..."
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Are you open to shipping?</label>
              <RadioOptions
                options={radioOptions.shippingOptions}
                handleRadioOptionClick={(clickedOption) =>
                  setRadioOptions({
                    ...radioOptions,
                    shippingOptions: radioOptions.shippingOptions.map((option) => {
                      return {
                        ...option,
                        checked: clickedOption.id == option.id,
                      };
                    }),
                  })
                }
              />
            </div>
          </div>
        </div>
        <div className="submit-container">
          {fieldErrors.filter((fieldError) => fieldError.active).length >= 1 ? (
            <FieldErrorButtons
              fieldErrors={fieldErrors}
              setMarkedFieldKey={setMarkedFieldKey}
            />
          ) : (
            false
          )}

          <button type="submit" disabled={submitDisabled}>
            Submit
          </button>
        </div>
      </form>

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
                // setCategories(setCategoryChecked(category, categories));
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
    </div>
  );
};
