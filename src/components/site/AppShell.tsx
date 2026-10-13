import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { Keyboard, Menu, X, ChevronDown, User } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useKeyboardLayout } from "@/lib/useKeyboardLayout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const LAYOUTS = [
  { label: "Remington GAIL", to: "/lessons" as const },
  { label: "Remington CBI", to: "/lessons/remington-cbi" as const },
  { label: "Kruti Dev", to: "/lessons/kruti-dev" as const },
  { label: "Mangal InScript", to: "/lessons/inscript" as const },
  { label: "English", to: "/english-lessons" as const },
];

const navItems = [
  { to: "/", label: "Home" },
  { isLayoutSelector: true, label: "Typing Tutor" },
  { to: "/lessons", label: "Lessons" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/dashboard", label: "Dashboard" },
];

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="inline-flex size-9 items-center justify-center rounded-xl bg-secondary/60 dark:bg-white/[0.04] border border-border/60 dark:border-white/[0.08] text-foreground transition-all duration-200 hover:bg-secondary dark:hover:bg-white/[0.08] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="text-base leading-none select-none" aria-hidden="true">
        {theme === "dark" ? "☀️" : "🌙"}
      </span>
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { currentUser, isGuest, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const { layout } = useKeyboardLayout();

  let lessonsRoute = "/lessons";
  if (layout === "English") lessonsRoute = "/english-lessons";
  else if (layout === "Krutidev" || layout === "Kruti Dev") lessonsRoute = "/lessons/kruti-dev";
  else if (layout === "Remington CBI") lessonsRoute = "/lessons/remington-cbi";
  else if (layout === "Inscript" || layout === "Mangal InScript")
    lessonsRoute = "/lessons/inscript";

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  const handleLayoutSelect = (label: string) => {
    // Normalize layout names for settings
    let normalized = label;
    if (label === "Kruti Dev") normalized = "Krutidev";
    else if (label === "Mangal InScript") normalized = "Inscript";

    localStorage.setItem("settings_keyboard_layout", normalized);
    window.dispatchEvent(new Event("settings_keyboard_layout_changed"));

    // Also update language mode
    if (normalized === "English") {
      localStorage.setItem("settings_language_mode", "English");
    } else if (normalized === "Krutidev") {
      localStorage.setItem("settings_language_mode", "Krutidev (Hindi)");
    } else {
      localStorage.setItem("settings_language_mode", "Hindi");
    }
    window.dispatchEvent(new Event("language_mode_changed"));
  };

  return (
    <div className="surface-grid min-h-screen">
      <header className="sticky top-0 z-50 border-b border-white/50 dark:border-white/[0.08] bg-white/60 dark:bg-[rgba(7,20,38,0.90)] backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center text-white/[0.85] font-[Manrope] font-extrabold text-[18px] w-[36px] h-[36px] rounded-md opacity-90 shadow-[0_4px_0_rgba(0,0,0,0.28)] bg-gradient-to-br from-[#2b52ff] to-[#1b3ad1]">
              अ
            </div>
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-slate-900 dark:text-slate-100">Typing</span>
              <span className="text-primary">Abhyas</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              if (item.isLayoutSelector) {
                return (
                  <DropdownMenu key="layout-selector">
                    <DropdownMenuTrigger className="flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-white/80 dark:hover:bg-white/10 outline-none data-[state=open]:bg-white/80 dark:data-[state=open]:bg-white/10">
                      <div className="flex items-center gap-1.5">
                        <span>{item.label}</span>
                      </div>
                      <ChevronDown className="size-4 opacity-50" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-[280px] rounded-2xl p-2 bg-white/70 dark:bg-[#0f172a] backdrop-blur-[20px] dark:backdrop-blur-[16px] dark:backdrop-saturate-[120%] border border-white/75 dark:border-slate-800 shadow-[0_12px_35px_rgba(15,23,42,0.16)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
                    >
                      <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-widest">
                        Keyboard Layout
                      </div>
                      {LAYOUTS.map((l) => {
                        return (
                          <DropdownMenuItem key={l.label} asChild>
                            <Link
                              to={l.to!}
                              onClick={() => handleLayoutSelect(l.label)}
                              className="rounded-xl cursor-pointer py-2.5 px-3 transition-all duration-200 my-0.5 font-medium flex items-center justify-between text-foreground dark:text-slate-200 hover:bg-black/5 dark:hover:bg-slate-800 focus:bg-black/5 dark:focus:bg-slate-800"
                              style={{ textDecoration: "none" }}
                            >
                              {l.label}
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              const itemTo = item.label === "Lessons" ? lessonsRoute : item.to;
              const isLessonsTab = item.label === "Lessons";
              const forceActive =
                isLessonsTab &&
                (currentPath.startsWith("/lessons") || currentPath.startsWith("/english-lessons"));

              return (
                <Link
                  key={item.label}
                  to={itemTo!}
                  activeOptions={{ exact: itemTo === "/" }}
                  activeProps={
                    forceActive ? {} : { className: "bg-primary text-primary-foreground" }
                  }
                  inactiveProps={
                    forceActive
                      ? {}
                      : {
                          className:
                            "text-muted-foreground dark:text-[#8EA0B8] hover:bg-white/80 dark:hover:bg-white/10 dark:hover:text-[#FFFFFF]",
                        }
                  }
                  className={
                    forceActive
                      ? "rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200 bg-primary text-primary-foreground"
                      : "rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {/* Global theme toggle — visible on all screen sizes */}
            <ThemeToggle />

            <Link
              to="/profile"
              className="hidden rounded-full border border-border dark:border-white/10 bg-white/80 dark:bg-[#1C304D] px-4 py-2 text-sm font-medium text-foreground dark:text-[#F4F7FB] transition-colors hover:bg-white dark:hover:bg-[#1C304D]/80 md:inline-flex items-center gap-2"
            >
              {currentUser && !isGuest ? (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold uppercase">
                  {currentUser[0]}
                </span>
              ) : (
                <User className="size-4 text-muted-foreground dark:text-[#8EA0B8]" />
              )}
              Profile
            </Link>

            {currentUser && !isGuest ? (
              <button
                onClick={handleLogout}
                className="hidden rounded-full border border-border dark:border-white/10 px-4 py-2 text-sm font-semibold text-foreground dark:text-[#F4F7FB] transition-colors hover:bg-secondary dark:hover:bg-white/10 md:inline-flex"
              >
                Logout
              </button>
            ) : isGuest ? (
              <button
                onClick={handleLogout}
                className="hidden rounded-full border border-border dark:border-white/10 px-4 py-2 text-sm font-semibold text-foreground dark:text-[#F4F7FB] transition-colors hover:bg-secondary dark:hover:bg-white/10 md:inline-flex"
              >
                Exit Guest
              </button>
            ) : (
              <Link
                to="/login"
                className="hidden rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 md:inline-flex"
                style={{ background: "var(--gradient-primary)" }}
              >
                Login
              </Link>
            )}
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle navigation"
              className="inline-flex size-10 items-center justify-center rounded-xl bg-white/80 dark:bg-white/10 text-foreground lg:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {open ? (
          <div className="mobile-menu-overlay animate-rise-in border-t border-white/50 dark:border-white/8 bg-white/85 dark:bg-[oklch(0.18_0.03_260/0.95)] px-5 py-3 lg:hidden">
            <div className="flex flex-col">
              {navItems.map((item) => {
                if (item.isLayoutSelector) {
                  return (
                    <div key="layout-selector" className="flex flex-col mb-1">
                      <div className="px-3 py-2 text-sm font-semibold text-foreground/80">
                        {item.label}
                      </div>
                      <div className="flex flex-col ml-3 pl-3 border-l-2 border-border/50">
                        {LAYOUTS.map((l) => {
                          return (
                            <Link
                              key={l.label}
                              to={l.to!}
                              onClick={() => {
                                handleLayoutSelect(l.label);
                                setOpen(false);
                              }}
                              className="text-left rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-0.5 flex items-center justify-between text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                            >
                              {l.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                const itemTo = item.label === "Lessons" ? lessonsRoute : item.to;
                const isLessonsTab = item.label === "Lessons";
                const forceActive =
                  isLessonsTab &&
                  (currentPath.startsWith("/lessons") ||
                    currentPath.startsWith("/english-lessons"));

                return (
                  <Link
                    key={item.label}
                    to={itemTo!}
                    onClick={() => setOpen(false)}
                    activeProps={
                      forceActive ? {} : { className: "text-foreground bg-secondary/60" }
                    }
                    inactiveProps={
                      forceActive
                        ? {}
                        : {
                            className:
                              "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                          }
                    }
                    className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-1 ${
                      forceActive ? "text-foreground bg-secondary/60" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors mb-1 flex items-center gap-2"
              >
                {currentUser && !isGuest ? (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold uppercase">
                    {currentUser[0]}
                  </span>
                ) : (
                  <User className="size-4 text-muted-foreground dark:text-[#8EA0B8]" />
                )}
                Profile
              </Link>
              {!currentUser && !isGuest && (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors mb-1"
                >
                  Login
                </Link>
              )}
              {currentUser && !isGuest && (
                <button
                  onClick={async () => {
                    await handleLogout();
                    setOpen(false);
                  }}
                  className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  Logout
                </button>
              )}
              {isGuest && (
                <button
                  onClick={async () => {
                    await handleLogout();
                    setOpen(false);
                  }}
                  className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                >
                  Exit Guest Mode
                </button>
              )}
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10">{children}</main>

      <footer className="border-t border-white/50 dark:border-white/8 bg-white/60 dark:bg-[oklch(0.20_0.035_260/0.85)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex items-center justify-center text-white/[0.85] font-[Manrope] font-extrabold text-[15px] w-[28px] h-[28px] rounded-md opacity-90 shadow-[0_3px_0_rgba(0,0,0,0.28)] bg-gradient-to-br from-[#2b52ff] to-[#1b3ad1]">
                अ
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-slate-900 dark:text-slate-100">Typing</span>
                <span className="text-primary">Abhyas</span>
              </span>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              For any queries or suggestions, feel free to reach out.
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <p>© {new Date().getFullYear()} TypingAbhyas. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
