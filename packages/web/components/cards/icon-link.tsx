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
      className={`transition-colors duration-200 ease-in-out ${className} hover:bg-gray-300`}
      aria-label={ariaLabel}
      onClick={handleClick}
    >
      <div className="transition-all duration-200 hover:brightness-75">
        {children}
      </div>
    </a>
  );
};
