import { useSelector } from "react-redux";
import { supabase } from "../../../utils/supabase";
import { Arrow } from "../Icons/Arrow";
import "./ItemVotes.css";

export function ItemVotes({
  itemId,
  existingVote,
  setExistingVote,
  votes,
  setVotes,
  postType,
}) {
  const { user } = useSelector((state) => state.auth);
  const initialVote = existingVote

  async function handleItemDownvote() {
    try {
      setExistingVote('Down');

      const { data, error } = await supabase.rpc("add_item_vote", {
        p_item_id: itemId,
        p_vote_direction: "Down",
        p_user_id: user?.auth_id,
        p_post_type: postType,
      });

      if (error) throw error.message;

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

      setExistingVote(initialVote);
    }
  }

  async function handleItemUpvote() {
    try {
      setExistingVote('Up');

      const { data, error } = await supabase.rpc("add_item_vote", {
        p_item_id: itemId,
        p_vote_direction: "Up",
        p_user_id: user?.auth_id,
        p_post_type: postType,
      });

      if (error) throw error.message;

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
      setExistingVote(initialVote);
    }
  }

  return (
    <div className="item-like-and-dislike">
      
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
  );
}
