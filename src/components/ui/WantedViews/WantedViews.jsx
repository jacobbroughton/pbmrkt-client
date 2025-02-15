import { useDispatch, useSelector } from "react-redux";
import Overview from "../Overview/Overview";
import { SkeletonsListingGrid } from "../SkeletonsListingGrid/SkeletonsListingGrid";
import { SkeletonsListingList } from "../SkeletonsListingList/SkeletonsListingList";
import { SkeletonsOverview } from "../SkeletonsOverview/SkeletonsOverview";
import { ListingGrid } from "../ListingGrid/ListingGrid";
import { ListingList } from "../ListingList/ListingList";
import { useWindowSize } from "../../../utils/useWindowSize";
import { useEffect, useState } from "react";
import { setFiltersUpdated } from "../../../redux/filters";
import { setFlag } from "../../../redux/flags";
import "./WantedViews.css";
import { WantedListingGrid } from "../WantedListingGrid/WantedListingGrid";
import { WantedListingList } from "../WantedListingList/WantedListingList";
import { WantedOverview } from "../WantedOverview/WantedOverview";

export function WantedViews({ sort, setTotalListings }) {
  const overviewCategories = useSelector((state) => state.overviewCategories);
  const view = useSelector((state) => state.view);
  const filtersSidebarToggled = useSelector(
    (state) => state.modals.filtersSidebarToggled
  );
  const search = useSelector((state) => state.search);
  const filters = useSelector((state) => state.filters);
  const flags = useSelector((state) => state.flags);
  const windowSize = useWindowSize();

  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsInitiallyLoading, setListingsInitiallyLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (filters.filtersUpdated) getListings(search.savedSearchValue);
  }, [filters.filtersUpdated]);

  useEffect(() => {
    if (flags.searchedListingsNeedUpdate) getListings(search.savedSearchValue);
  }, [flags.searchedListingsNeedUpdate]);

  async function getListings(searchValue = "") {
    try {
      setListingsLoading(true);

      const urlSearchParams = new URLSearchParams({
        search_value: searchValue,
        min_budget: filters.saved["Wanted"].minBudget || 0,
        max_budget: filters.saved["Wanted"].maxBudget,
        state:
          filters.saved["Wanted"].state == "All" ? null : filters.saved["Wanted"].state,
        shipping_ok: true,
        sort: sort,
        seller_id: null,
        city: filters.saved["Wanted"].city == "All" ? null : filters.saved["Wanted"].city,
        category_id: filters.saved["Wanted"].category?.id || null,
      }).toString();

      const response = await fetch(
        `http://localhost:4000/get-wanted-items?${urlSearchParams}`
      );

      if (!response.ok) throw new Error("Something happened get-wanted-items");

      let { data } = await response.json();

      if (!data) throw "No listings available";

      setListings(data);

      const urlSearchParams2 = new URLSearchParams({
        search_value: searchValue,
        min_budget: filters.saved["Wanted"].minBudget || 0,
        max_budget: filters.saved["Wanted"].maxBudget,
        state:
          filters.saved["Wanted"].state == "All" ? null : filters.saved["Wanted"].state,
        shipping_ok: true,
        seller_id: null,
        city: filters.saved["Wanted"].city == "All" ? null : filters.saved["Wanted"].city,
        category_id: filters.saved["Wanted"].category?.id || null,
      }).toString();

      const response2 = await fetch(
        `http://localhost:4000/get-wanted-items-count?${urlSearchParams2}`
      );

      if (!response.ok) throw new Error("Something happened at get-wanted-items-count");

      const { data: data2 } = await response2.json();

      if (!data2) throw new Error("No wanted items count found");
      console.log(data2[0].num_results);

      setTotalListings(data2[0].num_results);

      if (isInitialLoad) setIsInitialLoad(false);
      // if (filters.filtersUpdated) dispatch(setFiltersUpdated(false));
      if (flags.searchedListingsNeedUpdate)
        dispatch(setFlag({ key: "searchedListingsNeedUpdate", value: false }));
      dispatch(setFiltersUpdated(false));
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }

    setListingsLoading(false);
    setListingsInitiallyLoading(false);
  }

  useEffect(() => {
    getListings(search.savedSearchValue);
  }, [sort]);

  const isInitiallyLoading =
    isInitialLoad && listingsLoading && !overviewCategories.nestedCategories.length;
  const subsequentlyLoading = !isInitialLoad && listingsLoading;
  const loadedWithNoResults = !isInitialLoad && listings.length === 0;

  // if (subsequentlyLoading) return <p>Subsequently loooooaaaaddddddiiiiiiinnnnnggggg</p>

  return error ? (
    <p className="small-text error-text">{error}</p>
  ) : isInitiallyLoading ? (
    view.layout == "Grid" ? (
      <SkeletonsListingGrid
        accountsForSidebar={windowSize.width > 225 && filtersSidebarToggled}
        hasOverlay={false}
        numSkeletons={20}
        blinking={true}
        heightPx={null}
      />
    ) : view.layout == "List" ? (
      <SkeletonsListingList />
    ) : view.layout == "Overview" ? (
      <SkeletonsOverview />
    ) : (
      false
    )
  ) : loadedWithNoResults ? (
    view.layout == "Grid" ? (
      <SkeletonsListingGrid
        message={"No wanted listings found, try adjusting your search or filters."}
        accountsForSidebar={windowSize.width > 225 && filtersSidebarToggled}
        hasOverlay={true}
        numSkeletons={20}
        blinking={false}
        heightPx={null}
        loading={false}
      />
    ) : view.layout == "List" ? (
      <SkeletonsListingList
        hasOverlay={true}
        message={"No wanted listings found, try adjusting your search or filters."}
      />
    ) : view.layout == "Overview" ? (
      <WantedOverview
        loading={listingsLoading}
        setLoading={(value) => setListingsLoading(value)}
      />
    ) : (
      true
    )
  ) : view.layout == "Grid" ? (
    <WantedListingGrid
      listings={listings}
      accountForSidebar={windowSize.width > 225 && filtersSidebarToggled}
      loading={false}
    />
  ) : view.layout == "List" ? (
    <WantedListingList listings={listings} />
  ) : view.layout == "Overview" ? (
    <WantedOverview
      loading={listingsLoading}
      setLoading={(value) => setListingsLoading(value)}
    />
  ) : (
    false
  );
}
