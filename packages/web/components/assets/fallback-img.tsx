import { FunctionComponent, ImgHTMLAttributes, useRef } from "react";

export const FallbackImg: FunctionComponent<
  {
    /** Image to show if there is an error rendering/fetching default image src. */
    fallbacksrc: string;
  } & ImgHTMLAttributes<HTMLImageElement>
> = (props) => {
  const imgRef = useRef<HTMLImageElement | null>(null);

  return (
    <img
      ref={imgRef}
      alt={props.alt ?? "fallback-img"}
      {...props}
      onError={() => {
        if (imgRef.current) {
          imgRef.current.src = props.fallbacksrc;
        }
      }}
    />
  );
};
