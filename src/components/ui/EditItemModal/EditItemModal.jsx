import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import "./EditItemModal.css";
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase";

const EditItemModal = ({ item, setItem }) => {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.auth)
  const [brand, setBrand] = useState(item.info.brand);
  const [model, setModel] = useState(item.info.model);
  const [price, setPrice] = useState(item.info.price);
  const [condition, setCondition] = useState(item.info.condition);
  const [details, setDetails] = useState(item.info.details);
  const [shipping, setShipping] = useState(item.info.shipping);
  const [trades, setTrades] = useState(item.info.trades);
  const [shippingCost, setShippingCost] = useState(item.info.shipping_cost);
  const [buyerPaysShipping, setBuyerPaysShipping] = useState(
    item.info.shipping_cost > 0
  );
  const [negotiable, setNegotiable] = useState(item.info.negotiable);
  const [whatIsThisItem, setWhatIsThisItem] = useState(item.info.what_is_this);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    try {
      e.preventDefault();
      setLoading(true);

      const priceIsNumber = price % 1 != 0 || Number.isInteger(price);

      if (!priceIsNumber) throw "Invalid price given";

      const { data, error } = await supabase.rpc("edit_item", {
        p_item_id: item.info.id,
        p_trades: trades,
        p_brand: brand,
        p_condition: condition,
        p_details: details,
        p_state: "NC",
        p_model: model,
        p_price: price,
        p_shipping_cost: shippingCost, // TODO - Add this to supabase function
        p_status: "Available",
        p_what_is_this: whatIsThisItem,
        p_shipping: shipping,
        p_negotiable: negotiable,
        p_city: "Matthews",
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
          p_user_id: user.auth_id
        });

        if (error) throw error.message

        console.log(data)
      }

      console.log(data[0])

      setItem({ info: data[0], photos: item.photos });
      setLoading(false);
      dispatch(toggleModal({ key: "editItemModal", value: false }));
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }
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

  return (
    <>
      <div className="modal edit-item">
        {error && <p className="small-text error-text">{error.toString()}</p>}
        <form onSubmit={handleSubmit}>
          <button
            onClick={() => dispatch(toggleModal({ key: "editItemModal", value: false }))}
            type="button"
            className="button close"
          >
            Close
          </button>
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
                  onChange={(e) => setPrice(parseFloat(e.target.value || 0))}
                  value={price}
                  placeholder="Price"
                  required
                />
              </div>
            </fieldset>

            <fieldset className="prices">
              <div className="form-group shipping">
                <label>Shipping</label>
                <div className="shipping-selector-and-input">
                  <div className="shipping-selector">
                    <button
                      className={`shipping-toggle-button ${
                        !buyerPaysShipping ? "selected" : ""
                      }`}
                      type="button"
                      onClick={() => setBuyerPaysShipping(false)}
                    >
                      Free/Included
                    </button>
                    <button
                      className={`shipping-toggle-button ${
                        buyerPaysShipping ? "selected" : ""
                      }`}
                      type="button"
                      onClick={() => setBuyerPaysShipping(true)}
                    >
                      Buyer Pays
                    </button>
                  </div>
                  {/* <input
                  onChange={(e) => setShippingCost(e.target.value)}
                  value={shippingCost}
                  placeholder="$0"
                  required
                  disabled={!buyerPaysShipping}
                /> */}
                </div>
              </div>
              <div
                className={`form-group shipping-cost ${
                  buyerPaysShipping ? "" : "disabled"
                }`}
              >
                <label>Shipping Cost</label>
                <input
                  onChange={(e) => setShippingCost(e.target.value)}
                  value={shippingCost}
                  placeholder="$0"
                  required
                  disabled={!buyerPaysShipping}
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
            </fieldset>
            <fieldset>
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
            <div className="horizontal-divider"></div>
            {loading ? (
              <p>Submitting...</p>
            ) : (
              <button type="submit" disabled={submitDisabled}>
                Submit
              </button>
            )}
          </div>
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
