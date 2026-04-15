import { useState, useEffect, useCallback } from "react";
import { MapPin, Navigation, Info, ExternalLink, Locate } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const centerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const kabadwalaIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type LatLng = { lat: number; lng: number };

type RecyclingCenter = {
  id: number;
  name: string;
  type: "Recycling" | "E-Waste" | "Composting" | "Paper" | "Scrap Dealer";
  location: LatLng;
  distance: number;
  address: string;
  accepts: string[];
  phone?: string;
};

function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLng * sinLng;
  return R * 2 * Math.asin(Math.sqrt(h));
}

function generateNearbySpots(base: LatLng): RecyclingCenter[] {
  const raw: Omit<RecyclingCenter, "distance">[] = [
    {
      id: 1,
      name: "Main Campus Eco-Hub",
      type: "Recycling",
      location: { lat: base.lat + 0.005, lng: base.lng + 0.002 },
      address: "Near Science Block A",
      accepts: ["Dry Waste", "E-Waste", "Batteries"],
    },
    {
      id: 2,
      name: "Hostel Zone Bins",
      type: "Recycling",
      location: { lat: base.lat - 0.003, lng: base.lng + 0.004 },
      address: "Behind Boys Hostel 2",
      accepts: ["Wet Waste", "Dry Waste"],
    },
    {
      id: 3,
      name: "Tech Park E-Waste Box",
      type: "E-Waste",
      location: { lat: base.lat + 0.002, lng: base.lng - 0.005 },
      address: "Computer Science Dept Entrance",
      accepts: ["E-Waste", "Cables", "Laptops"],
    },
    {
      id: 4,
      name: "Cafeteria Compost Site",
      type: "Composting",
      location: { lat: base.lat - 0.004, lng: base.lng - 0.002 },
      address: "Backside of Main Canteen",
      accepts: ["Wet Waste", "Food Scraps"],
    },
    {
      id: 5,
      name: "Library Paper Recycling",
      type: "Paper",
      location: { lat: base.lat + 0.001, lng: base.lng + 0.006 },
      address: "Central Library Ground Floor",
      accepts: ["Paper", "Cardboard", "Books"],
    },
    {
      id: 6,
      name: "Raju Kabad-wala",
      type: "Scrap Dealer",
      location: { lat: base.lat + 0.012, lng: base.lng - 0.008 },
      address: "Near Bus Stand, Main Road",
      accepts: ["Metal", "Plastic", "Paper", "Cardboard", "Glass"],
      phone: "9812345670",
    },
    {
      id: 7,
      name: "Sharma Scrap Centre",
      type: "Scrap Dealer",
      location: { lat: base.lat - 0.018, lng: base.lng + 0.021 },
      address: "Old Market Lane, Sector 4",
      accepts: ["Metal", "Tin", "Aluminium", "Plastic"],
      phone: "9988776655",
    },
    {
      id: 8,
      name: "Green Kabad Wala",
      type: "Scrap Dealer",
      location: { lat: base.lat + 0.022, lng: base.lng + 0.017 },
      address: "Industrial Area Gate 3",
      accepts: ["All Dry Waste", "Metal", "E-Waste", "Batteries"],
      phone: "8765432109",
    },
    {
      id: 9,
      name: "City Scrap Dealer",
      type: "Scrap Dealer",
      location: { lat: base.lat - 0.028, lng: base.lng - 0.019 },
      address: "Behind Railway Station",
      accepts: ["Iron", "Steel", "Copper", "Plastic", "Paper"],
      phone: "7654321098",
    },
    {
      id: 10,
      name: "Eco Kabad Centre",
      type: "Scrap Dealer",
      location: { lat: base.lat + 0.035, lng: base.lng - 0.031 },
      address: "Subzi Mandi Road, Near Temple",
      accepts: ["All Recyclables", "Old Electronics"],
      phone: "9123456789",
    },
  ];

  return raw
    .map((spot) => ({
      ...spot,
      distance: Math.round(haversineKm(base, spot.location) * 10) / 10,
    }))
    .filter((spot) => spot.distance <= 5)
    .sort((a, b) => a.distance - b.distance);
}

function MapUpdater({ center }: { center: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], 14);
  }, [center, map]);
  return null;
}

const TYPE_BADGE: Record<RecyclingCenter["type"], string> = {
  Recycling: "bg-green-100 text-green-800 border-green-200",
  "E-Waste": "bg-orange-100 text-orange-800 border-orange-200",
  Composting: "bg-lime-100 text-lime-800 border-lime-200",
  Paper: "bg-amber-100 text-amber-800 border-amber-200",
  "Scrap Dealer": "bg-yellow-100 text-yellow-800 border-yellow-200",
};

export default function MapPage() {
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [centers, setCenters] = useState<RecyclingCenter[]>([]);
  const [locating, setLocating] = useState(false);

  const defaultCenter: LatLng = { lat: 28.6139, lng: 77.209 };

  const resolveLocation = useCallback((loc: LatLng) => {
    setUserLocation(loc);
    setCenters(generateNearbySpots(loc));
    setLoading(false);
    setLocating(false);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser. Showing default area.");
      resolveLocation(defaultCenter);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolveLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        console.warn("Geolocation error:", err);
        setError("Location access denied. Showing default area.");
        resolveLocation(defaultCenter);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const relocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolveLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const mapCenter = userLocation ?? defaultCenter;
  const kabadwalas = centers.filter((c) => c.type === "Scrap Dealer");
  const recycleCenters = centers.filter((c) => c.type !== "Scrap Dealer");

  return (
    <div className="flex flex-col gap-6 pb-10 h-[calc(100vh-80px)]">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <MapPin className="w-8 h-8 text-primary" />
            Find Recycling Spots
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
            Your live location — nearby recycling centres and Kabad-walas within 5 km.
          </p>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2 shrink-0"
          onClick={relocate}
          disabled={locating}
        >
          <Locate className={`w-4 h-4 text-primary ${locating ? "animate-spin" : ""}`} />
          {locating ? "Locating…" : "Re-centre"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Map */}
        <Card className="lg:col-span-2 overflow-hidden flex flex-col border-border/60 shadow-sm h-[400px] lg:h-full">
          <div className="bg-muted px-3 py-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs shrink-0 border-b border-border/40">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> You
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Recycling Centre
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> Kabad-wala / Scrap Dealer
            </span>
            {error && (
              <span className="text-amber-600 flex items-center gap-1 ml-auto">
                <Info className="w-3 h-3" /> {error}
              </span>
            )}
          </div>
          <div className="flex-1 w-full relative z-0">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                <p className="text-muted-foreground animate-pulse flex items-center gap-2">
                  <Navigation className="w-4 h-4 animate-spin" /> Locating you…
                </p>
              </div>
            ) : (
              <MapContainer
                center={[mapCenter.lat, mapCenter.lng]}
                zoom={14}
                scrollWheelZoom
                className="w-full h-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapUpdater center={mapCenter} />

                {userLocation && (
                  <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                    <Popup>
                      <div className="font-semibold text-sm">📍 You are here</div>
                    </Popup>
                  </Marker>
                )}

                {recycleCenters.map((c) => (
                  <Marker key={c.id} position={[c.location.lat, c.location.lng]} icon={centerIcon}>
                    <Popup>
                      <div className="p-1 min-w-[160px]">
                        <div className="font-bold text-green-700 mb-1">{c.name}</div>
                        <div className="text-xs text-gray-500 mb-1">{c.address}</div>
                        <div className="text-xs font-medium text-gray-700 mb-2">
                          {c.distance} km away
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {c.accepts.map((t) => (
                            <span key={t} className="text-[10px] bg-green-50 border border-green-200 text-green-800 px-1.5 py-0.5 rounded-sm">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {kabadwalas.map((k) => (
                  <Marker key={k.id} position={[k.location.lat, k.location.lng]} icon={kabadwalaIcon}>
                    <Popup>
                      <div className="p-1 min-w-[160px]">
                        <div className="font-bold text-orange-700 mb-1">{k.name}</div>
                        <div className="text-xs text-gray-500 mb-1">{k.address}</div>
                        <div className="text-xs font-medium text-gray-700 mb-1">
                          {k.distance} km away
                        </div>
                        {k.phone && (
                          <div className="text-xs font-semibold text-blue-700 mb-2">
                            📞 {k.phone}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {k.accepts.map((t) => (
                            <span key={t} className="text-[10px] bg-orange-50 border border-orange-200 text-orange-800 px-1.5 py-0.5 rounded-sm">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>
        </Card>

        {/* Sidebar */}
        <Card className="flex flex-col border-border/60 shadow-sm h-full max-h-[500px] lg:max-h-full">
          <CardHeader className="shrink-0 pb-3">
            <CardTitle className="text-base">Nearby Spots</CardTitle>
            <CardDescription className="text-xs">
              {centers.length > 0
                ? `${centers.length} location${centers.length !== 1 ? "s" : ""} within 5 km`
                : "Searching near you…"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2 space-y-3 pb-4">
            {centers.length === 0 && !loading && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No spots found within 5 km.
              </p>
            )}
            {centers.map((center) => (
              <div
                key={center.id}
                className="p-3 rounded-xl border border-border/50 bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex justify-between items-start mb-1.5">
                  <h3 className="font-semibold text-sm text-foreground leading-snug pr-2">
                    {center.name}
                  </h3>
                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase font-bold shrink-0 ${TYPE_BADGE[center.type]}`}
                  >
                    {center.type === "Scrap Dealer" ? "Kabad-wala" : center.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-start gap-1 mb-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary/60" />
                  {center.address}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-primary">
                    {center.distance} km
                  </span>
                  {center.phone && (
                    <span className="text-xs text-muted-foreground">• 📞 {center.phone}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {center.accepts.map((type) => (
                    <span
                      key={type}
                      className="text-[11px] font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full"
                    >
                      {type}
                    </span>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 h-7 text-xs text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${center.location.lat},${center.location.lng}`,
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                >
                  <ExternalLink className="w-3 h-3 mr-1.5" /> Get Directions
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
