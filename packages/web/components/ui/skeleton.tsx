import classNames from "classnames";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={classNames(
        "animate-pulse rounded-md bg-osmoverse-700",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
