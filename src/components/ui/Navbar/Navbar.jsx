import { Link } from "react-router-dom";
import "./Navbar.css";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import RightSideMenu from "../RightSideMenu/RightSideMenu";
import PlusIcon from "../Icons/PlusIcon";
import SearchBar from "../SearchBar/SearchBar";
import { setDraftSearchValue } from "../../../redux/search";

function Navbar() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
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
        PBMRKT
      </Link>

      <div className="right-side">
        <SearchBar handleSearchSubmit={handleSearchSubmit} />
        <Link to="/sell" className="sell-link">
          {/* <PlusIcon /> */}
          Sell
        </Link>

        {auth.session?.user ? (
          <>
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
      {modals.rightSideMenuToggled && auth.session && <RightSideMenu />}
    </nav>
  );
}

export default Navbar;
