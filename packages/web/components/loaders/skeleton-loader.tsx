import classNames from "classnames";
import { DetailedHTMLProps, FunctionComponent } from "react";

export const SkeletonLoader: FunctionComponent<
  {
    isLoaded?: boolean;
  } & DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
> = ({ isLoaded, ...rest }) => {
  if (isLoaded) {
    return <div {...rest} />;
  }

  return (
    <div
      {...rest}
      className={classNames(
        "animate-pulse rounded-lg bg-osmoverse-700 [&>*]:invisible",
        rest.className
      )}
    />
  );
};
