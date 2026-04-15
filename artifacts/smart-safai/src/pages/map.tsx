import { useState, useEffect } from "react";
import { MapPin, Navigation, Info, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Dynamic import for leaflet to avoid SSR issues
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet marker icons
import L from "leaflet";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom markers
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const centerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

type Location = {
  lat: number;
  lng: number;
};

type RecyclingCenter = {
  id: number;
  name: string;
  type: string;
  location: Location;
  distance?: number;
  address: string;
  accepts: string[];
};

// Component to handle map view centering
function MapUpdater({ center }: { center: Location | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], 15);
    }
  }, [center, map]);
  return null;
}

export default function MapPage() {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [centers, setCenters] = useState<RecyclingCenter[]>([]);

  // Default fallback center (e.g. some generic city coordinates)
  const defaultCenter = { lat: 28.6139, lng: 77.2090 };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      generateDummyCenters(defaultCenter);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(loc);
        generateDummyCenters(loc);
        setLoading(false);
      },
      (err) => {
        console.warn("Geolocation error:", err);
        setError("Could not access your location. Using default view.");
        generateDummyCenters(defaultCenter);
        setLoading(false);
      }
    );
  }, []);

  const generateDummyCenters = (baseLoc: Location) => {
    // Generate centers around the base location
    const dummyCenters: RecyclingCenter[] = [
      {
        id: 1,
        name: "Main Campus Eco-Hub",
        type: "Comprehensive",
        location: { lat: baseLoc.lat + 0.005, lng: baseLoc.lng + 0.002 },
        address: "Near Science Block A",
        accepts: ["Dry Waste", "E-Waste", "Batteries"]
      },
      {
        id: 2,
        name: "Hostel Zone Bins",
        type: "Standard",
        location: { lat: baseLoc.lat - 0.003, lng: baseLoc.lng + 0.004 },
        address: "Behind Boys Hostel 2",
        accepts: ["Wet Waste", "Dry Waste"]
      },
      {
        id: 3,
        name: "Tech Park E-Waste Box",
        type: "Specialized",
        location: { lat: baseLoc.lat + 0.002, lng: baseLoc.lng - 0.005 },
        address: "Computer Science Dept Entrance",
        accepts: ["E-Waste", "Cables", "Laptops"]
      },
      {
        id: 4,
        name: "Cafeteria Compost Site",
        type: "Composting",
        location: { lat: baseLoc.lat - 0.004, lng: baseLoc.lng - 0.002 },
        address: "Backside of Main Canteen",
        accepts: ["Wet Waste", "Food Scraps"]
      },
      {
        id: 5,
        name: "Library Paper Recycling",
        type: "Paper Only",
        location: { lat: baseLoc.lat + 0.001, lng: baseLoc.lng + 0.006 },
        address: "Central Library Ground Floor",
        accepts: ["Paper", "Cardboard", "Books"]
      }
    ];
    setCenters(dummyCenters);
  };

  const mapCenter = userLocation || defaultCenter;

  return (
    <div className="flex flex-col gap-8 pb-10 h-[calc(100vh-80px)]">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <MapPin className="w-8 h-8 text-primary" />
            Find Recycling Spots
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Locate the nearest bins, e-waste drop-offs, and compost sites on campus.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Map View */}
        <Card className="lg:col-span-2 overflow-hidden flex flex-col border-border/60 shadow-sm h-[400px] lg:h-full">
          <div className="bg-muted p-2 flex items-center justify-between text-xs shrink-0 border-b border-border/40">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Your Location
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Recycling Center
            </span>
            {error && <span className="text-amber-500 flex items-center gap-1"><Info className="w-3 h-3" /> {error}</span>}
          </div>
          <div className="flex-1 w-full relative z-0">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                <p className="text-muted-foreground animate-pulse flex items-center gap-2">
                  <Navigation className="w-4 h-4 animate-spin" /> Locating you...
                </p>
              </div>
            ) : (
              <MapContainer 
                center={[mapCenter.lat, mapCenter.lng]} 
                zoom={14} 
                scrollWheelZoom={true}
                className="w-full h-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <MapUpdater center={mapCenter} />

                {/* User Location */}
                {userLocation && (
                  <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                    <Popup>
                      <div className="font-semibold">You are here</div>
                    </Popup>
                  </Marker>
                )}

                {/* Centers */}
                {centers.map(center => (
                  <Marker 
                    key={center.id} 
                    position={[center.location.lat, center.location.lng]} 
                    icon={centerIcon}
                  >
                    <Popup>
                      <div className="p-1">
                        <div className="font-bold text-primary mb-1">{center.name}</div>
                        <div className="text-xs text-muted-foreground mb-2">{center.address}</div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {center.accepts.map(type => (
                            <span key={type} className="text-[10px] bg-muted px-1.5 py-0.5 rounded-sm">
                              {type}
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

        {/* Centers List */}
        <Card className="flex flex-col border-border/60 shadow-sm h-full max-h-[500px] lg:max-h-full">
          <CardHeader className="shrink-0 pb-4">
            <CardTitle>Nearby Spots</CardTitle>
            <CardDescription>Locations around you</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2 space-y-4 pb-4">
            {centers.map(center => (
              <div key={center.id} className="p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-foreground">{center.name}</h3>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold bg-primary/5 text-primary border-primary/20">
                    {center.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground flex items-start gap-1.5 mb-3">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary/70" />
                  {center.address}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {center.accepts.map(type => (
                    <span key={type} className="text-[11px] font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                      {type}
                    </span>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-3 h-8 text-xs text-primary hover:text-primary hover:bg-primary/10">
                  <ExternalLink className="w-3 h-3 mr-2" /> View on Map
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
