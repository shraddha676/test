import { Link, useLocation } from "wouter";
import { Home, BookOpen, ShoppingCart, MapPin, ShoppingBag } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/education", icon: BookOpen, label: "Learn" },
  { href: "/shopping", icon: ShoppingCart, label: "Shop" },
  { href: "/map", icon: MapPin, label: "Map" },
  { href: "/marketplace", icon: ShoppingBag, label: "Market" },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = location === href;
          return (
            <Link key={href} href={href} className="flex-1 flex flex-col items-center justify-center gap-0.5 relative group">
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
              )}
              <Icon
                className={`w-5 h-5 transition-all duration-200 ${active ? "text-primary scale-110" : "text-muted-foreground group-hover:text-foreground"}`}
              />
              <span className={`text-[10px] font-medium tracking-tight transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="h-safe-bottom bg-background/90" />
    </nav>
  );
}
