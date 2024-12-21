import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { toggleModal } from "../../../redux/modals";
import { supabase } from "../../../utils/supabase";
import ContactSellerModal from "../../ui/ContactSellerModal/ContactSellerModal";
import { EditListingModal } from "../../ui/EditListingModal/EditListingModal";
import { FullScreenImageModal } from "../../ui/FullScreenImageModal/FullScreenImageModal";
import { CheckIcon } from "../../ui/Icons/CheckIcon";
import { WarningTriangle } from "../../ui/Icons/WarningTriangle";
import { XIcon } from "../../ui/Icons/XIcon";
import { ItemCommentsSection } from "../../ui/ItemCommentsSection/ItemCommentsSection";
import { ItemImages } from "../../ui/ItemImages/ItemImages";
import { ItemVotes } from "../../ui/ItemVotes/ItemVotes";
import { LoadingOverlay } from "../../ui/LoadingOverlay/LoadingOverlay";
import { MetadataTable } from "../../ui/MetadataTable/MetadataTable";
import { ModalOverlay } from "../../ui/ModalOverlay/ModalOverlay";
import { PriceChangeHistoryModal } from "../../ui/PriceChangeHistoryModal/PriceChangeHistoryModal";
import { ProfileBadge } from "../../ui/ProfileBadge/ProfileBadge";
import { SellerReviewsModal } from "../../ui/SellerReviewsModal/SellerReviewsModal";
import "./Item.css";
import { DeleteModal } from "../../ui/DeleteModal/DeleteModal";
import PageTitle from "../../ui/PageTitle/PageTitle";
import { useSearchParams } from "../../../hooks/useSearchParams";
import { Arrow } from "../../ui/Icons/Arrow";
import { Chevron } from "../../ui/Icons/Chevron";

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
  // const [newCommentBody, setNewCommentBody] = useState("");
  // const [localComments, setLocalComments] = useState(null);
  // const [repliesLoading, setRepliesLoading] = useState(false);
  // const [commentIdWithRepliesOpening, setCommentIdWithRepliesOpening] = useState(null);
  const [markAsSoldLoading, setMarkAsSoldLoading] = useState(false);
  const [priceChangeHistory, setPriceChangeHistory] = useState(null);
  const [editItemMenuToggled, setEditItemMenuToggled] = useState(false);
  const [sellerReviews, setSellerReviews] = useState();
  const [existingVote, setExistingVote] = useState(null);
  const [votes, setVotes] = useState(null);
  const [deleteItemLoading, setDeleteItemLoading] = useState(false);

  useEffect(() => {
    async function getItem() {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc("get_item", {
          p_item_id: itemID,
          p_user_id: user?.auth_id,
        });

        if (error) {
          console.error(error);
          throw error.message;
        }
        if (!data[0]) throw "Item not found";

        getPriceChangeHistory(itemID);

        let { data: data2, error: error2 } = await supabase.rpc(
          "get_item_photo_metadata",
          { p_item_id: itemID }
        );

        if (error2) throw error2.message;

        data2 = data2.map((img) => {
          const { data, error } = supabase.storage
            .from("item_images")
            .getPublicUrl(img.path);

          if (error) throw error.message;

          return {
            ...img,
            url: data.publicUrl,
          };
        });

        const { data: data3, error: error3 } = supabase.storage
          .from("profile_pictures")
          .getPublicUrl(data[0].profile_picture_path || "placeholders/user-placeholder");

        if (error3) throw error.message;

        const { data: data4, error: error4 } = await supabase.rpc("get_seller_reviews", {
          p_reviewee_id: data[0].created_by_id,
        });

        if (error4) throw error4.message;

        setSellerReviews({
          count: data4.length,
          list: data4,
        });

        setItem({
          photos: data2,
          info: { ...data[0], profile_picture_url: data3?.publicUrl },
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
      const { data, error } = await supabase.rpc("get_price_change_history", {
        p_item_id: itemId,
      });

      if (error) throw error.message;

      setPriceChangeHistory(data);
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }
  }

  async function handleStatusChange(newStatus) {
    if (!["Available", "Pending", "Sold"].includes(newStatus)) return;

    setMarkAsSoldLoading(true);
    const { data, error } = await supabase.rpc("update_sale_item_status", {
      p_status: newStatus,
      p_item_id: item.info.id,
    });

    if (error) {
      console.error(error);
      throw error.message;
    }

    setItem({ ...item, info: { ...item.info, status: newStatus } });

    setMarkAsSoldLoading(false);
  }

  if (!item && loading)
    return <LoadingOverlay message="Fetching item..." verticalAlignment="center" />;
  if (!item) return <p>item not found</p>;

  const isAdmin = user && item.info?.created_by_id == user?.auth_id;

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
          handleDeleteClick={async () => {
            try {
              const { error, data } = await supabase.rpc("delete_item", {
                p_item_id: item.info.id,
              });

              if (error) throw error;

              setItem({
                ...item,
                info: { ...item.info, is_deleted: true },
              });
            } catch (error) {
              console.error(error);
            } finally {
              setDeleteItemLoading(false);
            }
          }}
        />
      )}
      {searchParams.get("back-ref") === "dashboard" && (
        <Link to={`http://localhost:3000/`} className="button back-button">
          <Arrow direction={'left'}/> Go back to listings 
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
                  onClick={() =>
                    dispatch(
                      toggleModal({
                        key: "editListingModal",
                        value: !editItemMenuToggled,
                      })
                    )
                  }
                >
                  Edit/Modify Listing
                </button>
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
                      {item.info.shipping_cost
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
                profilePictureUrl: item.info.profile_picture_url,
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
