import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Keyboard, Eye, EyeOff, Loader2, Sparkles, User } from "lucide-react";
import { useState } from "react";
import { GlassCard } from "@/components/kit/GlassCard";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signup, enterGuestMode } = useAuth();
  const navigate = useNavigate();

  const handleContinueAsGuest = () => {
    enterGuestMode();
    navigate({ to: "/" });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill out all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup(name, email, password);

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
      } else {
        // Successful signup -> Home
        navigate({ to: "/" });
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <GlassCard className="w-full max-w-md p-8 sm:p-10 text-center animate-rise-in">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
          <Sparkles className="size-8" />
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
          Create an Account
        </h1>
        <p className="mb-8 font-hindi text-muted-foreground">
          Create a new account
        </p>

        {error && (
          <div className="mb-6 rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-4 text-left">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground ml-1">
              Display Name
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-lg font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground ml-1">
              Email
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-lg font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5 relative">
            <label className="text-sm font-medium text-foreground ml-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 pr-12 text-lg font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5 relative">
            <label className="text-sm font-medium text-foreground ml-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-lg font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || !email.trim() || !password.trim() || isLoading}
            className="w-full mt-4 flex justify-center items-center rounded-xl px-4 py-3 font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: "var(--gradient-primary)" }}
          >
            {isLoading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              "Create Account"
            )}
          </button>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </p>

          <div className="relative my-3 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60" />
            </div>
            <div className="relative bg-card px-3 text-xs uppercase tracking-wider text-muted-foreground">
              Or
            </div>
          </div>

          <button
            type="button"
            onClick={handleContinueAsGuest}
            className="w-full flex justify-center items-center gap-2 rounded-xl border border-border/80 bg-background/60 hover:bg-secondary/60 py-2.5 text-sm font-semibold text-foreground transition-all shadow-xs cursor-pointer"
          >
            <User className="size-4 text-muted-foreground" />
            <span>Continue as Guest</span>
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
