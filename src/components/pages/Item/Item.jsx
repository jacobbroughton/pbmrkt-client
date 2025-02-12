import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSearchParams } from "../../../hooks/useSearchParams";
import { toggleModal } from "../../../redux/modals";
import ContactSellerModal from "../../ui/ContactSellerModal/ContactSellerModal";
import { DeleteModal } from "../../ui/DeleteModal/DeleteModal";
import { EditListingModal } from "../../ui/EditListingModal/EditListingModal";
import { FullScreenImageModal } from "../../ui/FullScreenImageModal/FullScreenImageModal";
import { Arrow } from "../../ui/Icons/Arrow";
import { CheckIcon } from "../../ui/Icons/CheckIcon";
import { WarningTriangle } from "../../ui/Icons/WarningTriangle";
import { XIcon } from "../../ui/Icons/XIcon";
import { ItemCommentsSection } from "../../ui/ItemCommentsSection/ItemCommentsSection";
import { ItemImages } from "../../ui/ItemImages/ItemImages";
import { ItemVotes } from "../../ui/ItemVotes/ItemVotes";
import { LoadingOverlay } from "../../ui/LoadingOverlay/LoadingOverlay";
import { MetadataTable } from "../../ui/MetadataTable/MetadataTable";
import { ModalOverlay } from "../../ui/ModalOverlay/ModalOverlay";
import PageTitle from "../../ui/PageTitle/PageTitle";
import { PriceChangeHistoryModal } from "../../ui/PriceChangeHistoryModal/PriceChangeHistoryModal";
import { ProfileBadge } from "../../ui/ProfileBadge/ProfileBadge";
import { SellerReviewsModal } from "../../ui/SellerReviewsModal/SellerReviewsModal";
import "./Item.css";

export const Item = () => {
  const dispatch = useDispatch();
  const {
    editListingModalToggled,
    priceChangeModalToggled,
    fullScreenImageModalToggled,
    sellerReviewsModalToggled,
    contactSellerModalToggled,
    deleteModalToggled,
  } = useSelector((state) => state.modals);
  const { user } = useSelector((state) => state.auth);
  const { searchParams } = useSearchParams();
  const { itemID } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(true);
  const [deletedModalShowing, setDeletedModalShowing] = useState(false);
  const [markAsSoldLoading, setMarkAsSoldLoading] = useState(false);
  const [priceChangeHistory, setPriceChangeHistory] = useState(null);
  const [editItemMenuToggled, setEditItemMenuToggled] = useState(false);
  const [sellerReviews, setSellerReviews] = useState();
  const [existingVote, setExistingVote] = useState(null);
  const [votes, setVotes] = useState(null);
  const [deleteItemLoading, setDeleteItemLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function getItem() {
      setLoading(true);
      try {
        const urlSearchParams = new URLSearchParams({
          item_id: itemID,
        }).toString();

        const response = await fetch(
          `http://localhost:4000/get-item?${urlSearchParams}`,
          {
            method: "get",
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("Something happened get-item");

        const { data } = await response.json();

        if (!data || !data.length === 0) throw new Error("Item was not found");

        getPriceChangeHistory(itemID);

        const urlSearchParams2 = new URLSearchParams({ item_id: itemID }).toString();

        const response2 = await fetch(
          `http://localhost:4000/get-item-image-metadata?${urlSearchParams2}`
        );

        if (!response2.ok) throw new Error("Something happened get-item-image-metadata");

        let { data: data2 } = await response2.json();

        if (!data2) throw new Error("Item image metadata not found");

        const urlSearchParams3 = new URLSearchParams({
          reviewee_id: data[0].created_by_id,
        }).toString();

        const response4 = await fetch(
          `http://localhost:4000/get-seller-reviews?${urlSearchParams3}`,
          {
            method: "get",
            credentials: "include",
          }
        );

        if (!response4.ok) throw new Error("Something happened get-seller-reviews");

        let { data: data4 } = await response4.json();

        if (!data4) throw new Error("Seller reviews not found");

        setSellerReviews({
          count: data4.length,
          list: data4,
        });

        setItem({
          photos: data2,
          info: { ...data[0], profile_image_url: "" },
        });
        setVotes(data[0].votes);
        setExistingVote(data[0].existing_vote);
        setSelectedPhoto(data2[0]);
      } catch (error) {
        console.error(error);
        setError(error.toString());
      }
      setLoading(false);
    }

    getItem();
  }, [itemID]);

  async function getPriceChangeHistory(itemId) {
    try {
      const urlSearchParams = new URLSearchParams({
        item_id: itemId,
      }).toString();

      const response = await fetch(
        `http://localhost:4000/get-price-change-history?${urlSearchParams}`,
        {
          method: "get",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Something happened get-price-change-history");

      let data = await response.json();

      if (!data || data.length == 0) throw new Error("price change history not found");

      setPriceChangeHistory(data);
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }
  }

  async function handleStatusChange(newStatus) {
    if (!["Available", "Pending", "Sold"].includes(newStatus)) return;

    setMarkAsSoldLoading(true);

    const response = await fetch(
      `http://localhost:4000/update-sale-item-price?${urlSearchParams3}`,
      {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          item_id: item.info.id,
        }),
      }
    );

    if (!response.ok) throw new Error("Something happened update-sale-item-price");

    setItem({ ...item, info: { ...item.info, status: newStatus } });

    setMarkAsSoldLoading(false);
  }

  async function handleDeleteItem() {
    try {
      const response2 = await fetch("http://localhost:4000/delete-item", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          item_id: item.info.id,
        }),
      });

      if (!response2.ok) throw new Error("Something happened at delete-item");

      setItem({
        ...item,
        info: { ...item.info, is_deleted: true },
      });
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteItemLoading(false);
    }
  }

  if (!item && loading)
    return <LoadingOverlay message="Fetching item..." verticalAlignment="center" />;
  if (!item) return <p>item not found</p>;

  const isAdmin = user && item.info?.created_by_id == user?.id;

  if (error) return <p className="error-text small-text">{error.toString()}</p>;
  if (item.info?.is_deleted)
    return (
      <main className="item">
        <p>This listing has been deleted</p>
      </main>
    );

  return (
    <main className="item">
      {item.info?.is_deleted && <p>This item was deleted</p>}
      <PageTitle title={`For Sale: ${item.info.what_is_this}`} />
      {deleteModalToggled && (
        <DeleteModal
          label="Delete this listing?"
          // deleteLoading={deleteItemLoading}
          handleDeleteClick={handleDeleteItem}
        />
      )}
      {searchParams.get("back-ref") === "dashboard" && (
        <Link to={`http://localhost:3000/`} className="button back-button">
          <Arrow direction={"left"} /> Go back to listings
        </Link>
      )}
      <div className="images-and-content">
        <ItemImages
          photos={item.photos}
          selectedPhoto={selectedPhoto}
          setSelectedPhoto={setSelectedPhoto}
        />
        <div className="content">
          <div className="header-buttons">
            <button
              onClick={() =>
                dispatch(toggleModal({ key: "contactSellerModal", value: true }))
              }
            >
              Contact
            </button>
            {priceChangeHistory?.length >= 1 && (
              <button
                onClick={() =>
                  dispatch(toggleModal({ key: "priceChangeModal", value: true }))
                }
              >
                Price Change History
              </button>
            )}
            {isAdmin && (
              <>
                <button
                  onClick={() =>
                    handleStatusChange(
                      item.info.status == "Available" ? "Sold" : "Available"
                    )
                  }
                >
                  Mark as "{item.info.status == "Available" ? "Sold" : "Available"}"
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(toggleModal({ key: "deleteModal", value: true }));
                  }}
                >
                  Delete Listing
                </button>
                <button
                  onClick={() => {
                    dispatch(
                      toggleModal({
                        key: "editListingModal",
                        value: !editItemMenuToggled,
                      })
                    );
                  }}
                >
                  Edit/Modify Listing Button
                </button>
                <Link
                  onClick={() => {
                    dispatch(
                      toggleModal({
                        key: "editListingModal",
                        value: !editItemMenuToggled,
                      })
                    );
                  }}
                  to={`/edit-listing/forsale/${item.info.id}`}
                >
                  Edit/Modify Listing
                </Link>
              </>
            )}
          </div>
          <div className="info">
            <div className="info-and-contact">
              <div className="primary-info-and-votes">
                {isAdmin && (
                  <ItemVotes
                    itemId={item.info.id}
                    existingVote={existingVote}
                    setExistingVote={setExistingVote}
                    votes={votes}
                    setVotes={setVotes}
                    postType="For Sale"
                  />
                )}
                <div className="primary-info">
                  {editItemMenuToggled && <div></div>}
                  <h1>{item.info.what_is_this}</h1>
                  <div className="price-and-toggle">
                    <p>
                      ${item.info.price}
                      {console.log(item.info.shipping_cost)}
                      {item.info.shipping_cost && item.info.shipping_cost !== "0.00"
                        ? ` + $${item.info.shipping_cost} shipping`
                        : " w/ Free Shipping"}{" "}
                    </p>
                  </div>
                  <div className="status-as-of-container">
                    <p
                      className={`status-as-of ${
                        item.info.status === "Available" ? "green" : "red"
                      }`}
                    >
                      {item.info.status == "Available" ? <CheckIcon /> : <XIcon />}
                      {item.info.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {item.info.details ? (
              <div className="details">
                <label>Details from the seller</label>
                <p>{item.info.details}</p>
              </div>
            ) : (
              <div className="no-details-warning">
                <p>
                  <WarningTriangle /> No details were provided
                </p>
                {!isAdmin && (
                  <p>
                    Make sure to request more info from the seller prior to purchasing, so
                    there are no surprises.
                  </p>
                )}
              </div>
            )}
            {item.info.accepted_trades}
            <MetadataTable
              rows={[
                { label: "Condition", values: [item.info.condition] },
                { label: "Shipping", values: [item.info.shipping] },
                { label: "Negotiable", values: [item.info.negotiable] },
                {
                  label: "Trades",
                  values: [
                    item.info.trades,
                    ...(item.info.accepted_trades
                      ? [`"${item.info.accepted_trades}"`]
                      : []),
                  ],
                },
              ]}
            />

            <ProfileBadge
              userInfo={{
                profileImageUrl: item.info.profile_image_url,
                username: item.info.created_by_username,
                city: item.info.city,
                state: item.info.state,
                reviewCount: sellerReviews.count,
                rating: item.info.seller_rating,
              }}
            />
          </div>
        </div>
      </div>

      <ItemCommentsSection
        itemInfo={{ id: item.info.id, createdById: item.info.created_by_id }}
        setError={setError}
      />
      {editListingModalToggled ? (
        <EditListingModal
          item={item}
          setItem={(newItem) => {
            setItem(newItem);
          }}
        />
      ) : (
        false
      )}
      {priceChangeModalToggled ? (
        <PriceChangeHistoryModal item={item} priceChangeHistory={priceChangeHistory} />
      ) : (
        false
      )}
      {fullScreenImageModalToggled ? (
        <FullScreenImageModal
          photos={item.photos}
          setSelectedPhoto={setSelectedPhoto}
          selectedPhoto={selectedPhoto}
        />
      ) : (
        false
      )}
      {sellerReviewsModalToggled && (
        <>
          <SellerReviewsModal
            seller={{
              username: item.info.created_by_username,
              auth_id: item.info.created_by_id,
            }}
            reviews={sellerReviews}
            zIndex={7}
          />
          <ModalOverlay zIndex={6} />
        </>
      )}
      {contactSellerModalToggled && <ContactSellerModal contactInfo={item.info} />}
    </main>
  );
};
