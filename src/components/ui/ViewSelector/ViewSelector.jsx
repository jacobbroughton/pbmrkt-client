import { useEffect } from "react";
import { useSearchParams } from "../../../hooks/useSearchParams";
import { setViewLayout, setViewType } from "../../../redux/view";
import { useDispatch, useSelector } from "react-redux";
import { setFilters } from "../../../redux/filters";
import "./ViewSelector.css";

export function ViewSelector() {
  const dispatch = useDispatch();
  const view = useSelector((state) => state.view);
  const filters = useSelector((state) => state.filters);
  const { searchParams, addSearchParams } = useSearchParams();

  useEffect(() => {
    const viewTypeFromSearchRaw = searchParams.get("view-type");
    const viewLayoutFromSearchRaw = searchParams.get("view-layout");

    const viewTypeFromSearch = viewTypeFromSearchRaw === "wanted" ? "Wanted" : "For Sale";
    const viewLayoutFromSearch =
      viewLayoutFromSearchRaw === "overview"
        ? "Overview"
        : viewLayoutFromSearchRaw === "grid"
        ? "Grid"
        : viewLayoutFromSearchRaw === "list"
        ? "List"
        : "Overview";

    if (viewTypeFromSearch !== view.type) dispatch(setViewType(viewTypeFromSearch));

    if (viewLayoutFromSearch !== view.layout)
      dispatch(setViewLayout(viewLayoutFromSearch));
  }, [searchParams.get("view-type"), searchParams.get("view-layout")]);
  return (
    <div className="view-selector">
      {["Overview", "Grid", "List"].map((viewOption) => (
        <button
          onClick={() => {
            if (viewOption === "Overview" && filters.saved[view.type].category)
              dispatch(
                setFilters({
                  ...filters,
                  saved: {
                    ...filters.saved,
                    [view.type]: {
                      ...filters.saved[view.type],
                      category: null,
                    },
                  },
                })
              );
            localStorage.setItem("pbmrkt_view_layout", viewOption);
            dispatch(setViewLayout(viewOption));
            addSearchParams([["view-layout", viewOption.toLowerCase()]]);
          }}
          className={`view-option ${viewOption == view.layout ? "selected" : ""}`}
          key={viewOption}
        >
          {viewOption}
        </button>
      ))}
    </div>
  );
}
