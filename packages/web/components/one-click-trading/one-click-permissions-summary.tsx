import {
  FORCED_ONE_CLICK_CATEGORIES,
  ForcedOneClickCategory,
  OneClickCategory,
  OPTIONAL_ONE_CLICK_CATEGORIES,
  OptionalOneClickCategory,
} from "@osmosis-labs/types";
import classNames from "classnames";
import { FunctionComponent } from "react";

import { useTranslation } from "~/hooks";

/** Compact one-line "Includes: ..." summary of which 1CT permission categories
 *  are in scope for the current session/draft. Used in surfaces that already
 *  show a sessionPeriod + spendLimit recap (trade-preview, the wallet-select
 *  Introduction / Welcome Back screens) so the user can see the full scope
 *  without opening the settings.
 *
 *  By default only optional categories are listed (the user can change those
 *  via the Permissions toggles). Pass `includeForced` on first-impression
 *  surfaces (Introduction / Welcome Back) to also list swaps and rewards so a
 *  user new to 1CT sees the full default scope, not just the editable subset. */

const CATEGORY_LABEL_KEYS: Record<OneClickCategory, string> = {
  swaps: "oneClickTrading.permissionsSummary.categoryLabel.swaps",
  rewards: "oneClickTrading.permissionsSummary.categoryLabel.rewards",
  poolManagement: "oneClickTrading.settings.permissions.poolManagement.label",
  limitOrders: "oneClickTrading.settings.permissions.limitOrders.label",
};

interface OneClickPermissionsSummaryProps {
  enabledOptionalCategories:
    | Record<OptionalOneClickCategory, boolean>
    | undefined;
  /** When true, prepend the forced categories (swaps, rewards) to the list. */
  includeForced?: boolean;
  className?: string;
}

export const OneClickPermissionsSummary: FunctionComponent<
  OneClickPermissionsSummaryProps
> = ({ enabledOptionalCategories, includeForced = false, className }) => {
  const { t } = useTranslation();
  if (!enabledOptionalCategories) return null;

  const forcedCategories: ForcedOneClickCategory[] = includeForced
    ? [...FORCED_ONE_CLICK_CATEGORIES]
    : [];
  const optionalCategories = OPTIONAL_ONE_CLICK_CATEGORIES.filter(
    (category) => enabledOptionalCategories[category]
  );

  const categories: OneClickCategory[] = [
    ...forcedCategories,
    ...optionalCategories,
  ];
  if (categories.length === 0) return null;

  const labels = categories.map((category) => t(CATEGORY_LABEL_KEYS[category]));

  return (
    <span
      className={classNames(
        "text-caption font-caption text-osmoverse-300",
        className
      )}
    >
      {t("oneClickTrading.permissionsSummary.prefix")} {labels.join(", ")}
    </span>
  );
};
