import Link from "next/link";
import React from "react";
import { ReactElement } from "react";

import { Button } from "~/components/ui/button";

export function LinkButton({
  label,
  icon,
  ariaLabel,
  href,
  className: optionalClassNames,
  size = "default",
}: {
  label: string;
  icon?: ReactElement;
  ariaLabel: string;
  href: string;
  className?: string;
  size?: "sm" | "md" | "default";
}) {
  return (
    <Button asChild variant="ghost" size={size}>
      <Link
        href={href}
        passHref
        aria-label={ariaLabel}
        className={`flex flex-row gap-2 ${optionalClassNames ?? ""}`}
      >
        {icon}
        <p className="text-base font-subtitle1 leading-6 tracking-wide text-osmoverse-200">
          {label}
        </p>
      </Link>
    </Button>
  );
}
