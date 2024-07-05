import { useDispatch } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import { ModalOverlay } from "../ModalOverlay/ModalOverlay";
import { Arrow } from "../Icons/Arrow";
import "./PriceChangeHistoryModal.css";
import { formatDollars, getTimeAgo } from "../../../utils/usefulFunctions";
import { useEffect } from "react";

export const PriceChangeHistoryModal = ({ item, priceChangeHistory }) => {
  const dispatch = useDispatch();

  return (
    <>
      <div className="modal price-change-modal">
        <div className="header">
          <h2>Price Changes ({priceChangeHistory.length})</h2>
          <button
            onClick={() =>
              dispatch(toggleModal({ key: "priceChangeModal", value: false }))
            }
            className="button"
          >
            Close
          </button>
        </div>
        <div className="metadata">
          <p>Currently: {formatDollars(item.info.price)}</p>
          <p>Originally Listed at: {formatDollars(item.info.orig_price)}</p>
        </div>
        <div className="content">
          <ul>
            {priceChangeHistory.map((priceChange) => {
              const createdAt = new Date(priceChange.created_at);
              const createdDt = new Intl.DateTimeFormat("en-US", {
                dateStyle: "medium",
                timeStyle: "long",
                timeZone: "America/New_York",
              }).format(createdAt);
              const createdTimeAgo = getTimeAgo(createdAt);

              let priceStatus = "equal";

              if (priceChange.new_price > priceChange.prev_price) priceStatus = "up";
              else if (priceChange.new_price < priceChange.prev_price)
                priceStatus = "down";

              const prevPrice = formatDollars(priceChange.prev_price);
              const newPrice = formatDollars(priceChange.new_price);

              return (
                <li className={`${priceStatus}`}>
                  <p className="price-change-and-icon">
                    {prevPrice} &#61;&gt; {newPrice}
                    {priceStatus == "equal" ? "=" : <Arrow direction={priceStatus} />}
                  </p>
                  <p title={createdDt} className="change-date">
                    {createdTimeAgo}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <ModalOverlay
        zIndex={4}
        onClick={() => dispatch(toggleModal({ key: "priceChangeModal", value: false }))}
      />
    </>
  );
};
