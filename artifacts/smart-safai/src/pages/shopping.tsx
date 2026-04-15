import { useState } from "react";
import { ShoppingCart, MapPin, Star, Package, Leaf, Zap, Search, ExternalLink } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Category = "all" | "bins" | "compost" | "kits";

const PRODUCTS = [
  {
    id: 1,
    name: "Bin (Dry Waste)",
    category: "bins" as Category,
    price: 399,
    rating: 4.6,
    reviews: 218,
    image: "https://images.unsplash.com/photo-1611735341450-74d61e660ad2?w=400&h=300&fit=crop&q=80",
    description: "Standard blue dry-waste bin with lid. Ideal for paper, plastic, glass, and metal recyclables.",
    badge: "Best Seller",
    badgeColor: "bg-amber-100 text-amber-800",
    buyLink: "https://www.amazon.in/s?k=dry+waste+bin+blue",
  },
  {
    id: 2,
    name: "Bin (Wet Waste)",
    category: "bins" as Category,
    price: 299,
    rating: 4.4,
    reviews: 143,
    image: "https://m.media-amazon.com/images/I/51cvJ5yhOML._SX679_.jpg?w=400&h=300&fit=crop&q=80",
    badge: null,
    description: "Green 10L wet-waste bin with secure lid. Odour-sealed for food scraps and organic waste.",
    badgeColor: "",
    buyLink: "https://www.amazon.in/s?k=wet+waste+green+bin",
  },
  {
    id: 3,
    name: "Color-Coded Bin Set (5pc)",
    category: "bins" as Category,
    price: 1200,
    rating: 4.7,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop&q=80",
    description: "Full set of 5 colour-coded bins with lids for complete waste segregation at home or office.",
    badge: "New",
    badgeColor: "bg-blue-100 text-blue-800",
    buyLink: "https://www.amazon.in/s?k=color+coded+waste+segregation+bin+set",
  },
  {
    id: 4,
    name: "Compost Unit (Home)",
    category: "compost" as Category,
    price: 799,
    rating: 4.9,
    reviews: 203,
    image: "https://images.unsplash.com/photo-1591384640699-9a85bd036da2?w=400&h=300&fit=crop&q=80",
    description: "Odour-locked home compost unit for vegetable peels and food scraps. Converts waste to manure in 45 days.",
    badge: "Top Rated",
    badgeColor: "bg-green-100 text-green-800",
    buyLink: "https://www.amazon.in/s?k=home+compost+bin+unit",
  },
  {
    id: 5,
    name: "Garden Compost Bin (80L)",
    category: "compost" as Category,
    price: 1850,
    rating: 4.6,
    reviews: 77,
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop&q=80",
    description: "Large garden composter with aeration system for rich organic soil.",
    badge: null,
    badgeColor: "",
    buyLink: "https://www.amazon.in/s?k=garden+compost+bin+80+litre",
  },
  {
    id: 6,
    name: "Vermicompost Starter Kit",
    category: "compost" as Category,
    price: 2200,
    rating: 4.8,
    reviews: 44,
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop&q=80",
    description: "Complete kit with worm bin, coco peat, and live red worms to begin vermicomposting.",
    badge: "Eco Pick",
    badgeColor: "bg-primary/10 text-primary",
    buyLink: "https://www.amazon.in/s?k=vermicompost+starter+kit",
  },
  {
    id: 7,
    name: "Plastic Crusher Tool",
    category: "kits" as Category,
    price: 480,
    rating: 4.4,
    reviews: 38,
    image: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=400&h=300&fit=crop&q=80",
    description: "Compact manual crusher for plastic bottles — saves bin space by 70%.",
    badge: null,
    badgeColor: "",
    buyLink: "https://www.amazon.in/s?k=plastic+bottle+crusher",
  },
  {
    id: 8,
    name: "Recycling Starter Pack",
    category: "kits" as Category,
    price: 1650,
    rating: 4.7,
    reviews: 91,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&q=80",
    description: "Everything you need to begin recycling: colour-coded bags, labels, guide booklet, and crusher.",
    badge: "Bundle Deal",
    badgeColor: "bg-purple-100 text-purple-800",
    buyLink: "https://www.amazon.in/s?k=recycling+starter+kit",
  },
  {
    id: 9,
    name: "Reusable Grocery Bag Set",
    category: "kits" as Category,
    price: 299,
    rating: 4.9,
    reviews: 315,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop&q=80",
    description: "Set of 6 durable cotton mesh bags — eliminates single-use plastic bags.",
    badge: "Popular",
    badgeColor: "bg-rose-100 text-rose-800",
    buyLink: "https://www.amazon.in/s?k=reusable+grocery+bag+cotton",
  },
];

const CATEGORY_TABS: { value: Category; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "All Products", icon: <Package className="w-4 h-4" /> },
  { value: "bins", label: "Waste Bins", icon: <Package className="w-4 h-4" /> },
  { value: "compost", label: "Compost Units", icon: <Leaf className="w-4 h-4" /> },
  { value: "kits", label: "Recycling Kits", icon: <Zap className="w-4 h-4" /> },
];

export default function Shopping() {
  const [category, setCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");
  const [locateOpen, setLocateOpen] = useState(false);

  const filtered = PRODUCTS.filter(
    (p) =>
      (category === "all" || p.category === category) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-8 pb-24 md:pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-primary" />
            Waste Utilities Shop
          </h1>
          <p className="text-muted-foreground mt-2">
            Quality bins, composters, and recycling kits to make segregation easy at home.
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2" onClick={() => setLocateOpen(true)}>
          <MapPin className="w-4 h-4 text-primary" /> Locate Shop
        </Button>
      </div>

      {/* Search + Category Tabs */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setCategory(tab.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
                category === tab.value
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No products found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Locate Shop Dialog */}
      <Dialog open={locateOpen} onOpenChange={setLocateOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Nearby Eco Stores
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {[
              { name: "GreenMart Eco Store", area: "Koramangala, Bangalore", dist: "0.8 km", open: true, phone: "080-41234567" },
              { name: "RecycleHub India", area: "HSR Layout, Bangalore", dist: "1.4 km", open: true, phone: "9876001234" },
              { name: "EcoNest Supplies", area: "Indiranagar, Bangalore", dist: "2.1 km", open: false, phone: "080-25678901" },
              { name: "Swachh Samagri", area: "BTM Layout, Bangalore", dist: "3.2 km", open: true, phone: "9845123456" },
            ].map((store) => (
              <div key={store.name} className="flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-card">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{store.name}</p>
                  <p className="text-xs text-muted-foreground">{store.area}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-primary font-medium">{store.dist}</span>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${store.open ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {store.open ? "Open" : "Closed"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{store.phone}</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-2" onClick={() => setLocateOpen(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductCard({ product }: { product: (typeof PRODUCTS)[0] }) {
  return (
    <Card className="overflow-hidden flex flex-col group hover:shadow-lg transition-shadow duration-300 border-border/50">
      <div className="relative h-48 overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.badge && (
          <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${product.badgeColor}`}>
            {product.badge}
          </span>
        )}
      </div>
      <CardContent className="p-4 flex-1">
        <h3 className="font-semibold text-base leading-snug mb-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center gap-1.5 mb-3">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-xs font-semibold">{product.rating}</span>
          <span className="text-xs text-muted-foreground">({product.reviews} reviews)</span>
        </div>
        <p className="text-2xl font-bold text-primary">
          ₹{product.price.toLocaleString("en-IN")}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          className="flex-1"
          onClick={() => window.open(product.buyLink, "_blank", "noopener,noreferrer")}
        >
          <ExternalLink className="w-4 h-4 mr-2" /> Buy Now
        </Button>
      </CardFooter>
    </Card>
  );
}
