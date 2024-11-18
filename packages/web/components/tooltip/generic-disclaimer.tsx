import classNames from "classnames";
import { PropsWithChildren, ReactNode } from "react";

import { Tooltip } from "~/components/tooltip";

export function GenericDisclaimer({
  body,
  children,
  title,
  disabled,
  containerClassName,
  childWrapperClassName,
  tooltipClassName,
}: PropsWithChildren<
  Partial<{
    title: ReactNode;
    body: ReactNode;
    disabled: boolean;
    containerClassName: string;
    childWrapperClassName?: string;
    tooltipClassName?: string;
  }>
>) {
  return (
    <Tooltip
      disabled={disabled}
      rootClassNames={classNames(
        "!p-0 w-[280px] !border-0 !rounded-none !bg-transparent",
        containerClassName
      )}
      content={
        <div className="relative flex items-start gap-3 rounded-xl border border-[#39383D] bg-osmoverse-1000 p-3">
          <div className="flex flex-col gap-1">
            {title && <span className="caption">{title}</span>}
            {body && <span className="caption text-osmoverse-300">{body}</span>}
          </div>
        </div>
      }
      className={tooltipClassName}
      enablePropagation
    >
      <div className={classNames("w-full", childWrapperClassName)}>
        {children}
      </div>
    </Tooltip>
  );
}
