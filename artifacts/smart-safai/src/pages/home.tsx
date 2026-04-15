import { Link } from "wouter";
import { useGetListingStats, useGetDailyTip } from "@workspace/api-client-react";
import { ArrowRight, Leaf, Recycle, MapPin, Gamepad2, TrendingUp, Sparkles, AlertCircle, ShoppingCart, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: stats, isLoading: statsLoading } = useGetListingStats();
  const { data: tip, isLoading: tipLoading } = useGetDailyTip();

  return (
    <div className="flex flex-col gap-10 pb-10">
      {/* Hero Section */}
      <section className="relative rounded-3xl bg-primary/10 px-6 py-16 md:py-24 md:px-12 overflow-hidden border border-primary/20">
        <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:20px_20px]" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary font-medium text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Welcome to the Eco-Campus</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            Keep our campus <span className="text-primary">green & clean</span> together.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
            Smart Safai is your community platform for learning about waste, bartering recyclables, and finding recycling spots nearby.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/marketplace">
              <Button size="lg" className="font-semibold rounded-full px-8 shadow-md">
                Browse Marketplace <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/education">
              <Button size="lg" variant="outline" className="rounded-full px-8 bg-background/50 backdrop-blur-sm">
                Learn to Sort
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="hidden lg:flex absolute right-24 top-1/2 -translate-y-1/2 items-center justify-center w-64 h-64 rounded-full border-4 border-primary/30 bg-background/50 backdrop-blur-sm shadow-xl transform rotate-12">
          <Leaf className="w-32 h-32 text-primary opacity-80" />
        </div>
      </section>

      {/* Daily Tip */}
      <section>
        <Card className="bg-secondary/30 border-secondary-border shadow-sm">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="bg-secondary p-3 rounded-full shrink-0 mt-1">
              <AlertCircle className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1 flex items-center gap-2 text-foreground">
                Daily Green Tip <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">NEW</span>
              </h3>
              {tipLoading ? (
                <div className="space-y-2 mt-2">
                  <Skeleton className="h-4 w-full max-w-md" />
                  <Skeleton className="h-4 w-3/4 max-w-sm" />
                </div>
              ) : tip ? (
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  {tip.tip}
                </p>
              ) : (
                <p className="text-muted-foreground text-sm md:text-base">
                  Rinse out your plastic containers before throwing them in the dry waste bin to prevent contamination!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Modules Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Explore the Platform</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ModuleCard
            href="/education"
            icon={<BookOpen className="w-8 h-8" />}
            title="Education Hub"
            description="Learn how to segregate waste, watch videos, and take the Waste Quiz."
            color="bg-blue-500/10 text-blue-600 border-blue-500/20"
          />
          <ModuleCard
            href="/marketplace"
            icon={<Recycle className="w-8 h-8" />}
            title="P2P Marketplace"
            description="Buy, sell, or barter recyclable materials with your community."
            color="bg-primary/10 text-primary border-primary/20"
          />
          <ModuleCard
            href="/shopping"
            icon={<ShoppingCart className="w-8 h-8" />}
            title="Eco Shop"
            description="Buy quality waste bins, compost units, and recycling kits online."
            color="bg-teal-500/10 text-teal-600 border-teal-500/20"
          />
          <ModuleCard
            href="/map"
            icon={<MapPin className="w-8 h-8" />}
            title="Facility Locator"
            description="Find nearest recycling centers, scrap dealers, and e-waste depots."
            color="bg-purple-500/10 text-purple-600 border-purple-500/20"
          />
          <ModuleCard
            href="/game"
            icon={<Gamepad2 className="w-8 h-8" />}
            title="Sorting Game"
            description="Test your waste segregation skills in an interactive drag-and-drop game."
            color="bg-orange-500/10 text-orange-600 border-orange-500/20"
          />
          <ModuleCard
            href="/profile"
            icon={<TrendingUp className="w-8 h-8" />}
            title="Impact Tracker"
            description="Track waste diverted, badges earned, and your personal eco score."
            color="bg-rose-500/10 text-rose-600 border-rose-500/20"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" /> Campus Impact
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="border-border/50">
                <CardHeader className="p-4 pb-2">
                  <Skeleton className="h-4 w-20" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <StatCard title="Total Listings" value={stats?.totalListings ?? 0} />
              <StatCard title="Dry Waste Items" value={stats?.dryWasteCount ?? 0} />
              <StatCard title="E-Waste Items" value={stats?.electronicWasteCount ?? 0} />
              <StatCard title="Items Requested" value={stats?.totalRequests ?? 0} />
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function ModuleCard({ href, icon, title, description, color }: { href: string; icon: React.ReactNode; title: string; description: string; color: string }) {
  return (
    <Link href={href}>
      <Card className="h-full hover:-translate-y-1 transition-transform duration-300 cursor-pointer border-border/50 hover:shadow-md group">
        <CardHeader>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${color} group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-base text-muted-foreground">{description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card className="border-border/50 shadow-sm bg-card">
      <CardHeader className="p-4 pb-2">
        <CardDescription className="font-medium text-muted-foreground">{title}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-3xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

