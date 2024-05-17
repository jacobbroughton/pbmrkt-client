import { useDispatch } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import "./EditItemModal.css";
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase";

const EditItemModal = ({ item, setItem }) => {
  const dispatch = useDispatch();
  const [brand, setBrand] = useState(item.info.brand);
  const [model, setModel] = useState(item.info.model);
  const [price, setPrice] = useState(item.info.price);
  const [condition, setCondition] = useState(item.info.condition);
  const [details, setDetails] = useState(item.info.details);
  const [shipping, setShipping] = useState(item.info.shipping);
  const [trades, setTrades] = useState(item.info.trades);
  const [buyerPaysShipping, setBuyerPaysShipping] = useState(
    item.info.buyer_pays_shipping
  );
  const [negotiable, setNegotiable] = useState(item.info.negotiable);
  const [whatIsThisItem, setWhatIsThisItem] = useState(item.info.what_is_this);
  const [loading, setLoading] = useState(false);

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

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.rpc("edit_item", {
      p_item_id: item.info.id,
      p_trades: trades,
      p_brand: brand,
      p_condition: condition,
      p_details: details,
      p_location: "Matthews, NC",
      p_model: model,
      p_price: price,
      p_status: "",
      p_what_is_this: whatIsThisItem,
      p_shipping: shipping,
      p_negotiable: negotiable,
    });

    setItem({ info: data[0], photos: item.photos });
    setLoading(false);
    dispatch(toggleModal({ key: "editItemModal", value: false }));
  }

  const submitDisabled =
    item.info.brand == brand &&
    item.info.model == model &&
    item.info.price == price &&
    item.info.condition == condition &&
    item.info.details == details &&
    item.info.willing_to_ship == shipping &&
    item.info.acceptingTrades == trades &&
    item.info.negotiable == negotiable &&
    item.info.what_is_this == whatIsThisItem;

  return (
    <>
      <div className="modal edit-item">
        <form onSubmit={handleSubmit}>
          <div className="form-block">
            <h2>Item Details</h2>

            <fieldset>
              <div className="form-group">
                <label>What is this item?</label>
                <input
                  onChange={(e) => setWhatIsThisItem(e.target.value)}
                  value={whatIsThisItem}
                  placeholder='e.g. "GI Cut Planet Eclipse LV1"'
                />
              </div>
              <div className="form-group price">
                <label>Price</label>
                <input
                  onChange={(e) => setPrice(e.target.value)}
                  value={price}
                  placeholder="Price"
                  required
                />
              </div>
            </fieldset>

            <fieldset>
              <div className="form-group">
                <label>Brand</label>
                <input
                  onChange={(e) => setBrand(e.target.value)}
                  value={brand}
                  placeholder="Brand"
                  required
                />
              </div>

              <div className="form-group">
                <label>Model</label>
                <input
                  onChange={(e) => setModel(e.target.value)}
                  value={model}
                  placeholder="Model"
                  required
                />
              </div>
            </fieldset>
            {/* <fieldset>


            <div className="form-group">
              <label>Condition</label>
              <select onChange={(e) => setCondition(e.target.value)} value={condition}>
                {radioOptions.conditionOptions.map((condition) => (
                  <option value={condition}>{condition.value}</option>
                ))}
              </select>
            </div>
          </fieldset> */}

            <div className="form-group">
              <label>Details</label>
              <textarea
                onChange={(e) => setDetails(e.target.value)}
                value={details}
                placeholder="Enter some details about the item you're selling"
              />
            </div>

            <fieldset className="radio-form-groups">
              <div className="form-group">
                <label>Shipping</label>
                {/* <select onChange={(e) => setCondition(e.target.value)} value={condition}> */}
                <div className="radio-options">
                  {radioOptions.shippingOptions.map((option) => (
                    // <option value={condition}>{condition.value}</option>
                    <div className="radio-option">
                      <label>
                        <input
                          type="radio"
                          value={option.value}
                          checked={option.value == shipping}
                          onChange={() => setShipping(option.value)}
                        />{" "}
                        {option.value}
                      </label>
                    </div>
                  ))}
                </div>
                {/* </select> */}
              </div>

              <div className="form-group">
                <label>Trades</label>
                <div className="radio-options">
                  {radioOptions.tradeOptions.map((option) => (
                    // <option value={condition}>{condition.value}</option>
                    <div className="radio-option">
                      <label>
                        <input
                          type="radio"
                          value={option.value}
                          checked={option.value == trades}
                          onChange={() => setTrades(option.value)}
                        />{" "}
                        {option.value}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Condition</label>
                <div className="radio-options">
                  {radioOptions.conditionOptions.map((option) => (
                    // <option value={condition}>{condition.value}</option>
                    <div className="radio-option">
                      <label>
                        <input
                          type="radio"
                          value={option.value}
                          checked={option.value == condition}
                          onChange={() => setCondition(option.value)}
                        />{" "}
                        {option.value}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Negotiable</label>
                <div className="radio-options">
                  {radioOptions.negotiableOptions.map((option) => (
                    // <option value={negotiable}>{negotiable.value}</option>
                    <div className="radio-option">
                      <label>
                        <input
                          type="radio"
                          value={option.value}
                          checked={option.value == negotiable}
                          onChange={() => setNegotiable(option.value)}
                        />{" "}
                        {option.value}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </fieldset>
            {/* {imagesUploading ? (
            <p>Images uploading...</p>
            ) : (
              <div className="form-group">
              <label>Photos</label>
              <input
              onChange={(e) => handleImageUpload(e)}
              type="file"
              multiple
              accept=".jpg"
              name="photos"
              ref={imageInputRef}
              />
              </div>
            )} */}
            <div className="horizontal-divider"></div>
            {loading ? (
              <p>Submitting...</p>
            ) : (
              <button type="submit" disabled={submitDisabled}>
                Submit
              </button>
            )}
          </div>

          {/* {photos.length != 0 && (
          <div className="selling-item-images">
            {photos?.map((image, index) => {
              return (
                <div
                  className={`image-container ${image.id == newCoverPhotoId ? "cover" : ""}`}
                  title={image.name}
                >
                  <img
                    src={`https://mrczauafzaqkmjtqioan.supabase.co/storage/v1/object/public/item_images/temp/${user.id}/${generatedGroupId}/${image.name}`}
                  />
                  <button
                    className="delete-button"
                    type="button"
                    onClick={(e) => handleImageDelete(image)}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className="cover-button"
                    onClick={() => handleNewCoverImage(image)}
                  >
                    Cover
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {photos?.length >= 1 ? (
          <button type="submit">Submit</button>
        ) : (
          <p>Please upload at least 1 photo of the item you're selling</p>
        )} */}
        </form>
      </div>
      <div
        className="modal-overlay"
        onClick={() => {
          dispatch(toggleModal({ key: "editItemModal", value: false }));
        }}
      ></div>
    </>
  );
};
export default EditItemModal;
