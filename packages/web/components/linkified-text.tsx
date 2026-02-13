import { FunctionComponent, Fragment } from "react";

const URL_REGEX =
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;

interface LinkifiedTextProps {
  text: string;
  className?: string;
  linkClassName?: string;
}

/**
 * Component that parses text for URLs and converts them into clickable links.
 * Links open in a new tab with security attributes.
 */
export const LinkifiedText: FunctionComponent<LinkifiedTextProps> = ({
  text,
  className,
  linkClassName = "text-wosmongton-300 underline hover:text-wosmongton-200",
}) => {
  const parts = text.split(URL_REGEX);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if this part is a URL
        if (part.match(URL_REGEX)) {
          // Ensure URL has protocol
          const href = part.startsWith("http") ? part : `https://${part}`;
          return (
            <a
              key={index}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </span>
  );
};
