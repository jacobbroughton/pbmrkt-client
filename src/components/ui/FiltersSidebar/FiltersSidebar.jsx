import { useEffect, useState } from "react";
import { useWindowSize } from "../../../utils/useWindowSize.js";
import { DoubleArrow } from "../Icons/DoubleArrow.jsx";
import { UndoIcon } from "../Icons/UndoIcon";
import { states, statesAndCities } from "../../../utils/statesAndCities.js";
import { capitalizeWords, isOnMobile } from "../../../utils/usefulFunctions.js";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals.js";
import {
  resetFilter,
  resetFilters,
  setFilters,
  setFiltersUpdated,
} from "../../../redux/filters.js";
import "./FiltersSidebar.css";
import { Checkboxes } from "../Checkboxes/Checkboxes.jsx";
import { RadioOptions } from "../RadioOptions/RadioOptions.jsx";
import { setFlag } from "../../../redux/flags.js";
import { WarningCircle } from "../Icons/WarningCircle.jsx";
import { EditIcon } from "../Icons/EditIcon.jsx";
import { Arrow } from "../Icons/Arrow.jsx";
import "./FiltersSidebar.css";

export const FiltersSidebar = ({ allFiltersDisabled }) => {
  const dispatch = useDispatch();
  const windowSize = useWindowSize();
  const filters = useSelector((state) => state.filters);
  const { filtersSidebarToggled } = useSelector((state) => state.modals);
  const [sidebarNeedsUpdate, setSidebarNeedsUpdate] = useState(windowSize.width > 625);
  const [sidebarTogglePositionY, setSidebarTogglePositionY] = useState(50); // percentage

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

  function handlePriceFilterSelect(selectedOption) {
    const newDraft = {
      ...filters.draft,
      minPrice: selectedOption.minValue,
      maxPrice: selectedOption.maxValue,
      priceOptions: filters.draft.priceOptions.map((option) => ({
        ...option,
        checked: option.id == selectedOption.id,
      })),
    };

    dispatch(setFilters({ ...filters, draft: newDraft, saved: newDraft }));
    dispatch(setFiltersUpdated(true));
  }

  function handleStateFilterSelect(e) {
    if (allFiltersDisabled) return;

    const newDraft = {
      ...filters.draft,
      state: e.target.value,
      city: "All",
    };

    dispatch(setFilters({ ...filters, draft: newDraft, saved: newDraft }));
    dispatch(setFiltersUpdated(true));
  }

  function handleCityFilterSelect(e) {
    if (allFiltersDisabled) return;

    const newDraft = {
      ...filters.draft,
      city: e.target.value,
    };

    dispatch(setFilters({ ...filters, draft: newDraft, saved: newDraft }));
    dispatch(setFiltersUpdated(true));
  }

  function handleRadioFilterSelect(filterTypeKey, selectedOption) {
    if (allFiltersDisabled) return;

    const newDraft = {
      ...filters.draft,
      [filterTypeKey]: filters.draft[filterTypeKey]?.map((option) => ({
        ...option,
        ...(option.id == selectedOption.id && {
          checked: !selectedOption.checked,
        }),
      })),
    };

    dispatch(setFilters({ ...filters, draft: newDraft, saved: newDraft }));
    dispatch(setFiltersUpdated(true));
  }

  function handleFiltersApply(e) {
    e.preventDefault();
    console.log("wassup wassup youtube");

    dispatch(setFilters({ ...filters, saved: filters.draft }));
    dispatch(setFiltersUpdated(true));
    if (windowSize.width <= 625)
      dispatch(toggleModal({ key: "filtersSidebar", value: false }));
  }

  // function handleMousePosition(e) {
  //   console.log("mousemove", e);
  //   if (isDragging)
  //     setSidebarTogglePositionY(
  //       Math.round(((e.pageY - 30) / e.view.innerHeight) * 98 + 1)
  //     );
  // }

  const resetButtonDisabled =
    (!filters.saved.category &&
      filters.saved.brand == filters.initial.brand &&
      filters.saved.model == filters.initial.model &&
      filters.saved.minPrice == filters.initial.minPrice &&
      filters.saved.maxPrice == filters.initial.maxPrice &&
      filters.saved.city == filters.initial.city &&
      filters.saved.state == filters.initial.state &&
      filters.saved.negotiableOptions == filters.initial.negotiableOptions &&
      filters.saved.tradeOptions == filters.initial.tradeOptions &&
      filters.saved.conditionOptions == filters.initial.conditionOptions &&
      filters.saved.shippingOptions == filters.initial.shippingOptions) ||
    filters.saved.negotiableOptions.filter((option) => option.checked).length == 0 ||
    filters.saved.tradeOptions.filter((option) => option.checked).length == 0 ||
    filters.saved.conditionOptions.filter((option) => option.checked).length == 0 ||
    filters.saved.shippingOptions.filter((option) => option.checked).length == 0;

  // const applyButtonDisabled =
  //   (filters.draft.brand == filters.saved.brand &&
  //     filters.draft.model == filters.saved.model &&
  //     filters.draft.minPrice == filters.saved.minPrice &&
  //     filters.draft.maxPrice == filters.saved.maxPrice &&
  //     filters.draft.city == filters.saved.city &&
  //     filters.draft.state == filters.saved.state &&
  //     filters.draft.negotiableOptions == filters.saved.negotiableOptions &&
  //     filters.draft.tradeOptions == filters.saved.tradeOptions &&
  //     filters.draft.conditionOptions == filters.saved.conditionOptions &&
  //     filters.draft.shippingOptions == filters.saved.shippingOptions) ||
  //   filters.draft.negotiableOptions.filter((option) => option.checked).length == 0 ||
  //   filters.draft.tradeOptions.filter((option) => option.checked).length == 0 ||
  //   filters.draft.conditionOptions.filter((option) => option.checked).length == 0 ||
  //   filters.draft.shippingOptions.filter((option) => option.checked).length == 0;

  return (
    <aside className={`sidebar ${windowSize.width <= 625 ? "over-nav" : ""}`}>
      {" "}
      <form className="filters" onSubmit={handleFiltersApply}>
        <div className="apply-and-reset">
          {/* {windowSize.width <= 625 && (
            <button
              onClick={() =>
                dispatch(toggleModal({ key: "filtersSidebar", value: false }))
              }
              type="button"
              className="close-sidebar-button"
              tabIndex="0"
            >
              <DoubleArrow direction="left" />
            </button>
          )} */}
          {/* {!resetButtonHidden && ( */}
          <button
            onClick={() => {
              if (resetButtonDisabled) return;
              dispatch(resetFilters());
              dispatch(setFlag({ key: "searchedListingsNeedUpdate", value: true }));
              // if (windowSize.width <= 625) {
              //   dispatch(toggleModal({ key: "filtersSidebar", value: false }));
              // }
            }}
            type="button"
            className={`reset-button`}
            disabled={resetButtonDisabled}
            title="Reset all of your filters back to their original state"
          >
            <UndoIcon />
          </button>
          {/* )} */}
          {/* <button className="apply-button" type="submit" disabled={applyButtonDisabled}>
            Apply
          </button> */}
        </div>
        <div className="filter-items">
          <div className={`filter-item ${allFiltersDisabled ? "disabled" : ""}`}>
            <div className="label-and-reset">
              <label>By Category</label>
              {filters.saved.category && (
                <button
                  type="button"
                  className="reset-button"
                  onClick={() => {
                    dispatch(resetFilter("category"));
                    dispatch(setFiltersUpdated(true));
                  }}
                >
                  Reset
                </button>
              )}
            </div>
            <button
              onClick={() =>
                dispatch(toggleModal({ key: "categorySelectorModal", value: true }))
              }
              className="button select-category-modal-toggle"
              type="button"
              title={`Click this to open a menu and select an item category to filter your results on`}
            >
              <span className="current-category">
                {filters.saved.category?.value ?? "Select a Category"}
              </span>
              <EditIcon />{" "}
            </button>
          </div>
          <div className={`filter-item ${allFiltersDisabled ? "disabled" : ""}`}>
            <div className="label-and-reset">
              <label>By Price</label>
              {!filters.draft.priceOptions.find((op) => op.id == 0).checked && (
                <button
                  className="reset-button"
                  type="button"
                  onClick={() => {
                    dispatch(resetFilter("priceOptions"));
                    dispatch(setFiltersUpdated(true));
                  }}
                >
                  Reset
                </button>
              )}
            </div>
            {parseFloat(filters.draft.minPrice) > parseFloat(filters.draft.maxPrice) ? (
              <p className="filter-warning">Max must be equal or greater</p>
            ) : filters.draft.minPrice[0] == 0 ||
              (filters.draft.maxPrice && filters.draft?.maxPrice[0]) == "" ? (
              <p className="filter-warning">Min/Max cannot start with '0'</p>
            ) : (
              false
            )}
            <RadioOptions
              options={filters.draft.priceOptions}
              handleRadioOptionClick={(option) => handlePriceFilterSelect(option)}
              disabled={allFiltersDisabled}
            />
            {/* <div className="min-max-price-inputs">
              <div className="min-max-input-container">
                <label>Min. $</label>
                <input
                  type="number"
                  placeholder="$15"
                  onChange={(e) =>
                    dispatch(
                      setFilters({
                        ...filters,
                        draft: { ...filters.draft, minPrice: e.target.value },
                      })
                    )
                  }
                  value={filters.draft.minPrice}
                />
              </div>
              <div className="min-max-input-container">
                <label>Max $</label>
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
                    dispatch(
                      setFilters({
                        ...filters,
                        draft: { ...filters.draft, maxPrice: e.target.value },
                      })
                    )
                  }
                  value={filters.draft.maxPrice}
                />
              </div>
            </div> */}
          </div>
          <div className={`filter-item ${allFiltersDisabled ? "disabled" : ""}`}>
            <div className="label-and-reset">
              <label>By State</label>
              {filters.draft.state != "All" && (
                <button
                  title="Reset the state filter"
                  className="reset-button"
                  type="button"
                  onClick={() => {
                    dispatch(resetFilter("state"));
                    dispatch(setFiltersUpdated(true));
                  }}
                >
                  Reset
                </button>
              )}
            </div>

            <select
              title="Select a state to filter your results on"
              onChange={handleStateFilterSelect}
              value={filters.draft.state}
              disabled={allFiltersDisabled}
            >
              {["All", ...states].map((state) => (
                <option key={state}>{state}</option>
              ))}
            </select>
          </div>

          <div
            className={`filter-item ${
              allFiltersDisabled || filters.draft.state == "All" ? "disabled" : ""
            }`}
          >
            <div className="label-and-reset">
              <label>By City</label>
              {filters.draft.city != "All" && filters.draft.state != "All" && (
                <button
                  title="Reset the city filter"
                  className="reset-button"
                  type="button"
                  onClick={() => {
                    dispatch(resetFilter("city"));
                    dispatch(setFiltersUpdated(true));
                  }}
                >
                  Reset
                </button>
              )}
            </div>

            {filters.draft.state == "All" ? (
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
                disabled={allFiltersDisabled || filters.draft.state == "All"}
                onChange={handleCityFilterSelect}
                value={filters.draft.city}
              >
                <option>All</option>
                {statesAndCities[filters.draft.state]?.map((city) => (
                  <option key={city}>{capitalizeWords(city)}</option>
                ))}
              </select>
            )}
          </div>
          <div className={`filter-item ${allFiltersDisabled ? "disabled" : ""}`}>
            <div className="label-and-reset">
              <label>By Condition</label>
              {filters.draft.conditionOptions.find((op) => !op.checked) && (
                <button
                  className="reset-button"
                  type="button"
                  onClick={() => {
                    dispatch(resetFilter("conditionOptions"));
                    dispatch(setFiltersUpdated(true));
                  }}
                >
                  Reset
                </button>
              )}
            </div>
            <Checkboxes
              options={filters.draft.conditionOptions}
              handleCheckboxOptionClick={(option) =>
                handleRadioFilterSelect("conditionOptions", option)
              }
              disabled={allFiltersDisabled}
            />
          </div>
          <div className={`filter-item ${allFiltersDisabled ? "disabled" : ""}`}>
            <div className="label-and-reset">
              <label>By Shipping</label>
              {filters.draft.shippingOptions.find((op) => !op.checked) && (
                <button
                  className="reset-button"
                  type="button"
                  onClick={() => {
                    dispatch(resetFilter("shippingOptions"));
                    dispatch(setFiltersUpdated(true));
                  }}
                >
                  Reset
                </button>
              )}
            </div>

            <Checkboxes
              options={filters.draft.shippingOptions}
              handleCheckboxOptionClick={(option) =>
                handleRadioFilterSelect("shippingOptions", option)
              }
              disabled={allFiltersDisabled}
            />
          </div>

          <div className={`filter-item ${allFiltersDisabled ? "disabled" : ""}`}>
            <div className="label-and-reset">
              <label>By Trades</label>
              {filters.draft.tradeOptions.find((op) => !op.checked) && (
                <button
                  className="reset-button"
                  onClick={() => {
                    dispatch(resetFilter("tradeOptions"));
                    dispatch(setFiltersUpdated(true));
                  }}
                >
                  Reset
                </button>
              )}
            </div>

            <Checkboxes
              options={filters.draft.tradeOptions}
              handleCheckboxOptionClick={(option) =>
                handleRadioFilterSelect("tradeOptions", option)
              }
              disabled={allFiltersDisabled}
            />
          </div>
          <div className={`filter-item ${allFiltersDisabled ? "disabled" : ""}`}>
            <div className="label-and-reset">
              <label>By Negotiable</label>
              {filters.draft.negotiableOptions.find((op) => !op.checked) && (
                <button
                  className="reset-button"
                  onClick={() => {
                    dispatch(resetFilter("negotiableOptions"));
                    dispatch(setFiltersUpdated(true));
                  }}
                >
                  Reset
                </button>
              )}
            </div>

            <Checkboxes
              options={filters.draft.negotiableOptions}
              handleCheckboxOptionClick={(option) =>
                handleRadioFilterSelect("negotiableOptions", option)
              }
              disabled={allFiltersDisabled}
            />
          </div>
        </div>
      </form>
      <div className="sidebar-fixed-wrapper">
        <div className="dotted-track"></div>
        <button
          draggable={true}
          className="sidebar-toggle-button"
          onClick={() => {
            console.log("toggled");
            dispatch(toggleModal({ key: "filtersSidebar", value: false }));
          }}
          style={{
            // top: `${sidebarTogglePositionY}%`,
            // transform: `translateY(-${sidebarTogglePositionY}%)`,
            ...(isOnMobile() ? {bottom: '200px'} : {top: '65px'}),
          }}
        >
          {filtersSidebarToggled ? (
            <Arrow direction="left" />
          ) : (
            <Arrow direction="right" />
          )}
        </button>
      </div>
    </aside>
  );
};
