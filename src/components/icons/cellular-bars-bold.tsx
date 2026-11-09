import type { SVGProps } from "react";

export function CellularBarsBoldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <rect x="2" y="16" width="3.5" height="5" rx="1.5" />
      <rect x="7.5" y="12" width="3.5" height="9" rx="1.5" />
      <rect x="13" y="8" width="3.5" height="13" rx="1.5" />
      <rect x="18.5" y="4" width="3.5" height="17" rx="1.5" />
    </svg>
  );
}
