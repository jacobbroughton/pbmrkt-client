import { useEffect, useState } from "react";
import { useWindowSize } from "../../../utils/useWindowSize.js";
import { DoubleArrow } from "../Icons/DoubleArrow.jsx";
import { UndoIcon } from "../Icons/UndoIcon";
import { states, statesAndCities } from "../../../utils/statesAndCities.js";
import { capitalizeWords, isOnMobile } from "../../../utils/usefulFunctions";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals.ts";
import {
  resetFilter,
  resetFilters,
  setFilters,
  setFiltersUpdated,
  uncheckFilter,
} from "../../../redux/filters.js";
import "./FiltersSidebar.css";
import { Checkboxes } from "../Checkboxes/Checkboxes.jsx";
import { RadioOptions } from "../RadioOptions/RadioOptions.jsx";
import { setFlag } from "../../../redux/flags.ts";
import { WarningCircle } from "../Icons/WarningCircle.jsx";
import { EditIcon } from "../Icons/EditIcon.jsx";
import { Arrow } from "../Icons/Arrow.jsx";
import "./FiltersSidebar.css";
import { SortIcon } from "../Icons/SortIcon.tsx";
import { RadioIcon } from "../Icons/RadioIcon.jsx";
import { setViewType } from "../../../redux/view.ts";
import { SelectCategoryToggle } from "../SelectCategoryToggle/SelectCategoryToggle.jsx";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "../../../hooks/useSearchParams";

export const FiltersSidebar = ({ allFiltersDisabled, totalListings }) => {
  const { searchParams, addSearchParam } = useSearchParams();
  const dispatch = useDispatch();
  const windowSize = useWindowSize();
  const view = useSelector((state) => state.view);
  const filters = useSelector((state) => state.filters);
  const [sidebarNeedsUpdate, setSidebarNeedsUpdate] = useState(windowSize.width > 625);

  useEffect(() => {
    if (windowSize.width > 625) {
      toggleModal({ key: "filtersSidebar", value: true });
      setSidebarNeedsUpdate(true);
    }
    if (windowSize.width <= 625 && sidebarNeedsUpdate) {
      toggleModal({ key: "filtersSidebar", value: false });
      setSidebarNeedsUpdate(false);
    }
  }, [windowSize.width]);

  function handlePriceFilterSelect(selectedOption, viewType) {
    console.log(filters.draft, selectedOption);
    const newDraft = {
      ...filters.draft,
      [viewType]: {
        ...filters.draft[viewType],
        [viewType === "Wanted" ? "minBudget" : "minPrice"]: selectedOption.minValue,
        [viewType === "Wanted" ? "maxBudget" : "maxPrice"]: selectedOption.maxValue,
        [viewType === "Wanted" ? "budgetOptions" : "priceOptions"]: filters.draft[
          viewType
        ][[viewType === "Wanted" ? "budgetOptions" : "priceOptions"]].map((option) => ({
          ...option,
          checked: option.id == selectedOption.id,
        })),
      },
    };

    dispatch(setFilters({ ...filters, draft: newDraft, saved: newDraft }));
    dispatch(setFiltersUpdated(true));
  }

  function handleStateFilterSelect(e, viewType) {
    if (allFiltersDisabled) return;

    const newDraft = {
      ...filters.draft,
      [viewType]: {
        ...filters.draft[viewType],
        state: e.target.value,
        city: "All",
      },
    };

    dispatch(setFilters({ ...filters, draft: newDraft, saved: newDraft }));
    dispatch(setFiltersUpdated(true));
  }

  function handleCityFilterSelect(e, viewType) {
    if (allFiltersDisabled) return;

    const newDraft = {
      ...filters.draft,
      [viewType]: {
        ...filters.draft[viewType],
        city: e.target.value,
      },
    };

    dispatch(setFilters({ ...filters, draft: newDraft, saved: newDraft }));
    dispatch(setFiltersUpdated(true));
  }

  function handleRadioFilterSelect(filterTypeKey, selectedOption, viewType) {
    if (allFiltersDisabled) return;

    const newDraft = {
      ...filters.draft,
      // TODO - fix this
      [viewType]: {
        ...filters.draft[viewType],
        [filterTypeKey]: filters.draft[viewType][filterTypeKey]?.map((option) => ({
          ...option,
          ...(option.id == selectedOption.id && {
            checked: !selectedOption.checked,
          }),
        })),
      },
    };

    dispatch(setFilters({ ...filters, draft: newDraft, saved: newDraft }));
    dispatch(setFiltersUpdated(true));
  }

  function handleFiltersApply(e) {
    e.preventDefault();

    dispatch(setFilters({ ...filters, saved: filters.draft }));
    dispatch(setFiltersUpdated(true));
    if (windowSize.width <= 625)
      dispatch(toggleModal({ key: "filtersSidebar", value: false }));
  }

  // function handleMousePosition(e) {
  //   if (isDragging)
  //     setSidebarTogglePositionY(
  //       Math.round(((e.pageY - 30) / e.view.innerHeight) * 98 + 1)
  //     );
  // }

  let resetButtonDisabled =
    !filters.saved["Wanted"].category &&
    filters.saved["Wanted"].city == filters.initial["Wanted"].city &&
    filters.saved["Wanted"].state == filters.initial["Wanted"].state;

  if (view.type === "Wanted") {
    resetButtonDisabled =
      filters.saved["Wanted"].minBudget == filters.initial["Wanted"].minBudget &&
      filters.saved["Wanted"].maxBudget == filters.initial["Wanted"].maxBudget &&
      filters.saved["Wanted"].shippingOk == filters.initial["Wanted"].shippingOk;
  } else if (view.type === "For Sale") {
    resetButtonDisabled =
      (filters.saved.minPrice == filters.initial.minPrice &&
        filters.saved.maxPrice == filters.initial.maxPrice &&
        filters.saved.negotiableOptions == filters.initial.negotiableOptions &&
        filters.saved.tradeOptions == filters.initial.tradeOptions &&
        filters.saved.conditionOptions == filters.initial.conditionOptions &&
        filters.saved.shippingOptions == filters.initial.shippingOptions) ||
      filters.saved.negotiableOptions.filter((option) => option.checked).length == 0 ||
      filters.saved.tradeOptions.filter((option) => option.checked).length == 0 ||
      filters.saved.conditionOptions.filter((option) => option.checked).length == 0 ||
      filters.saved.shippingOptions.filter((option) => option.checked).length == 0;
  }

  return (
    <aside className={`sidebar ${windowSize.width <= 625 ? "over-nav" : ""}`}>
      <div className="sidebar-container">
        <form className="filters" onSubmit={handleFiltersApply}>
          <div className="listing-count-and-reset">
            <p>
              {totalListings} Listing{totalListings !== 1 ? "s" : ""}
            </p>
            <button
              onClick={() => {
                if (resetButtonDisabled) return;
                dispatch(resetFilters());
                dispatch(setFiltersUpdated(true));
                dispatch(setFlag({ key: "searchedListingsNeedUpdate", value: true }));
              }}
              type="button"
              className={`reset-button`}
              disabled={resetButtonDisabled}
              title="Reset all of your filters back to their original state"
            >
              Reset All
            </button>
          </div>
          <div className="filter-items">
            <div className="filter-item">
              <div className="wanted-or-for-sale-buttons">
                {[
                  { label: "Wanted", class: "wanted" },
                  { label: "For Sale", class: "for-sale" },
                ].map((viewType) => (
                  <button
                    type="button"
                    className={`${viewType.class} ${
                      view.type === viewType.label ? "selected" : ""
                    }`}
                    onClick={() => {
                      localStorage.setItem("pbmrkt_view_type", viewType.label);
                      dispatch(setViewType(viewType.label));

                      // navigate(`/${viewType.class}`);
                      addSearchParam("view-type", viewType.class);
                    }}
                  >
                    <RadioIcon checked={view.type == viewType.label} />{" "}
                    <p>{viewType.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {view.layout !== "Overview" && (
              <div className={`filter-item ${allFiltersDisabled ? "disabled" : ""}`}>
                <div className="label-and-reset">
                  <label>Category</label>
                  {filters.saved.category && (
                    <button
                      type="button"
                      className="reset-button"
                      onClick={() => {
                        dispatch(
                          resetFilter({ filterKey: "category", viewType: view.type })
                        );
                        dispatch(setFiltersUpdated(true));
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>

                <SelectCategoryToggle
                  handleOnClick={() =>
                    dispatch(toggleModal({ key: "categorySelectorModal", value: true }))
                  }
                  label={filters.saved[view.type].category?.plural_name}
                  noCategorySelected={!filters.saved[view.type].category}
                  title="Click this to open a menu and select an item category to filter your results on"
                  emptyLabel="Markers/Barrels/Etc"
                />
              </div>
            )}
            {view.type === "Wanted" ? (
              <>
                <div className={`filter-item ${allFiltersDisabled ? "disabled" : ""}`}>
                  <div className="label-and-reset">
                    <label>By Budget</label>
                    {!filters.draft["Wanted"].budgetOptions.find((op) => op.id == 0)
                      .checked && (
                      <button
                        className="reset-button"
                        type="button"
                        onClick={() => {
                          dispatch(
                            resetFilter({
                              filterKey: "budgetOptions",
                              viewType: view.type,
                            })
                          );
                          dispatch(setFiltersUpdated(true));
                        }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  {parseFloat(filters.draft["Wanted"].minBudget) >
                  parseFloat(filters.draft["Wanted"].maxBudget) ? (
                    <p className="filter-warning">Max must be equal or greater</p>
                  ) : filters.draft["Wanted"].minBudget[0] == 0 ||
                    (filters.draft["Wanted"].maxBudget &&
                      filters.draft["Wanted"]?.maxBudget[0]) == "" ? (
                    <p className="filter-warning">Min/Max cannot start with '0'</p>
                  ) : (
                    false
                  )}
                  <RadioOptions
                    options={filters.draft["Wanted"].budgetOptions}
                    handleRadioOptionClick={(option) =>
                      handlePriceFilterSelect(option, "Wanted")
                    }
                    disabled={allFiltersDisabled}
                  />
                </div>
                <div className={`filter-item ${allFiltersDisabled ? "disabled" : ""}`}>
                  <div className="label-and-reset">
                    <label>State</label>
                    {filters.draft["Wanted"].state != "All" && (
                      <button
                        title="Reset the state filter"
                        className="reset-button"
                        type="button"
                        onClick={() => {
                          dispatch(
                            resetFilter({ filterKey: "state", viewType: view.type })
                          );
                          dispatch(setFiltersUpdated(true));
                        }}
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <div className="select-container">
                    <select
                      title="Select a state to filter your results on"
                      onChange={(e) => handleStateFilterSelect(e, view.type)}
                      value={filters.draft["Wanted"].state}
                      disabled={allFiltersDisabled}
                    >
                      {["All", ...states].map((state) => (
                        <option key={state}>{state}</option>
                      ))}
                    </select>
                    <SortIcon />
                  </div>
                </div>

                <div
                  className={`filter-item ${
                    allFiltersDisabled || filters.draft["Wanted"].state == "All"
                      ? "disabled"
                      : ""
                  }`}
                >
                  <div className="label-and-reset">
                    <label>City</label>
                    {filters.draft["Wanted"].city != "All" &&
                      filters.draft["Wanted"].state != "All" && (
                        <button
                          title="Reset the city filter"
                          className="reset-button"
                          type="button"
                          onClick={() => {
                            dispatch(
                              resetFilter({ filterKey: "city", viewType: view.type })
                            );
                            dispatch(setFiltersUpdated(true));
                          }}
                        >
                          Reset
                        </button>
                      )}
                  </div>

                  {filters.draft["Wanted"].state == "All" ? (
                    <p
                      className="small-text disabled"
                      title={"Selecting a city is disabled if no state is selected"}
                    >
                      <WarningCircle /> Select a state first
                    </p>
                  ) : (
                    <select
                      title={`Select a city`}
                      className=""
                      disabled={
                        allFiltersDisabled || filters.draft["Wanted"].state == "All"
                      }
                      onChange={(e) => handleCityFilterSelect(e, view.type)}
                      value={filters.draft["Wanted"].city}
                    >
                      <option>All</option>
                      {statesAndCities[filters.draft["Wanted"].state]?.map((city) => (
                        <option key={city}>{capitalizeWords(city)}</option>
                      ))}
                    </select>
                  )}
                </div>
              </>
            ) : view.type === "For Sale" ? (
              <>
                <div className={`filter-item ${allFiltersDisabled ? "disabled" : ""}`}>
                  <div className="label-and-reset">
                    <label>By Price</label>
                    {!filters.draft["For Sale"].priceOptions.find((op) => op.id == 0)
                      .checked && (
                      <button
                        className="reset-button"
                        type="button"
                        onClick={() => {
                          dispatch(
                            resetFilter({
                              filterKey: "priceOptions",
                              viewType: view.type,
                            })
                          );
                          dispatch(setFiltersUpdated(true));
                        }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  {parseFloat(filters.draft["For Sale"].minPrice) >
                  parseFloat(filters.draft["For Sale"].maxPrice) ? (
                    <p className="filter-warning">Max must be equal or greater</p>
                  ) : filters.draft["For Sale"].minPrice[0] == 0 ||
                    (filters.draft["For Sale"].maxPrice &&
                      filters.draft["For Sale"]?.maxPrice[0]) == "" ? (
                    <p className="filter-warning">Min/Max cannot start with '0'</p>
                  ) : (
                    false
                  )}
                  <RadioOptions
                    options={filters.draft["For Sale"].priceOptions}
                    handleRadioOptionClick={(option) =>
                      handlePriceFilterSelect(option, "For Sale")
                    }
                    disabled={allFiltersDisabled}
                  />
                </div>
                <div className={`filter-item ${allFiltersDisabled ? "disabled" : ""}`}>
                  <div className="label-and-reset">
                    <label>State</label>
                    {filters.draft["For Sale"].state != "All" && (
                      <button
                        title="Reset the state filter"
                        className="reset-button"
                        type="button"
                        onClick={() => {
                          dispatch(
                            resetFilter({ filterKey: "state", viewType: view.type })
                          );
                          dispatch(setFiltersUpdated(true));
                        }}
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <div className="select-container">
                    <select
                      title="Select a state to filter your results on"
                      onChange={(e) => handleStateFilterSelect(e, view.type)}
                      value={filters.draft["For Sale"].state}
                      disabled={allFiltersDisabled}
                    >
                      {["All", ...states].map((state) => (
                        <option key={state}>{state}</option>
                      ))}
                    </select>
                    <SortIcon />
                  </div>
                </div>

                <div
                  className={`filter-item ${
                    allFiltersDisabled || filters.draft["For Sale"].state == "All"
                      ? "disabled"
                      : ""
                  }`}
                >
                  <div className="label-and-reset">
                    <label>City</label>
                    {filters.draft["For Sale"].city != "All" &&
                      filters.draft["For Sale"].state != "All" && (
                        <button
                          title="Reset the city filter"
                          className="reset-button"
                          type="button"
                          onClick={() => {
                            dispatch(
                              resetFilter({ filterKey: "city", viewType: view.type })
                            );
                            dispatch(setFiltersUpdated(true));
                          }}
                        >
                          Reset
                        </button>
                      )}
                  </div>

                  {filters.draft["For Sale"].state == "All" ? (
                    <p
                      className="small-text disabled"
                      title={"Selecting a city is disabled if no state is selected"}
                    >
                      <WarningCircle /> Select a state first
                    </p>
                  ) : (
                    <select
                      title={`Select a city`}
                      className=""
                      disabled={
                        allFiltersDisabled || filters.draft["For Sale"].state == "All"
                      }
                      onChange={(e) => handleCityFilterSelect(e, view.type)}
                      value={filters.draft["For Sale"].city}
                    >
                      <option>All</option>
                      {statesAndCities[filters.draft["For Sale"].state]?.map((city) => (
                        <option key={city}>{capitalizeWords(city)}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className={`filter-item ${allFiltersDisabled ? "disabled" : ""}`}>
                  <div className="label-and-reset">
                    <label>Condition</label>
                    {filters.draft["For Sale"].conditionOptions.find(
                      (op) => !op.checked
                    ) && (
                      <button
                        className="reset-button"
                        type="button"
                        onClick={() => {
                          dispatch(
                            resetFilter({
                              filterKey: "conditionOptions",
                              viewType: view.type,
                            })
                          );
                          dispatch(setFiltersUpdated(true));
                        }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  {console.log(filters.draft["For Sale"].conditionOptions)}
                  <Checkboxes
                    options={filters.draft["For Sale"].conditionOptions}
                    size="medium"
                    handleCheckboxOptionClick={(option) =>
                      handleRadioFilterSelect("conditionOptions", option, view.type)
                    }
                    disabled={allFiltersDisabled}
                  />
                </div>
                <div className={`filter-item ${allFiltersDisabled ? "disabled" : ""}`}>
                  <div className="label-and-reset">
                    <label>Shipping</label>
                    {filters.draft["For Sale"].shippingOptions.find(
                      (op) => !op.checked
                    ) && (
                      <button
                        className="reset-button"
                        type="button"
                        onClick={() => {
                          dispatch(
                            resetFilter({
                              filterKey: "shippingOptions",
                              viewType: view.type,
                            })
                          );
                          dispatch(setFiltersUpdated(true));
                        }}
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <Checkboxes
                    options={filters.draft["For Sale"].shippingOptions}
                    size="medium"
                    handleCheckboxOptionClick={(option) =>
                      handleRadioFilterSelect("shippingOptions", option, view.type)
                    }
                    disabled={allFiltersDisabled}
                  />
                </div>

                <div className={`filter-item ${allFiltersDisabled ? "disabled" : ""}`}>
                  <div className="label-and-reset">
                    <label>Trades</label>
                    {filters.draft["For Sale"].tradeOptions.find((op) => !op.checked) && (
                      <button
                        className="reset-button"
                        onClick={() => {
                          dispatch(
                            resetFilter({
                              filterKey: "tradeOptions",
                              viewType: view.type,
                            })
                          );
                          dispatch(setFiltersUpdated(true));
                        }}
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <Checkboxes
                    options={filters.draft["For Sale"].tradeOptions}
                    size="medium"
                    handleCheckboxOptionClick={(option) =>
                      handleRadioFilterSelect("tradeOptions", option, view.type)
                    }
                    disabled={allFiltersDisabled}
                  />
                </div>
                <div className={`filter-item ${allFiltersDisabled ? "disabled" : ""}`}>
                  <div className="label-and-reset">
                    <label>Negotiability</label>
                    {filters.draft["For Sale"].negotiableOptions.find(
                      (op) => !op.checked
                    ) && (
                      <button
                        className="reset-button"
                        onClick={() => {
                          dispatch(
                            resetFilter({
                              filterKey: "negotiableOptions",
                              viewType: view.type,
                            })
                          );
                          dispatch(setFiltersUpdated(true));
                        }}
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <Checkboxes
                    options={filters.draft["For Sale"].negotiableOptions}
                    size="medium"
                    handleCheckboxOptionClick={(option) =>
                      handleRadioFilterSelect("negotiableOptions", option, view.type)
                    }
                    disabled={allFiltersDisabled}
                  />
                </div>
              </>
            ) : (
              false
            )}
          </div>
        </form>
      </div>
    </aside>
  );
};
