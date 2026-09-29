"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, LogIn, ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { NavigateFn } from "@/components/mentora-app";
import { cn } from "@/lib/utils";

const EXAMS = ["UPSC CSE", "State PCS", "SSC CGL", "RBI Grade B", "NABARD Grade A"];

type Mode = "login" | "signup";

export function AuthView({ mode: initialMode, navigate }: { mode: Mode; navigate: NavigateFn }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [exam, setExam] = useState(EXAMS[0]);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<{ name: string; email: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setBusy(true);
    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const payload = mode === "signup" ? { name, email, password, exam } : { email, password };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setFormError(data?.error ?? "Something went wrong. Please retry.");
      } else {
        setLoggedInUser({ name: data.user.name, email: data.user.email });
        toast({
          title: mode === "signup" ? "Welcome to MENTORA IAS" : "Welcome back",
          description: mode === "signup"
            ? "Your account is ready. Ask your first doubt — it's free."
            : "Logged in successfully.",
        });
      }
    } catch {
      setFormError("Network trouble. Check your connection and retry.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-14 sm:px-6">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-border bg-card p-7 shadow-xl shadow-primary/5 sm:p-9">
          {loggedInUser ? (
            <div className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </span>
              <h1 className="mt-5 font-display text-2xl font-semibold">
                {mode === "signup" ? "Account created" : "You're in"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Signed in as <span className="font-semibold text-foreground">{loggedInUser.name}</span>{" "}
                ({loggedInUser.email}).
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                In this preview, doubt asking works right on the home page.
              </p>
              <Button onClick={() => navigate("home", { anchor: "try-doubt" })} className="mt-6 h-11 w-full bg-primary font-semibold text-primary-foreground hover:bg-pine-soft">
                Ask your first doubt
              </Button>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-semibold">
                {mode === "signup" ? "Create your free account" : "Welcome back"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "signup"
                  ? "Ask doubts, keep mentors close, track revision — free to start."
                  : "Log in to ask doubts and connect with verified mentors."}
              </p>

              <form onSubmit={submit} className="mt-7 flex flex-col gap-4" noValidate>
                {mode === "signup" && (
                  <div className="grid gap-1.5">
                    <Label htmlFor="auth-name">Full name</Label>
                    <Input
                      id="auth-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Aspirant name"
                      autoComplete="name"
                      required
                      minLength={2}
                    />
                  </div>
                )}

                <div className="grid gap-1.5">
                  <Label htmlFor="auth-email">Email</Label>
                  <Input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="auth-password">Password</Label>
                  <Input
                    id="auth-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    required
                    minLength={8}
                  />
                </div>

                {mode === "signup" && (
                  <div className="grid gap-1.5">
                    <Label htmlFor="auth-exam">Target exam</Label>
                    <Select value={exam} onValueChange={setExam}>
                      <SelectTrigger id="auth-exam" aria-label="Choose your target exam">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EXAMS.map((x) => (
                          <SelectItem key={x} value={x}>{x}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formError && (
                  <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                    {formError}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={busy}
                  className="h-11 w-full bg-primary font-semibold text-primary-foreground hover:bg-pine-soft"
                >
                  {busy ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : mode === "signup" ? (
                    <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
                  ) : (
                    <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
                  )}
                  {mode === "signup" ? "Create account" : "Log in"}
                </Button>
              </form>

              <div className="mt-6 border-t border-border pt-5 text-center">
                <p className="text-sm text-muted-foreground">
                  {mode === "signup" ? "Already have an account?" : "New to MENTORA IAS?"}{" "}
                  <button
                    onClick={() => setMode(mode === "signup" ? "login" : "signup")}
                    className={cn("link-sweep font-semibold text-primary")}
                    aria-label={mode === "signup" ? "Switch to log in form" : "Switch to sign up form"}
                  >
                    {mode === "signup" ? "Log in instead" : "Create a free account"}
                  </button>
                </p>
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  Mentoring or running an institute?{" "}
                  <button onClick={() => navigate("mentor")} className="link-sweep font-medium text-gold">
                    Apply as mentor
                  </button>{" "}
                  ·{" "}
                  <button onClick={() => navigate("institute")} className="link-sweep font-medium text-gold">
                    Institute onboarding
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
