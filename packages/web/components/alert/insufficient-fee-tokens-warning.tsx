import classNames from "classnames";
import { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { useTranslation } from "~/hooks/language";

/**
 * Shared warning banner shown when the user holds no fee token with sufficient
 * balance to cover the gas of the next transaction (e.g. an alt-fee token
 * whose txfees routing pool has no liquidity). Used across swap, limit, review
 * order, asset variants conversion, and bridge surfaces so that the copy and
 * styling stay in sync.
 */
export const InsufficientFeeTokensWarning: FunctionComponent<{
  className?: string;
}> = ({ className }) => {
  const { t } = useTranslation();
  return (
    <div
      className={classNames(
        "flex gap-3 border border-osmoverse-700 p-4 rounded-2xl",
        className
      )}
    >
      <Icon
        id="alert-triangle"
        width={20}
        height={20}
        className="text-rust-600 min-w-[20px] mt-1"
      />
      <div className="flex flex-col gap-1">
        <span className="body2 text-base text-rust-500">
          {t("errors.insufficientFeeTokens.title")}
        </span>
        <span className="subtitle2 text-osmoverse-400">
          {t("errors.insufficientFeeTokens.body")}
        </span>
      </div>
    </div>
  );
};
