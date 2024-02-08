import { Icon } from "~/components/assets";
import { Tooltip } from "~/components/tooltip";
import { useTranslation } from "~/hooks";

// const mockData = [
//   {
//     time: 1700841000000,
//     close: 0.65400126,
//     high: 0.65403389,
//     low: 0.65373768,
//     open: 0.65395691,
//     volume: 14924.6249708296,
//   },
//   {
//     time: 1700841300000,
//     close: 0.65441089,
//     high: 0.65441089,
//     low: 0.65400126,
//     open: 0.65400126,
//     volume: 19703.3007456919,
//   },
//   {
//     time: 1700841600000,
//     close: 0.65503813,
//     high: 0.65507399,
//     low: 0.65441089,
//     open: 0.65441089,
//     volume: 13458.9162743022,
//   },
//   {
//     time: 1700841900000,
//     close: 0.65612501,
//     high: 0.6561639,
//     low: 0.6549041,
//     open: 0.65509209,
//     volume: 26237.4484187444,
//   },
//   {
//     time: 1700842200000,
//     close: 0.65651969,
//     high: 0.65689089,
//     low: 0.65608492,
//     open: 0.65612501,
//     volume: 19748.608984616,
//   },
//   {
//     time: 1700842500000,
//     close: 0.6571733,
//     high: 0.65732227,
//     low: 0.65651969,
//     open: 0.65651969,
//     volume: 19163.6796236313,
//   },
//   {
//     time: 1700842800000,
//     close: 0.65673653,
//     high: 0.65732804,
//     low: 0.65668747,
//     open: 0.6571733,
//     volume: 9782.0254345117,
//   },
//   {
//     time: 1700843100000,
//     close: 0.65816234,
//     high: 0.65823109,
//     low: 0.65678242,
//     open: 0.65678242,
//     volume: 48806.164623421,
//   },
//   {
//     time: 1700843400000,
//     close: 0.65774444,
//     high: 0.65824681,
//     low: 0.65770708,
//     open: 0.65816234,
//     volume: 15678.1349349541,
//   },
//   {
//     time: 1700843700000,
//     close: 0.65813635,
//     high: 0.65835,
//     low: 0.65773638,
//     open: 0.65774444,
//     volume: 10095.653257161,
//   },
//   {
//     time: 1700844000000,
//     close: 0.65792152,
//     high: 0.65813635,
//     low: 0.65792152,
//     open: 0.65813635,
//     volume: 8362.6096812617,
//   },
// ];

export const EarnPosition = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center gap-3.5">
        <h5 className="text-lg font-semibold leading-normal text-osmoverse-100">
          {t("earnPage.positions")}
        </h5>
        <p className="whitespace-nowrap text-sm font-semibold text-wosmongton-300">
          {t("earnPage.strategiesCount", { number: "7" })}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <span className="inline-flex items-center gap-4">
          <p className="text-subtitle-1">{t("earnPage.totalValueInvested")}</p>
          <Tooltip content="lorem ipsum">
            <Icon id="info" width={16} height={16} />
          </Tooltip>
        </span>
        <h3 className="text-osmoverse-100">$23,347.23</h3>
      </div>
      {/* <div className="flex flex-col justify-between">
        <div className="flex justify-between xs:flex-wrap">
          <h4 className="font-semibold leading-9 text-osmoverse-200">
            $23,347.23
          </h4>
          <div className="flex items-center gap-4.5 xs:gap-2.5">
            <p className="text-sm font-semibold text-osmoverse-100">
              {t("earnPage.value")}
            </p>
            <p className="text-sm font-semibold text-osmoverse-100 opacity-50">
              {t("convertToStake.APR")}
            </p>
          </div>
        </div>
        <EarnPositionChartSection />
      </div> */}
    </div>
  );
};

// const EarnPositionChartSection = () => {
//   const { t } = useTranslation();

//   return (
//     <div className="relative mt-5 flex h-52">
//       <div className="absolute flex gap-1">
//         <ChartButton
//           label={t("tokenInfos.chart.xDay", {
//             d: "1",
//           })}
//           onClick={() => {}}
//           selected={false}
//         />
//         <ChartButton
//           label={t("tokenInfos.chart.xDay", {
//             d: "7",
//           })}
//           onClick={() => {}}
//           selected={false}
//         />
//         <ChartButton label={"1M"} onClick={() => {}} selected={true} />
//         <ChartButton
//           label={t("tokenInfos.chart.xYear", {
//             y: "1",
//           })}
//           onClick={() => {}}
//           selected={false}
//         />
//         <ChartButton
//           label={t("tokenInfos.chart.all", {
//             y: "1",
//           })}
//           onClick={() => {}}
//           selected={false}
//         />
//       </div>
//       <TokenPairHistoricalChart
//         minimal
//         showTooltip
//         showGradient
//         annotations={[]}
//         data={mockData}
//         domain={[0.6228583428571428, 0.691070457]}
//       />
//     </div>
//   );
// };
