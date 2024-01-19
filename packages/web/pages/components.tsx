import { NextPage } from "next";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
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
    <div className="flex w-full flex-wrap items-start justify-start gap-4">
      {children}
    </div>
  </div>
);

const Component = ({
  title,
  children,
}: {
  title: string;
  children: JSX.Element;
}) => (
  <div className="flex flex-grow flex-col gap-2">
    <p>{title}</p>
    {children}
  </div>
);

const Sliders = () => {
  const [slider, setSlider] = useState(0);

  return (
    <Card title="Slider">
      <Component title="Slider">
        <Slider
          className="my-8 w-full"
          currentValue={slider}
          onInput={(value) => {
            console.log("value: ", value);
            setSlider(value);
          }}
          min={0}
          max={100}
          step={1}
        />
      </Component>
      <Component title="Disabled">
        <Slider
          disabled
          className="my-8 w-full"
          currentValue={slider}
          onInput={(value) => setSlider(value)}
          min={0}
          max={100}
          step={1}
        />
      </Component>
      <Component title="Supercharged Gradient">
        <Slider
          className="my-8 w-full"
          currentValue={slider}
          onInput={(value) => setSlider(value)}
          min={0}
          max={100}
          step={1}
          useSuperchargedGradient
        />
      </Component>
    </Card>
  );
};

const Checkboxes = () => {
  const [checked, setChecked] = useState(false);
  const handleCheckboxToggle = () => setChecked(!checked);
  return (
    <Card title="Checkbox">
      <Component title="Regular">
        <CheckBox isOn={checked} onToggle={handleCheckboxToggle} />
      </Component>

      <Component title="Indeterminate">
        <CheckBox
          isOn={checked}
          onToggle={handleCheckboxToggle}
          isIndeterminate={true}
        />
      </Component>

      <Component title="Disabled">
        <CheckBox
          disabled={true}
          isOn={checked}
          onToggle={handleCheckboxToggle}
        />
      </Component>

      <Component title="With Children">
        <CheckBox isOn={checked} onToggle={handleCheckboxToggle}>
          <span className="rounded-lg bg-osmoverse-700 p-2">child</span>
        </CheckBox>
      </Component>

      <Component title="Superfluid">
        <CheckBox
          borderStyles="border-superfluid"
          backgroundStyles="bg-superfluid"
          isOn={checked}
          onToggle={handleCheckboxToggle}
        />
      </Component>

      <Component title="Rust-700">
        <CheckBox
          borderStyles="border-rust-700"
          backgroundStyles="bg-gradient-negative"
          isOn={checked}
          onToggle={handleCheckboxToggle}
        />
      </Component>

      <Component title="Wosmongton-200">
        <CheckBox
          backgroundStyles="bg-wosmongton-200"
          borderStyles="border-wosmongton-200"
          isOn={checked}
          onToggle={handleCheckboxToggle}
        />
      </Component>
    </Card>
  );
};

const Radios = () => {
  const [radio, setRadio] = useState("a");

  return (
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
  );
};

const Buttons = () => {
  return (
    <Card title="Buttons">
      <Component title="Regular">
        <Button onClick={() => console.log("clicked")}>Click</Button>
      </Component>
      <Component title="Disabled">
        <Button disabled onClick={() => console.log("clicked")}>
          Click
        </Button>
      </Component>
      <Component title="Primary">
        <Button mode="primary" onClick={() => console.log("clicked")}>
          Click
        </Button>
      </Component>
      <Component title="Primary Bullish">
        <Button mode="primary-bullish" onClick={() => console.log("clicked")}>
          Click
        </Button>
      </Component>
      <Component title="Primary Warning">
        <Button mode="primary-warning" onClick={() => console.log("clicked")}>
          Click
        </Button>
      </Component>
      <Component title="Secondary">
        <Button mode="secondary" onClick={() => console.log("clicked")}>
          Click
        </Button>
      </Component>
      <Component title="Secondary Bullish">
        <Button mode="secondary-bullish" onClick={() => console.log("clicked")}>
          Click
        </Button>
      </Component>
      <Component title="Tertiary">
        <Button mode="tertiary" onClick={() => console.log("clicked")}>
          Click
        </Button>
      </Component>
      <Component title="Text">
        <Button mode="text" onClick={() => console.log("clicked")}>
          Click
        </Button>
      </Component>
      <Component title="Text White">
        <Button mode="text-white" onClick={() => console.log("clicked")}>
          Click
        </Button>
      </Component>
      <Component title="Framed Primary">
        <Button mode="framed-primary" onClick={() => console.log("clicked")}>
          Click
        </Button>
      </Component>
      <Component title="Framed Secondary">
        <Button mode="framed-secondary" onClick={() => console.log("clicked")}>
          Click
        </Button>
      </Component>
      <Component title="Amount">
        <Button mode="amount" onClick={() => console.log("clicked")}>
          Click
        </Button>
      </Component>
      <Component title="Special 1">
        <Button mode="special-1" onClick={() => console.log("clicked")}>
          Click
        </Button>
      </Component>
      <Component title="Icon Primary">
        <Button mode="icon-primary" onClick={() => console.log("clicked")}>
          Click
        </Button>
      </Component>
      <Component title="Icon Social">
        <Button mode="icon-social" onClick={() => console.log("clicked")}>
          Click
        </Button>
      </Component>
      <Component title="Bullish Special">
        <Button mode="bullish-special" onClick={() => console.log("clicked")}>
          Click
        </Button>
      </Component>
      <Component title="Quaternary Modal">
        <Button mode="quaternary-modal" onClick={() => console.log("clicked")}>
          Click
        </Button>
      </Component>
      <Component title="Quaternary">
        <Button mode="quaternary" onClick={() => console.log("clicked")}>
          Click
        </Button>
      </Component>
      <Component title="Unstyled">
        <Button mode="unstyled" onClick={() => console.log("clicked")}>
          Click
        </Button>
      </Component>
    </Card>
  );
};

const Switches = () => {
  const [isSwitchOn, setIsSwitchOn] = useState(false);

  return (
    <Card title="Switch">
      <Component title="Regular">
        <Switch isOn={isSwitchOn} onToggle={() => setIsSwitchOn(!isSwitchOn)} />
      </Component>
      <Component title="Disabled">
        <Switch
          disabled
          isOn={isSwitchOn}
          onToggle={() => setIsSwitchOn(!isSwitchOn)}
        />
      </Component>
    </Card>
  );
};

const CheckboxSelects = () => {
  const [checkboxSelect, setCheckboxSelect] = useState(["1"]);

  return (
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
  );
};

const StakeTabs = () => {
  const [stakeTab, setStakeTab] = useState("Stake");
  return (
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
  );
};

const MenuDropdowns = () => {
  const [selectedTimeFrame, setSelectedTimeFrame] =
    useState<CommonPriceChartTimeFrame>("1D");

  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);
  return (
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
  );
};

const Components: NextPage = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h1>Components Library</h1>
      <h4>Control</h4>
      <Checkboxes />
      <Radios />
      <Switches />
      <Sliders />
      <CheckboxSelects />
      <StakeTabs />
      <MenuDropdowns />
      <h4>Buttons</h4>
      <Buttons />
    </div>
  );
};

export default Components;

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { req } = context;

  // get host or host from proxy
  const host = req.headers["x-forwarded-host"] || req.headers["host"];

  // redirect on production
  if (host === "osmosis.zone") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return { props: {} };
};
