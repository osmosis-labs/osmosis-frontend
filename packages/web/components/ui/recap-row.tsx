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
        "flex min-h-[2rem] w-full items-center justify-between sm:min-h-[1.5rem]",
        className
      )}
    >
      <span className="text-osmoverse-300">{left}</span>
      {right}
    </div>
  );
}
