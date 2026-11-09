import type { SVGProps } from "react";

export function SunBoldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="12" cy="12" r="5" />
      <path
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        d="M12 2v2m0 16v2M2 12h2m16 0h2m-3.05-6.95-1.41 1.41M6.46 17.54l-1.41 1.41m0-12.95 1.41 1.41m11.08 11.08 1.41 1.41"
      />
    </svg>
  );
}
