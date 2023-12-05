import { EarnAllocation } from "~/components/earn/allocation";
import { FilterProvider } from "~/components/earn/filters/filter-context";
import { TopFilters } from "~/components/earn/filters/top-filters";
import { EarnPosition } from "~/components/earn/position";
import { EarnRewards } from "~/components/earn/rewards";
import {
  TabButton,
  TabButtons,
  TabHeader,
  TabPanel,
  TabPanels,
  Tabs,
} from "~/components/earn/tabs";
import StrategiesTable from "~/components/earn/tabs/table";
import { useNavBar } from "~/hooks";

export default function Earn() {
  useNavBar({ title: "Earn" });

  return (
    <div className="flex flex-col gap-10 pl-8 pr-9 pt-10">
      <div className="grid grid-cols-earnpage gap-6">
        <div className="grid grid-cols-earnpositions gap-x-7 rounded-3x4pxlinset bg-osmoverse-850 px-8 pt-7">
          <EarnPosition />
          <div className="h-full max-h-72 w-0.5 bg-osmoverse-825" />
          <EarnAllocation />
        </div>
        <EarnRewards />
      </div>
      <FilterProvider>
        <Tabs className="flex flex-col">
          <TabButtons>
            <TabButton>Discover Strategies</TabButton>
            <TabButton>My Strategies</TabButton>
          </TabButtons>
          <TabHeader>
            <TopFilters />
          </TabHeader>
          <TabPanels>
            <TabPanel>
              <StrategiesTable showBalance={false} />
            </TabPanel>
            <TabPanel>
              <StrategiesTable showBalance />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </FilterProvider>
    </div>
  );
}
