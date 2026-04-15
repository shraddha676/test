import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, login, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-primary/10 p-4 rounded-2xl mb-4 border border-primary/20">
            <Leaf className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-foreground">
            Smart Safai
          </h1>
          <p className="text-muted-foreground text-lg">
            Join the eco-campus community
          </p>
        </div>

        <Card className="border-border/60 shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <CardDescription>Log in to access all features</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-8">
            <Button 
              className="w-full text-base py-6 rounded-xl font-bold shadow-md" 
              onClick={login}
            >
              Log in with Replit
            </Button>
            
            <p className="text-center text-xs text-muted-foreground mt-6">
              By logging in, you agree to our community guidelines for keeping the campus clean and green.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
