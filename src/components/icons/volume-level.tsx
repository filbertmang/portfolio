import type { SVGProps } from "react";

interface VolumeLevelIconProps extends SVGProps<SVGSVGElement> {
  dimWaves?: boolean;
  level?: number;
}

export function VolumeLevelIcon({
  dimWaves = false,
  level = 3,
  className,
  ...props
}: VolumeLevelIconProps) {
  const waveOpacity = (waveLevel: number) => {
    if (level < waveLevel) return "opacity-20";
    return dimWaves ? "opacity-75" : "opacity-100";
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M4 9.5a1.5 1.5 0 0 0-1.5 1.5v2a1.5 1.5 0 0 0 1.5 1.5h2.8l4.4 3.7a1.2 1.2 0 0 0 2-.9V6.7a1.2 1.2 0 0 0-2-.9L6.8 9.5H4Z" />
      <path
        d="M15.5 8.5a4.5 4.5 0 0 1 0 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className={waveOpacity(1)}
      />
      <path
        d="M18 6a8 8 0 0 1 0 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className={waveOpacity(2)}
      />
      <path
        d="M20.5 3.5a11.5 11.5 0 0 1 0 17"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className={waveOpacity(3)}
      />
    </svg>
  );
}
