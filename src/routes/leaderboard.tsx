import { createFileRoute } from "@tanstack/react-router";
import { Crown, Medal, Trophy } from "lucide-react";
import { GlassCard, SectionTitle } from "@/components/kit/GlassCard";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/useLanguage";
import { calculateXP, XP_PER_LEVEL, MAX_DISPLAY_LEVEL } from "@/lib/scoring";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Hindi Typing Leaderboard — Top Typists" },
      {
        name: "description",
        content:
          "See the fastest Hindi typists this week ranked by words per minute, accuracy and practice consistency.",
      },
      { property: "og:title", content: "Hindi Typing Leaderboard" },
      {
        property: "og:description",
        content: "Weekly ranking of the fastest and most accurate Hindi typists.",
      },
    ],
  }),
  component: LeaderboardPage,
});

const podiumIcons = [Crown, Trophy, Medal, Medal];

const podiumStyles = [
  {
    card: "relative z-10 md:-translate-y-3 md:scale-105 shadow-xl md:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:md:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]",
    iconBox: "bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400",
    iconSize: "size-7",
  },
  {
    card: "shadow-lg",
    iconBox: "bg-slate-400/15 border border-slate-400/30 text-slate-600 dark:text-slate-300",
    iconSize: "size-6",
  },
  {
    card: "shadow-lg",
    iconBox: "bg-orange-700/15 border border-orange-700/30 text-orange-700 dark:text-orange-500",
    iconSize: "size-6",
  },
  {
    card: "shadow-md opacity-90",
    iconBox: "bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400",
    iconSize: "size-5",
  },
];

type Period = "Daily" | "Weekly" | "Monthly" | "Overall";

function LeaderboardPage() {
  const { isEnglish } = useLanguage();
  const { currentUser } = useAuth();
  const [leaderboardMode, setLeaderboardMode] = useState<"Typing Speed" | "XP">("Typing Speed");
  const [period, setPeriod] = useState<Period>("Weekly");
  const [realPlayers, setRealPlayers] = useState<any[]>([]);

  useEffect(() => {
    const usersData: Record<string, any[]> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("results_")) {
        const username = key.replace("results_", "");
        if (username.toLowerCase() === "guest") continue;
        try {
          const results = JSON.parse(localStorage.getItem(key) || "[]");
          if (Array.isArray(results)) {
            usersData[username] = results;
          }
        } catch (e) {}
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // 6 days ago + today = exactly 7 calendar days for Weekly filter
    const sixDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);

    const aggregated = Object.keys(usersData)
      .map((username) => {
        const results = usersData[username];
        let tests = 0;
        let highestWpm = 0;
        let highestAcc = 0;
        let totalXp = 0;

        if (results)
          results.forEach((r) => {
            if (!r.date || typeof r.date !== "string") return;
            if (leaderboardMode === "Typing Speed" && r.isBonus) return;

            let include = false;
            if (leaderboardMode === "XP") {
              include = true;
            } else if (period === "Overall") {
              include = true;
            } else {
              // Try parsing existing "D Mon" format by appending current year
              const d = new Date(`${r.date} ${today.getFullYear()}`);
              if (!isNaN(d.getTime())) {
                d.setHours(0, 0, 0, 0);

                // Handle December -> January transition correctly.
                // If parsed date is significantly in the future (e.g. '28 Dec' parsed in Jan),
                // it belongs to the previous year.
                if (d.getTime() > today.getTime() + 7 * 24 * 60 * 60 * 1000) {
                  d.setFullYear(d.getFullYear() - 1);
                }

                if (period === "Daily" && d.getTime() === today.getTime()) {
                  include = true;
                } else if (
                  period === "Weekly" &&
                  d.getTime() >= sixDaysAgo.getTime() &&
                  d.getTime() <= today.getTime()
                ) {
                  include = true;
                } else if (
                  period === "Monthly" &&
                  d.getMonth() === today.getMonth() &&
                  d.getFullYear() === today.getFullYear()
                ) {
                  include = true;
                }
              }
            }

            if (include) {
              if (leaderboardMode === "Typing Speed") {
                tests++;
                if (r.wpm > highestWpm) {
                  highestWpm = r.wpm;
                  highestAcc = r.accuracy || 0;
                }
              } else {
                if (!r.isBonus) tests++;
                if (typeof r.xp === "number" && !isNaN(r.xp)) {
                  totalXp += r.xp;
                } else {
                  const w = parseInt(String(r.wpm ?? 0).replace(" WPM", "")) || 0;
                  const a = parseInt(String(r.accuracy || r.acc || "0").replace("%", "")) || 0;
                  const errs = typeof r.errors === "number" ? r.errors : 0;
                  totalXp += calculateXP(w, a, errs);
                }
              }
            }
          });

        return { name: username, wpm: highestWpm, acc: highestAcc, tests, xp: totalXp };
      })
      .filter((p) => (leaderboardMode === "XP" ? p.xp > 0 : p.tests > 0));

    if (leaderboardMode === "XP") {
      aggregated.sort((a, b) => b.xp - a.xp);
    } else {
      aggregated.sort((a, b) => b.wpm - a.wpm);
    }
    setRealPlayers(aggregated);
  }, [period, leaderboardMode]);

  return (
    <div className="flex flex-col">
      <div className="animate-rise-in">
        <span className="en inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold tracking-wide text-accent-foreground uppercase">
          Community
        </span>
        <h1 className="en mt-4 text-3xl font-[800] tracking-tight text-primary">
          {leaderboardMode === "XP" ? "XP Leaderboard" : `${period} Leaderboard`}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {isEnglish
            ? "The fastest and most accurate typists this week."
            : "इस सप्ताह के सबसे तेज़ और सटीक टाइपिस्ट।"}
        </p>
      </div>

      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="inline-flex items-center rounded-full border border-border/60 bg-card p-1 shadow-sm">
          {(["Typing Speed", "XP"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setLeaderboardMode(m)}
              className={cn(
                "px-5 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-full transition-colors",
                leaderboardMode === m
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
              )}
            >
              {m}
            </button>
          ))}
        </div>

        {leaderboardMode === "Typing Speed" && (
          <div className="inline-flex items-center rounded-full border border-border/60 bg-card p-1 shadow-sm transition-opacity duration-300">
            {(["Daily", "Weekly", "Monthly"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-5 py-1.5 text-xs font-semibold rounded-full transition-colors",
                  period === p
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                )}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {realPlayers.length > 0 ? (
        <>
          <div className="mt-6 md:mt-8 grid gap-5 md:grid-cols-4 pt-2 md:pt-4">
            {realPlayers.slice(0, 4).map((p, i) => {
              const Icon = podiumIcons[i]!;
              const style = podiumStyles[i]!;
              return (
                <GlassCard
                  key={p.name}
                  className={cn("text-center transition-transform", style.card)}
                >
                  <span
                    className={cn(
                      "mx-auto flex size-14 items-center justify-center rounded-2xl",
                      style.iconBox,
                    )}
                  >
                    <Icon className={style.iconSize} />
                  </span>
                  <p className="mt-4 font-hindi text-lg font-semibold text-foreground">{p.name}</p>
                  <p className="mt-5 text-[26px] font-[800] leading-none text-primary">
                    {leaderboardMode === "XP" ? p.xp.toLocaleString() : p.wpm}
                  </p>
                  <p className="mt-1.5 text-[11px] tracking-wider text-muted-foreground uppercase">
                    {leaderboardMode === "XP" ? "XP" : "WPM"}
                  </p>
                  <div className="mt-3 inline-block rounded-full bg-success/10 px-2.5 py-0.5 text-[11px] font-[800] text-success">
                    {leaderboardMode === "XP"
                      ? `Level ${Math.min(MAX_DISPLAY_LEVEL, Math.floor(p.xp / XP_PER_LEVEL) + 1)}`
                      : `${p.acc}% accuracy`}
                  </div>
                </GlassCard>
              );
            })}
          </div>

          <div className="mt-10 md:mt-16">
            <GlassCard hover={false} className="overflow-x-auto p-0">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-border/70 text-[11px] font-[700] tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                    <th className="px-6 py-4 text-center w-20">Rank</th>
                    <th className="px-6 py-4 text-left">Typist</th>
                    <th className="px-6 py-4 text-center">
                      {leaderboardMode === "XP" ? "Level" : "WPM"}
                    </th>
                    <th className="px-6 py-4 text-center">
                      {leaderboardMode === "XP" ? "Total XP" : "Accuracy"}
                    </th>
                    <th className="px-6 py-4 text-right">Tests</th>
                  </tr>
                </thead>
                <tbody>
                  {realPlayers.map((p, i) => {
                    const isCurrentUser = currentUser === p.name;
                    return (
                      <tr
                        key={p.name}
                        className={cn(
                          "border-b transition-all duration-200 last:border-0",
                          isCurrentUser
                            ? "border-primary/20 bg-primary/5 hover:bg-primary/10"
                            : "border-border/40 hover:bg-indigo-500/5 dark:hover:bg-indigo-400/10",
                        )}
                      >
                        <td className="px-6 py-4 text-center font-[700] text-indigo-500/90 dark:text-indigo-400">
                          #{i + 1}
                        </td>
                        <td className="px-6 py-4 text-left font-hindi font-medium text-foreground">
                          {p.name}
                          {isCurrentUser && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-1.5 py-[1px] en text-[9px] font-bold text-primary uppercase translate-y-[-1px]">
                              You
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center font-[800] text-primary tabular-nums">
                          {leaderboardMode === "XP"
                            ? `Lvl ${Math.min(MAX_DISPLAY_LEVEL, Math.floor(p.xp / XP_PER_LEVEL) + 1)}`
                            : p.wpm}
                        </td>
                        <td className="px-6 py-4 text-center font-[800] text-success tabular-nums">
                          {leaderboardMode === "XP" ? p.xp.toLocaleString() : `${p.acc}%`}
                        </td>
                        <td className="px-6 py-4 text-right text-muted-foreground tabular-nums">
                          {p.tests}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </GlassCard>
          </div>
        </>
      ) : (
        <div className="mt-16">
          <GlassCard
            hover={false}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <p className="text-xl font-semibold text-foreground/80">No typing results yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Take a new typing test or switch periods to see the leaderboard.
            </p>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
