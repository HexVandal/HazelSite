"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Flame,
  RefreshCcw,
  Trophy,
} from "lucide-react";
import { useMemo, useState } from "react";

import { GitHub } from "@/components/logos/github";
import {
  fetchContributions,
  type ContributionDay,
} from "@/lib/github/contributions";
import { cn } from "@/lib/utils";

const LEVEL_CLASSES: Record<number, string> = {
  0: "bg-muted",
  1: "bg-foreground/20",
  2: "bg-foreground/40",
  3: "bg-foreground/65",
  4: "bg-foreground",
};

interface Week {
  days: ContributionDay[];
  monthLabel: string | null;
}

function buildWeeks(days: ContributionDay[]): Week[] {
  const weeks: Week[] = [];

  for (const day of days) {
    const date = new Date(`${day.date}T00:00:00Z`);
    const isWeekStart = date.getUTCDay() === 0;

    if (isWeekStart || weeks.length === 0) {
      weeks.push({ days: [day], monthLabel: null });
    } else {
      weeks[weeks.length - 1].days.push(day);
    }
  }

  let lastMonth = "";

  for (const week of weeks) {
    const first = week.days[0];
    const month = new Date(`${first.date}T00:00:00Z`).toLocaleString("en-GB", {
      month: "short",
      timeZone: "UTC",
    });

    if (month !== lastMonth) {
      week.monthLabel = month;
      lastMonth = month;
    }
  }

  return weeks;
}

function computeStreaks(days: ContributionDay[]) {
  let longest = 0;
  let running = 0;
  let current = 0;

  for (const day of days) {
    if (day.count > 0) {
      running += 1;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
  }

  for (let index = days.length - 1; index >= 0; index -= 1) {
    if (days[index].count > 0) current += 1;
    else break;
  }

  return { longest, current };
}

function Cell({ day }: { day: ContributionDay }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        role="img"
        aria-label={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
        className={cn(
          "size-[11px] rounded-[2px] transition-transform duration-100",
          LEVEL_CLASSES[day.level] ?? LEVEL_CLASSES[0],
          hovered && "scale-125 ring-1 ring-foreground/40",
        )}
      />

      {hovered && (
        <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 rounded-md border border-border bg-popover px-2 py-1 font-mono text-[0.65rem] whitespace-nowrap text-popover-foreground shadow-lg">
          {day.count} contribution{day.count === 1 ? "" : "s"} · {day.date}
        </div>
      )}
    </div>
  );
}

export function ContributionGraph({ username }: { username: string }) {
  const { data, status, isFetching, refetch } = useQuery({
    queryKey: ["github-contributions", username],
    queryFn: ({ signal }) => fetchContributions(username, signal),
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  const weeks = useMemo(
    () => (data ? buildWeeks(data.contributions) : []),
    [data],
  );
  const streaks = useMemo(
    () => (data ? computeStreaks(data.contributions) : null),
    [data],
  );

  if (status === "pending") {
    return (
      <div className="flex flex-col gap-3">
        <div className="h-[92px] w-full animate-pulse rounded-md bg-muted/60" />
        <div className="flex justify-between">
          <div className="h-3 w-40 animate-pulse rounded bg-muted/60" />
          <div className="h-3 w-24 animate-pulse rounded bg-muted/60" />
        </div>
      </div>
    );
  }

  if (status === "error" || !data) {
    return (
      <div className="flex flex-col items-start gap-3 py-2">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="size-4" />
          Could not load GitHub contributions right now.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <RefreshCcw className={cn("size-3", isFetching && "animate-spin")} />
          Retry
        </button>
      </div>
    );
  }

  const total = data.total.lastYear ?? data.contributions.reduce(
    (sum, day) => sum + day.count,
    0,
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="no-scrollbar w-full overflow-x-auto pb-1">
        <div className="w-max">
          <div className="mb-1 flex gap-[3px] pl-0">
            {weeks.map((week, index) => (
              <div
                key={index}
                className="w-[11px] font-mono text-[0.55rem] leading-none text-muted-foreground"
              >
                {week.monthLabel ?? ""}
              </div>
            ))}
          </div>

          <div className="flex gap-[3px]">
            {weeks.map((week, weekIndex) => (
              <div
                key={weekIndex}
                className="flex flex-col gap-[3px]"
                aria-hidden={week.days.length === 0}
              >
                {week.days.map((day) => (
                  <Cell key={day.date} day={day} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[0.65rem] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <GitHub className="size-3.5" />
            <span className="font-semibold text-foreground">{total}</span>
            contributions this year
          </span>
          {streaks && (
            <>
              <span className="flex items-center gap-1.5">
                <Flame className="size-3.5" />
                <span className="font-semibold text-foreground">
                  {streaks.current}
                </span>
                day streak
              </span>
              <span className="flex items-center gap-1.5">
                <Trophy className="size-3.5" />
                <span className="font-semibold text-foreground">
                  {streaks.longest}
                </span>
                day best
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[0.65rem] text-muted-foreground">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className={cn("size-[11px] rounded-[2px]", LEVEL_CLASSES[level])}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
