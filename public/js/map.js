// Expects `mapToken` and `mapListing` to be defined by show.ejs
(function () {
    const container = document.getElementById("map");
    if (!container || typeof mapboxgl === "undefined") return;

    mapboxgl.accessToken = mapToken;

    if (!mapListing.coordinates) {
        container.innerHTML =
            '<p class="text-muted p-3">Location could not be found on the map. Try editing the listing with a more specific address.</p>';
        return;
    }

    const map = new mapboxgl.Map({
        container: "map",
        center: mapListing.coordinates, // [lng, lat] from geocoding
        zoom: 10,
    });

    map.addControl(new mapboxgl.NavigationControl());

    // build popup content with textContent so user input can't inject HTML
    const popupContent = document.createElement("div");
    const heading = document.createElement("h6");
    heading.className = "mb-1";
    heading.textContent = mapListing.title;
    const place = document.createElement("p");
    place.className = "mb-1";
    place.textContent = `${mapListing.location}, ${mapListing.country}`;
    const hint = document.createElement("p");
    hint.className = "mb-0 fw-semibold";
    hint.textContent = "Exact location provided after booking";
    popupContent.append(heading, place, hint);

    const popup = new mapboxgl.Popup({ offset: 25, closeButton: false, closeOnClick: false })
        .setDOMContent(popupContent);

    const marker = new mapboxgl.Marker({ color: "#fe424d" })
        .setLngLat(mapListing.coordinates)
        .addTo(map);

    // show the popup only while the mouse is over the marker
    const markerEl = marker.getElement();
    markerEl.style.cursor = "pointer";
    markerEl.addEventListener("mouseenter", () => popup.setLngLat(mapListing.coordinates).addTo(map));
    markerEl.addEventListener("mouseleave", () => popup.remove());
})();
