import classNames from "classnames";
import { ReactNode } from "react";

export function RecapRow({
  left,
  right,
  className,
}: {
  left: ReactNode;
  right: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={classNames(
        "body2 flex h-8 w-full items-center justify-between",
        className
      )}
    >
      <span className="text-osmoverse-300">{left}</span>
      {right}
    </div>
  );
}
