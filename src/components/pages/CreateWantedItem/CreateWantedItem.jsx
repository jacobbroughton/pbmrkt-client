import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { toggleModal } from "../../../redux/modals";
import { smoothScrollOptions } from "../../../utils/constants";
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
} from "../../../utils/usefulFunctions";
import { CategorySelectorModal } from "../../ui/CategorySelectorModal/CategorySelectorModal";
import { ErrorBanner } from "../../ui/ErrorBanner/ErrorBanner";
import { FieldErrorButtons } from "../../ui/FieldErrorButtons/FieldErrorButtons";
import { FormSelect } from "../../ui/FormSelect/FormSelect.jsx";
import { Arrow } from "../../ui/Icons/Arrow.jsx";
import { MagicWand } from "../../ui/Icons/MagicWand.jsx";
import PageTitle from "../../ui/PageTitle/PageTitle.jsx";
import { PhotoUpload } from "../../ui/PhotoUpload/PhotoUpload";
import { RadioOptions } from "../../ui/RadioOptions/RadioOptions";
import { SelectCategoryToggle } from "../../ui/SelectCategoryToggle/SelectCategoryToggle";
import "./CreateWantedItem.css";

export const CreateWantedItem = () => {
  const filters = useSelector((state) => state.filters);
  const { categorySelectorModalToggled } = useSelector((state) => state.modals);
  const { user } = useSelector((state) => state.auth);

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

  useEffect(() => {}, []);

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
  const [submitLoading, setSubmitLoading] = useState(false);

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
      setSubmitLoading(true);

      const checkedShippingValue = radioOptions.shippingOptions.find((op) => op.checked);
      let okWithShipping = checkedShippingValue.value === "Ok with shipping";

      const response = await fetch("http://localhost:4000/add-wanted-item", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: whatIsIt,
          description: description,
          budget: budget,
          shipping_ok: okWithShipping,
          category_id: categories.saved.selected?.id,
          created_by_id: user.auth_id,
          state: state,
          city: city,
        }),
      });

      if (!response.ok) throw new Error("Something happened at add-wanted-item");

      const { data: createdWantedItem } = await response.json();

      if (!createdWantedItem) throw new Error("No new wanted post was created");

      if (newCoverPhotoId) {
        const response = await fetch("http://localhost:4000/update-wanted-cover-photo", {
          method: "post",
          headers: {
            "content-type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            item_id: createdWantedItem.id,
            image_id: newCoverPhotoId,
          }),
        });

        if (!response.ok)
          throw new Error("Something happened at update-wanted-cover-photo");

        const { data: coverPhoto } = await response.json();

        if (!coverPhoto)
          throw new Error("Wanted cover photo was not retrieved after update");
      }

      const imagePaths = photos.map(
        (photo) => `${user.auth_id}/${generatedGroupId}/${photo.name}`
      );

      const response2 = await fetch(
        "http://localhost:4000/move-wanted-item-images-from-temp",
        {
          method: "post",
          headers: {
            "content-type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            item_id: createdWantedItem.id,
            group_id: generatedGroupId,
          }),
        }
      );

      if (!response2.ok)
        throw new Error("Something happened at move-wanted-item-images-from-temp");

      const { data: movedImagesFromTempTableData } = await response2.json();

      if (!movedImagesFromTempTableData || movedImagesFromTempTableData.length === 0)
        throw new Error("failed to move temp wanted item images to non-temp");

      imagePaths.forEach(async (path) => {
        const { error } = await supabase.storage
          .from("wanted_item_images")
          .move(`temp/${path}`, `saved/${path}`);
        if (error) throw error.message;
        navigate(`/wanted/${createdWantedItem.id}`);
      });
    } catch (error) {
      console.error(error);
      setError("1" + error.toString());
    } finally {
      setSubmitLoading(false);
    }
  }

  useEffect(() => {
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
        const response = await fetch("http://localhost:4000/get-item-categories");

        if (!response.ok) throw new Error("Something happened get-item-categories");

        const { data: itemCategories } = await response.json();

        if (!itemCategories || !itemCategories.length === 0)
          throw new Error("No item categories were fetched");

        const nestedItemCategories = nestItemCategories(itemCategories, null);

        console.log("Yepppp");

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
        const urlSearchParams = new URLSearchParams({ user_id: user.id }).toString();

        const response = await fetch(
          `http://localhost:4000/get-default-seller-inputs?${urlSearchParams}`
        );

        if (!response.ok) throw new Error("Something happened get-default-seller-inputs");

        const { data: defaultSellerInputs } = await response.json();

        if (!defaultSellerInputs || !defaultSellerInputs.length === 0)
          throw new Error("No default seller inputs were fetched");

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

  const submitDisabled = !whatIsIt || !budget || submitLoading;

  return (
    <main className="create-wanted-item">
      <PageTitle title="Create wanted listing" />
      {error && (
        <ErrorBanner error={error.toString()} handleCloseBanner={() => setError(null)} />
      )}
      <h1>Create a new wanted listing</h1>

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
                <FormSelect
                  options={["Select One", ...states]}
                  selectedOption={state}
                  handleChange={(e) =>
                    setState(
                      ["All", "Select One"].includes(e.target.value)
                        ? null
                        : e.target.value
                    )
                  }
                />
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
                    {/* <div className="select-container">
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
                    </div> */}
                    <FormSelect
                      options={statesAndCities[state]?.map((city) =>
                        capitalizeWords(city)
                      )}
                      selectedOption={city}
                      handleChange={(e) => {
                        setCity(
                          ["All", "Select One"].includes(e.target.value)
                            ? null
                            : e.target.value
                        );
                      }}
                      disabled={!state}
                    />
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
            {submitLoading ? "Submitting" : "Submit"}
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
    </main>
  );
};
