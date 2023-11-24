import {
  TabButton,
  TabButtons,
  TabPanel,
  TabPanels,
  Tabs,
} from "~/components/earn";
import { EarnAllocation } from "~/components/earn/allocation";
import { EarnPosition } from "~/components/earn/position";
import { EarnRewards } from "~/components/earn/rewards";
import { useNavBar } from "~/hooks";

export default function Earn() {
  useNavBar({ title: "Earn" });

  return (
    <div className="flex flex-col gap-10 pl-8 pr-9 pt-10">
      <div className="flex gap-6">
        <div className="flex w-full rounded-3x4pxlinset bg-osmoverse-850 px-8 pt-7">
          <EarnPosition />
          <div className="mx-[26px] h-full max-h-72 w-0.5 bg-osmoverse-825" />
          <EarnAllocation />
        </div>
        <EarnRewards />
      </div>
      <Tabs className="flex flex-col">
        <TabButtons>
          <TabButton>Discover Strategies</TabButton>
          <TabButton>My Strategies</TabButton>
        </TabButtons>
        <TabPanels>
          <TabPanel>1</TabPanel>
          <TabPanel>2</TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}
