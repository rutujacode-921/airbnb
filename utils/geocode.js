// Converts a text address (e.g. "Bidar, India") into a GeoJSON Point
// using the Mapbox Geocoding API. Returns null if nothing was found.
module.exports = async function geocode(location, country) {
    const query = [location, country].filter(Boolean).join(", ");
    if (!query) return null;

    const url = new URL("https://api.mapbox.com/search/geocode/v6/forward");
    url.searchParams.set("q", query);
    url.searchParams.set("limit", "1");
    url.searchParams.set("access_token", process.env.MAP_TOKEN);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error("Geocoding failed:", response.status, await response.text());
            return null;
        }
        const data = await response.json();
        const feature = data.features && data.features[0];
        return feature ? feature.geometry : null; // { type: "Point", coordinates: [lng, lat] }
    } catch (err) {
        console.error("Geocoding error:", err.message);
        return null;
    }
};
