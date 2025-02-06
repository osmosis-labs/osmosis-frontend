import classNames from "classnames";
import { useState } from "react";
import { useCopyToClipboard, useTimeoutFn } from "react-use";

import { CopyIcon, Icon } from "~/components/assets";

// TODO migrate from profile
export const CopyIconButton = ({
  valueToCopy,
  label,
  classes,
}: {
  valueToCopy: string;
  label: string | JSX.Element;
  classes?: Partial<Record<"container" | "label", string>>;
}) => {
  const [hasCopied, setHasCopied] = useState(false);
  const [, copyToClipboard] = useCopyToClipboard();
  const [, , reset] = useTimeoutFn(() => setHasCopied(false), 2000);

  const onCopyAddress = () => {
    copyToClipboard(valueToCopy);
    setHasCopied(true);
    reset();
  };

  return (
    <button
      className={classNames(
        "flex items-center justify-center gap-3",
        classes?.container
      )}
      onClick={onCopyAddress}
    >
      <span className={classNames("body2 text-wosmongton-300", classes?.label)}>
        {label}
      </span>
      {hasCopied ? (
        <Icon id="check-mark" className="text-wosmongton-300" />
      ) : (
        <CopyIcon
          isAnimated
          classes={{
            frontCube: "text-wosmongton-300",
            backCube: "text-wosmongton-300",
          }}
        />
      )}
    </button>
  );
};
