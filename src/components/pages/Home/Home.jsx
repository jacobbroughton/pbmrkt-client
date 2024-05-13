import { Link } from "react-router-dom";
import "./Home.css";
import SearchIcon from "../../ui/Icons/SearchIcon.jsx";
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase.js";
import DoubleArrow from "../../ui/Icons/DoubleArrow.jsx";
import useWindowSize from "../../../utils/useWindowSize";
import { states, statesAndCities } from "../../../utils/statesAndCities.js";
import { capitalizeWords } from "../../../utils/usefulFunctions.js";

function Listings() {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [draftSearchValue, setDraftSearchValue] = useState("");
  const [listingsError, setListingsError] = useState(null);
  const [sort, setSort] = useState("Date Listed (New-Old)");
  const [filtersUpdated, setFiltersUpdated] = useState(false);
  const windowSize = useWindowSize();
  const [sidebarToggled, setSidebarToggled] = useState(windowSize.width > 625);
  const [sidebarNeedsUpdate, setSidebarNeedsUpdate] = useState(windowSize.width > 625);

  const [views, setViews] = useState([
    {
      id: 0,
      label: "For Sale",
      toggled: true,
    },
    {
      id: 1,
      label: "Looking To Buy",
      toggled: false,
    },
  ]);

  const initialFilters = {
    brand: "",
    model: "",
    minPrice: 0,
    maxPrice: null,
    city: "All",
    state: "All",
    conditionOptions: [
      { id: 0, value: "Brand New", checked: true },
      { id: 1, value: "Like New", checked: true },
      { id: 2, value: "Used", checked: true },
      { id: 3, value: "Heavily Used", checked: true },
      { id: 4, value: "Not Functional", checked: true },
    ],
    shippingOptions: [
      { id: 0, value: "Willing to Ship", checked: true },
      { id: 1, value: "Local Only", checked: true },
    ],
    tradeOptions: [
      { id: 0, value: "Accepting Trades", checked: true },
      { id: 1, value: "No Trades", checked: true },
    ],
    negotiableOptions: [
      { id: 0, value: "Firm", checked: true },
      { id: 1, value: "OBO/Negotiable", checked: true },
    ],
  };

  const [filters, setFilters] = useState({
    draft: initialFilters,
    saved: initialFilters,
  });

  useEffect(() => {
    if (windowSize.width > 625) {
      setSidebarToggled(true);
      setSidebarNeedsUpdate(true);
    }
    if (windowSize.width <= 625 && sidebarNeedsUpdate) {
      setSidebarToggled(false);
      setSidebarNeedsUpdate(false);
    }
  }, [windowSize.width]);

  useEffect(() => {
    console.log(filters.draft);
  }, [filters.draft]);

  async function getListings(searchValue = "") {
    try {
      if (!listingsLoading) {
        setListingsLoading(true);
      }

      const { data, error } = await supabase.rpc("get_items", {
        p_search_value: searchValue,
        p_brand: filters.saved.brand,
        p_model: filters.saved.model,
        p_min_price: filters.saved.minPrice || 0,
        p_max_price: filters.saved.maxPrice,
        p_state: filters.saved.state || "",
        p_condition: filters.saved.conditionOptions
          .filter((option) => option.checked)
          .map((option) => option.value),
        p_shipping: filters.saved.shippingOptions
          .filter((option) => option.checked)
          .map((option) => option.value),
        p_trades: filters.saved.tradeOptions
          .filter((option) => option.checked)
          .map((option) => option.value),
        p_negotiable: filters.saved.negotiableOptions
          .filter((option) => option.checked)
          .map((option) => option.value),
        p_sort: sort,
        p_seller_id: null,
        p_city: filters.saved.city || "",
      });

      if (error) throw error.message

      if (!data) throw "No listings available";

      setListings(data);
      setListingsLoading(false);

      if (isInitialLoad) setIsInitialLoad(false);
      if (filtersUpdated) setFiltersUpdated(false);
    } catch (error) {
      setListingsError(error);
    }
  }

  useEffect(() => {
    getListings(searchValue);
  }, [sort]);

  useEffect(() => {
    if (filtersUpdated) getListings(searchValue);
  }, [filtersUpdated]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setSearchValue(draftSearchValue);

    getListings(draftSearchValue);
  }

  function handleConditionFilterSelect(e, selectedOption) {
    setFilters((prevState) => ({
      ...prevState,
      draft: {
        ...prevState.draft,
        conditionOptions: prevState.draft.conditionOptions.map((option) => ({
          ...option,
          ...(option.id == selectedOption.id && {
            checked: e.target.checked,
          }),
        })),
      },
    }));
  }

  function handleNegotiableFilterSelect(e, selectedOption) {
    setFilters((prevState) => {
      return {
        ...prevState,
        draft: {
          ...prevState.draft,
          negotiableOptions: prevState.draft.negotiableOptions.map((option) => ({
            ...option,
            ...(option.id == selectedOption.id && {
              checked: e.target.checked,
            }),
          })),
        },
      };
    });
  }

  function handleStateFilterSelect(e) {
    setFilters((prevState) => {
      return {
        ...prevState,
        draft: {
          ...prevState.draft,
          state: e.target.value,
          city: "All",
        },
      };
    });
  }

  function handleCityFilterSelect(e) {
    setFilters((prevState) => {
      return {
        ...prevState,
        draft: {
          ...prevState.draft,
          city: e.target.value,
        },
      };
    });
  }

  function handleTradesFilterSelect(e, selectedOption) {
    setFilters((prevState) => {
      return {
        ...prevState,
        draft: {
          ...prevState.draft,
          tradeOptions: prevState.draft.tradeOptions.map((option) => ({
            ...option,
            ...(option.id == selectedOption.id && {
              checked: e.target.checked,
            }),
          })),
        },
      };
    });
  }

  function handleShippingFilterSelect(e, selectedOption) {
    setFilters((prevState) => ({
      ...prevState,
      draft: {
        ...prevState.draft,
        shippingOptions: prevState.draft.shippingOptions.map((option) => ({
          ...option,
          ...(option.id == selectedOption.id && {
            checked: e.target.checked,
          }),
        })),
      },
    }));
  }

  function handleFiltersApply(e) {
    e.preventDefault();

    setFilters({ ...filters, saved: filters.draft });
    setFiltersUpdated(true);
    if (windowSize.width <= 625) setSidebarToggled(false)
    // getListings(searchValue);
  }

  console.log({
    draft: filters.draft.negotiableOptions,
    saved: filters.saved.negotiableOptions,
  });

  function handleFiltersReset(e) {

    console.log({
      ...filters,
      draft: initialFilters
    })
    setFilters({
      ...filters,
      draft: initialFilters
    })
  }

  const applyButtonDisabled =
    (filters.draft.brand == filters.saved.brand &&
      filters.draft.model == filters.saved.model &&
      filters.draft.minPrice == filters.saved.minPrice &&
      filters.draft.maxPrice == filters.saved.maxPrice &&
      filters.draft.city == filters.saved.city &&
      filters.draft.state == filters.saved.state &&
      filters.draft.negotiableOptions == filters.saved.negotiableOptions &&
      filters.draft.tradeOptions == filters.saved.tradeOptions &&
      filters.draft.conditionOptions == filters.saved.conditionOptions &&
      filters.draft.shippingOptions == filters.saved.shippingOptions) ||
    filters.draft.negotiableOptions.filter((option) => option.checked).length == 0 ||
    filters.draft.tradeOptions.filter((option) => option.checked).length == 0 ||
    filters.draft.conditionOptions.filter((option) => option.checked).length == 0 ||
    filters.draft.shippingOptions.filter((option) => option.checked).length == 0;

  return (
    <div className="listings">
      <div className="sidebar-and-grid">
        {/* {!sidebarToggled && (
          <button onClick={() => setSidebarToggled(true)} type="button" className='sidebar-toggle-button'>
            <DoubleArrow direction="right" />
          </button>
        )} */}
        {sidebarToggled && (
          <aside className={`sidebar ${windowSize.width <= 625 ? "over-nav" : ""}`}>
            {" "}
            <form className="filters" onSubmit={handleFiltersApply}>
              {windowSize.width <= 625 && (
                <button
                  onClick={() => setSidebarToggled(false)}
                  type="button"
                  className="close-sidebar-button"
                >
                  <DoubleArrow direction="left" />
                </button>
              )}
              <button onClick={handleFiltersReset} type='button' className='reset-button'>Reset</button>
              <button
                className="cta-button apply"
                type="submit"
                disabled={applyButtonDisabled}
              >
                Apply
              </button>
              <div className="filter-items">
                <div className="filter-item">
                  <label>By Brand</label>
                  <input
                    placeholder="Planet Eclipse, Dye, Tippmann"
                    type="text"
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        draft: { ...filters.draft, brand: e.target.value },
                      })
                    }
                    value={filters.draft.brand}
                  />
                </div>
                <div className="filter-item">
                  <label>By Model</label>
                  <input
                    placeholder="CS1, Drone, Intimidator"
                    type="text"
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        draft: { ...filters.draft, model: e.target.value },
                      })
                    }
                    value={filters.draft.model}
                  />
                </div>
                <div className="filter-item">
                  <label>By State</label>

                  <select onChange={handleStateFilterSelect}>
                    <option>All</option>
                    {states.map((state) => (
                      <option>{state}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-item">
                  <label>By City</label>

                  <select
                    className=""
                    disabled={filters.draft.state == "All"}
                    onChange={handleCityFilterSelect}
                    value={filters.draft.city}
                  >
                    <option>All</option>
                    {statesAndCities[filters.draft.state]?.map((city) => (
                      <option>{capitalizeWords(city)}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-item">
                  <div className="min-max-price-inputs">
                    <div className="min-max-input-container">
                      <label>Min. Price</label>
                      <input
                        type="number"
                        placeholder="$15"
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            draft: { ...filters.draft, minPrice: e.target.value },
                          })
                        }
                        value={filters.draft.minPrice}
                      />
                    </div>
                    <div className="min-max-input-container">
                      <label>Max Price</label>
                      <input
                        type="number"
                        placeholder="$450"
                        className={`${
                          parseFloat(filters.draft.minPrice) >
                          parseFloat(filters.draft.maxPrice)
                            ? "error"
                            : ""
                        }`}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            draft: { ...filters.draft, maxPrice: e.target.value || null },
                          })
                        }
                        value={filters.draft.maxPrice}
                      />
                    </div>
                  </div>
                  {parseFloat(filters.draft.minPrice) >
                  parseFloat(filters.draft.maxPrice) ? (
                    <p className="filter-warning">Max must be equal or greater</p>
                  ) : filters.draft.minPrice[0] == 0 ||
                    (filters.draft.maxPrice && filters.draft?.maxPrice[0]) == "" ? (
                    <p className="filter-warning">Min/Max cannot start with '0'</p>
                  ) : (
                    false
                  )}
                </div>
                <div className="filter-item">
                  <label>By Condition</label>
                  <div className="checkbox-options">
                    {filters.draft.conditionOptions.map((conditionOption) => (
                      <div
                        className={`checkbox-option ${
                          conditionOption.checked ? "checked" : ""
                        }`}
                      >
                        <label>
                          <input
                            type="checkbox"
                            value={conditionOption.value}
                            onChange={(e) =>
                              handleConditionFilterSelect(
                                e,
                                conditionOption,
                                filters.draft.conditionOptions
                              )
                            }
                            checked={conditionOption.checked}
                          />{" "}
                          {conditionOption.value}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="filter-item">
                  <label>By Shipping</label>
                  <div className="checkbox-options">
                    {filters.draft.shippingOptions.map((shippingOption) => (
                      <div
                        className={`checkbox-option ${
                          shippingOption.checked ? "checked" : ""
                        }`}
                      >
                        <label>
                          <input
                            type="checkbox"
                            value={shippingOption.value}
                            onChange={(e) =>
                              handleShippingFilterSelect(
                                e,
                                shippingOption,
                                filters.draft.shippingOptions
                              )
                            }
                            checked={shippingOption.checked}
                          />{" "}
                          {shippingOption.value}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="filter-item">
                  <label>By Trades</label>
                  <div className="checkbox-options">
                    {filters.draft.tradeOptions.map((tradeOption) => (
                      <div
                        className={`checkbox-option ${
                          tradeOption.checked ? "checked" : ""
                        }`}
                      >
                        <label>
                          <input
                            type="checkbox"
                            value={tradeOption.value}
                            checked={tradeOption.checked}
                            onChange={(e) =>
                              handleTradesFilterSelect(
                                e,
                                tradeOption,
                                filters.draft.tradeOptions
                              )
                            }
                          />{" "}
                          {tradeOption.value}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="filter-item">
                  <label>By Negotiatable</label>
                  <div className="checkbox-options">
                    {filters.draft.negotiableOptions.map((negotiableOption) => (
                      <div
                        className={`checkbox-option ${
                          negotiableOption.checked ? "checked" : ""
                        }`}
                      >
                        <label>
                          <input
                            type="checkbox"
                            onChange={(e) =>
                              handleNegotiableFilterSelect(
                                e,
                                negotiableOption,
                                filters.draft.negotiableOptions
                              )
                            }
                            checked={negotiableOption.checked}
                          />{" "}
                          {negotiableOption.value}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </form>
          </aside>
        )}
        <div className="listings-section">
          {/* <div className="view-toggle">
            {views.map((view) => (
              <button
                onClick={() =>
                  setViews(
                    views.map((innerView) => ({
                      ...innerView,
                      ...(view.id == innerView.id && {
                        toggled: !innerView.toggled,
                      }),
                    }))
                  )
                }
                className={`${view.toggled ? "toggled" : ""}`}
              >
                {view.label}
              </button>
            ))}
          </div> */}
          <div className="search-bar">
            <form onSubmit={handleSearchSubmit}>
              <div className="search-input-container">
                <SearchIcon />
                <input
                  placeholder="Search"
                  value={draftSearchValue}
                  onChange={(e) => setDraftSearchValue(e.target.value)}
                />
              </div>
              <button disabled={draftSearchValue === searchValue}>Search</button>
            </form>
          </div>
          <div className="listings-controls">
            {windowSize.width <= 625 ? (
              <button onClick={() => setSidebarToggled(true)} className="filters-button">
                Filters
              </button>
            ) : (
              <span>&nbsp;</span>
            )}
            <div className="control-group sort">
              <select onChange={(e) => setSort(e.target.value)} value={sort}>
                <option>Alphabetically (A-Z)</option>
                <option>Alphabetically (Z-A)</option>
                <option>Price (Low-High)</option>
                <option>Price (High-Low)</option>
                <option>Date Listed (New-Old)</option>
                <option>Date Listed (Old-New)</option>
              </select>
            </div>
          </div>
          {listingsError ? (
            <p>There was an error</p>
          ) : listingsLoading ? (
            <p>Listings are loading...</p>
          ) : !isInitialLoad && listings.length == 0 ? (
            <p>No listings available</p>
          ) : (
            <div className="grid">
              {listings?.map((listing) => (
                <Link
                  to={`/${listing.id}`}
                  key={listing.id}
                  // className="grid-item"
                  title={listing.what_is_this}
                >
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
                      <p className="price">${listing.price}</p>
                      <p className="what-is-this">{listing.what_is_this}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Listings;
