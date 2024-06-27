import { useState } from "react";
import { useCopyToClipboard, useTimeoutFn } from "react-use";

import { CopyIcon, Icon } from "~/components/assets";

// TODO migrate from profile
export const CopyIconButton = ({
  valueToCopy,
  label,
}: {
  valueToCopy: string;
  label: string | JSX.Element;
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
      className="flex items-center justify-center gap-3"
      onClick={onCopyAddress}
    >
      <span className="body2 text-wosmongton-300">{label}</span>
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
