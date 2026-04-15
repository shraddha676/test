import { useAuth } from "@workspace/replit-auth-web";
import { useGetListings } from "@workspace/api-client-react";
import { Link } from "wouter";
import {
  User,
  Leaf,
  Award,
  TrendingUp,
  Recycle,
  Gamepad2,
  BookOpen,
  ShoppingBag,
  Star,
  Trophy,
  LogIn,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BADGES = [
  { id: "eco-starter", label: "Eco Starter", icon: Leaf, color: "text-green-600 bg-green-100", desc: "Created your first listing" },
  { id: "quiz-whiz", label: "Quiz Whiz", icon: Star, color: "text-amber-600 bg-amber-100", desc: "Scored 100% on a quiz" },
  { id: "sorter", label: "Master Sorter", icon: Recycle, color: "text-blue-600 bg-blue-100", desc: "Played the sorting game" },
  { id: "educator", label: "Educator", icon: BookOpen, color: "text-purple-600 bg-purple-100", desc: "Read all waste guides" },
  { id: "trader", label: "Green Trader", icon: ShoppingBag, color: "text-primary bg-primary/10", desc: "Completed a barter deal" },
  { id: "champion", label: "Eco Champion", icon: Trophy, color: "text-orange-600 bg-orange-100", desc: "Diverted 10kg from landfill" },
];

const WASTE_DIVERSION_PER_LISTING = 1.2;

export default function Profile() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const { data: listings = [] } = useGetListings();

  const myListings = listings.filter((l) => l.userId === user?.id);
  const totalRequests = myListings.reduce((sum, l) => sum + l.requestCount, 0);
  const estimatedKg = (myListings.length * WASTE_DIVERSION_PER_LISTING).toFixed(1);

  const quizPoints = Number(localStorage.getItem("ss_quiz_points") ?? 0);
  const gamesPlayed = Number(localStorage.getItem("ss_games_played") ?? 0);

  const earnedBadges = new Set<string>();
  if (myListings.length >= 1) earnedBadges.add("eco-starter");
  if (quizPoints >= 100) earnedBadges.add("quiz-whiz");
  if (gamesPlayed >= 1) earnedBadges.add("sorter");
  if (totalRequests >= 1) earnedBadges.add("trader");
  if (myListings.length >= 5) earnedBadges.add("educator");
  if (myListings.length >= 10) earnedBadges.add("champion");

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center pb-24 md:pb-0">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">Your Eco Profile</h2>
          <p className="text-muted-foreground max-w-sm">
            Log in to see your impact stats, badges, and listings.
          </p>
        </div>
        <Button size="lg" className="rounded-full px-8" onClick={login}>
          <LogIn className="w-4 h-4 mr-2" /> Log In to Continue
        </Button>
      </div>
    );
  }

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : user?.username ?? "Eco User";

  return (
    <div className="flex flex-col gap-6 pb-24 md:pb-10">
      {/* Profile Header */}
      <div className="relative rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 p-6 md:p-8 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />
        <div className="flex items-center gap-5 relative z-10">
          <Avatar className="w-20 h-20 border-4 border-background shadow-xl">
            <AvatarImage src={user?.profileImage ?? ""} alt={displayName} />
            <AvatarFallback className="text-2xl font-bold bg-primary/20 text-primary">
              {displayName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{displayName}</h1>
            <p className="text-muted-foreground text-sm">{user?.email ?? `@${user?.username}`}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-primary text-primary-foreground px-2.5 py-1 rounded-full">
                <Leaf className="w-3 h-3" /> Eco Warrior
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-background/80 px-2.5 py-1 rounded-full border border-border">
                {earnedBadges.size} / {BADGES.length} badges
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Stats */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" /> Your Impact Tracker
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ImpactCard
            icon={<ShoppingBag className="w-5 h-5 text-primary" />}
            label="Items Listed"
            value={String(myListings.length)}
            sub="on marketplace"
            color="bg-primary/10"
          />
          <ImpactCard
            icon={<Recycle className="w-5 h-5 text-green-600" />}
            label="Waste Diverted"
            value={`${estimatedKg} kg`}
            sub="from landfills"
            color="bg-green-100"
          />
          <ImpactCard
            icon={<Star className="w-5 h-5 text-amber-500" />}
            label="Quiz Points"
            value={String(quizPoints)}
            sub="total earned"
            color="bg-amber-100"
          />
          <ImpactCard
            icon={<Gamepad2 className="w-5 h-5 text-purple-600" />}
            label="Games Played"
            value={String(gamesPlayed)}
            sub="sorting games"
            color="bg-purple-100"
          />
        </div>
      </div>

      {/* Badges */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" /> Achievement Badges
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {BADGES.map((badge) => {
            const earned = earnedBadges.has(badge.id);
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={`flex items-start gap-3 p-4 rounded-2xl border transition-all duration-200 ${
                  earned
                    ? "border-primary/30 bg-primary/5 shadow-sm"
                    : "border-border/40 bg-muted/30 opacity-50 grayscale"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${earned ? badge.color : "bg-muted text-muted-foreground"}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{badge.label}</p>
                  <p className="text-xs text-muted-foreground">{badge.desc}</p>
                  {earned && (
                    <span className="text-xs text-primary font-medium mt-0.5 inline-block">Earned</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* My Listings */}
      {myListings.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" /> My Listings ({myListings.length})
          </h2>
          <div className="flex flex-col gap-3">
            {myListings.slice(0, 5).map((listing) => (
              <div key={listing.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card">
                {listing.imageUrl ? (
                  <img
                    src={listing.imageUrl}
                    alt={listing.title}
                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{listing.title}</p>
                  <p className="text-xs text-muted-foreground">{listing.location}</p>
                </div>
                <div className="text-right shrink-0">
                  {listing.price && (
                    <p className="text-sm font-bold text-primary">{listing.price}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{listing.requestCount} interested</p>
                </div>
              </div>
            ))}
            {myListings.length > 5 && (
              <Link href="/marketplace">
                <Button variant="outline" className="w-full">View All Listings</Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Log Out */}
      <div className="pt-4 border-t border-border/40">
        <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/5" onClick={logout}>
          Log Out
        </Button>
      </div>
    </div>
  );
}

function ImpactCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      <CardContent className="p-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
          {icon}
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}
