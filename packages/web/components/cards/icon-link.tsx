import React from "react";

interface IconLinkProps {
  children: React.ReactNode;
  url: string;
  className?: string;
  ariaLabel?: string;
}

export const IconLink: React.FC<IconLinkProps> = ({
  children,
  url,
  className,
  ariaLabel,
}) => {
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

export default IconLink;
