import { useState } from "react";

import { DropdownWithLabel } from "~/components/dropdown-with-label/";

const platforms = [
  { id: 1, name: "All" },
  { id: 2, name: "Quasar" },
  { id: 3, name: "Osmosis DEX" },
  { id: 4, name: "Levana" },
  { id: 5, name: "Mars" },
  { id: 6, name: "Osmosis" },
];

export const PlatformsDropdown = () => {
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);

  return (
    <DropdownWithLabel
      label="Platforms"
      values={platforms}
      value={selectedPlatform}
      onChange={setSelectedPlatform}
    />
  );
};
