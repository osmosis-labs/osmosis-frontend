import { HTMLProps } from "react";
interface IconLinkProps extends HTMLProps<HTMLAnchorElement> {
  url: string;
  ariaLabel?: string;
}

export const IconLink: React.FC<IconLinkProps> = (props) => {
  return (
    <a
      href={props.url}
      target="_blank"
      rel="noopener noreferrer"
      className={props.className}
      aria-label={props.ariaLabel}
    >
      {props.children}
    </a>
  );
};

export default IconLink;
