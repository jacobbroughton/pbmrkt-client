import { Link } from "react-router-dom";
import { supabase } from "../../../utils/supabase";
import "./WantedListingList.css";
import { getTimeAgo } from "../../../utils/usefulFunctions";

export const WantedListingList = ({ listings }) => {
  return (
    <ul className="listing-list">
      {listings.map((listing) => {
        console.log(listing)
        const { data } = supabase.storage.from("wanted_item_images").getPublicUrl(listing.thumbnail_path);
        const imageUrl = data.publicUrl;

        let truncatedDescriptionText = listing.description;

        if (truncatedDescriptionText.length > 200) {
          truncatedDescriptionText = truncatedDescriptionText.slice(0, 199).trim() + "...";
        }

        return (
          <li key={listing.id}>
            <div className="image-wrapper">
              <Link className="image-container" to={`/wanted/${listing.id}`}>
              {listing.thumbnail_path ? (
                  <img src={imageUrl} />
                ) : (
                  <img
                    src={`https://mrczauafzaqkmjtqioan.supabase.co/storage/v1/object/public/wanted_item_images/placeholders/placeholder.jpg`}
                  />
                )}
              </Link>
              {listing.image_count > 1 && (
                <p className="small-text photo-count">{listing.image_count} Photos</p>
              )}
            </div>
            <div className="info">
              <Link className="what-is-this" to={`/listing/${listing.id}`}>
                WANTED: {listing.title}
              </Link>
              <p className="small-text details">{truncatedDescriptionText}</p>
              <p className="small-text condition">
                <strong>Condition:</strong> {listing.condition}
              </p>
              <p className="small-text location">
                <strong>Location:</strong> {listing.city}, {listing.state}
              </p>
              <p className="seller small-text">
                <strong>Seller: </strong>
                <Link to={`/user/${listing.username}`}>{listing.username}</Link>
              </p>
              <p className="small-text">
                <strong>Listed </strong> {getTimeAgo(new Date(listing.created_dttm))}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
