import { useDispatch, useSelector } from "react-redux";
import Overview from "../Overview/Overview";
import { SkeletonsListingGrid } from "../SkeletonsListingGrid/SkeletonsListingGrid";
import { SkeletonsListingList } from "../SkeletonsListingList/SkeletonsListingList";
import { SkeletonsOverview } from "../SkeletonsOverview/SkeletonsOverview";
import { ListingGrid } from "../ListingGrid/ListingGrid";
import { ListingList } from "../ListingList/ListingList";
import { useWindowSize } from "../../../utils/useWindowSize";
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase";
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

      const params = {
        p_search_value: searchValue,
        p_min_price: forSaleFilters.minPrice || 0,
        p_max_price: forSaleFilters.maxPrice,
        p_state: forSaleFilters.state == "All" ? null : forSaleFilters.state,
        p_condition: getCheckedOps(forSaleFilters.conditionOptions),
        p_shipping: getCheckedOps(forSaleFilters.shippingOptions),
        p_trades: getCheckedOps(forSaleFilters.tradeOptions),
        p_negotiable: getCheckedOps(forSaleFilters.negotiableOptions),
        p_sort: sort,
        p_seller_id: null,
        p_city: forSaleFilters.city == "All" ? null : forSaleFilters.city,
        p_category_id: forSaleFilters.category?.id || null,
      };

      const paramsAsString = new URLSearchParams(params).toString();

      const response = await fetch(`http://localhost:4000/get-items?${paramsAsString}`);

      if (!response.ok) throw new Error("Something happened get-items");

      let { data } = await response.json();

      if (!data || !data.length === 0) throw new Error("No items were fetched");

      data = data.map((item) => {
        const { data, error } = supabase.storage
          .from("profile_pictures")
          .getPublicUrl(item.profile_picture_path || "placeholders/user-placeholder");

        if (error) throw error.message;

        return {
          ...item,
          profile_picture: data.publicUrl,
        };
      });

      setListings(data);

      const urlSearchQueries = new URLSearchParams({
        search_value: searchValue,
        min_price: FSFilters.minPrice || 0,
        max_price: FSFilters.maxPrice,
        state: FSFilters.state == "All" ? null : FSFilters.state,
        condition: getCheckedOps(FSFilters.conditionOptions),
        shipping: getCheckedOps(FSFilters.shippingOptions),
        trades: getCheckedOps(FSFilters.tradeOptions),
        negotiable: getCheckedOps(FSFilters.negotiableOptions),
        seller_id: null,
        city: FSFilters.city == "All" ? null : FSFilters.city,
        category_id: FSFilters.category?.id || null,
      }).toString();

      const response2 = await fetch(
        `http://localhost:4000/get-items-count/${urlSearchQueries}`
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
