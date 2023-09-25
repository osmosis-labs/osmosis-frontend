import Link from "next/link";
import React from "react";
import { ReactElement } from "react";

export default function LinkButton({
  label,
  icon,
  ariaLabel,
  href,
}: {
  label: string;
  icon: ReactElement;
  ariaLabel: string;
  href: string;
}) {
  return (
    <Link href={href} passHref>
      <a aria-label={ariaLabel} className="flex flex-row gap-2">
        {icon}
        <p className="text-base font-subtitle1 leading-6 tracking-wide text-osmoverse-200">
          {label}
        </p>
      </a>
    </Link>
  );
}
