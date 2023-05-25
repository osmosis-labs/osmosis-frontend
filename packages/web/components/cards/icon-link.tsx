import { FC, HTMLProps } from "react";

export const IconLink: FC<
  HTMLProps<HTMLAnchorElement> & {
    url: string;
    ariaLabel?: string;
  }
> = ({ url, ariaLabel, children, className }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
};
