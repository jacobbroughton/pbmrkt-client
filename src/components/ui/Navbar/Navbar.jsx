import { Link } from "react-router-dom";
import "./Navbar.css";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import RightSideMenu from "../RightSideMenu/RightSideMenu";
import HomeIcon from "../Icons/HomeIcon";
import SearchBar from "../SearchBar/SearchBar";
import { setDraftSearchValue } from "../../../redux/search";

function Navbar() {
  const dispatch = useDispatch();
  const { session, user } = useSelector((state) => state.auth);
  const modals = useSelector((state) => state.modals);

  function handleRightSideMenuToggle(e) {
    e.preventDefault();
    e.stopPropagation();

    dispatch(toggleModal({ key: "rightSideMenu", value: !modals.rightSideMenuToggled }));
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    dispatch(setDraftSearchValue(draftSearchValue));

    getListings(draftSearchValue);
  }

  return (
    <nav>
      <Link to="/" className="home-link">
        <p>core_pb</p>
        <HomeIcon />
      </Link>

      <div className="right-side">
        <SearchBar handleSearchSubmit={handleSearchSubmit} />
        <Link to="/sell" className="sell-link">
          {/* <PlusIcon /> */}
          Sell
        </Link>

        {session?.user ? (
          <>
            <button
              onClick={handleRightSideMenuToggle}
              className="right-side-menu-button"
            >
              <img className="profile-picture" src={user.profile_picture_url} />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="login-link">
              Login
            </Link>
            {/* <Link to="/register">Register</Link> */}
          </>
        )}
        {/* {!user && <Link to="/login">Login</Link>} */}
        {/* {!user && <Link to="/register">Register</Link>} */}
      </div>
      {modals.rightSideMenuToggled && session && <RightSideMenu />}
    </nav>
  );
}

export default Navbar;
