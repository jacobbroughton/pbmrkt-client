import { Link } from "react-router-dom";
import { LoadingOverlay } from "../LoadingOverlay/LoadingOverlay";
import { supabase } from "../../../utils/supabase";
import "./WantedListingGrid.css";

export const WantedListingGrid = ({ listings, accountForSidebar, loading }) => {
  return (
    <div className={`grid ${accountForSidebar ? "accounts-for-sidebar" : ""}`}>
      {listings?.map((listing) => {
        const { data, error } = supabase.storage
          .from("wanted_item_images")
          .getPublicUrl(listing?.thumbnail_path, {
            // transform: {
            //   height: 400,
            //   width: 400,
            // },
          });

        if (error) throw error.message;

        const imageUrl = data.publicUrl;
        return (
          <Link
            to={`/wanted/${listing.id}`}
            key={listing.id}
            title={listing.what_is_this}
          >
            <div className="grid-item">
              <div className="image-container">
                <div className="indicators">
                  {listing.trades == "Accepting Trades" ? (
                    <p className="trades">
                      Open to Trades{" "}
                      {listing.accepted_trades && (
                        <p className="info-bubble" title={listing.accepted_trades}>
                          i
                        </p>
                      )}
                    </p>
                  ) : (
                    false
                  )}{" "}
                  {listing.shipping_cost == 0 ? (
                    <p className="free-shipping">Free Shipping</p>
                  ) : (
                    false
                  )}
                </div>
                {listing.thumbnail_path ? (
                  <img src={imageUrl} />
                ) : (
                  <img
                    src={`https://mrczauafzaqkmjtqioan.supabase.co/storage/v1/object/public/wanted_item_images/placeholders/placeholder.jpg`}
                  />
                )}
              </div>
              <div className="listing-card-info">
                <div className="price-and-name">
                  <p className="price">${listing.budget.toLocaleString("en-US")}</p>
                  <p className="what-is-this">WANTED: {listing.title}</p>
                </div>
                <div className="profile">
                  asdf
                  <Link className="small-text bold" to={`/user/${listing.username}`}>
                    <div className="profile-picture-container">
                      <img className="profile-picture" src={listing.profile_picture} />
                    </div>
                    {listing.username}
                  </Link>
                </div>
                <p className="location">
                  {listing.city}, {listing.state}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
      {loading && <LoadingOverlay zIndex={1} />}
    </div>
  );
};
