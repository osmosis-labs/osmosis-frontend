import { PropsWithChildren, ReactNode } from "react";

import { Tooltip } from "~/components/tooltip";

export function GenericDisclaimer({
  body,
  children,
  title,
  disabled,
}: PropsWithChildren<
  Partial<{ title: ReactNode; body: ReactNode; disabled: boolean }>
>) {
  return (
    <Tooltip
      disabled={disabled}
      rootClassNames="!p-0 w-[280px] !border-0 !rounded-none !bg-transparent"
      content={
        <div className="relative flex items-start gap-3 rounded-xl border border-[#39383D] bg-osmoverse-1000 p-3">
          <div className="flex flex-col gap-1">
            <span className="caption">{title}</span>
            <span className="caption text-osmoverse-300">{body}</span>
          </div>
        </div>
      }
      enablePropagation
    >
      <div className="w full">{children}</div>
    </Tooltip>
  );
}
