import { Link, useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { Leaf, BookOpen, ShoppingBag, Gamepad2, MapPin, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link as WouterLink } from "wouter";

export default function NavBar() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const links = [
    { href: "/education", label: "Education", icon: <BookOpen className="w-4 h-4" /> },
    { href: "/shopping", label: "Shop", icon: <ShoppingCart className="w-4 h-4" /> },
    { href: "/marketplace", label: "Marketplace", icon: <ShoppingBag className="w-4 h-4" /> },
    { href: "/game", label: "Sorting Game", icon: <Gamepad2 className="w-4 h-4" /> },
    { href: "/map", label: "Find Centers", icon: <MapPin className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight hover:opacity-90 transition-opacity shrink-0">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-sm">
            <Leaf className="w-5 h-5" />
          </div>
          Smart Safai
        </Link>

        <nav className="hidden md:flex items-center gap-5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1.5 ${
                location === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={user.profileImage ?? ""} alt={user.username ?? "User"} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {user.firstName?.[0] ?? user.username?.[0] ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email ?? `@${user.username}`}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <WouterLink href="/profile" className="flex items-center gap-2 cursor-pointer w-full">
                    <User className="w-4 h-4" /> My Profile
                  </WouterLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive"
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="default" size="sm" className="font-semibold shadow-sm">
                Log in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
