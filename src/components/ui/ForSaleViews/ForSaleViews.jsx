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
import "./ForSaleViews.css";
import { getCheckedOps } from "../../../utils/usefulFunctions";

export function ForSaleViews({ sort, setTotalListings }) {
  const view = useSelector((state) => state.view);
  const overviewCategories = useSelector((state) => state.overviewCategories);
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
      // if (totalListings) setTotalListings(null)
      // if (!listingsInitiallyLoading && listingsLoading) {
      setListingsLoading(true);
      // }

      const forSaleFilters = filters.saved["For Sale"];

      // TODO - fix seller_id
      const params = new URLSearchParams({
        search_value: searchValue,
        min_price: forSaleFilters.minPrice || 0,
        max_price: forSaleFilters.maxPrice,
        state: forSaleFilters.state == "All" ? null : forSaleFilters.state,
        condition: getCheckedOps(forSaleFilters.conditionOptions),
        shipping: getCheckedOps(forSaleFilters.shippingOptions),
        trades: getCheckedOps(forSaleFilters.tradeOptions),
        negotiable: getCheckedOps(forSaleFilters.negotiableOptions),
        sort: sort,
        seller_id: null,
        city: forSaleFilters.city == "All" ? null : forSaleFilters.city,
        category_id:
          forSaleFilters.category?.id === "null"
            ? null
            : forSaleFilters.category?.id || null,
      }).toString();

      const response = await fetch(`http://localhost:4000/get-items?${params}`);

      if (!response.ok) throw new Error("Something happened at get-items listing view");

      let { data } = await response.json();

      if (!data || !data.length === 0) throw new Error("No items were fetched");

      data = data.map((item) => {
        return {
          ...item,
          profile_picture: "",
        };
      });

      setListings(data);

      const urlSearchQueries = new URLSearchParams({
        search_value: searchValue,
        min_price: forSaleFilters.minPrice || 0,
        max_price: forSaleFilters.maxPrice,
        state: forSaleFilters.state == "All" ? null : forSaleFilters.state,
        condition: getCheckedOps(forSaleFilters.conditionOptions),
        shipping: getCheckedOps(forSaleFilters.shippingOptions),
        trades: getCheckedOps(forSaleFilters.tradeOptions),
        negotiable: getCheckedOps(forSaleFilters.negotiableOptions),
        seller_id: null,
        city: forSaleFilters.city == "All" ? null : forSaleFilters.city,
        category_id: forSaleFilters.category?.id || null,
      }).toString();

      const response2 = await fetch(
        `http://localhost:4000/get-items-count/?${urlSearchQueries}`
      );

      if (!response2.ok) throw new Error("Something happened get-items-count");

      const { data: data2 } = await response2.json();

      setTotalListings(data2[0].num_results);

      if (isInitialLoad) setIsInitialLoad(false);
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
  const isSubsequentlyLoading = !isInitialLoad && listingsLoading;
  const loadedWithNoResults = !isInitialLoad && listings.length === 0;

  // if (isSubsequentlyLoading) return <p>Is subsequently loading</p>;

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
        message={"No listings found, try adjusting your search or filters."}
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
        message={"No listings found, try adjusting your search or filters."}
      />
    ) : view.layout == "Overview" ? (
      <Overview
        loading={listingsLoading}
        setLoading={(value) => setListingsLoading(value)}
      />
    ) : (
      true
    )
  ) : view.layout == "Grid" ? (
    <ListingGrid
      listings={listings}
      accountForSidebar={windowSize.width > 225 && filtersSidebarToggled}
      loading={false}
    />
  ) : view.layout == "List" ? (
    <ListingList listings={listings} />
  ) : view.layout == "Overview" ? (
    <Overview
      loading={listingsLoading}
      setLoading={(value) => setListingsLoading(value)}
    />
  ) : (
    false
  );
}
