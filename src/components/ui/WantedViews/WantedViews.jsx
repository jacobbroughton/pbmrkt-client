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
import "./WantedViews.css";
import { WantedListingGrid } from "../WantedListingGrid/WantedListingGrid";
import { WantedListingList } from "../WantedListingList/WantedListingList";
import { WantedOverview } from "../WantedOverview/WantedOverview";

export function WantedViews({ sort, setTotalListings }) {
  const view = useSelector((state) => state.view);
  const filtersSidebarToggled = useSelector(
    (state) => state.modals.filtersSidebarToggled
  );
  const search = useSelector((state) => state.search);
  const filters = useSelector((state) => state.filters);
  const flags = useSelector((state) => state.flags);
  const windowSize = useWindowSize();

  useEffect(() => {
    if (filters.filtersUpdated) getListings(search.savedSearchValue);
  }, [filters.filtersUpdated]);

  useEffect(() => {
    if (flags.searchedListingsNeedUpdate) getListings(search.savedSearchValue);
  }, [flags.searchedListingsNeedUpdate]);

  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsInitiallyLoading, setListingsInitiallyLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  async function getListings(searchValue = "") {
    try {
      // if (totalListings) setTotalListings(null)
      // if (!listingsInitiallyLoading && listingsLoading) {
      setListingsLoading(true);
      // }

      // p_search_value text,
      // p_min_budget float,
      // p_max_budget float,
      // p_shipping_ok boolean,
      // p_sort varchar(20),
      // p_seller_id uuid,
      // p_state text,
      // p_city text,
      // p_category_id bigint

      let { data, error } = await supabase.rpc("get_wanted_items", {
        p_search_value: searchValue,
        p_min_budget: filters.saved["Wanted"].minBudget || 0,
        p_max_budget: filters.saved["Wanted"].maxBudget,
        p_state:
          filters.saved["Wanted"].state == "All" ? null : filters.saved["Wanted"].state,
        p_shipping_ok: true,
        p_sort: sort,
        p_seller_id: null,
        p_city:
          filters.saved["Wanted"].city == "All" ? null : filters.saved["Wanted"].city,
        p_category_id: filters.saved["Wanted"].category?.id || null,
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

      console.log(data)

      setListings(data);


      let { data: data2, error: error2 } = await supabase.rpc("get_view_all_wanted_count", {
        p_search_value: searchValue,
        p_min_budget: filters.saved["Wanted"].minBudget || 0,
        p_max_budget: filters.saved["Wanted"].maxBudget,
        p_state:
          filters.saved["Wanted"].state == "All" ? null : filters.saved["Wanted"].state,
        p_shipping_ok: true,
        p_seller_id: null,
        p_city:
          filters.saved["Wanted"].city == "All" ? null : filters.saved["Wanted"].city,
        p_category_id: filters.saved["Wanted"].category?.id || null,
      });

      if (error2) {
        throw error2.message;
      }

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

  const isInitiallyLoading = isInitialLoad && listingsLoading;
  const loadedWithNoResults = !isInitialLoad && listings.length === 0;

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
