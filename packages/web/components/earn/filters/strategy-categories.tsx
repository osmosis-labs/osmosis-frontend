import Image from "next/image";

import { Icon } from "~/components/assets";
import { StrategyButton } from "~/components/strategy-button/";

const strategiesFilters = [
  {
    label: "Stablecoins",
    resp: "stablecoins",
    icon: <Icon id="stablecoins" />,
  },
  {
    label: "Correlated",
    resp: "correlated",
    icon: (
      <Image
        src="/icons/correlated.svg"
        alt="Correlated icon"
        width={28}
        height={28}
      />
    ),
  },
  {
    label: "Blue Chip",
    resp: "bluechip",
    icon: (
      <Image
        src="/icons/blue-chip.svg"
        alt="Bluechip icon"
        width={28}
        height={28}
      />
    ),
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
