"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { NavigateFn } from "@/components/mentora-app";

const EXAMS = ["UPSC CSE", "State PCS", "SSC CGL", "RBI Grade B", "NABARD Grade A"];
const SUBJECT_OPTIONS = ["Polity", "History", "Geography", "Economy", "Environment", "International Relations", "Science & Tech", "CSAT / Aptitude", "Current Affairs", "Essay & Ethics"];

export function MentorView({ navigate }: { navigate: NavigateFn }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [exam, setExam] = useState(EXAMS[0]);
  const [credential, setCredential] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleSubject(s: string) {
    setSubjects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (subjects.length === 0) {
      setError("Pick at least one subject you can mentor.");
      return;
    }
    if (!agree) {
      setError("Please accept the mentor code of conduct.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/mentor/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, exam, credential, subjects: subjects.join(", "), bio }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "Submission failed. Please retry.");
      } else {
        setDone(true);
        toast({ title: "Application received", description: "Our verification team will reach out within 3 working days." });
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
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">Become a mentor</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight">
            You cracked the exam.
            <br />
            <span className="text-primary">Now crack doubts for others.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
            Join a verified bench of toppers, professors and practitioners.
            Publish the hours you are free, answer over text, voice or video,
            and earn per solved doubt — on your schedule.
          </p>

          <ul className="mt-8 flex flex-col gap-4">
            {[
              { h: "Earn on your terms", p: "Set your available hours and session rates. Payouts land weekly, directly to your bank account." },
              { h: "Stay pseudonymous", p: "Students see 'a verified MENTORA mentor' — not your phone number, not your socials." },
              { h: "Zero chasing", p: "Session notes are kept for you, so every follow-up starts where the last one ended." },
            ].map((x) => (
              <li key={x.h} className="rounded-xl border border-border bg-card p-4">
                <p className="font-semibold">{x.h}</p>
                <p className="mt-1 text-sm text-muted-foreground">{x.p}</p>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-xs text-muted-foreground">
            Verification covers claimed credentials, a short mock doubt session, and reference checks.{" "}
            <button onClick={() => navigate("legal", { doc: "use" })} className="link-sweep font-semibold text-primary">
              Read the code of conduct
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
              <h2 className="mt-5 font-display text-2xl font-semibold">Application received</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Thank you, {name.split(" ")[0]}. Our verification team reviews
                every application and will reach out within 3 working days.
              </p>
              <Button variant="outline" onClick={() => navigate("home")} className="mt-6">
                Back to home
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
              <h2 className="font-display text-xl font-semibold">Mentor application</h2>

              <div className="grid gap-1.5">
                <Label htmlFor="m-name">Full name</Label>
                <Input id="m-name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} placeholder="Your name" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="m-email">Email</Label>
                  <Input id="m-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="m-phone">Phone (optional)</Label>
                  <Input id="m-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91…" />
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="m-exam">Exam vertical you mentor for</Label>
                <Select value={exam} onValueChange={setExam}>
                  <SelectTrigger id="m-exam" aria-label="Exam vertical">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAMS.map((x) => (
                      <SelectItem key={x} value={x}>{x}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="m-cred">Credential (rank / service / teaching experience)</Label>
                <Input id="m-cred" value={credential} onChange={(e) => setCredential(e.target.value)} required placeholder="e.g. AIR 214, CSE 2023 · or 10 yrs teaching History" />
              </div>

              <fieldset className="grid gap-2">
                <legend className="mb-1 text-sm font-medium">Subjects you can handle</legend>
                <div className="flex flex-wrap gap-2">
                  {SUBJECT_OPTIONS.map((s) => (
                    <label
                      key={s}
                      className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        subjects.includes(s)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={subjects.includes(s)}
                        onChange={() => toggleSubject(s)}
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-1.5">
                <Label htmlFor="m-bio">A line about your mentoring style (optional)</Label>
                <Textarea id="m-bio" value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[80px] resize-none" maxLength={400} placeholder="How do you usually break a doubt down?" />
              </div>

              <label className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground">
                <Checkbox checked={agree} onCheckedChange={(v) => setAgree(v === true)} className="mt-0.5" />
                I accept the mentor code of conduct: on-platform communication only, no contact-detail exchange, and respectful conduct in every session.
              </label>

              {error && (
                <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={busy} className="h-11 bg-primary font-semibold text-primary-foreground hover:bg-pine-soft">
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="mr-2 h-4 w-4" aria-hidden="true" />}
                Submit application
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
