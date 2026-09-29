"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Accessible light/dark toggle. Renders a stable placeholder until mounted to avoid hydration mismatch. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // deferred mount flag so the first client render matches the server HTML
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={
        className ??
        "relative h-9 w-9 overflow-hidden border-border bg-card/70 text-foreground hover:border-gold/50 hover:bg-accent/40 hover:text-gold"
      }
    >
      <Sun
        aria-hidden="true"
        className={`absolute h-[18px] w-[18px] transition-all duration-300 ${
          isDark ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      />
      <Moon
        aria-hidden="true"
        className={`absolute h-[18px] w-[18px] transition-all duration-300 ${
          isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
        }`}
      />
    </Button>
  );
}
