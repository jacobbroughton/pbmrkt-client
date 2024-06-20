import { Link } from "react-router-dom";
import "./UnauthenticatedOptionsMenu.css";

const UnauthenticatedOptionsMenu = () => {
  return (
    <div className="unauthenticated-options-menu">
      <Link to="/register">Register</Link>
      <Link to="/login">Login</Link>
    </div>
  );
};
export default UnauthenticatedOptionsMenu;
