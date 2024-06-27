import { useEffect, useRef, useState } from "react";
import "./MapboxLocationSearch.css";
import mapboxgl from "mapbox-gl";
import { v4 as uuidv4 } from "uuid";

const MapboxLocationSearch = () => {
  const mapContainerRef = useRef(null);
  const map = useRef(null);

  const [location, setLocation] = useState({
    place: {
      full_address: "N/A",
      name: "N/A",
    },
    lng: null,
    lat: null,
    zoom: 9,
  });
  const [suggestions, setSuggestions] = useState([]);

  const [coordsAreInitial, setCoordsAreInitial] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [mapLoading, setMapLoading] = useState(true);

  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY;

  useEffect(() => {
    const debounceFn = setTimeout(async () => {
      if ((location.lat == null || location.lng == null) && coordsAreInitial) return;

      async function getGeocodeData() {
        try {
          const response = await fetch(
            `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${
              location.lng
            }&latitude=${location.lat}&access_token=${
              import.meta.env.VITE_MAPBOX_API_KEY
            }&types=place,postcode`
          );

          const data = await response.json();

          console.log(data);

          const postcodeData = data.features[0];
          const placeData = data.features[1];

          setLocation((prevLocation) => ({
            ...prevLocation,
            place: placeData.properties,
            postcode: postcodeData.properties,
          }));
        } catch (error) {
          console.error(error);
        }
      }

      getGeocodeData();
    }, 100);

    return () => clearTimeout(debounceFn);
  }, [location.lat, location.lng, coordsAreInitial]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      console.log(position);

      if (map.current) return; // initialize map only once

      map.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [position.coords.longitude, position.coords.latitude],
        zoom: location.zoom,
      });

      map.current.on("load", () => {
        // Nifty code to force map to fit inside container when it loads
        map.current.resize();

        map.current.on("move", async (e) => {
          console.log(e);

          if (coordsAreInitial) setCoordsAreInitial(false);

          const newLng = map.current.getCenter().lng.toFixed(4);
          const newLat = map.current.getCenter().lat.toFixed(4);
          const newZoom = map.current.getZoom().toFixed(2);

          features = [
            {
              type: "Feature",
              properties: {
                description: "<strong>Test description</strong>",
                icon: "theatre",
              },
              geometry: {
                type: "Point",
                coordinates: [newLng, newLat],
              },
            },
          ];

          map.current.getSource("ourSource").setData({
            type: "FeatureCollection",
            features,
          });

          // const response = await fetch(
          //   `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${newLng}&latitude=${newLat}&access_token=${
          //     import.meta.env.VITE_MAPBOX_API_KEY
          //   }&types=place,postcode`
          // );

          // const data = await response.json();

          // console.log(data);

          // const postcodeData = data.features[0];
          // const placeData = data.features[1];

          setLocation((prevLocation) => ({
            ...prevLocation,
            // place: placeData?.properties,
            // postcode: postcodeData.properties,
            lng: newLng,
            lat: newLat,
            zoom: newZoom,
          }));
        });

        let features = [
          {
            type: "Feature",
            properties: {
              description:
                '<strong>Make it Mount Pleasant</strong><p><a href="http://www.mtpleasantdc.com/makeitmtpleasant" target="_blank" title="Opens in a new window">Make it Mount Pleasant</a> is a handmade and vintage market and afternoon of live entertainment and kids activities. 12:00-6:00 p.m.</p>',
              icon: "theatre",
            },
            geometry: {
              type: "Point",
              coordinates: [position.coords.longitude, position.coords.latitude],
            },
          },
        ];

        // Create source with our data
        map.current.addSource("ourSource", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features,
          },
        });

        // Add layer for background
        map.current.addLayer({
          id: "ourSource",
          type: "circle",
          source: "ourSource",
          paint: {
            "circle-radius": 5,
            "circle-stroke-width": 1,
            "circle-color": "#4ad493",
            "circle-stroke-color": "#333",
          },
        });

        // map.current.on("click", async (e) => {
        //   console.log(e);

        //   console.log(e)
        //   try {
        //     const response = await fetch(
        //       `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${
        //         e.lngLat.lng
        //       }&latitude=${e.lngLat.lng}&access_token=${
        //         import.meta.env.VITE_MAPBOX_API_KEY
        //       }`
        //     );

        //     const data = await response.json();

        //     console.log(data);
        //   } catch (error) {
        //     console.error(error);
        //   }
        // });
        setMapLoading(false);
      });

      setLocation((prevLocation) => ({
        ...prevLocation,
        lng: position.coords.longitude,
        lat: position.coords.latitude,
      }));
    });
  });

  async function handleSearchInputChange(val) {
    try {
      if (val == "") {
        console.log();
        setSuggestions([]);
        return;
      }
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/suggest?q=${val}&access_token=${
          import.meta.env.VITE_MAPBOX_API_KEY
        }&session_token=${uuidv4()}&types=address`
      );

      const data = await response.json();

      console.log(data);
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="location-selector-parent">
      <form>
        <div className="form-group">
          <input
            placeholder="e.g. Charlotte, NC / 28105 / Denver, CO"
            onChange={(e) => {
              setSearchValue(e.target.value);
              handleSearchInputChange(e.target.value);
            }}
            value={searchValue}
          />
        </div>
      </form>
      {/* {suggestions.length >= 1 ? ( */}
      <ul className="suggestion-list">
        {suggestions.map((suggestion) => (
          <li>
            {suggestion.name} {suggestion.place_formatted}
          </li>
        ))}
      </ul>
      {/* ) */}
      {/* //  : (
      //   <p className="small-text no-suggestions">No suggestions found</p>
      // ) */}
      {/* } */}
      <div className="location-selector">
        {mapLoading ? (
          <div className="skeleton blinking map-loading">
            <p className='skeleton blinking selected-location'></p>
          </div>
        ) : (
          <p className="small-text selected-location">
            {location.place?.full_address} {location.postcode?.name}
          </p>
        )}

        <div className="map-parent">
          <div
            ref={mapContainerRef}
            className={`map-container ${mapLoading ? "hidden" : ""}`}
          />
        </div>
      </div>
    </div>
  );
};
export default MapboxLocationSearch;
