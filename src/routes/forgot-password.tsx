import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { KeyRound, Loader2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { GlassCard } from "@/components/kit/GlassCard";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { resetPassword } = useAuth();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(email);

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
      } else {
        setSuccess(true);
        setIsLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <GlassCard className="w-full max-w-md p-8 sm:p-10 text-center animate-rise-in">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
          <KeyRound className="size-8" />
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
          Reset Password
        </h1>
        <p className="mb-8 font-hindi text-muted-foreground">
          Recover your account
        </p>

        {error && (
          <div className="mb-6 rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger text-left">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-left animate-in fade-in zoom-in duration-300">
            <div className="mb-6 rounded-xl bg-success/10 px-4 py-4 text-sm font-medium text-success">
              Password reset link has been sent to <strong>{email}</strong> if an account exists.
            </div>
            <Link
              to="/login"
              className="w-full flex justify-center items-center rounded-xl border border-input bg-background/50 px-4 py-3 font-semibold text-foreground hover:bg-muted transition-all"
            >
              <ArrowLeft className="size-4 mr-2" />
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-4 text-left">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground ml-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-lg font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              disabled={!email.trim() || isLoading}
              className="w-full mt-4 flex justify-center items-center rounded-xl px-4 py-3 font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: "var(--gradient-primary)" }}
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                "Send Reset Link"
              )}
            </button>

            <div className="mt-4 text-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
              >
                <ArrowLeft className="size-4 mr-1.5" />
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </GlassCard>
    </div>
  );
}
