import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toggleModal } from "../../../redux/modals";
import { DeleteModal } from "../../ui/DeleteModal/DeleteModal";
import { EditListingModal } from "../../ui/EditListingModal/EditListingModal";
import { FullScreenImageModal } from "../../ui/FullScreenImageModal/FullScreenImageModal";
import { CheckIcon } from "../../ui/Icons/CheckIcon";
import { WarningTriangle } from "../../ui/Icons/WarningTriangle";
import { XIcon } from "../../ui/Icons/XIcon";
import { ItemCommentsSection } from "../../ui/ItemCommentsSection/ItemCommentsSection";
import { ItemImages } from "../../ui/ItemImages/ItemImages";
import { ItemVotes } from "../../ui/ItemVotes/ItemVotes";
import { LoadingOverlay } from "../../ui/LoadingOverlay/LoadingOverlay";
import { ModalOverlay } from "../../ui/ModalOverlay/ModalOverlay";
import { PriceChangeHistoryModal } from "../../ui/PriceChangeHistoryModal/PriceChangeHistoryModal";
import { ProfileBadge } from "../../ui/ProfileBadge/ProfileBadge";
import { SellerReviewsModal } from "../../ui/SellerReviewsModal/SellerReviewsModal";
import "./WantedItem.css";
import ContactBuyerModal from "../../ui/ContactBuyerModal/ContactBuyerModal";
import PageTitle from "../../ui/PageTitle/PageTitle";
import { SearchIcon } from "../../ui/Icons/SearchIcon";
import { ErrorBanner } from "../../ui/ErrorBanner/ErrorBanner";

export function WantedItem() {
  const dispatch = useDispatch();
  const {
    editListingModalToggled,
    priceChangeModalToggled,
    fullScreenImageModalToggled,
    sellerReviewsModalToggled,
    contactBuyerModalToggled,
    deleteModalToggled,
  } = useSelector((state) => state.modals);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { wantedItemID } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(true);
  const [deletedModalShowing, setDeletedModalShowing] = useState(false);
  // const [newCommentBody, setNewCommentBody] = useState("");
  // const [localComments, setLocalComments] = useState(null);
  // const [repliesLoading, setRepliesLoading] = useState(false);
  // const [commentIdWithRepliesOpening, setCommentIdWithRepliesOpening] = useState(null);
  const [markAsSoldLoading, setMarkAsSoldLoading] = useState(false);
  const [priceChangeHistory, setPriceChangeHistory] = useState(null);
  const [editItemMenuToggled, setEditItemMenuToggled] = useState(false);
  const [buyerReviews, setBuyerReviews] = useState();
  const [existingVote, setExistingVote] = useState(null);
  const [votes, setVotes] = useState(null);
  const [deleteItemLoading, setDeleteItemLoading] = useState(false);

  useEffect(() => {
    async function getWantedItem() {
      setLoading(true);
      try {
        const urlSearchParams = new URLSearchParams({
          item_id: wantedItemID,
        }).toString();

        const response = await fetch(
          `http://localhost:4000/get-wanted-item?${urlSearchParams}`,
          { method: "get", credentials: "include" }
        );

        if (!response.ok)
          throw new Error(response.statusText || "Something happened at get-wanted-item");

        const { data: wantedItemFromDB } = await response.json();

        // if (!wantedItemFromDB || wantedItemFromDB.length === 0)
        //   throw new Error("Wanted item was not found");

        const urlSearchParams2 = new URLSearchParams({
          item_id: wantedItemID,
        }).toString();

        const wantedItemResponse = await fetch(
          `http://localhost:4000/get-wanted-item-image-metadata?${urlSearchParams2}`
        );

        if (!wantedItemResponse.ok)
          throw new Error("Something happened get-wanted-item-image-metadata");

        let { data: imageMetadataFromDB } = await wantedItemResponse.json();

        if (!imageMetadataFromDB || !imageMetadataFromDB.length === 0)
          throw new Error("Wanted item image metadata was not found");

        const urlSearchParams3 = new URLSearchParams({
          p_reviewee_id: wantedItemFromDB.created_by_id,
        }).toString();

        const sellerReviewsResponse = await fetch(
          `http://localhost:4000/get-seller-reviews?${urlSearchParams3}`,
          {
            method: "get",
            credentials: "include",
          }
        );

        if (!sellerReviewsResponse.ok)
          throw new Error("Something happened get-seller-reviews");

        let { data: sellerReviewsFromDB } = await sellerReviewsResponse.json();

        if (!sellerReviewsFromDB) throw new Error("Seller reviews not found");

        setBuyerReviews({
          count: sellerReviewsFromDB.length,
          list: sellerReviewsFromDB,
        });

        setItem({
          photos: imageMetadataFromDB,
          info: wantedItemFromDB,
        });
        setVotes(wantedItemFromDB.votes);
        setExistingVote(wantedItemFromDB.existing_vote);
        setSelectedPhoto(imageMetadataFromDB[0]);
      } catch (error) {
        console.error(error);
        setError(error.toString());
      }
      setLoading(false);
    }

    getWantedItem();
  }, [wantedItemID]);

  async function handleStatusChange(newStatus) {
    if (!["Still Searching", "Not Searching"].includes(newStatus)) return;

    setMarkAsSoldLoading(true);

    const response = await fetch("http://localhost:4000/update-wanted-item-status", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        status: newStatus,
        item_id: item.info.id,
      }),
    });

    if (!response.ok) throw new Error("Something happened at update-wanted-item-status");

    setItem({ ...item, info: { ...item.info, status: newStatus } });

    setMarkAsSoldLoading(false);
  }

  async function handleDeleteItem() {
    try {
      const response = await fetch("http://localhost:4000/delete-item", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          item_id: item.info.id,
        }),
      });

      if (!response.ok) throw new Error("Something happened at delete-item");

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

  const isAdmin = user && item.info?.created_by_id == user?.id;

  if (error)
    return (
      <ErrorBanner
        error={error.toString()}
        handleCloseBanner={() => setError(null)}
        hasMargin={true}
      />
    );
  if (item.info?.is_deleted) return <p>This item was deleted.</p>;

  return (
    <main className="wanted-item">
      <PageTitle title={`Wanted: ${item.info.title}`} />
      <div className="images-and-content">
        {item.photos.length > 0 && (
          <ItemImages
            photos={item.photos}
            selectedPhoto={selectedPhoto}
            setSelectedPhoto={setSelectedPhoto}
          />
        )}

        <div className="content">
          <div className="header-buttons">
            <button
              onClick={() =>
                dispatch(toggleModal({ key: "contactBuyerModal", value: true }))
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
                      item.info.status == "Still Searching"
                        ? "Not Searching"
                        : "Still Searching"
                    )
                  }
                >
                  Mark as "
                  {item.info.status == "Still Searching"
                    ? "Not Searching"
                    : "Still Searching"}
                  "
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(toggleModal({ key: "deleteModal", value: true }));
                  }}
                >
                  Delete
                </button>
                <Link
                  onClick={() => {
                    // dispatch(
                    //   toggleModal({
                    //     key: "editListingModal",
                    //     value: !editItemMenuToggled,
                    //   })
                    // );
                    navigate(`/edit-listing/wanted/${item.info.id}`);
                  }}
                >
                  Edit/Modify Listing
                </Link>
              </>
            )}
          </div>
          <div className="info">
            {/* <div className="wanted-poster">
              <h1>Wanted</h1>
            </div> */}
            <div className="info-and-contact">
              <div className="primary-info-and-votes">
                {isAdmin && (
                  <ItemVotes
                    itemId={item.info.id}
                    existingVote={existingVote}
                    setExistingVote={setExistingVote}
                    votes={votes}
                    setVotes={setVotes}
                    postType="Wanted"
                  />
                )}
                <div className="primary-info">
                  <h1>
                    <span className="italic ">Wanted</span>: {item.info.title}
                  </h1>
                  <div className="price-and-toggle">
                    <p>
                      <strong>Budget:</strong> ${item.info.budget}
                    </p>
                  </div>
                  <div className="status-as-of-container">
                    <p
                      className={`status-as-of ${
                        item.info.status === "Still Searching" ? "green" : "grey"
                      }`}
                    >
                      {item.info.status == "Still Searching" ? <SearchIcon /> : <XIcon />}
                      {item.info.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {item.info.description ? (
              <div className="details">
                <label>Details from the seller</label>
                <p>{item.info.description}</p>
              </div>
            ) : (
              <div className="no-details-warning">
                <p>
                  <WarningTriangle /> No details were provided
                </p>
                {!isAdmin && (
                  <p>
                    Make sure to be clear to the buyer about what it is you're selling.
                    E.g. condition, extra shipping cost, etc..
                  </p>
                )}
              </div>
            )}

            <ProfileBadge
              userInfo={{
                profile_image_url: item.info.profile_image_url,
                username: item.info.created_by_username,
                city: item.info.city,
                state: item.info.state,
                review_count: buyerReviews.count,
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
            reviews={buyerReviews}
            zIndex={7}
          />
          <ModalOverlay zIndex={6} />
        </>
      )}
      {contactBuyerModalToggled && <ContactBuyerModal contactInfo={item.info} />}
      {deleteModalToggled && (
        <DeleteModal
          label="Delete this listing?"
          // deleteLoading={deleteItemLoading}
          handleDeleteClick={handleDeleteItem}
        />
      )}
    </main>
  );
}
