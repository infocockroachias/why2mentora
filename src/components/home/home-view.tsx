"use client";

import type { NavigateFn } from "@/components/mentora-app";
import { Hero } from "@/components/home/hero";
import { Story } from "@/components/home/story";
import { Pillars, Toolbelt, HowItWorks } from "@/components/home/features";
import { Mentors, StatsBand, DoubtTeaser } from "@/components/home/mentors";
import { DoubtSimulator } from "@/components/doubt-simulator";

export function HomeView({ navigate }: { navigate: NavigateFn }) {
  return (
    <main>
      <Hero navigate={navigate} />
      <StatsBand />
      <Story />
      <Pillars navigate={navigate} />
      <Toolbelt />
      <HowItWorks navigate={navigate} />
      <DoubtSimulator />
      <Mentors />
      <DoubtTeaser navigate={navigate} />
    </main>
  );
}
