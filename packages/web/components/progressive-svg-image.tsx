import {
  Fragment,
  FunctionComponent,
  useEffect,
  useRef,
  useState,
} from "react";

export const ProgressiveSvgImage: FunctionComponent<
  React.SVGProps<SVGImageElement> & {
    lowResXlinkHref?: string;
  }
> = ({ lowResXlinkHref, ...props }) => {
  const ref = useRef<SVGImageElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // At first, load the low-res image and high-res image at the same time.
    // And if the high-res image loaded, remove the low-res image.
    // Expectedly, because the webside loads the image from the cache on the user’s second visit to the website, the loading should be very fast.
    if (ref.current) {
      ref.current.addEventListener(
        "load",
        () => {
          setIsLoaded(true);
        },
        {
          once: true,
        }
      );
    }
  }, []);

  return (
    <Fragment>
      {!isLoaded && lowResXlinkHref ? (
        <image {...props} xlinkHref={lowResXlinkHref} />
      ) : null}
      <image {...props} ref={ref} />
    </Fragment>
  );
};
