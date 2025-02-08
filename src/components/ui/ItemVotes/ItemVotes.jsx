import { useSelector } from "react-redux";
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
  const initialVote = existingVote;

  async function handleItemDownvote() {
    try {
      setExistingVote("Down");

      const response = await fetch("http://localhost:4000/add-item-vote", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          item_id: itemId,
          vote_direction: "Down",
          user_id: user?.id,
          post_type: postType,
        }),
      });

      if (!response.ok) throw new Error("Something happened at add-item-vote");

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
      setExistingVote("Up");

      const response = await fetch("http://localhost:4000/add-item-vote", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          item_id: itemId,
          vote_direction: "Up",
          user_id: user?.id,
          post_type: postType,
        }),
      });

      if (!response.ok) throw new Error("Something happened at add-item-vote");

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
