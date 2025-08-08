import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Import Leaflet's default icons manually
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix default icon path
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const FlyToDistrict = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 10, { duration: 1.5 });
    }
  }, [position, map]);

  return null;
};

const BangladeshMap = ({ serviceCenters, selectedDistrict, setError }) => {
  const defaultPosition = [23.8103, 90.4125]; // Dhaka

  // Find selected district
  const selected = serviceCenters.find((center) =>
    center.district.toLowerCase().includes(selectedDistrict?.toLowerCase())
  );

  useEffect(() => {
    if (selectedDistrict) {
      setError(selected ? "" : "District not found.");
    }
  }, [selectedDistrict, selected, setError]);

  return (
    <div className="h-[400px] rounded-xl overflow-hidden shadow-lg border border-gray-200">
      <MapContainer
        center={defaultPosition}
        zoom={7}
        className="h-full w-full z-10"
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        />

        {/* Fly to selected marker */}
        {selected && (
          <FlyToDistrict position={[selected.latitude, selected.longitude]} />
        )}

        {/* Markers */}
        {serviceCenters.map((center, idx) => (
          <Marker key={idx} position={[center.latitude, center.longitude]}>
            <Popup>
              <strong>{center.district}</strong>
              <br />
              {center.city} ({center.region})
              <br />
              Status: {center.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default BangladeshMap;
