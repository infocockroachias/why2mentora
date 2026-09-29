import { cn } from "@/lib/utils";

/**
 * MENTORA IAS — original brand mark.
 * A lamp/torch of learning cradled inside a rising "M", drawn as pure geometry.
 * Self-coloured (gradient pine tile, ivory stroke, saffron flame) so it keeps
 * its contrast on both light and dark surfaces.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-9 w-9", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="mentora-mark-bg" x1="8" y1="4" x2="42" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1d6b3c" />
          <stop offset="1" stopColor="#0f3d21" />
        </linearGradient>
      </defs>
      <rect x="0.75" y="0.75" width="46.5" height="46.5" rx="12" fill="url(#mentora-mark-bg)" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
      <path
        d="M11 35V16.5c0-.9 1.1-1.3 1.7-.6L23 27.5l10.3-11.6c.6-.7 1.7-.3 1.7.6V35"
        stroke="#faf7f0"
        strokeOpacity="0.62"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 9.5c2.6 2.2 4 4.4 4 6.4 0 2.4-1.8 4.1-4 4.1s-4-1.7-4-4.1c0-2 1.4-4.2 4-6.4Z"
        fill="#d97706"
      />
      <circle cx="24" cy="39" r="2.2" fill="#d97706" />
    </svg>
  );
}

export function LogoLockup({
  className,
  markClassName,
  compact = false,
}: {
  className?: string;
  markClassName?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={cn("text-primary", markClassName)} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.15rem] font-bold tracking-tight text-foreground">
          MENTORA
        </span>
        {!compact && (
          <span className="text-[0.6rem] font-semibold tracking-[0.32em] text-gold">
            IAS ACADEMY
          </span>
        )}
      </span>
    </span>
  );
}
