import { Link } from "react-router-dom";
import "./ListingGrid.css";
import LoadingOverlay from "../LoadingOverlay/LoadingOverlay";

const ListingGrid = ({ listings, accountForSidebar, loading }) => {
  return (
    <div className={`grid ${accountForSidebar ? "accounts-for-sidebar" : ""}`}>
      {listings?.map((listing) => (
        <Link to={`/${listing.id}`} key={listing.id} title={listing.what_is_this}>
          <div className="grid-item">
            <div className="image-container">
              {listing.path ? (
                <img
                  src={`https://mrczauafzaqkmjtqioan.supabase.co/storage/v1/object/public/item_images/${listing?.path}`}
                />
              ) : (
                <img
                  src={`https://mrczauafzaqkmjtqioan.supabase.co/storage/v1/object/public/item_images/placeholders/placeholder.jpg`}
                />
              )}
            </div>
            <div className="listing-card-info">
              <div className="price-and-name">
                <p className="price">${listing.price.toLocaleString('en-US')}</p>
                <p className="what-is-this">{listing.what_is_this}</p>
              </div>
              <div className="profile">
                <Link className="small-text bold" to={`/user/${listing.username}`}>
                  <div className="profile-picture-container">
                    <img className="profile-picture" src={listing.profile_picture} />
                  </div>
                  {listing.username}
                </Link>
              </div>
              <p className='location'>{listing.city}, {listing.state}</p>
            </div>
          </div>
        </Link>
      ))}
      {loading && <LoadingOverlay zIndex={1} />}
    </div>
  );
};
export default ListingGrid;
