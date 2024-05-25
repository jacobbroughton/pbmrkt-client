import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import LoadingOverlay from "../../ui/LoadingOverlay/LoadingOverlay";
import "./Item.css";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../../../utils/supabase";
import EditItemModal from "../../ui/EditItemModal/EditItemModal";
import { toggleModal } from "../../../redux/modals";
// import { setComments, setNewCommentBody } from "../../../redux/comments";
import CommentsList from "../../ui/CommentsList/CommentsList";
import Arrow from "../../ui/Icons/Arrow";
import { determineStarFillArray, getTimeAgo } from "../../../utils/usefulFunctions";
import Stars from "../../ui/Stars/Stars";
import SendIcon from "../../ui/Icons/SendIcon";

const Item = () => {
  const dispatch = useDispatch();
  // const user = useSelector((state) => state.auth.session?.user);
  const modals = useSelector((state) => state.modals);
  const { session } = useSelector((state) => state.auth);
  // const { comments, newCommentBody } = useSelector((state) => state.comments);
  const { itemID } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(true);
  const [deletedModalShowing, setDeletedModalShowing] = useState(false);
  const [newCommentBody, setNewCommentBody] = useState("");
  // const [newReplyBody, setNewReplyBody] = useState("");
  // const [commentWithReplyWindowID, setCommentWithReplyWindowID] = useState(null);
  const [localComments, setLocalComments] = useState(null);
  const [markAsSoldLoading, setMarkAsSoldLoading] = useState(false);

  useEffect(() => {
    async function getItem() {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc("get_item", { p_item_id: itemID });

        if (error) {
          console.log(data);
          console.log(error);
          throw error.message;
        }
        if (!data) throw "item not found";

        const { data: data2, error: error2 } = await supabase.rpc(
          "get_item_photo_metadata",
          { p_item_id: itemID }
        );

        if (error2) throw error2.message;

        console.log(data[0]);

        const { data: data3, error: error3 } = supabase.storage
          .from("profile_pictures")
          .getPublicUrl(data[0].profile_picture_path);

        if (error3) throw error.message;

        console.log(data3);

        setItem({
          photos: data2,
          info: { ...data[0], profile_picture: data3?.publicUrl },
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
      const { data, error } = await supabase.rpc("delete_item", {
        p_item_id: item.info.id,
      });

      setDeletedModalShowing(true);
    } catch (error) {
      setError(error);
    }
    setLoading(false);
  }

  // async function handleReplySubmit(e, replyParentID) {
  //   e.preventDefault();

  //   try {
  //     const { data, error } = await supabase.rpc("add_comment", {
  //       p_body: replyParentID ? newReplyBody : newCommentBody,
  //       p_created_by_id: session.user.id,
  //       p_item_id: itemID,
  //       p_parent_id: replyParentID,
  //     });
  //     if (error) console.error(error);
  //     else console.log(data);

  //     console.log(data);

  //     // setCommentWithReplyWindowID(null);
  //     getComments();

  //     dispatch(setNewCommentBody(""));
  //     // setNewReplyBody("");
  //   } catch (error) {
  //     console.log(error);
  //     setError(error);
  //   }
  // }

  async function handleNewCommentSubmit(e) {
    e.preventDefault();

    try {
      const { data, error } = await supabase.rpc("add_comment", {
        p_body: newCommentBody,
        p_created_by_id: session.user.id,
        p_item_id: itemID,
        p_parent_id: null,
      });
      if (error) console.error(error);
      else console.log("added comment", data);

      getComments();
      setNewCommentBody("");
    } catch (error) {
      console.log(error);
      setError(error);
    }
  }

  async function getComments() {
    try {
      const { data, error } = await supabase.rpc("get_comments_experimental", {
        p_item_id: itemID,
      });

      // setCommentWithReplyWindowID(null);
      setLocalComments(
        data.map((comment) => ({ ...comment, replies: [], repliesToggled: false }))
      );
      // dispatch(setComments(data.map((comment) => ({ ...comment, replies: [] }))));
    } catch (error) {
      console.log(error);
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
      // dispatch(
      //   setComments(
      //     comments.map((comment) => {
      //       return {
      //         ...comment,
      //         ...(comment.id == commentId && {
      //           eff_status: 0,
      //         }),
      //       };
      //     })
      //   )
      // );
    } catch (error) {
      console.log(error);
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
      console.log(error);
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
      console.log(error);
      throw error.message;
    }

    setLocalComments(
      localComments.map((comm) => {
        return {
          ...comm,
          tier: 0,
          ...(comm.id == commentWithReplies.id && {
            replies: data,
            repliesToggled: !comm.repliesToggled,
            reply_count: data.length,
          }),
        };
      })
    );
    // dispatch(
    //   setComments(
    //     comments.map((comm) => {
    //       return {
    //         ...comm,
    //         tier: 0,
    //         ...(comm.id == commentWithReplies.id && {
    //           replies: data,
    //         }),
    //       };
    //     })
    //   )
    // );
  }

  if (!item && loading) return <LoadingOverlay message="Fetching item..." />;
  if (!item) return <p>item not found</p>;

  const isAdmin = session && item.info?.created_by_id == session.user?.id;

  if (error) return <p>There was an error - {error.toString()}</p>;
  if (!item.info?.eff_status) return <p>This item was deleted.</p>;

  return (
    <div className="item">
      {deletedModalShowing && (
        <>
          <div className="deleted-modal">
            <h3>This item was deleted</h3>
            <div className="links">
              <Link to="/">Return home</Link>
              <Link to="/sell">Create a new listing</Link>
            </div>
          </div>
          <div className="modal-overlay"></div>
        </>
      )}
      {isAdmin ? (
        <>
          <div className="seller-controls">
            <p>Seller Controls</p>
            <div className="seller-buttons">
              <button className="button" onClick={() => handleDelete()}>
                Delete Listing
              </button>
              <button className="button" onClick={() => handleEditButtonClick()}>
                Edit
              </button>
              <button
                className="button"
                onClick={() =>
                  handleStatusChange(
                    item.info.status == "Available" ? "Sold" : "Available"
                  )
                }
              >
                Mark as {item.info.status == "Available" ? "Sold" : "Available"}{" "}
                {markAsSoldLoading ? "..." : ""}
              </button>
            </div>
            {/* <div className="horizontal-divider"></div> */}
          </div>
        </>
      ) : (
        false
      )}

      <div className="content">
        <div className="images-and-info">
          <div className="item-images">
            <div className="main-image-parent">
              {selectedPhoto ? (
                <img
                  className="item-main-image"
                  src={`https://mrczauafzaqkmjtqioan.supabase.co/storage/v1/object/public/item_images/${selectedPhoto?.path}`}
                />
              ) : (
                <div className="main-image-placeholder"></div>
              )}
            </div>
            <div className="item-thumbnails">
              {item.photos.map((photo) => (
                <img
                  key={photo.id}
                  className={`item-thumbnail-image ${
                    photo.id === selectedPhoto?.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedPhoto(photo)}
                  src={`https://mrczauafzaqkmjtqioan.supabase.co/storage/v1/object/public/item_images/${photo.path}`}
                />
              ))}
            </div>
          </div>

          <div className="item-info">
            <h1>{item.info.what_is_this}</h1>

            <p className="price">
              ${item.info.price}
              {item.info.shipping_cost ? ` + $${item.info.shipping_cost} shipping` : ""}
              {item.info.price != item.info.orig_price &&
                (item.info.price > item.info.orig_price ? (
                  <div className="price-change-display up">
                    <p>
                      Up ${item.info.price - item.info.orig_price} from $
                      {item.info.orig_price}
                    </p>
                    <Arrow direction="up" />
                  </div>
                ) : (
                  <div className="price-change-display down">
                    <p>
                      Down ${item.info.orig_price - item.info.price} from $
                      {item.info.orig_price}
                    </p>
                    <Arrow direction="down" />
                  </div>
                ))}
            </p>

            <div className="horizontal-divider extra-top-margin"></div>

            <table className="specs">
              <tr>
                <td>Availability</td>
                <td>
                  {item.info.status} as of{" "}
                  {/* //whenever the user last visited the site */ getTimeAgo(new Date())}
                </td>
              </tr>
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
            </table>
          </div>
          <p className="details">{item.info.details || "No details were provided"}</p>
          <div className="seller-info-container">
            {/* <p className="heading">Seller Info</p> */}
            <div className="seller-info">
              <div className="profile-picture-container">
                {/* <div className="profile-picture">&nbsp;</div> */}
                <img className="profile-picture" src={item.info.profile_picture} />
              </div>
              <div className="text">
                <p>
                  {item.info.city}, {item.info.state}
                </p>
                <Link to={`/user/${item.info.created_by_username}`} className="user-link">
                  {item.info.created_by_username}
                </Link>
                {/* <div className="stars">
                    {stars.map((fillDesc) => {
                      return <Star fillType={fillDesc} />;
                    })}
                  </div> */}
                <Stars rating={item.info.seller_rating} />
              </div>
            </div>
          </div>
        </div>
        {/* <div className="horizontal-divider"></div> */}
      </div>
      <div className="comments-section">
        <div className="horizontal-divider"></div>
        <h3>Comments</h3>
        {session?.user ? (
          <form onSubmit={(e) => handleNewCommentSubmit(e)} className="comment-form">
            <textarea
              placeholder="Add a comment..."
              onChange={(e) => setNewCommentBody(e.target.value)}
              value={newCommentBody}
            />
            <button type="submit">
              Submit <SendIcon />
            </button>
          </form>
        ) : (
          <p>
            <Link to="/login">Login</Link> or <Link to="/register">sign up</Link> to leave
            comment.
          </p>
        )}

        {/* {localComments?.length ? (
          <> */}
        <div className="horizontal-divider"></div>
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
        {/* </> */}
        {/* ) : (
          <p>No comments, consider starting the conversation!</p>
        )} */}
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
    </div>
  );
};
export default Item;
