import React, { FC, HTMLProps } from "react";

export const IconLink: FC<
  HTMLProps<HTMLAnchorElement> & {
    url: string;
    ariaLabel?: string;
  }
> = ({ url, ariaLabel, children, className }) => {
  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    event.stopPropagation();
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={ariaLabel}
      onClick={handleClick}
    >
      {children}
    </a>
  );
};
