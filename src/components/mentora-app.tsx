"use client";

/**
 * MENTORA IAS — application shell.
 * Single-route SPA: every "page" is a client-side view keyed off the URL hash,
 * with scroll restoration, focus management and keyboard-accessible navigation.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { LogoLockup } from "@/components/brand/logo";
import { HomeView } from "@/components/home/home-view";
import { AboutView } from "@/components/views/about-view";
import { PlansView } from "@/components/views/plans-view";
import { AuthView } from "@/components/views/auth-view";
import { LegalView, type LegalDoc } from "@/components/views/legal-view";
import { MentorView } from "@/components/views/mentor-view";
import { InstituteView } from "@/components/views/institute-view";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ArrowRight, Menu, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export type ViewKey =
  | "home"
  | "about"
  | "plans"
  | "auth"
  | "legal"
  | "mentor"
  | "institute";

export type NavigateFn = (view: ViewKey, opts?: { anchor?: string; doc?: LegalDoc; mode?: "login" | "signup" }) => void;

const NAV_ITEMS: { key: ViewKey; label: string }[] = [
  { key: "about", label: "About" },
  { key: "plans", label: "Plans" },
  { key: "mentor", label: "Become a mentor" },
  { key: "institute", label: "For institutes" },
];

export function MentoraApp() {
  const [view, setView] = useState<ViewKey>("home");
  const [doc, setDoc] = useState<LegalDoc>("terms");
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterBusy, setNewsletterBusy] = useState(false);
  const pendingAnchor = useRef<string | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  async function subscribeNewsletter(e: React.FormEvent) {
    e.preventDefault();
    const email = newsletterEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Enter a valid email", description: "We need a real address to send the weekly doubts digest.", variant: "destructive" });
      return;
    }
    setNewsletterBusy(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data?.ok) {
        toast({ title: "Subscribed", description: "The weekly doubts digest lands every Sunday morning." });
        setNewsletterEmail("");
      } else {
        toast({ title: "Could not subscribe", description: data?.error ?? "Please retry in a moment.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network trouble", description: "Check your connection and retry.", variant: "destructive" });
    } finally {
      setNewsletterBusy(false);
    }
  }

  const navigate = useCallback<NavigateFn>(
    (next, opts) => {
      if (opts?.doc) setDoc(opts.doc);
      if (opts?.mode) setAuthMode(opts.mode);
      setMobileOpen(false);

      if (next === view && !opts?.anchor) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      pendingAnchor.current = opts?.anchor ?? null;
      setView(next);
      const hash = opts?.anchor ? `#${next}/${opts.anchor}` : `#${next}`;
      if (window.location.hash !== hash) {
        window.history.replaceState(null, "", hash);
      }
      if (!opts?.anchor) window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    },
    [view]
  );

  // Hash routing on first load + back/forward
  useEffect(() => {
    const applyHash = () => {
      const raw = window.location.hash.replace(/^#\/?/, "");
      if (!raw) return;
      const [key, anchor] = raw.split("/");
      const known: ViewKey[] = ["home", "about", "plans", "auth", "legal", "mentor", "institute"];
      if (known.includes(key as ViewKey)) {
        setView(key as ViewKey);
        pendingAnchor.current = anchor ?? null;
        // #legal/<doc> pre-selects the document
        if (key === "legal" && anchor && ["terms", "privacy", "refund", "use"].includes(anchor)) {
          setDoc(anchor as LegalDoc);
          pendingAnchor.current = null;
        }
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  // After a view mounts, scroll to a pending anchor section
  useEffect(() => {
    if (pendingAnchor.current) {
      const id = pendingAnchor.current;
      pendingAnchor.current = null;
      requestAnimationFrame(() => {
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 60);
      });
    }
  }, [view]);

  // Header elevation on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goHome = useCallback(() => navigate("home"), [navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-background paper-grain">
      {/* ---------------- Header ---------------- */}
      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-all duration-300",
          scrolled
            ? "border-border bg-background/90 shadow-[0_8px_30px_-18px_rgba(20,83,45,0.35)] backdrop-blur-xl"
            : "border-transparent bg-background/60 backdrop-blur-md"
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <button
            onClick={goHome}
            aria-label="MENTORA IAS — home"
            className="rounded-lg transition-transform duration-300 hover:scale-[1.02] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-ring"
          >
            <LogoLockup />
          </button>

          <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => navigate(item.key)}
                className={cn(
                  "link-sweep relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  view === item.key && "text-foreground"
                )}
              >
                {item.label}
                {view === item.key && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_6px_rgba(217,119,6,0.8)]"
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Button variant="ghost" onClick={() => navigate("auth", { mode: "login" })}>
              Log in
            </Button>
            <Button
              onClick={() => navigate("auth", { mode: "signup" })}
              className="group bg-primary text-primary-foreground hover:bg-pine-soft"
            >
              Get started
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[340px]">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <SheetDescription className="sr-only">Switch between sections of MENTORA IAS</SheetDescription>
              <div className="mt-2 flex h-full flex-col">
                <LogoLockup />
                <nav aria-label="Mobile" className="mt-8 flex flex-col gap-1">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => navigate(item.key)}
                      className={cn(
                        "relative rounded-lg px-3 py-3 text-left text-[15px] font-medium text-foreground transition-colors hover:bg-secondary",
                        view === item.key && "bg-secondary/70 text-primary"
                      )}
                    >
                      {item.label}
                      {view === item.key && (
                        <span aria-hidden="true" className="absolute right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-gold" />
                      )}
                    </button>
                  ))}
                  <button
                    onClick={() => navigate("auth", { mode: "login" })}
                    className="rounded-lg px-3 py-3 text-left text-[15px] font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    Log in
                  </button>
                </nav>
                <div className="mt-auto pb-6">
                  <Button
                    onClick={() => navigate("auth", { mode: "signup" })}
                    className="w-full bg-primary text-primary-foreground hover:bg-pine-soft"
                  >
                    Get started <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* ---------------- Main ---------------- */}
      <div ref={mainRef} className="flex-1">
        {view === "home" && <HomeView navigate={navigate} />}
        {view === "about" && <AboutView navigate={navigate} />}
        {view === "plans" && <PlansView navigate={navigate} />}
        {view === "auth" && <AuthView mode={authMode} navigate={navigate} />}
        {view === "legal" && <LegalView doc={doc} navigate={navigate} />}
        {view === "mentor" && <MentorView navigate={navigate} />}
        {view === "institute" && <InstituteView navigate={navigate} />}
      </div>

      {/* ---------------- Footer (sticky bottom) ---------------- */}
      <footer className="relative mt-auto border-t border-[#24352b] bg-[#0d1710] text-[#c8d8cb]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
          aria-hidden="true"
        />
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <LogoLockup className="[&>span>span:first-child]:!text-[#f2f7f0]" />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#9db3a1]">
                Instant AI explanations and verified human mentors for every serious
                aspirant. Bring the doubt — leave with clarity.
              </p>
              <p className="mt-4 text-xs tracking-wide text-[#77907f]">
                grievance@mentora-ias.in
              </p>
              <form onSubmit={subscribeNewsletter} className="mt-5" aria-label="Newsletter subscription">
                <label htmlFor="newsletter-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-[#77907f]">
                  Weekly doubts digest
                </label>
                <div className="flex max-w-xs gap-2">
                  <Input
                    id="newsletter-email"
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-10 border-[#2c4033] bg-[#12211a] text-[#edf3ea] placeholder:text-[#5c6b60] focus-visible:border-gold/70 focus-visible:ring-gold/30"
                    autoComplete="email"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={newsletterBusy}
                    aria-label="Subscribe to newsletter"
                    className="h-10 w-10 shrink-0 bg-gold text-gold-foreground hover:bg-gold/90"
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
                <p className="mt-1.5 text-[11px] text-[#77907f]">One email every Sunday. Unsubscribe anytime.</p>
              </form>
            </div>

            <nav aria-label="Product" className="flex flex-col gap-2.5 text-sm">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#77907f]">
                Product
              </p>
              <button onClick={() => navigate("auth", { mode: "signup" })} className="link-sweep w-fit text-left transition-colors hover:text-gold">
                Sign up
              </button>
              <button onClick={() => navigate("about")} className="link-sweep w-fit text-left transition-colors hover:text-gold">
                About us
              </button>
              <button onClick={() => navigate("mentor")} className="link-sweep w-fit text-left transition-colors hover:text-gold">
                Become a mentor
              </button>
            </nav>

            <nav aria-label="Institute" className="flex flex-col gap-2.5 text-sm">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#77907f]">
                Institute
              </p>
              <button onClick={() => navigate("plans", { anchor: "institute-plans" })} className="link-sweep w-fit text-left transition-colors hover:text-gold">
                Plans and pricing
              </button>
              <button onClick={() => navigate("institute")} className="link-sweep w-fit text-left transition-colors hover:text-gold">
                Bring us to your institute
              </button>
            </nav>

            <nav aria-label="Legal" className="flex flex-col gap-2.5 text-sm">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#77907f]">
                Legal
              </p>
              <button onClick={() => navigate("legal", { doc: "terms" })} className="link-sweep w-fit text-left transition-colors hover:text-gold">
                Terms of Service
              </button>
              <button onClick={() => navigate("legal", { doc: "privacy" })} className="link-sweep w-fit text-left transition-colors hover:text-gold">
                Privacy Policy
              </button>
              <button onClick={() => navigate("legal", { doc: "refund" })} className="link-sweep w-fit text-left transition-colors hover:text-gold">
                Refund &amp; Cancellation
              </button>
              <button onClick={() => navigate("legal", { doc: "use" })} className="link-sweep w-fit text-left transition-colors hover:text-gold">
                Acceptable Use
              </button>
            </nav>
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-[#24352b] pt-6 text-xs text-[#77907f] sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} MENTORA IAS Academy. All rights reserved.</p>
            <p className="flex items-center gap-2">
              <span className="relative inline-block h-2 w-2 rounded-full bg-emerald-400 text-emerald-400 live-ping" />
              Mentors online across 6 exam verticals
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
