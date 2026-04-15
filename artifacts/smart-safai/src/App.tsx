import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@workspace/replit-auth-web";
import NavBar from "@/components/NavBar";
import BottomNav from "@/components/BottomNav";
import Home from "@/pages/home";
import Education from "@/pages/education";
import Marketplace from "@/pages/marketplace";
import Shopping from "@/pages/shopping";
import Profile from "@/pages/profile";
import Game from "@/pages/game";
import MapPage from "@/pages/map";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <NavBar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/education" component={Education} />
          <Route path="/marketplace" component={Marketplace} />
          <Route path="/shopping" component={Shopping} />
          <Route path="/profile" component={Profile} />
          <Route path="/game" component={Game} />
          <Route path="/map" component={MapPage} />
          <Route path="/login" component={Login} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
