import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import { resetFilters } from "../../../redux/filters";
import RightSideMenu from "../RightSideMenu/RightSideMenu";
import HomeIcon from "../Icons/HomeIcon";
import FilterIcon from "../Icons/FilterIcon";
import SearchBar from "../SearchBar/SearchBar";
import { setDraftSearchValue } from "../../../redux/search";
import { setFlag } from "../../../redux/flags";
import useWindowSize from "../../../utils/useWindowSize";
import { useCurrentPath } from "../../../utils/usefulFunctions";

function Navbar() {
  const dispatch = useDispatch();
  const location = useLocation()
  const { session, user } = useSelector((state) => state.auth);
  const modals = useSelector((state) => state.modals);

  const windowSize = useWindowSize()

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
      <div className="home-link-and-filter-button">
        {location.pathname == '/' && <button
          onClick={() =>
            dispatch(
              toggleModal({
                key: "filtersSidebar",
                value: windowSize.width > 625 ? !modals.filtersSidebarToggled : true,
              })
            )
          }
        >
          <FilterIcon />
        </button>}
        <Link
          to="/"
          className="home-link"
          onClick={() => {
            dispatch(resetFilters());
            dispatch(setFlag({ key: "searchedListingsNeedsUpdate", value: true }));
          }}
        >
          <p>Core PB</p>
          {/* <HomeIcon /> */}
        </Link>
      </div>

      <div className="right-side">
        <SearchBar handleSearchSubmit={handleSearchSubmit} />
        <Link to="/sell" className="sell-link" style={{}}>
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
