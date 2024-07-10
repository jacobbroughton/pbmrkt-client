import { LoadingOverlay } from "../../ui/LoadingOverlay/LoadingOverlay";
import { EditItemModal } from "../../ui/EditItemModal/EditItemModal";
import { CommentsList } from "../../ui/CommentsList/CommentsList";
import { Footer } from "../../ui/Footer/Footer";
import { Stars } from "../../ui/Stars/Stars";
import { SendIcon } from "../../ui/Icons/SendIcon";
import { CheckIcon } from "../../ui/Icons/CheckIcon";
import { PriceChangeHistoryModal } from "../../ui/PriceChangeHistoryModal/PriceChangeHistoryModal";
import { ChartIcon } from "../../ui/Icons/ChartIcon";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../../../utils/supabase";
import { toggleModal } from "../../../redux/modals";
import { getTimeAgo } from "../../../utils/usefulFunctions";
import { XIcon } from "../../ui/Icons/XIcon";
import { ThreeDots } from "../../ui/Icons/ThreeDots";
import { WarningCircle } from "../../ui/Icons/WarningCircle";
import { WarningTriangle } from "../../ui/Icons/WarningTriangle";
import { PhoneIcon } from "../../ui/Icons/PhoneIcon";
import { EmailIcon } from "../../ui/Icons/EmailIcon";
import { ExpandIcon } from "../../ui/Icons/ExpandIcon";
import { FullScreenImageModal } from "../../ui/FullScreenImageModal/FullScreenImageModal";
import { SellerReviewsModal } from "../../ui/SellerReviewsModal/SellerReviewsModal";
import { ModalOverlay } from "../../ui/ModalOverlay/ModalOverlay";
import "./Item.css";
import { Arrow } from "../../ui/Icons/Arrow";
import ContactSellerModal from "../../ui/ContactSellerModal/ContactSellerModal";
import MessageIcon from "../../ui/Icons/MessageIcon";
import { EditIcon } from "../../ui/Icons/EditIcon";

export const Item = () => {
  const dispatch = useDispatch();
  const {
    editItemModalToggled,
    priceChangeModalToggled,
    fullScreenImageModalToggled,
    sellerReviewsModalToggled,
    contactSellerModalToggled,
  } = useSelector((state) => state.modals);
  const { user } = useSelector((state) => state.auth);
  const { itemID } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(true);
  const [deletedModalShowing, setDeletedModalShowing] = useState(false);
  const [newCommentBody, setNewCommentBody] = useState("");
  const [localComments, setLocalComments] = useState(null);
  const [markAsSoldLoading, setMarkAsSoldLoading] = useState(false);
  const [priceChangeHistory, setPriceChangeHistory] = useState(null);
  const [editItemMenuToggled, setEditItemMenuToggled] = useState(false);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [commentIdWithRepliesOpening, setCommentIdWithRepliesOpening] = useState(null);
  const [sellerReviews, setSellerReviews] = useState();
  const [existingVote, setExistingVote] = useState(null);
  const [votes, setVotes] = useState(null);

  useEffect(() => {
    async function getItem() {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc("get_item", { p_item_id: itemID, p_user_id: user?.auth_id });

        if (error) {
          console.error(error);
          throw error.message;
        }
        if (!data) throw "Item not found";

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
        setVotes(data[0].votes)
        setExistingVote(data[0].existing_vote)
        setSelectedPhoto(data2[0]);
      } catch (error) {
        setError(error.toString());
      }
      setLoading(false);
    }

    getItem();
    getComments();
  }, [itemID]);

  async function handleDelete() {
    setLoading(true);
    try {
      const { error } = await supabase.rpc("delete_item", {
        p_item_id: item.info.id,
      });

      if (error) throw error.message;

      setDeletedModalShowing(true);
    } catch (error) {
      console.error(error);
      setError(error);
    }
    setLoading(false);
  }

  async function handleNewCommentSubmit(e) {
    e.preventDefault();

    try {
      if (!newCommentBody) throw "Cannot add comment, body empty";

      const { data, error } = await supabase.rpc("add_comment", {
        p_body: newCommentBody,
        p_created_by_id: user.auth_id,
        p_item_id: itemID,
        p_parent_id: null,
      });

      console.log(data);

      if (error) throw error.message;
      if (user.auth_id != item.info.created_by_id) {
        const { error: error2 } = await supabase.rpc("add_comment_notification", {
          p_message: newCommentBody,
          p_type: "Comment",
          p_url: "",
          p_item_id: itemID,
          p_comment_id: data[0].id,
          p_user_id: user.auth_id,
          p_related_user_id: item.info.created_by_id,
        });

        if (error2) throw error2.message;

        console.log("added comment notification");
      }
      getComments();
      setNewCommentBody("");
    } catch (error) {
      console.error(error);
      setError(error);
    }
  }

  async function getPriceChangeHistory(itemId) {
    try {
      const { data, error } = await supabase.rpc("get_price_change_history", {
        p_item_id: itemId,
      });

      if (error) throw error.message;

      console.log(data);

      setPriceChangeHistory(data);
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }
  }

  async function getComments() {
    try {
      const { data, error } = await supabase.rpc("get_comments_experimental", {
        p_item_id: itemID,
        p_user_id: user?.auth_id,
      });

      if (error) throw error.message;

      const comments = data.map((comment) => {
        const { data: data2, error: error2 } = supabase.storage
          .from("profile_pictures")
          .getPublicUrl(comment.profile_picture_path || "placeholders/user-placeholder");

        if (error2) throw error.message;

        return {
          ...comment,
          replies: [],
          repliesToggled: false,
          profile_picture_url: data2.publicUrl,
        };
      });

      setLocalComments(comments);
    } catch (error) {
      console.error(error);
      setError(error);
    }
  }

  async function handleDeleteComment(e, commentId) {
    e.preventDefault();
    try {
      await supabase.rpc("delete_comment", {
        p_comment_id: commentId,
      });

      setLocalComments(
        localComments.map((comment) => {
          return {
            ...comment,
            ...(comment.id == commentId && {
              eff_status: 0,
            }),
          };
        })
      );
    } catch (error) {
      console.error(error);
      setError(error);
    }
  }

  function handleEditButtonClick() {
    dispatch(toggleModal({ key: "editItemModal", value: !editItemModalToggled }));
  }

  async function handleStatusChange(newStatus) {
    if (!["Available", "Pending", "Sold"].includes(newStatus)) return;

    setMarkAsSoldLoading(true);
    const { data, error } = await supabase.rpc("update_item_status", {
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

  async function handleRepliesClick(e, commentWithReplies) {
    console.log("root");
    e.preventDefault();
    if (!commentWithReplies.repliesToggled) {
      setCommentIdWithRepliesOpening(commentWithReplies.id);
      setRepliesLoading(true);
      const { data, error } = await supabase.rpc("get_child_comments", {
        p_item_id: item.info.id,
        p_parent_comment_id: commentWithReplies.id,
        p_user_id: user?.auth_id,
      });

      if (error) {
        console.error(error);
        throw error.message;
      }
      const replies = data.map((comment) => {
        const { data: data2, error: error2 } = supabase.storage
          .from("profile_pictures")
          .getPublicUrl(comment.profile_picture_path || "placeholders/user-placeholder");

        if (error2) throw error.message;

        return {
          ...comment,
          profile_picture_url: data2.publicUrl,
        };
      });

      setLocalComments(
        localComments.map((comm) => {
          return {
            ...comm,
            tier: 0,
            ...(comm.id == commentWithReplies.id && {
              replies: replies,
              repliesToggled: !comm.repliesToggled,
              reply_count: replies.length,
            }),
          };
        })
      );
    } else {
      setCommentIdWithRepliesOpening(null);
      setLocalComments(
        localComments.map((comm) => {
          return {
            ...comm,
            tier: 0,
            ...(comm.id == commentWithReplies.id && {
              replies: [],
              repliesToggled: false,
              // reply_count: replies.length,
            }),
          };
        })
      );
    }
    setRepliesLoading(false);
  }

  async function handleItemDownvote() {
    try {
      const { data, error } = await supabase.rpc("add_item_vote", {
        p_item_id: item.info.id,
        p_vote_direction: "Down",
        p_user_id: user?.auth_id,
      });

      if (error) throw error.message;

      console.log("downvote", data);

      if (!existingVote) {
        setVotes((prevVotes) => (prevVotes -= 1));
      } else if (existingVote == "Up") {
        setVotes((prevVotes) => (prevVotes -= 2));
      } else if (existingVote == "Down") {
        setVotes((prevVotes) => (prevVotes += 1));
      }

      setExistingVote(data[0]?.vote_direction);
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }
  }

  async function handleItemUpvote() {
    try {
      const { data, error } = await supabase.rpc("add_item_vote", {
        p_item_id: item.info.id,
        p_vote_direction: "Up",
        p_user_id: user?.auth_id,
      });

      if (error) throw error.message;

      console.log("upvote", data);

      if (!existingVote) {
        setVotes((prevVotes) => (prevVotes += 1));
      } else if (existingVote == "Down") {
        setVotes((prevVotes) => (prevVotes += 2));
      } else if (existingVote == "Up") {
        setVotes((prevVotes) => (prevVotes -= 1));
      }

      setExistingVote(data[0]?.vote_direction);
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }
  }

  if (!item && loading)
    return <LoadingOverlay message="Fetching item..." verticalAlignment="center" />;
  if (!item) return <p>item not found</p>;

  const isAdmin = user && item.info?.created_by_id == user?.auth_id;

  if (error) return <p className="error-text small-text">{error.toString()}</p>;
  if (!item.info?.eff_status) return <p>This item was deleted.</p>;

  return (
    <>
      <div className="item">
        {deletedModalShowing && (
          <>
            <div className="modal deleted-modal">
              <h3>This item was deleted</h3>
              <div className="links">
                <Link to="/">Return home</Link>
                <Link to="/sell">Create a new listing</Link>
              </div>
            </div>
            <div className="modal-overlay"></div>
          </>
        )}
        <div className="images-and-content">
          <div className="item-images">
            <div
              className="main-image-parent"
              onDoubleClick={() =>
                dispatch(toggleModal({ key: "fullScreenImageModal", value: true }))
              }
            >
              {/* <div className="double-click-overlay">
                <button
                  // onDoubleClick={() =>
                  //   dispatch(toggleModal({ key: "fullScreenImageModal", value: true }))
                  // }
                >asdf</button>
              </div> */}
              {selectedPhoto ? (
                <img className="item-main-image" src={selectedPhoto.url} />
              ) : (
                <div className="main-image-placeholder"></div>
              )}
              <button
                className="expand-image-button"
                onClick={() =>
                  dispatch(toggleModal({ key: "fullScreenImageModal", value: true }))
                }
              >
                <ExpandIcon />
              </button>
            </div>
            {item.photos.length > 1 && (
              <div className="item-thumbnails">
                {item.photos.map((photo) => (
                  <div className="item-thumbnail-image-container">
                    <img
                      key={photo.id}
                      className={`item-thumbnail-image ${
                        photo.id === selectedPhoto?.id ? "selected" : ""
                      }`}
                      onClick={() => setSelectedPhoto(photo)}
                      onDoubleClick={() => {
                        setSelectedPhoto(photo);
                        dispatch(
                          toggleModal({ key: "fullScreenImageModal", value: true })
                        );
                      }}
                      src={photo.url}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
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
                    onClick={() =>
                      dispatch(
                        toggleModal({
                          key: "editItemModal",
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
                  {/* <div className="like-and-dislike">
                    <button onClick={handleItemUpvote}>
                      <Arrow direction="up" />
                    </button>
                    <span>{votes}</span>
                    <button onClick={handleItemDownvote}>
                      <Arrow direction="down" />
                    </button>
                  </div> */}
                  <div className="like-and-dislike">
                    <button
                      disabled={false}
                      onClick={(e) => handleItemUpvote(e)}
                      className={`up ${existingVote == "Up" ? "selected" : ""}`}
                    >
                      <Arrow direction="up" />
                    </button>
                    <span>{votes}</span>
                    <button
                      disabled={false}
                      onClick={(e) => handleItemDownvote(e)}
                      className={`down ${existingVote == "Down" ? "selected" : ""}`}
                    >
                      <Arrow direction="down" />
                    </button>
                  </div>
                  <div className="primary-info">
                    {editItemMenuToggled && <div></div>}
                    <h1>{item.info.what_is_this}</h1>
                    <div className="price-and-toggle">
                      <p>
                        ${item.info.price}
                        {item.info.shipping_cost
                          ? ` + $${item.info.shipping_cost} shipping`
                          : " + Free Shipping"}{" "}
                      </p>
                      {/* {priceChangeHistory?.length >= 1 && (
                        <button
                          className="button price-change-modal-toggle"
                          onClick={() =>
                            dispatch(
                              toggleModal({ key: "priceChangeModal", value: true })
                            )
                          }
                        >
                          <ChartIcon />
                        </button>
                      )} */}
                    </div>
                    <div className="status-as-of-container">
                      <p className={`status-as-of ${item.info.status.toLowerCase()}`}>
                        {item.info.status == "Available" ? <CheckIcon /> : <XIcon />}
                        {item.info.status} {/* as of {getTimeAgo(new Date())} */}
                      </p>
                      {/* {isAdmin && (
                        <button
                          className="status-change-button"
                          onClick={() =>
                            handleStatusChange(
                              item.info.status == "Available" ? "Sold" : "Available"
                            )
                          }
                        >
                          Mark as "
                          {item.info.status == "Available" ? "Sold" : "Available"}"
                        </button>
                      )} */}
                    </div>
                  </div>
                </div>

                {/* <div className="horizontal-divider"></div> */}
                {/* {isAdmin && (
                  <button
                    title="Modify the properties of this item"
                    type="button"
                    className="edit-item-menu-toggle"
                    onClick={() =>
                      dispatch(
                        toggleModal({
                          key: "editItemModal",
                          value: !editItemMenuToggled,
                        })
                      )
                    }
                  >
                    <ThreeDots />
                  </button>
                )} */}

                {/* <button
                      onClick={() =>
                        dispatch(toggleModal({ key: "contactSellerModal", value: true }))
                      }
                    >
                      <MessageIcon />
                      <p>Contact</p>
                    </button> */}
                {/* <div className="contact-option">
                      <PhoneIcon />{" "}
                      <p className="phone">
                        {user ? (
                          item.info.phone_number || "N/A"
                        ) : (
                          <div className="placeholder phone"></div>
                        )}
                      </p>
                    </div>
                    <div className="contact-option">
                      <EmailIcon />
                      <p className="email">
                        {user ? (
                          item.info.created_by_email || "N/A"
                        ) : (
                          <div className="placeholder email"></div>
                        )}
                      </p>
                    </div> */}
                {/* {!user && <p className="small-text">Must be signed in to view</p>} */}
                {/* </div>
                </div> */}
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
                  <p>
                    Make sure to request more info from the seller prior to purchasing, so
                    there are no surprises.
                  </p>
                </div>
              )}

              {/* <div className='metadata-new'>
                <div className='metadata-row'>
                  <p>Condition</p>
                  <div className='horizontal-divider'></div>
                  <p>{item.info.condition}</p>
                </div>
                <div className='metadata-row'>
                  <p>Shipping</p>
                  <div className='horizontal-divider'></div>
                  <p>{item.info.shipping}</p>
                </div>
                <div className='metadata-row'>
                  <p>Negotiable</p>
                  <div className='horizontal-divider'></div>
                  <p>{item.info.negotiable}</p>
                </div>
                <div className='metadata-row'>
                  <p>Trades</p>
                  <div className='horizontal-divider'></div>
                  <p>{item.info.trades}</p>
                </div>
              </div> */}

              {/* Metadata */}
              <div className="metadata-table-and-label">
                <div className="metadata-table-container">
                  <table className="metadata">
                    <tbody>
                      <tr>
                        <td>Condition</td>
                        <td>{item.info.condition}</td>
                      </tr>
                      <tr>
                        <td>Shipping</td>
                        <td>{item.info.shipping}</td>
                      </tr>
                      <tr>
                        <td>Negotiable</td>
                        <td>{item.info.negotiable}</td>
                      </tr>
                      <tr>
                        <td>Trades</td>
                        <td>{item.info.trades}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Seller Info */}
              <div className="seller-info">
                <div className="profile-picture-container">
                  <img className="profile-picture" src={item.info.profile_picture_url} />
                </div>
                <div className="text">
                  <Link
                    to={`/user/${item.info.created_by_username}`}
                    className="user-link"
                  >
                    {item.info.created_by_username}
                  </Link>
                  <p>
                    {item.info.city}, {item.info.state}
                  </p>

                  {/* <Stars rating={item.info.seller_rating} /> ({sellerReviews.count}) */}
                  <button
                    className="stars-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (sellerReviews.count <= 0) return;
                      dispatch(toggleModal({ key: "sellerReviewsModal", value: true }));
                    }}
                    disabled={sellerReviews.count == 0}
                  >
                    <Stars rating={item.info.seller_rating} />{" "}
                    <span>({sellerReviews.count})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="comments-section">
          {/* <div className="horizontal-divider"></div> */}
          {/* <h3>Comments</h3> */}
          {user ? (
            <form onSubmit={(e) => handleNewCommentSubmit(e)} className="comment-form">
              <textarea
                placeholder="Write Something"
                onChange={(e) => setNewCommentBody(e.target.value)}
                value={newCommentBody}
              />
              <button type="submit" disabled={!newCommentBody}>
                Submit <SendIcon />
              </button>
            </form>
          ) : (
            <p className="login-or-signup">
              <button
                className="link-button"
                onClick={() => dispatch(toggleModal({ key: "loginModal", value: true }))}
              >
                Login
              </button>{" "}
              or{" "}
              <button
                className="link-button"
                onClick={() =>
                  dispatch(toggleModal({ key: "registerModal", value: true }))
                }
              >
                Sign Up
              </button>{" "}
              to leave a comment.
            </p>
          )}
          <CommentsList
            passedComments={localComments}
            handleCommentSubmit={handleNewCommentSubmit}
            handleRepliesClickFromRootLevel={handleRepliesClick}
            handleDeleteComment={handleDeleteComment}
            isRootLevel={true}
            setRootLevelComments={setLocalComments}
            setError={setError}
            getComments={getComments}
            repliesLoadingFromRootLevel={repliesLoading}
            commentIdWithRepliesOpening={commentIdWithRepliesOpening}
          />
        </div>
        {editItemModalToggled ? (
          <EditItemModal
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
        {/* <Footer marginTop={150} /> */}
      </div>
    </>
  );
};
