import { Link } from "react-router-dom";
import "./Navbar.css";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import RightSideMenu from "../RightSideMenu/RightSideMenu";
import PlusIcon from "../Icons/PlusIcon";

function Navbar() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const modals = useSelector((state) => state.modals);

  function handleRightSideMenuToggle(e) {
    e.preventDefault();
    e.stopPropagation();

    dispatch(toggleModal({ key: "rightSideMenu", value: !modals.rightSideMenuToggled }));
  }

  return (
    <nav>
      <Link to="/" className="home-link">
        PBMRKT
      </Link>
      <div className="nav-links">
        {auth.session?.user ? (
          <>
            <Link to="/sell" className='sell-link'>
              {/* <PlusIcon /> */}
              Sell
            </Link>

            <button
              onClick={handleRightSideMenuToggle}
              className="right-side-menu-button"
            >
              <div className="profile-picture"></div>
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            {/* <Link to="/register">Register</Link> */}
          </>
        )}
        {/* {!auth.user && <Link to="/login">Login</Link>} */}
        {/* {!auth.user && <Link to="/register">Register</Link>} */}
      </div>
      {modals.rightSideMenuToggled && <RightSideMenu />}
    </nav>
  );
}

export default Navbar;
