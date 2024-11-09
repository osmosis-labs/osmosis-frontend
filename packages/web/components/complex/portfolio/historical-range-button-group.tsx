import type { Range } from "@osmosis-labs/server";
import { FunctionComponent } from "react";

import { ButtonGroup, ButtonGroupItem } from "~/components/ui/button-group";
import { useTranslation } from "~/hooks";
import { AvailablePriceRanges } from "~/hooks/ui-config";

export const PortfolioHistoricalRangeButtonGroup: FunctionComponent<{
  priceRange: Range;
  setPriceRange: (range: Range) => void;
}> = ({ priceRange, setPriceRange }) => {
  const { t } = useTranslation();

  return (
    <ButtonGroup onValueChange={setPriceRange} defaultValue={priceRange}>
      <ButtonGroupItem
        value={AvailablePriceRanges["1d"]}
        label={t("tokenInfos.chart.xDay", { d: "1" })}
      />
      <ButtonGroupItem
        value={AvailablePriceRanges["7d"]}
        label={t("tokenInfos.chart.xDay", { d: "7" })}
      />
      <ButtonGroupItem
        value={AvailablePriceRanges["1mo"]}
        label={t("tokenInfos.chart.xDay", { d: "30" })}
      />
      <ButtonGroupItem
        value={AvailablePriceRanges["1y"]}
        label={t("tokenInfos.chart.xYear", { y: "1" })}
      />
      <ButtonGroupItem
        value={AvailablePriceRanges.all}
        label={t("tokenInfos.chart.all")}
      />
    </ButtonGroup>
  );
};
