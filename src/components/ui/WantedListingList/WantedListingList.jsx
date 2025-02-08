import { Link } from "react-router-dom";
import "./WantedListingList.css";
import { getTimeAgo } from "../../../utils/usefulFunctions";

export const WantedListingList = ({ listings }) => {
  return (
    <ul className="listing-list">
      {listings.map((listing) => {
        let truncatedDescriptionText = listing.description;

        if (truncatedDescriptionText.length > 200) {
          truncatedDescriptionText =
            truncatedDescriptionText.slice(0, 199).trim() + "...";
        }

        return (
          <li key={listing.id}>
            <div className="image-wrapper">
              <Link className="image-container" to={`/wanted/${listing.id}`}>
                <img
                  src={
                    listing.url ||
                    `https://mrczauafzaqkmjtqioan.supabase.co/storage/v1/object/public/item_images/placeholders/placeholder.jpg`
                  }
                />
              </Link>
              {listing.image_count > 1 && (
                <p className="small-text image-count">{listing.image_count} Photos</p>
              )}
            </div>
            <div className="info">
              <Link className="what-is-this" to={`/wanted/${listing.id}`}>
                WANTED: {listing.title}
              </Link>
              <p className="small-text details">{truncatedDescriptionText}</p>

              <p className="small-text location">
                <strong>Location:</strong> {listing.city}, {listing.state}
              </p>
              <p className="seller small-text">
                <strong>Buyer: </strong>
                <Link to={`/user/${listing.username}`}>{listing.username}</Link>
              </p>
              <p className="small-text">
                <strong>Listed </strong> {getTimeAgo(new Date(listing.created_at))}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
