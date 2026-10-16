import classNames from "classnames";

import { Tooltip } from "~/components/tooltip";
import { useTranslation } from "~/hooks";

/**
 * Shown for a transfer address that couldn't be determined, e.g. an Axelar
 * deposit whose source sender Axelarscan hasn't returned yet, or a bridge
 * payload that couldn't be decoded.
 */
export const UnknownAddress = ({ className }: { className?: string }) => {
  const { t } = useTranslation();
  return (
    <Tooltip content={t("transactions.unknownAddressTooltip")}>
      <span
        className={classNames(
          "cursor-help underline decoration-dotted underline-offset-2",
          className
        )}
      >
        {t("transfer.unknown")}
      </span>
    </Tooltip>
  );
};
