import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import "./LeafletLocationSearch.css";

export const LeafletLocationSearch = () => {
  const mapContainer = useRef();
  const [map, setMap] = useState({});
  const [radiusInMiles, setRadiusInMiles] = useState(100);
  const [location, setLocation] = useState({
    coords: {
      lat: null,
      lng: null,
    },
  });

  useEffect(() => {
    const map = L.map(mapContainer.current, { attributionControl: false });
    navigator.geolocation.getCurrentPosition((position) => {

      map.setView([position.coords.latitude, position.coords.longitude], 13);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 7,
        minZoom: 4,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        // tileSize: 256,
        // zoomOffset: -1,
        // detectRetina: true,
      })
        .addTo(map)
        .setZIndex(3);

      let circlesLayerGroup = L.layerGroup().addTo(map).setZIndex(900);
      let markersLayerGroup = L.layerGroup().addTo(map).setZIndex(899);

      const smallCircle = L.circleMarker(
        [position.coords.latitude, position.coords.longitude],
        {
          color: "blue",
          fillColor: "blue",
          fillOpacity: 0.2,
          radius: radiusInMiles / 10,
        }
      ).addTo(markersLayerGroup);

      const bigCircle = L.circleMarker(
        [position.coords.latitude, position.coords.longitude],
        {
          color: "red",
          fillColor: "red",
          fillOpacity: 0.2,
          radius: radiusInMiles,
        }
      ).addTo(circlesLayerGroup);

      map.addEventListener("dragstart", addCircleAndRadius);
      map.addEventListener("dragend", addCircleAndRadius);
      map.addEventListener("drag", addCircleAndRadius);
      map.addEventListener("zoomanim", addCircleAndRadius);
      map.addEventListener("zoomstart", addCircleAndRadius);
      map.addEventListener("zoom", addCircleAndRadius);

      const centerCoords = map.getCenter();

      function addCircleAndRadius() {
        const centerCoords = map.getCenter();

        circlesLayerGroup.clearLayers();
        markersLayerGroup.clearLayers();

        const smallCircle = L.circleMarker([centerCoords.lat, centerCoords.lng], {
          color: "blue",
          fillColor: "blue",
          fillOpacity: 0.2,
          radius: radiusInMiles / 10,
        }).addTo(markersLayerGroup);

        const bigCircle = L.circleMarker([centerCoords.lat, centerCoords.lng], {
          color: "red",
          fillColor: "red",
          fillOpacity: 0.2,
          radius: radiusInMiles,
        }).addTo(circlesLayerGroup);

        setLocation({
          coords: { lng: centerCoords.lng, lat: centerCoords.lat },
        });
      }

      // L.control.zoom({
      //   zoomInText: '<span aria-hidden="true">+dfs</span>',
      //   zoomInTitle: "Zoom in mf",
      //   zoomOutText: '<span aria-hidden="true">&#x2212;</span>',
      //   zoomOutTitle: "Zoom Out mf",
      // });

      setLocation({
        coords: { lng: position.coords.longitude, lat: position.coords.latitude },
      });
    });
    return () => map.remove();
  }, []);

  useEffect(() => {});

  return (
    <div>
      <p>
        {location.coords.lat}, {location.coords.lng}
      </p>
      <div id="map" ref={(el) => (mapContainer.current = el)}></div>
      <input
        type="range"
        step={1}
        min={1}
        max={500}
        onChange={(e) => setRadiusInMiles(e.target.value)}
        value={radiusInMiles}
      />
      {radiusInMiles}
    </div>
  );
};

