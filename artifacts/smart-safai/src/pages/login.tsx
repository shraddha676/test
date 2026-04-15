import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { Leaf, Eye, EyeOff, Mail, Phone, Lock, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Mode = "login" | "register";

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function getIdentifierType(v: string): "email" | "phone" | null {
  if (isEmail(v)) return "email";
  if (/^[+]?[\d\s\-().]{7,15}$/.test(v.trim())) return "phone";
  return null;
}

export default function Login() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading, refetch } = useAuth();
  const [mode, setMode] = useState<Mode>("login");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const identifierType = getIdentifierType(identifier);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError("Enter your email or phone number");
      return;
    }
    if (!password) {
      setError("Enter your password");
      return;
    }
    if (mode === "register" && password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);

    const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
    const body: Record<string, string> = { identifier: identifier.trim(), password };
    if (mode === "register") {
      if (firstName.trim()) body.firstName = firstName.trim();
      if (lastName.trim()) body.lastName = lastName.trim();
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      refetch?.();
      setLocation("/");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-primary/10 p-4 rounded-2xl mb-4 border border-primary/20">
            <Leaf className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1 text-foreground">Smart Safai</h1>
          <p className="text-muted-foreground">Join the eco-campus community</p>
        </div>

        <Card className="border-border/60 shadow-lg">
          <CardHeader className="pb-4">
            {/* Mode Toggle */}
            <div className="flex rounded-xl bg-muted p-1 mb-2">
              <button
                type="button"
                onClick={() => { setMode("login"); setError(null); }}
                className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all duration-200 ${
                  mode === "login"
                    ? "bg-background shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => { setMode("register"); setError(null); }}
                className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all duration-200 ${
                  mode === "register"
                    ? "bg-background shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>
            <CardTitle className="text-lg">
              {mode === "login" ? "Welcome back!" : "Create your account"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Log in with your email or phone number"
                : "Sign up with your email or phone number"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name fields (register only) */}
              {mode === "register" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        className="pl-9"
                        placeholder="Shraddha"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        autoComplete="given-name"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Damse"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      autoComplete="family-name"
                    />
                  </div>
                </div>
              )}

              {/* Identifier */}
              <div className="space-y-1.5">
                <Label htmlFor="identifier">Email or Phone Number</Label>
                <div className="relative">
                  {identifierType === "email" ? (
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  ) : identifierType === "phone" ? (
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  ) : (
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  )}
                  <Input
                    id="identifier"
                    className="pl-9"
                    placeholder="you@email.com or 9876543210"
                    value={identifier}
                    onChange={(e) => { setIdentifier(e.target.value); setError(null); }}
                    autoComplete={mode === "register" ? "username" : "email"}
                    inputMode="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pl-9 pr-10"
                    placeholder={mode === "register" ? "Min 6 characters" : "Your password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                    autoComplete={mode === "register" ? "new-password" : "current-password"}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full font-semibold py-5 text-base mt-2"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                    {mode === "register" ? "Creating account…" : "Logging in…"}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {mode === "register" ? "Create Account" : "Log In"}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-5 leading-relaxed">
              By continuing, you agree to our community guidelines for keeping the campus clean and green.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
