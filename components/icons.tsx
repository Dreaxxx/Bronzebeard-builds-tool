// components/icons.tsx
import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & { className?: string };

export function TrashIcon({ className, ...props }: IconProps) {
  // Style outline (hérite de la couleur via currentColor)
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M3 6h18" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export function TrashSolidIcon({ className, ...props }: IconProps) {
  // Style plein (solide), hérite aussi via currentColor
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M9 3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1h4a1 1 0 1 1 0 2h-1l-1 14a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3L4 6H3a1 1 0 1 1 0-2h4V3Zm2 0a1 1 0 0 0-1 1v1h4V4a1 1 0 0 0-1-1h-2Z" />
      <rect x="10" y="10.5" width="1.8" height="7" rx="0.9" />
      <rect x="12.2" y="10.5" width="1.8" height="7" rx="0.9" />
    </svg>
  );
}
