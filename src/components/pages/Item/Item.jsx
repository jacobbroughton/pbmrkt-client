import LoadingOverlay from "../../ui/LoadingOverlay/LoadingOverlay";
import EditItemModal from "../../ui/EditItemModal/EditItemModal";
import CommentsList from "../../ui/CommentsList/CommentsList";
import Footer from "../../ui/Footer/Footer";
import Stars from "../../ui/Stars/Stars";
import SendIcon from "../../ui/Icons/SendIcon";
import CheckIcon from "../../ui/Icons/CheckIcon";
import PriceChangeHistoryModal from "../../ui/PriceChangeHistoryModal/PriceChangeHistoryModal";
import ChartIcon from "../../ui/Icons/ChartIcon";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../../../utils/supabase";
import { toggleModal } from "../../../redux/modals";
import { getTimeAgo } from "../../../utils/usefulFunctions";
import "./Item.css";
import XIcon from "../../ui/Icons/XIcon";
import ThreeDots from "../../ui/Icons/ThreeDots";
import WarningCircle from "../../ui/Icons/WarningCircle";
import WarningTriangle from "../../ui/Icons/WarningTriangle";

const Item = () => {
  const dispatch = useDispatch();
  const modals = useSelector((state) => state.modals);
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

  useEffect(() => {
    async function getItem() {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc("get_item", { p_item_id: itemID });

        if (error) {
          console.error(error);
          throw error.message;
        }
        if (!data) throw "item not found";

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

        setItem({
          photos: data2,
          info: { ...data[0], profile_picture_url: data3?.publicUrl },
        });
        setSelectedPhoto(data2[0]);
      } catch (error) {
        setError(error);
      }
      setLoading(false);
    }

    getItem();
    getComments();
  }, []);

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
      if (error) throw error.message;

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
      });

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
    dispatch(toggleModal({ key: "editItemModal", value: !modals.editItemModalToggled }));
  }

  async function handleStatusChange(newStatus) {
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
    e.preventDefault();
    const { data, error } = await supabase.rpc("get_child_comments", {
      p_item_id: item.info.id,
      p_parent_comment_id: commentWithReplies.id,
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
            <div className="main-image-parent">
              {selectedPhoto ? (
                <img className="item-main-image" src={selectedPhoto.url} />
              ) : (
                <div className="main-image-placeholder"></div>
              )}
            </div>
            {item.photos.length > 1 && (
              <div className="item-thumbnails">
                {item.photos.map((photo) => (
                  <img
                    key={photo.id}
                    className={`item-thumbnail-image ${
                      photo.id === selectedPhoto?.id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedPhoto(photo)}
                    src={photo.url}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="content">
            <div className="images-and-info">
              {/* Images */}
              <div className="primary-info">
                {isAdmin && (
                  <button
                    title="Modify the properties of this item"
                    type="button"
                    className="edit-item-menu-toggle"
                    onClick={() =>
                      dispatch(
                        toggleModal({
                          key: "editItemModal",
                          value: !modals.editItemMenuToggled,
                        })
                      )
                    }
                  >
                    <ThreeDots />
                  </button>
                )}
                {editItemMenuToggled && <div></div>}
                <h1>{item.info.what_is_this}</h1>
                <div className="price-and-toggle">
                  <p>
                    ${item.info.price}
                    {item.info.shipping_cost
                      ? ` + $${item.info.shipping_cost} shipping`
                      : " + Free Shipping"}
                  </p>
                  {priceChangeHistory?.length >= 1 && (
                    <button
                      className="button price-change-modal-toggle"
                      onClick={() =>
                        dispatch(toggleModal({ key: "priceChangeModal", value: true }))
                      }
                    >
                      Price History
                      <ChartIcon />
                    </button>
                  )}
                </div>
                <p className={`status-as-of ${item.info.status.toLowerCase()}`}>
                  {item.info.status == "Available" ? <CheckIcon /> : <XIcon />}
                  {item.info.status} as of {getTimeAgo(new Date())}
                </p>
              </div>

              {/* <div className="horizontal-divider"></div> */}
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
                <label>Extra Info</label>
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

                  <Stars rating={item.info.seller_rating} />
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
            <p>
              <Link to="/login">Login</Link> or <Link to="/register">sign up</Link> to
              leave comment.
            </p>
          )}

          {/* <div className="horizontal-divider"></div> */}
          <CommentsList
            passedComments={localComments}
            handleCommentSubmit={handleNewCommentSubmit}
            handleRepliesClickFromRootLevel={handleRepliesClick}
            handleDeleteComment={handleDeleteComment}
            isRootLevel={true}
            setRootLevelComments={setLocalComments}
            setError={setError}
            getComments={getComments}
          />
        </div>
        {modals.editItemModalToggled ? (
          <EditItemModal
            item={item}
            setItem={(newItem) => {
              setItem(newItem);
            }}
          />
        ) : (
          false
        )}
        {modals.priceChangeModalToggled ? (
          <PriceChangeHistoryModal item={item} priceChangeHistory={priceChangeHistory} />
        ) : (
          false
        )}
      <Footer marginTop={100} />
      </div>
    </>
  );
};
export default Item;
