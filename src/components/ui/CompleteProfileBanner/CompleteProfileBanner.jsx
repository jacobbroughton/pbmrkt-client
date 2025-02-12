import { Link } from "react-router-dom";
import "./CompleteProfileBanner.css";

const CompleteProfileBanner = () => {
  return (
    <Link className="complete-profile-banner" to="edit-profile">
      Complete your profile to begin selling. Click here.
    </Link>
  );
};
export default CompleteProfileBanner;
