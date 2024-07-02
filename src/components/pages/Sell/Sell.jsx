import { useCallback, useEffect, useRef, useState } from "react";
import { LoadingOverlay } from "../../ui/LoadingOverlay/LoadingOverlay.jsx";
import { Link, useNavigate } from "react-router-dom";
import "./Sell.css";
import { supabase } from "../../../utils/supabase";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import {
  capitalizeWords,
  collapseAllCategoryFolders,
  expandAllCategoryFolders,
  isValidPhoneNumber,
  nestItemCategories,
  setCategoryChecked,
  toggleCategoryFolder,
} from "../../../utils/usefulFunctions.js";
import { toggleModal } from "../../../redux/modals.js";
import { states, statesAndCities } from "../../../utils/statesAndCities.js";
import { CategorySelectorModal } from "../../ui/CategorySelectorModal/CategorySelectorModal.jsx";
import { TrashIcon } from "../../ui/Icons/TrashIcon";
import { StarIcon } from "../../ui/Icons/StarIcon";
import { Arrow } from "../../ui/Icons/Arrow";
import { RadioOptions } from "../../ui/RadioOptions/RadioOptions.jsx";
import { MagicWand } from "../../ui/Icons/MagicWand.jsx";
import { RadioIcon } from "../../ui/Icons/RadioIcon.jsx";
import { SortIcon } from "../../ui/Icons/SortIcon.jsx";
import { ImagesIcons } from "../../ui/Icons/ImagesIcons.jsx";
import { JumpToIcon } from "../../ui/Icons/JumpToIcon.jsx";
import { MissingUserInfoModal } from "../../ui/MissingUserInfoModal/MissingUserInfoModal.jsx";

const brandArr = [
  "Planet Eclipse",
  "Dye Precision",
  "Empire Paintball",
  "Field One Paintball",
  "DLX Technologies",
  "MacDev",
  "Virtue Paintball",
  "Shocker Paintball",
  "Tiberius Arms",
  "Dangerous Power",
];
const modelArr = [
  "CS2",
  "M3+",
  "Vanquish GT",
  "Luxe X",
  "Etha 2",
  "DSR",
  "Axe Pro",
  "Luxe Ice",
  "Geo 4",
  "CZR",
];

const priceArr = [150, 200, 400, 440, 1300, 1140, 1150, 1900, 800, 241];

const randomBrand = brandArr[Math.floor(Math.random() * brandArr.length)];
const randomModel = modelArr[Math.floor(Math.random() * modelArr.length)];
const randomPrice = priceArr[Math.floor(Math.random() * priceArr.length)];

export const Sell = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const categorySelectorModalToggled = useSelector(
    (state) => state.modals.categorySelectorModalToggled
  );
  const imageInputRef = useRef(null);
  const [imagesUploading, setImagesUploading] = useState(false);
  const [brand, setBrand] = useState(randomBrand);
  const [model, setModel] = useState(randomModel);
  const [price, setPrice] = useState(randomPrice);
  const [details, setDetails] = useState("");
  const [buyerPaysShipping, setBuyerPaysShipping] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [contactPhoneNumber, setContactPhoneNumber] = useState("");
  const [sellerName, setSellerName] = useState("Jacob Broughton");
  const [generatedGroupId, setGeneratedGroupId] = useState(uuidv4());
  const [newCoverPhotoId, setNewCoverPhotoId] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [sellError, setSellError] = useState("");
  const [listedItemID, setListedItemID] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [whatIsThisItem, setWhatIsThisItem] = useState(randomBrand + " " + randomModel);
  const [radioOptions, setRadioOptions] = useState({
    conditionOptions: [
      { id: 0, value: "Brand New", checked: false },
      { id: 1, value: "Like New", checked: false },
      { id: 2, value: "Used", checked: false },
      { id: 3, value: "Not Functional", checked: false },
    ],
    shippingOptions: [
      { id: 0, value: "Willing to Ship", checked: false },
      { id: 1, value: "Local Only", checked: false },
    ],
    tradeOptions: [
      { id: 0, value: "Accepting Trades", checked: false },
      { id: 1, value: "No Trades", checked: false },
    ],
    negotiableOptions: [
      { id: 0, value: "Firm", checked: false },
      { id: 1, value: "OBO/Negotiable", checked: false },
    ],
  });
  const [draggingPhotos, setDraggingPhotos] = useState(false);
  const [numPhotosUploaded, setNumPhotosUploaded] = useState(0);
  const [batchFile, setBatchFile] = useState(null);
  const [state, setState] = useState(null);
  const [city, setCity] = useState(null);
  const [totalPhotos, setTotalPhotos] = useState(null);
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
  // const [selectedCategory, setSelectedCategory] = useState(null);
  const [discardImagesLoading, setDiscardImagesLoading] = useState(false);
  const [cantFindCity, setCantFindCity] = useState(false);

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
    const getItemCategories = async () => {
      try {
        const { data, error } = await supabase.rpc("get_item_categories");

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
        setSellError(error);
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

        if (defaultTrades) {
          localGeneratedFilters.trades = true;
          const correspondingTradesOption = radioOptions.tradeOptions.find(
            (op) => op.value == defaultTrades
          );
          localRadioOptions.tradeOptions = localRadioOptions.tradeOptions.map((op) => {
            return {
              ...op,
              checked: op.value == correspondingTradesOption.value,
            };
          });
        }

        if (defaultShipping) {
          localGeneratedFilters.shipping = true;
          const correspondingShippingOption = radioOptions.shippingOptions.find(
            (op) => op.value == defaultShipping
          );
          localRadioOptions.shippingOptions = localRadioOptions.shippingOptions.map(
            (op) => {
              return {
                ...op,
                checked: op.value == correspondingShippingOption.value,
              };
            }
          );
        }

        if (defaultNegotiable) {
          localGeneratedFilters.negotiable = true;
          const correspondingNegotiableOption = radioOptions.negotiableOptions.find(
            (op) => op.value == defaultNegotiable
          );
          localRadioOptions.negotiableOptions = localRadioOptions.negotiableOptions.map(
            (op) => {
              return {
                ...op,
                checked: op.value == correspondingNegotiableOption.value,
              };
            }
          );
        }

        setRadioOptions(localRadioOptions);
        setGeneratedFilters(localGeneratedFilters);
      } catch (error) {
        console.error(error);
        setSellError(error.toString());
      }
    };

    getDefaultSelections();
    getItemCategories();
  }, []);

  function handleDragEnter(e) {
    e.preventDefault();
    setDraggingPhotos(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setDraggingPhotos(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDraggingPhotos(false);

    if (e.dataTransfer.files) {
      handleImageUpload(e.dataTransfer.files);
    } else {
      throw "Something happened while dropping images";
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSubmitLoading(true);

      const { data, error } = await supabase.rpc("add_item", {
        p_brand: brand,
        p_created_by_id: user.auth_id,
        p_details: details,
        p_state: state,
        p_model: model,
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
      setSubmitLoading(true);
      setListedItemID(data);
      navigate(`/listing/${data}`);
    } catch (error) {
      console.error(error);
      setSellError(error.toString());
      setLoading(false);
    }
  }

  // async function handleBatchFileUploadDrop(file) {
  //   try {
  //     const newFile = await (await fetch(file.name)).arrayBuffer();
  //     if (!file) throw "No batch file provided";

  //     const reader = new FileReader();

  //     reader.onload = function (e) {
  //       const data = e.target.result;
  //       const workbook = read(data);

  //     };

  //     // const workbook = read(file.name);
  //     reader.readAsArrayBuffer(file);
  //   } catch (error) {
  //     setSellError(error.toString());
  //   }
  // }

  let index = 0;
  async function handleImageUpload(imageFiles) {
    try {
      if (imageFiles.length > 5) {
        throw "Too many files uploaded, maximum: 5";
      }

      const tempImages = [];

      setTotalPhotos(imageFiles.length);

      setImagesUploading(true);

      for (let i = 0; i < imageFiles.length; i++) {
        const thisUploadUUID = uuidv4();
        const file = imageFiles[i];
        const { data, error } = await supabase.storage
          .from("item_images")
          .upload(`temp/${user.auth_id}/${generatedGroupId}/${thisUploadUUID}`, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error(error);
          throw error.message;
        }

        const { data: data22, error: error2 } = await supabase.rpc(
          "add_item_photo_temp",
          {
            p_group_id: generatedGroupId,
            p_generated_id: data.id,
            p_full_path: data.fullPath,
            p_path: data.path,
            p_is_cover: i == 0 ? 1 : 0,
            p_created_by_id: user.auth_id,
          }
        );
        if (error2) throw error2.message;

        tempImages.push(data22[0]);

        index += 1;
        setNumPhotosUploaded(index);
      }

      const { data, error } = await supabase.storage
        .from("item_images")
        .list(`temp/${user.auth_id}/${generatedGroupId}/`, {
          limit: 100,
          offset: 0,
        });

      if (error) {
        console.error(error);
        throw error.message;
      }

      setNewCoverPhotoId(data[0].id);
      setPhotos(
        data.map((photo, i) => ({
          ...photo,
          is_cover: i == 0,
        }))
      );

      setImagesUploading(false);
      // }
    } catch (error) {
      console.error(error);
      setSellError(error.toString());
    }
  }

  function handleNewCoverImage(clickedPhoto) {
    setNewCoverPhotoId(clickedPhoto.id);
    setPhotos(
      photos.map((photo) => ({
        ...photo,
        is_cover: photo.id == clickedPhoto.id,
      }))
    );
  }

  function handleStateReset() {
    setImagesUploading(false);
    setBrand(randomBrand);
    setModel(randomModel);
    setPrice(randomPrice);
    setDetails("");
    setContactPhoneNumber("7047708371");
    setSellerName("Jacob Broughton");
    setGeneratedGroupId(uuidv4());
    setNewCoverPhotoId(null);
    setPhotos([]);
    setSellError("");
    setListedItemID(false);
    setLoading(false);
    setWhatIsThisItem(randomBrand + " " + randomModel);
    setRadioOptions({
      conditionOptions: [
        { id: 0, value: "Brand New", checked: false },
        { id: 1, value: "Like New", checked: false },
        { id: 2, value: "Used", checked: false },
        { id: 3, value: "Not Functional", checked: false },
      ],
      shippingOptions: [
        { id: 0, value: "Willing to Ship", checked: false },
        { id: 1, value: "Local Only", checked: false },
      ],
      tradeOptions: [
        { id: 0, value: "Accepting Trades", checked: false },
        { id: 1, value: "No Trades", checked: false },
      ],
      negotiableOptions: [
        { id: 0, value: "Firm", checked: false },
        { id: 1, value: "OBO/Negotiable", checked: false },
      ],
    });
  }

  async function handleImageDelete(image) {
    const { data, error } = await supabase.rpc("delete_temp_image", {
      p_image_name: `temp/${user.auth_id}/${generatedGroupId}/${image.name}`,
    });

    if (error) throw error.message;

    const photosLeft = photos.filter((photo) => photo.id != image.id);

    if (!error) setPhotos(photosLeft);

    if (photosLeft.length === 0 && imageInputRef.current)
      imageInputRef.current.value = "";

    // TODO - need to delete from storage as well
  }

  async function handleDiscardImages(e) {
    try {
      e.preventDefault();
      // todo - need to delete from tables as well
      setDiscardImagesLoading(true);

      const paths = photos.map(
        (photo) => `temp/${user.auth_id}/${generatedGroupId}/${photo.name}`
      );

      const { data, error } = await supabase.storage.from("item_images").remove(paths);

      if (error) {
        console.error(error);
        throw error.message;
      }

      const { error: error2 } = await supabase.rpc("delete_temp_images", {
        p_user_id: user.auth_id,
        p_group_id: generatedGroupId,
      });

      if (error2) throw error2.message;

      setPhotos([]);
      setNumPhotosUploaded(0);
      setDiscardImagesLoading(false);
    } catch (error) {
      console.error(error);
      setSellError(error.toString());
    }
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

  const scrollOptions = { behavior: "smooth", block: "center", inline: "center" };

  const fieldErrors = [
    {
      fieldKey: "images",
      active: false,
      warningText: "You must include at least one photo of the item you're selling",
      // active: photos?.length == 0,
      onClick: (e) => {
        e.preventDefault();
        imagesRef.current.scrollIntoView(scrollOptions);
      },
    },
    {
      fieldKey: "fullName",
      warningText: "You must include your full name",
      // active: !sellerName,
      active: false,
      onClick: (e) => {
        e.preventDefault();
        fullNameRef.current.scrollIntoView(scrollOptions);
      },
    },
    {
      fieldKey: "contactPhoneNumber",
      warningText: "You must include your contact number",
      // active: !contactPhoneNumber,
      active: false,
      onClick: (e) => {
        e.preventDefault();
        contactPhoneNumberRef.current.scrollIntoView(scrollOptions);
      },
    },
    {
      fieldKey: "state",
      warningText: "You must include your state",
      active: !state,
      onClick: (e) => {
        e.preventDefault();
        stateRef.current.scrollIntoView(scrollOptions);
      },
    },
    {
      fieldKey: "city",
      warningText: "You must include your city",
      active: !city,
      onClick: (e) => {
        e.preventDefault();
        cityRef.current.scrollIntoView(scrollOptions);
      },
    },
    {
      fieldKey: "whatIsThis",
      warningText: 'You must include a name for your item (The "What is this" field)',
      active: !whatIsThisItem,
      onClick: (e) => {
        e.preventDefault();
        whatIsThisRef.current.scrollIntoView(scrollOptions);
      },
    },
    {
      fieldKey: "category",
      warningText: "You must include a category for your item",
      active: !categories.saved.selected,
      onClick: (e) => {
        e.preventDefault();
        categoryRef.current.scrollIntoView(scrollOptions);
      },
    },
    {
      fieldKey: "shipping",
      warningText: "You must select an option for shipping",
      active: !radioOptions.shippingOptions.find((option) => option.checked),
      onClick: (e) => {
        e.preventDefault();
        shippingRef.current.scrollIntoView(scrollOptions);
      },
    },
    {
      fieldKey: "trades",
      warningText: "You must select an option for trades",
      active: !radioOptions.tradeOptions.find((option) => option.checked),
      onClick: (e) => {
        e.preventDefault();
        tradesRef.current.scrollIntoView(scrollOptions);
      },
    },
    {
      fieldKey: "condition",
      warningText: "You must select an option for condition",
      active: !radioOptions.conditionOptions.find((option) => option.checked),
      onClick: (e) => {
        e.preventDefault();
        conditionRef.current.scrollIntoView(scrollOptions);
      },
    },
    {
      fieldKey: "negotiable",
      warningText: "You must select an option for how negotiable your price is",
      active: !radioOptions.negotiableOptions.find((option) => option.checked),
      onClick: (e) => {
        e.preventDefault();
        negotiableRef.current.scrollIntoView(scrollOptions);
      },
    },
    {
      fieldKey: "price",
      warningText: "You must select an option for condition",
      active: !price,
      onClick: (e) => {
        e.preventDefault();
        priceRef.current.scrollIntoView(scrollOptions);
      },
    },
    {
      fieldKey: "details",
      warningText: "You must select an option for how negotiable your price is",
      active: !details,
      onClick: (e) => {
        e.preventDefault();
        detailsRef.current.scrollIntoView(scrollOptions);
      },
    },
  ];

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

  const imagesStillUploading = imagesUploading && !numPhotosUploaded;
  const imageSkeletonsShowing = imagesUploading && numPhotosUploaded;

  const missingUserInfo =
    !user.phone_number ||
    !user.first_name ||
    !user.last_name ||
    !user.state ||
    !user.city;

  const noShipping =
    radioOptions.shippingOptions.find((option) => option.checked)?.value == "Local Only";

  let warnings = [];

  const detailsPlaceholderText = `(Example) 
- Planet Eclipse CS1
- Comes with a .685 freak insert, parts kit, tools, barrel sock.
- Small leak in solenoid area. Can still use about 4 pods in a point.`;

  if (!whatIsThisItem) warnings.push("");

  return (
    <>
      <div className="sell">
        {sellError && <p className="error-text">{sellError}</p>}
        <h1>Create a new listing</h1>
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          // className="standard"
        >
          <div className="form-block">
            {/* <div className="header">
              <h2>Photos</h2>
            </div> */}
            <div className="form-content">
              {photos.length != 0 && (
                <div className="selling-item-images">
                  {photos?.map((image) => {
                    return (
                      <div
                        key={image.id}
                        className={`image-container ${
                          image.id == newCoverPhotoId ? "cover" : ""
                        }`}
                        onClick={() => handleNewCoverImage(image)}
                      >
                        {image.is_cover && (
                          <StarIcon title="Marked as 'cover image'. Meaning this image will show in the feed of items for sale, and will be featured on the item listing." />
                        )}
                        <img
                          src={`https://mrczauafzaqkmjtqioan.supabase.co/storage/v1/object/public/item_images/temp/${user.auth_id}/${generatedGroupId}/${image.name}?width=73&height=73`}
                        />
                        {/* <div className="image-overlay">
                      <div className="buttons">
                        <button
                          className="delete-button"
                          type="button"
                          onClick={(e) => handleImageDelete(image)}
                        >
                          Delete
                        </button>
                      </div>
                    </div> */}
                      </div>
                    );
                  })}
                </div>
              )}
              {photos.length == 0 ? (
                <div className="image-input-and-prompt">
                  {(imagesStillUploading || imageSkeletonsShowing) && (
                    <p className="small-text">
                      {numPhotosUploaded}/{totalPhotos} Uploaded
                    </p>
                  )}
                  {imagesStillUploading ? (
                    <div className="image-skeletons">
                      <div className="image-skeleton">&nbsp;</div>
                    </div>
                  ) : imageSkeletonsShowing ? (
                    <div className="image-skeletons">
                      {Array.from(Array(numPhotosUploaded)).map((item, i) => (
                        <div key={i} className="image-skeleton">
                          &nbsp;
                        </div>
                      ))}
                    </div>
                  ) : (
                    <label
                      className={`custom-photo-upload ${
                        markedFieldKey == "images" ? "marked" : ""
                      } ${photos.length > 0 ? "secondary" : ""} ${
                        draggingPhotos ? "dragging" : ""
                      }`}
                      onDragOver={(e) => e.preventDefault()}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      ref={imagesRef}
                    >
                      <ImagesIcons />
                      <div className="text">
                        <p>Add Photos (Up to 5)</p>
                        <p>or drag and drop</p>
                      </div>
                      <input
                        onChange={(e) => handleImageUpload(e.target.files)}
                        type="file"
                        multiple
                        accept=".jpg"
                        name="photos"
                        ref={imageInputRef}
                        capture
                      />
                    </label>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleDiscardImages}
                  className="reset-images-button"
                  disabled={discardImagesLoading}
                >
                  <TrashIcon />{" "}
                  {discardImagesLoading
                    ? "Discarding Images..."
                    : "Discard & Upload New Images"}
                </button>
              )}
            </div>
          </div>

          <div className="form-block">
            <div className="header">
              <h2>Your Info</h2>
            </div>

            <div className="form-content">
              {/* For edit page, copy from here down */}
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
            {/* <MapboxLocationSearch/> */}
            {/* <LeafletLocationSearch /> */}
          </div>

          <div className="form-block">
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
                {/* <label>Examples: 'Planet Eclipse LV1 Dynasty Waffle Cut', 'Valken Rolling Gear Bag', 'Infamous Pro DNA Barrel Kit'</label> */}
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
                  {console.log(categories)}
                  <button
                    onClick={() =>
                      dispatch(toggleModal({ key: "categorySelectorModal", value: true }))
                    }
                    className="select-category-modal-toggle"
                    type="button"
                    title={`Click this to open a menu and select an item category to filter your results on`}
                  >
                    {categories.saved?.selected?.value ?? "No Category Selected"}{" "}
                    <SortIcon />{" "}
                  </button>
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
            <div className="header">
              <h2>Price</h2>
            </div>
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

              {/* </fieldset> */}

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

          {/* <div className="what-the-buyer-sees">
              <p>
                Buyer Sees $
                {(
                  parseFloat(price) +
                    parseFloat(buyerPaysShipping ? shippingCost || 0 : 0) || 0
                ).toLocaleString("en-US")}{" "}
                (${parseFloat(price).toLocaleString("en-US") || 0}
                {buyerPaysShipping && shippingCost
                  ? ` + $${parseFloat(shippingCost).toLocaleString("en-US")} shipping`
                  : " + Free Shipping"})
              </p>
            </div> */}

          {/* For edit page, copy from here up */}

          <div className="submit-container">
            {fieldErrors.filter((fieldError) => fieldError.active).length >= 1 && (
              <div className="field-errors">
                <div className="header">
                  <p className="small-text bold">Complete these to submit</p>
                  <p className="small-text">(Click one to mark it & jump to it)</p>
                </div>
                {fieldErrors
                  .filter((fieldError) => fieldError.active)
                  .map((fieldError) => (
                    <button
                      type="button"
                      onClick={(e) => {
                        fieldError.onClick(e);
                        setMarkedFieldKey(fieldError.fieldKey);
                      }}
                    >
                      {/* <PenIcon /> */}
                      <JumpToIcon />
                      {fieldError.warningText}

                      {/* <div className='jump-to'> */}
                      {/* </div> */}
                    </button>
                  ))}
              </div>
            )}

            {/* {warnings?.map((warning) => (
              <p className="warning"></p>
            ))}
            {photos?.length == 0 && (
              <p className="warning">
                Please upload at least 1 photo of the item you're selling
              </p>
            )} */}
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
                console.log(category);
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
                console.log(categories);
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
            />
          </>
        )}
        {loading && <LoadingOverlay message="Listing your item for sale..." />}
      </div>
      {/* {missingUserInfo && <MissingUserInfoModal />} */}
      {/* <Footer /> */}
    </>
  );
};
