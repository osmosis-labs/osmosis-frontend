import { NextPage } from "next";
import { useCallback, useState } from "react";

import { Button } from "~/components/buttons";
import {
  CheckBox,
  CheckboxSelect,
  MenuDropdown,
  Radio,
  Slider,
  StakeTab,
  Switch,
} from "~/components/control";
import { useConst } from "~/hooks/use-const";
import type { CommonPriceChartTimeFrame } from "~/server/queries/complex/assets";

const Card: React.FC<{
  title: string;
}> = ({ title, children }) => (
  <div className="flex flex-col gap-4 rounded-[32px] bg-osmoverse-850 p-6">
    <h6 className="text-center">{title}</h6>
    <div className="flex w-full items-start justify-start gap-4">
      {children}
    </div>
  </div>
);

const Components: NextPage = () => {
  const [checked, setChecked] = useState(false);
  const [radio, setRadio] = useState("a");
  const [checkboxSelect, setCheckboxSelect] = useState(["1"]);
  const [slider, setSlider] = useState(0);
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [stakeTab, setStakeTab] = useState("stake");
  const [selectedTimeFrame, setSelectedTimeFrame] =
    useState<CommonPriceChartTimeFrame>("1D");
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);

  const handleToggle = () => setChecked(!checked);

  const Component = ({
    title,
    children,
  }: {
    title: string;
    children: JSX.Element;
  }) => (
    <div className="flex flex-col gap-2">
      <p>{title}</p>
      {children}
    </div>
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1>Components Library</h1>
      <h4>Control</h4>
      <Card title="Checkbox">
        <Component title="Regular">
          <CheckBox isOn={checked} onToggle={handleToggle} />
        </Component>

        <Component title="Indeterminate">
          <CheckBox
            isOn={checked}
            onToggle={handleToggle}
            isIndeterminate={true}
          />
        </Component>

        <Component title="Disabled">
          <CheckBox disabled={true} isOn={checked} onToggle={handleToggle} />
        </Component>

        <Component title="With Children">
          <CheckBox
            isOn={checked}
            onToggle={handleToggle}
            isIndeterminate={true}
          >
            <div>child component</div>
          </CheckBox>
        </Component>

        <Component title="Superfluid">
          <CheckBox
            borderStyles="border-superfluid"
            backgroundStyles="bg-superfluid"
            isOn={checked}
            onToggle={handleToggle}
          />
        </Component>

        <Component title="Rust-700">
          <CheckBox
            borderStyles="border-rust-700"
            backgroundStyles="bg-gradient-negative"
            isOn={checked}
            onToggle={handleToggle}
          />
        </Component>

        <Component title="Wosmongton-200">
          <CheckBox
            backgroundStyles="bg-wosmongton-200"
            borderStyles="border-wosmongton-200"
            isOn={checked}
            onToggle={handleToggle}
          />
        </Component>
      </Card>
      <Card title="Radio">
        <Component title="Regular">
          <>
            <Radio
              value="a"
              onSelectRadio={() => setRadio("a")}
              groupValue={radio}
            />
            <Radio
              value="b"
              onSelectRadio={() => setRadio("b")}
              groupValue={radio}
            />
          </>
        </Component>
        <Component title="Disabled">
          <Radio
            value="c"
            onSelectRadio={() => setRadio("c")}
            groupValue={radio}
            disabled
          />
        </Component>
      </Card>
      <Card title="Checkbox Select">
        <CheckboxSelect
          label="checkbox select"
          options={[
            { id: "1", display: "option 1" },
            { id: "2", display: "option 2" },
          ]}
          selectedOptionIds={checkboxSelect}
          onSelect={(id) => {
            if (checkboxSelect.includes(id)) {
              setCheckboxSelect(
                checkboxSelect.filter((selectedId) => selectedId !== id)
              );
            } else {
              setCheckboxSelect([...checkboxSelect, id]);
            }
          }}
        />
      </Card>
      <Card title="Slider">
        <Slider
          className="my-8 w-full"
          currentValue={slider}
          onInput={(value) => setSlider(value)}
          min={0}
          max={100}
          step={1}
        />
      </Card>
      <Card title="Switch">
        <Switch isOn={isSwitchOn} onToggle={() => setIsSwitchOn(!isSwitchOn)} />
      </Card>
      <Card title="Stake Tab">
        <StakeTab
          active={stakeTab === "Stake"}
          onClick={() => setStakeTab("Stake")}
        >
          Stake
        </StakeTab>
        <StakeTab
          active={stakeTab === "Unstake"}
          onClick={() => setStakeTab("Unstake")}
        >
          Unstake
        </StakeTab>
      </Card>
      <Card title="Menu Dropdown">
        <div className="relative w-full">
          <Button onClick={() => setIsMenuDropdownOpen(!isMenuDropdownOpen)}>
            Open Menu Dropdown
          </Button>
          <MenuDropdown
            className="w-full"
            options={useConst([
              { id: "1H", display: "1H" },
              { id: "1D", display: "1D" },
              { id: "1W", display: "1W" },
              { id: "1M", display: "1M" },
            ] as { id: CommonPriceChartTimeFrame; display: string }[])}
            selectedOptionId={selectedTimeFrame}
            onSelect={useCallback(
              (id: string) => {
                setSelectedTimeFrame(id as CommonPriceChartTimeFrame),
                  setIsMenuDropdownOpen(false);
              },
              [setSelectedTimeFrame]
            )}
            isOpen={isMenuDropdownOpen}
          />
        </div>
      </Card>
      <ul>
        <li>Language Select</li>
        <li>Menu Toggle</li>
        <li>Pool Token Select</li>
        <li>Select Menu</li>
        <li>Sort Menu</li>
        <li>Tab Box</li>
        <li>Token Select With Drawer</li>
        <li>Token Select</li>
      </ul>
    </div>
  );
};

export default Components;
