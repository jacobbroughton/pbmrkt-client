import { forwardRef, useState } from "react";
import { SortIcon } from "../Icons/SortIcon";
import { MagicWand } from "../Icons/MagicWand";
import { states, statesAndCities } from "../../../utils/statesAndCities";
import { capitalizeWords } from "../../../utils/usefulFunctions";
import { Arrow } from "../Icons/Arrow";
import "./CityStateFieldset.css";

export const CityStateFieldset = () => {
  const [state, setState] = useState();
  const [city, setCity] = useState();
  const [cantFindCity, setCantFindCity] = useState(false);

  return (
    <fieldset className="city-state">
      <div className={`form-group `}>
        <label>State</label>
        <div className="select-container">
          <select
            onChange={(e) =>
              setState(
                ["All", "Select One"].includes(e.target.value) ? null : e.target.value
              )
            }
            value={state}
          >
            {["Select One", ...states].map((childState) => (
              <option value={childState} key={childState}>
                {childState}
              </option>
            ))}
          </select>
          <SortIcon />
        </div>
      </div>
      <div className={`form-group ${!state ? "disabled" : ""}`}>
        <label>City</label>
        {cantFindCity ? (
          <>
            <input
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter your city"
            />{" "}
            <button
              className="cant-find-city-toggle"
              type="button"
              onClick={() => setCantFindCity(false)}
            >
              <Arrow direction={"left"} /> Go back
            </button>
          </>
        ) : (
          <>
            <div className="select-container">
              <select
                disabled={!state}
                onChange={(e) =>
                  setCity(
                    ["All", "Select One"].includes(e.target.value) ? null : e.target.value
                  )
                }
                value={city?.toUpperCase()}
              >
                {statesAndCities[state]?.map((innerCity, i) => (
                  <option value={innerCity} key={i}>
                    {capitalizeWords(innerCity)}
                  </option>
                ))}
              </select>
              <SortIcon />
            </div>
            <button
              onClick={() => setCantFindCity(true)}
              className="cant-find-city-toggle"
            >
              Can't find your city?
            </button>
          </>
        )}
      </div>
    </fieldset>
  );
};
