import { StrategyButton } from "~/components/strategy-button/";

const strategiesFilters = [
  {
    label: "Stablecoins",
    imageURI: "/images/table-filters/stablecoins.svg",
    resp: "stablecoins",
  },
  {
    label: "Correlated",
    imageURI: "/images/table-filters/correlated.svg",
    resp: "correlated",
  },
  {
    label: "Blue Chip",
    imageURI: "/images/table-filters/blue-chip.svg",
    resp: "bluechip",
  },
];

export const StrategyCategories = () => {
  return (
    <div className="flex">
      {strategiesFilters.map((props) => (
        <StrategyButton key={`${props.label} strategy button`} {...props} />
      ))}
    </div>
  );
};
