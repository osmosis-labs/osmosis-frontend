import classNames from "classnames";
import React from "react";

interface SpinnerProps {
  className?: string;
}

const Spinner = (props: SpinnerProps) => {
  return (
    <div
      className={classNames(
        "inline-block h-5 w-5 animate-[spin_0.7s_linear_infinite] rounded-full border-2 border-b-transparent border-l-transparent",
        props?.className
      )}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
