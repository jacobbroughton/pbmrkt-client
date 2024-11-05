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

      const FSFilters = filters.saved["For Sale"];

      let { data, error } = await supabase.rpc("get_items", {
        p_search_value: searchValue,
        p_min_price: FSFilters.minPrice || 0,
        p_max_price: FSFilters.maxPrice,
        p_state: FSFilters.state == "All" ? null : FSFilters.state,
        p_condition: getCheckedOps(FSFilters.conditionOptions),
        p_shipping: getCheckedOps(FSFilters.shippingOptions),
        p_trades: getCheckedOps(FSFilters.tradeOptions),
        p_negotiable: getCheckedOps(FSFilters.negotiableOptions),
        p_sort: sort,
        p_seller_id: null,
        p_city: FSFilters.city == "All" ? null : FSFilters.city,
        p_category_id: FSFilters.category?.id || null,
      });

      if (error) {
        throw error.message;
      }

      if (!data) throw "No listings available";

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

      let { data: data2, error: error2 } = await supabase.rpc("get_items_count", {
        p_search_value: searchValue,
        p_min_price: FSFilters.minPrice || 0,
        p_max_price: FSFilters.maxPrice,
        p_state: FSFilters.state == "All" ? null : FSFilters.state,
        p_condition: getCheckedOps(FSFilters.conditionOptions),
        p_shipping: getCheckedOps(FSFilters.shippingOptions),
        p_trades: getCheckedOps(FSFilters.tradeOptions),
        p_negotiable: getCheckedOps(FSFilters.negotiableOptions),
        p_seller_id: null,
        p_city: FSFilters.city == "All" ? null : FSFilters.city,
        p_category_id: FSFilters.category?.id || null,
      });

      if (error2) {
        throw error2.message;
      }

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
