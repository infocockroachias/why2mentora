"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { NavigateFn } from "@/components/mentora-app";

const SIZES = ["1-100", "100-500", "500-1000", "1000+"];

export function InstituteView({ navigate }: { navigate: NavigateFn }) {
  const [institute, setInstitute] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [students, setStudents] = useState(SIZES[0]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/institute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ institute, contactName, email, phone, city, students, message }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "Submission failed. Please retry.");
      } else {
        setDone(true);
        toast({ title: "Request received", description: "Our institute team will set up a walkthrough within 2 working days." });
      }
    } catch {
      setError("Network trouble. Check your connection and retry.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="pb-10">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_460px] lg:px-8">
        {/* Pitch */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">For institutes</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight">
            Your mentors first.
            <br />
            <span className="text-primary">Our network as backup.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
            Doubts shouldn't wait for the next class. Route them to your own
            faculty first — when nobody is free, the shared MENTORA bench picks
            them up instead of letting them go cold overnight.
          </p>

          <ol className="mt-8 flex flex-col gap-4">
            {[
              { n: "1", h: "Onboard in a week", p: "Import your student list, invite faculty, and brand the reports with your institute's name." },
              { n: "2", h: "Your bench answers first", p: "Doubts route to your mentors' published hours before touching the shared network." },
              { n: "3", h: "See everything", p: "Outcome dashboards: doubts solved, response times, mentor accountability — one printable sheet per role." },
            ].map((s) => (
              <li key={s.n} className="flex gap-4 rounded-xl border border-border bg-card p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-display font-bold text-primary-foreground">
                  {s.n}
                </span>
                <div>
                  <p className="font-semibold">{s.h}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.p}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-6 text-xs text-muted-foreground">
            Campus pilots carry a 30-day satisfaction guarantee.{" "}
            <button onClick={() => navigate("plans", { anchor: "institute-plans" })} className="link-sweep font-semibold text-primary">
              See institute pricing
            </button>
          </p>
        </div>

        {/* Form */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xl shadow-primary/5 sm:p-8">
          {done ? (
            <div className="py-8 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30">
                ✓
              </span>
              <h2 className="mt-5 font-display text-2xl font-semibold">Walkthrough requested</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Thanks, {contactName.split(" ")[0]}. The institute team will
                email you within 2 working days to schedule a demo for{" "}
                <span className="font-medium text-foreground">{institute}</span>.
              </p>
              <Button variant="outline" onClick={() => navigate("home")} className="mt-6">
                Back to home
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
              <h2 className="font-display text-xl font-semibold">Talk to us</h2>

              <div className="grid gap-1.5">
                <Label htmlFor="i-name">Institute name</Label>
                <Input id="i-name" value={institute} onChange={(e) => setInstitute(e.target.value)} required minLength={2} placeholder="e.g. Sunrise Academy" />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="i-contact">Your name</Label>
                <Input id="i-contact" value={contactName} onChange={(e) => setContactName(e.target.value)} required minLength={2} placeholder="Director / coordinator" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="i-email">Work email</Label>
                  <Input id="i-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@institute.in" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="i-phone">Phone (optional)</Label>
                  <Input id="i-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91…" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="i-city">City (optional)</Label>
                  <Input id="i-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Delhi, Prayagraj…" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="i-size">Students</Label>
                  <Select value={students} onValueChange={setStudents}>
                    <SelectTrigger id="i-size" aria-label="Number of students">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SIZES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="i-msg">What would you like to see? (optional)</Label>
                <Textarea id="i-msg" value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[80px] resize-none" maxLength={500} placeholder="Batches, subjects, timelines…" />
              </div>

              {error && (
                <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={busy} className="h-11 bg-primary font-semibold text-primary-foreground hover:bg-pine-soft">
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="mr-2 h-4 w-4" aria-hidden="true" />}
                Request a walkthrough
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
