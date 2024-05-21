import { useEffect, useState } from "react";
import useWindowSize from "../../../utils/useWindowSize.js";
import DoubleArrow from "../Icons/DoubleArrow.jsx";
import UndoIcon from "../Icons/UndoIcon.jsx";
import { states, statesAndCities } from "../../../utils/statesAndCities.js";
import { capitalizeWords } from "../../../utils/usefulFunctions.js";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals.js";
import { resetFilters, setFilters, setFiltersUpdated } from "../../../redux/filters.js";
import "./FiltersSidebar.css";
import Checkboxes from "../Checkboxes/Checkboxes.jsx";
import RadioOptions from "../RadioOptions/RadioOptions.jsx";

const FiltersSidebar = () => {
  const dispatch = useDispatch();
  const windowSize = useWindowSize();
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

  function handleConditionFilterSelect(selectedOption) {
    dispatch(
      setFilters({
        ...filters,
        draft: {
          ...filters.draft,
          conditionOptions: filters.draft.conditionOptions.map((option) => ({
            ...option,
            ...(option.id == selectedOption.id && {
              checked: !selectedOption.checked,
            }),
          })),
        },
      })
    );
  }

  function handlePriceFilterSelect(selectedOption) {
    dispatch(
      setFilters({
        ...filters,
        draft: {
          ...filters.draft,
          minPrice: selectedOption.minValue,
          maxPrice: selectedOption.maxValue,
          priceOptions: filters.draft.priceOptions.map((option) => ({
            ...option,
            checked: option.id == selectedOption.id,
          })),
        },
      })
    );
  }

  function handleNegotiableFilterSelect(selectedOption) {
    dispatch(
      setFilters({
        ...filters,
        draft: {
          ...filters.draft,
          negotiableOptions: filters.draft.negotiableOptions.map((option) => ({
            ...option,
            ...(option.id == selectedOption.id && {
              // checked: e.target.checked,
              checked: !selectedOption.checked,
            }),
          })),
        },
      })
    );
  }

  function handleStateFilterSelect(e) {
    dispatch(
      setFilters({
        ...filters,
        draft: {
          ...filters.draft,
          state: e.target.value,
          city: "All",
        },
      })
    );
  }

  function handleCityFilterSelect(e) {
    dispatch(
      setFilters({
        ...filters,
        draft: {
          ...filters.draft,
          city: e.target.value,
        },
      })
    );
  }

  function handleTradesFilterSelect(selectedOption) {
    dispatch(
      setFilters({
        ...filters,
        draft: {
          ...filters.draft,
          tradeOptions: filters.draft.tradeOptions.map((option) => ({
            ...option,
            ...(option.id == selectedOption.id && {
              // checked: e.target.checked,
              checked: !selectedOption.checked,
            }),
          })),
        },
      })
    );
  }

  function handleShippingFilterSelect(selectedOption) {
    dispatch(
      setFilters({
        ...filters,
        draft: {
          ...filters.draft,
          shippingOptions: filters.draft.shippingOptions.map((option) => ({
            ...option,
            ...(option.id == selectedOption.id && {
              // checked: e.target.checked,
              checked: !selectedOption.checked,
            }),
          })),
        },
      })
    );
  }

  function handleFiltersApply(e) {
    e.preventDefault();

    dispatch(setFilters({ ...filters, saved: filters.draft }));
    dispatch(setFiltersUpdated(true));
    if (windowSize.width <= 625)
      dispatch(toggleModal({ key: "filtersSidebar", value: false }));
    // getListings(searchValue);
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
    <aside className={`sidebar ${windowSize.width <= 625 ? "over-nav" : ""}`}>
      {" "}
      <form className="filters" onSubmit={handleFiltersApply}>
        {windowSize.width <= 625 && (
          <button
            onClick={() => dispatch(toggleModal({ key: "filtersSidebar", value: false }))}
            type="button"
            className="close-sidebar-button"
          >
            <DoubleArrow direction="left" />
          </button>
        )}
        <div className="apply-and-reset">
          <button
            onClick={() => dispatch(resetFilters())}
            type="button"
            className=" reset-button"
            disabled={applyButtonDisabled}
          >
            <UndoIcon />
          </button>
          <button className="apply-button" type="submit" disabled={applyButtonDisabled}>
            Apply
          </button>
        </div>
        <div className="filter-items">
          {/* <div className="filter-item">
            <label>By Brand</label>
            <input
              placeholder="Planet Eclipse, Dye, Tippmann"
              type="text"
              onChange={(e) =>
                dispatch(
                  setFilters({
                    ...filters,
                    draft: { ...filters.draft, brand: e.target.value },
                  })
                )
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
                dispatch(
                  setFilters({
                    ...filters,
                    draft: { ...filters.draft, model: e.target.value },
                  })
                )
              }
              value={filters.draft.model}
            />
          </div> */}
          <div className="filter-item">
            <label>By State</label>

            <select onChange={handleStateFilterSelect} value={filters.draft.state}>
              <option>All</option>
              {states.map((state) => (
                <option key={state}>
                  {state}
                </option>
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
                <option  key={city}>
                  {capitalizeWords(city)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            {/* <div className="min-max-price-inputs">
              <div className="min-max-input-container">
                <label>Min. Price</label>
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
            <label>By Price</label>
            <RadioOptions
              options={filters.draft.priceOptions}
              handleRadioOptionClick={(option) => handlePriceFilterSelect(option)}
            />
            {/* <Checkboxes
              options={filters.draft.priceOptions}
              handleCheckboxOptionClick={(option) => handlePriceFilterSelect(option)}
            /> */}
            {parseFloat(filters.draft.minPrice) > parseFloat(filters.draft.maxPrice) ? (
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
            {/* <div className="checkbox-options">
              {filters.draft.conditionOptions.map((conditionOption) => (
                <div
                  className={`checkbox-option ${
                    conditionOption.checked ? "checked" : ""
                  }`}
                  onClick={() =>
                    handleConditionFilterSelect(
                      null,
                      conditionOption,
                      filters.draft.conditionOptions
                    )
                  }
                >
                  <Checkbox checked={conditionOption.checked} />
                  <label>{conditionOption.value}</label>
                </div>
              ))}
            </div> */}
            <Checkboxes
              options={filters.draft.conditionOptions}
              handleCheckboxOptionClick={(option) => handleConditionFilterSelect(option)}
            />
          </div>
          <div className="filter-item">
            <label>By Shipping</label>
            {/* <div className="checkbox-options">
              {filters.draft.shippingOptions.map((shippingOption) => (
                <div
                  className={`checkbox-option ${shippingOption.checked ? "checked" : ""}`}
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
            </div> */}
            <Checkboxes
              options={filters.draft.shippingOptions}
              handleCheckboxOptionClick={(option) => handleShippingFilterSelect(option)}
            />
          </div>
          <div className="filter-item">
            <label>By Trades</label>
            {/* <div className="checkbox-options">
              {filters.draft.tradeOptions.map((tradeOption) => (
                <div
                  className={`checkbox-option ${tradeOption.checked ? "checked" : ""}`}
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
            </div> */}
            <Checkboxes
              options={filters.draft.tradeOptions}
              handleCheckboxOptionClick={(option) => handleTradesFilterSelect(option)}
            />
          </div>
          <div className="filter-item">
            <label>By Negotiatable</label>
            {/* <div className="checkbox-options">
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
            </div> */}
            <Checkboxes
              options={filters.draft.negotiableOptions}
              handleCheckboxOptionClick={(option) => handleNegotiableFilterSelect(option)}
            />
          </div>
        </div>
      </form>
    </aside>
  );
};
export default FiltersSidebar;
