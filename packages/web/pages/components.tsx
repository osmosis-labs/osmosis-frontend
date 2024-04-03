import { RatePretty } from "@keplr-wallet/unit";
import type { CommonPriceChartTimeFrame } from "@osmosis-labs/server";
import { NextPage } from "next";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Image from "next/image";
import { ReactNode, useCallback, useContext, useState } from "react";

import { PoolAssetsIcon } from "~/components/assets";
import {
  CopyIcon,
  ExternalLinkIcon,
  FallbackImg,
  Icon,
  LogOutIcon,
  PoolAssetsName,
  QRIcon,
} from "~/components/assets";
import { RateRing } from "~/components/assets";
import { Token } from "~/components/assets";
import { CoinsIcon } from "~/components/assets/coins-icon";
import { CreditCardIcon } from "~/components/assets/credit-card-icon";
import { GradientView } from "~/components/assets/gradient-view";
import { RightArrowIcon } from "~/components/assets/right-arrow-icon";
import { UnlockIcon } from "~/components/assets/unlock-icon";
import ClipboardButton from "~/components/buttons/clipboard-button";
import IconButton from "~/components/buttons/icon-button";
import LinkButton from "~/components/buttons/link-button";
import { SwitchWalletButton } from "~/components/buttons/switch-wallet";
import {
  CheckboxSelect,
  MenuDropdown,
  Radio,
  StakeTab,
} from "~/components/control";
import { FilterProvider } from "~/components/earn/filters/filter-context";
import { FilterContext } from "~/components/earn/filters/filter-context";
import { InputBox, SearchBox } from "~/components/input";
import { MetricLoader } from "~/components/loaders";
import SkeletonLoader from "~/components/loaders/skeleton-loader";
import Spinner from "~/components/loaders/spinner";
import { RadioWithOptions } from "~/components/radio-with-options";
import { Step, Stepper } from "~/components/stepper";
import { Tooltip } from "~/components/tooltip";
import { LinkIconButton } from "~/components/ui/button";
import { ArrowButton } from "~/components/ui/button";
import { ShowMoreButton } from "~/components/ui/button";
import { Button, ChartButton } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input as InputShadcn } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Skeleton } from "~/components/ui/skeleton";
import { Slider as SliderShadcn } from "~/components/ui/slider";
import { Switch } from "~/components/ui/switch";
import { SpriteIconId } from "~/config";
import { useConst } from "~/hooks/use-const";

const Card: React.FC<{
  title: string;
  children: ReactNode;
}> = ({ title, children }) => (
  <div className="flex flex-col gap-4 rounded-3xl bg-osmoverse-800 p-6">
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

const Loaders = () => {
  return (
    <Card title="Loaders">
      <Component title="Metric Loader">
        <MetricLoader isLoading />
      </Component>
      <Component title="Skeleton Loader">
        <SkeletonLoader isLoaded={false}>
          <div className="h-4 w-full bg-osmoverse-700" />
        </SkeletonLoader>
      </Component>
      <Component title="Spinner">
        <Spinner />
      </Component>
      <Component title="Skeleton (Shadcn)">
        <Skeleton className="h-4 w-full rounded-full" />
      </Component>
    </Card>
  );
};

const Sliders = () => {
  const [slider, setSlider] = useState([50]);

  return (
    <Card title="Slider (Shadcn)">
      <Component title="Slider Default">
        <SliderShadcn
          variant="default"
          min={0}
          max={100}
          step={1}
          value={slider}
          onValueChange={(value) => setSlider(value)}
        />
      </Component>
      <Component title="Slider Supercharged">
        <SliderShadcn
          variant="secondary"
          min={0}
          max={100}
          step={1}
          value={slider}
          onValueChange={(value) => setSlider(value)}
        />
      </Component>
    </Card>
  );
};

const Checkboxes = () => {
  const [checked, setChecked] = useState(false);
  const handleCheckboxToggle = () => setChecked(!checked);

  return (
    <Card title="Checkbox (Shadcn)">
      <Component title="Regular">
        <Checkbox checked={checked} onClick={handleCheckboxToggle} />
      </Component>
      <Component title="Indeterminate">
        <Checkbox
          checked={checked}
          onClick={handleCheckboxToggle}
          isIndeterminate
        />
      </Component>
      <Component title="Disabled">
        <Checkbox checked={checked} onClick={handleCheckboxToggle} disabled />
      </Component>
      <Component title="With Children">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={checked}
            onClick={handleCheckboxToggle}
            id="terms"
          />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Child
          </label>
        </div>
      </Component>
      <Component title="Secondary">
        <Checkbox
          checked={checked}
          onClick={handleCheckboxToggle}
          variant="secondary"
        />
      </Component>
      <Component title="Destructive">
        <Checkbox
          checked={checked}
          onClick={handleCheckboxToggle}
          variant="destructive"
        />
      </Component>
    </Card>
  );
};

const RadiosShadcn = () => {
  const [radio, setRadio] = useState("option-one");

  return (
    <Card title="Radio (Shadcn)">
      <Component title="Regular (Shadcn)">
        <RadioGroup defaultValue="option-one">
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="option-one"
              id="option-one"
              onClick={(e) => setRadio(e.currentTarget.value)}
              checked={radio === "option-one"}
            />
            <Label htmlFor="option-one">Option One</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="option-two"
              id="option-two"
              onClick={(e) => setRadio(e.currentTarget.value)}
              checked={radio === "option-two"}
            />
            <Label htmlFor="option-two">Option Two</Label>
          </div>
        </RadioGroup>
      </Component>
      <Component title="Regular (Shadcn)">
        <RadioGroup defaultValue="option-one">
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              disabled
              value="option-one"
              id="option-one"
              onClick={(e) => setRadio(e.currentTarget.value)}
              checked={radio === "option-one"}
            />
            <Label htmlFor="option-one">Option One</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              disabled
              value="option-two"
              id="option-two"
              onClick={(e) => setRadio(e.currentTarget.value)}
              checked={radio === "option-two"}
            />
            <Label htmlFor="option-two">Option Two</Label>
          </div>
        </RadioGroup>
      </Component>
    </Card>
  );
};

const RadiosWithOptions = () => {
  const rewardTypes = [
    {
      value: "all",
      label: "All",
    },
    {
      value: "single",
      label: "Single",
    },
    {
      value: "multi",
      label: "Multi",
    },
  ];

  const RadiosWithOptionsWithContext = () => {
    const { filters, setFilter } = useContext(FilterContext);

    return (
      <Card title="Radio with Options">
        <Component title="Primary Small">
          <RadioWithOptions
            mode="primary"
            variant="small"
            value={filters?.rewardType || "all"}
            onChange={(value) => setFilter("rewardType", value)}
            options={rewardTypes}
          />
        </Component>
        <Component title="Primary Large">
          <RadioWithOptions
            mode="primary"
            variant="large"
            value={filters?.rewardType || "all"}
            onChange={(value) => setFilter("rewardType", value)}
            options={rewardTypes}
          />
        </Component>
        <Component title="Secondary Small">
          <RadioWithOptions
            mode="secondary"
            variant="small"
            value={filters?.rewardType || "all"}
            onChange={(value) => setFilter("rewardType", value)}
            options={rewardTypes}
          />
        </Component>
        <Component title="Secondary Large">
          <RadioWithOptions
            mode="secondary"
            variant="large"
            value={filters?.rewardType || "all"}
            onChange={(value) => setFilter("rewardType", value)}
            options={rewardTypes}
          />
        </Component>
      </Card>
    );
  };

  return (
    <FilterProvider
      defaultFilters={{
        tokenHolder: "all",
        strategyMethod: { label: "All", value: "" },
        platform: { label: "All", value: "" },
        lockDurationType: "all",
        search: "",
        specialTokens: [],
        rewardType: "all",
      }}
    >
      <RadiosWithOptionsWithContext />
    </FilterProvider>
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
    <Card title="Buttons (Shadcn)">
      <Component title="Primary">
        <Button onClick={() => console.log("clicked")} size="default">
          Click
        </Button>
      </Component>
      <Component title="Disabled">
        <Button disabled onClick={() => console.log("clicked")}>
          Click
        </Button>
      </Component>
      <Component title="Success">
        <Button onClick={() => console.log("clicked")} variant="success">
          Click
        </Button>
      </Component>
      <Component title="Success">
        <Button onClick={() => console.log("clicked")} variant="success">
          Click
        </Button>
      </Component>
      <Component title="Destructive">
        <Button onClick={() => console.log("clicked")} variant="destructive">
          Click
        </Button>
      </Component>
      <Component title="Ghost">
        <Button onClick={() => console.log("clicked")} variant="ghost">
          Click
        </Button>
      </Component>
      <Component title="Outline">
        <Button variant="outline" onClick={() => console.log("clicked")}>
          Click
        </Button>
      </Component>
      <Component title="Medium">
        <Button onClick={() => console.log("clicked")} size="md">
          Click
        </Button>
      </Component>
      <Component title="Small">
        <Button onClick={() => console.log("clicked")} size="sm">
          Click
        </Button>
      </Component>
      <Component title="Small Outline">
        <Button
          onClick={() => console.log("clicked")}
          size="sm"
          variant="outline"
        >
          Click
        </Button>
      </Component>
      <Component title="Icon">
        <Button onClick={() => console.log("clicked")} size="icon">
          <Icon id="close" />
        </Button>
      </Component>
      <Component title="Link">
        <Button onClick={() => console.log("clicked")} variant="link">
          Click
        </Button>
      </Component>
    </Card>
  );
};

const CustomButtons = () => {
  const [showMoreButton, setShowMoreButton] = useState(false);
  return (
    <Card title="Custom Buttons">
      <Component title="Arrow">
        <ArrowButton onClick={() => console.log("clicked")}>Click</ArrowButton>
      </Component>
      <Component title="Chart">
        <ChartButton
          alt="refresh"
          icon="refresh-ccw"
          selected={false}
          onClick={() => console.log("clicked")}
        />
      </Component>
      <Component title="Clipboard">
        <ClipboardButton
          aria-label="clipboard-button"
          onClick={() => console.log("clicked")}
        >
          Click
        </ClipboardButton>
      </Component>
      <Component title="Icon">
        <IconButton
          aria-label="clipboard-button"
          onClick={() => console.log("clicked")}
          icon={
            <Icon
              id="close"
              className="text-osmoverse-400 hover:text-white-full"
              width={32}
              height={32}
            />
          }
        />
      </Component>
      <Component title="Link">
        <LinkButton
          className="mr-auto md:invisible"
          icon={
            <Image
              alt="right"
              src="/icons/arrow-right.svg"
              width={24}
              height={24}
              className="text-osmoverse-200"
            />
          }
          label="Label"
          ariaLabel="Aria Label"
          href=""
        />
      </Component>
      <Component title="Link Icon">
        <LinkIconButton
          href=""
          target="_blank"
          rel="external"
          aria-label="X"
          icon={<Icon className="h-4 w-4 text-osmoverse-400" id="X" />}
        />
      </Component>
      <Component title="Show More">
        <ShowMoreButton
          isOn={showMoreButton}
          onToggle={() => setShowMoreButton(!showMoreButton)}
          className="m-auto"
        >
          Click
        </ShowMoreButton>
      </Component>
      <Component title="Switch Wallet">
        <SwitchWalletButton
          selectedWalletIconUrl="wallets/keplr.svg"
          onClick={() => console.log("clicked")}
        />
      </Component>
    </Card>
  );
};

const Switches = () => {
  const [isSwitchOn, setIsSwitchOn] = useState(false);

  return (
    <Card title="Switch (Shadcn)">
      <Component title="Regular">
        <Switch
          checked={isSwitchOn}
          onCheckedChange={() => setIsSwitchOn(!isSwitchOn)}
        />
      </Component>
      <Component title="Disabled">
        <Switch
          disabled
          checked={isSwitchOn}
          onCheckedChange={() => setIsSwitchOn(!isSwitchOn)}
        />
      </Component>
      <Component title="Children - Left">
        <div className="flex items-center">
          <label className="text-white pr-[15px] text-[15px] leading-none">
            Child
          </label>
          <Switch
            checked={isSwitchOn}
            onCheckedChange={() => setIsSwitchOn(!isSwitchOn)}
          >
            Child
          </Switch>
        </div>
      </Component>
      <Component title="Children - Right">
        <div className="flex items-center">
          <Switch
            checked={isSwitchOn}
            onCheckedChange={() => setIsSwitchOn(!isSwitchOn)}
          >
            Child
          </Switch>
          <label className="text-white pl-[15px] text-[15px] leading-none">
            Child
          </label>
        </div>
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

const FontSize = () => (
  <Card title="Font Size">
    <p className="text-xss">text-xss</p>
    <p className="text-xs">text-xs</p>
    <p className="text-sm">text-sm</p>
    <p className="text-base">text-base</p>
    <p className="text-base">text-base</p>
    <p className="text-lg">text-lg</p>
    <p className="text-xl">text-xl</p>
    <p className="text-2xl">text-2xl</p>
    <p className="text-3xl">text-3xl</p>
    <p className="text-4xl">text-4xl</p>
    <p className="text-5xl">text-5xl</p>
    <h1>h1</h1>
    <h2>h2</h2>
    <h3>h3</h3>
    <h4>h4</h4>
    <h5>h5</h5>
    <h6>h6</h6>
    <p className="subtitle1">subtitle1</p>
    <p className="subtitle2">subtitle2</p>
    <p className="body1">body1</p>
    <p className="body2">body2</p>
    <p className="button">button</p>
    <p className="caption">caption</p>
    <p className="override">override</p>
  </Card>
);

const Color = () => (
  <Card title="Color">
    <p className="text-white-full">white-full</p>
    <p className="text-white-high">white-high</p>
    <p className="text-white-emphasis">white-emphasis</p>
    <p className="text-white-mid">white-mid</p>
    <p className="text-white-disabled">white-disabled</p>
    <p className="text-white-faint">white-faint</p>
    <p className="text-wosmongton-100">wosmongton-100</p>
    <p className="text-wosmongton-200">wosmongton-200</p>
    <p className="text-wosmongton-300">wosmongton-300</p>
    <p className="text-wosmongton-400">wosmongton-400</p>
    <p className="text-wosmongton-500">wosmongton-500</p>
    <p className="text-wosmongton-700">wosmongton-700</p>
    <p className="text-ion-100">ion-100</p>
    <p className="text-ion-300">ion-300</p>
    <p className="text-ion-400">ion-400</p>
    <p className="text-ion-500">ion-500</p>
    <p className="text-ion-700">ion-700</p>
    <p className="text-bullish-100">bullish-100</p>
    <p className="text-bullish-300">bullish-300</p>
    <p className="text-bullish-400">bullish-400</p>
    <p className="text-bullish-500">bullish-500</p>
    <p className="text-bullish-600">bullish-600</p>
    <p className="text-osmoverse-100">osmoverse-100</p>
    <p className="text-osmoverse-200">osmoverse-200</p>
    <p className="text-osmoverse-300">osmoverse-300</p>
    <p className="text-osmoverse-400">osmoverse-400</p>
    <p className="text-osmoverse-500">osmoverse-500</p>
    <p className="bg-white-full text-osmoverse-600">osmoverse-600</p>
    <p className="bg-white-full text-osmoverse-700">osmoverse-700</p>
    <p className="bg-white-full text-osmoverse-800">osmoverse-800</p>
    <p className="bg-white-full text-osmoverse-810">osmoverse-810</p>
    <p className="bg-white-full text-osmoverse-825">osmoverse-825</p>
    <p className="bg-white-full text-osmoverse-850">osmoverse-850</p>
    <p className="bg-white-full text-osmoverse-860">osmoverse-860</p>
    <p className="bg-white-full text-osmoverse-900">osmoverse-900</p>
    <p className="bg-white-full text-osmoverse-1000">osmoverse-1000</p>
    <p className="text-ammelia-400">ammelia-400</p>
    <p className="text-ammelia-600">ammelia-600</p>
    <p className="text-rust-200">rust-200</p>
    <p className="text-rust-300">rust-300</p>
    <p className="text-rust-500">rust-500</p>
    <p className="text-rust-600">rust-600</p>
    <p className="text-rust-700">rust-700</p>
    <p className="text-rust-800">rust-800</p>
    <p className="bg-white-full text-wireframes-darkGrey">
      wireframes-darkGrey
    </p>
    <p className="text-wireframes-grey">wireframes-grey</p>
    <p className="text-wireframes-lightGrey">wireframes-lightGrey</p>
    <p className="text-error">error</p>
    <p className="text-missionError">missionError</p>
    <p className="text-superfluid">superfluid</p>
    <p className="text-supercharged">supercharged</p>
    <p className="bg-white-full text-black">black</p>
    <p className="text-inherit">inherit</p>
    <p className="text-barFill">barFill</p>
    <p className="text-chartGradientPrimary">chartGradientPrimary</p>
    <p className="text-chartGradientSecondary">chartGradientSecondary</p>
    <p className="bg-white-full text-yourBalanceActionButton">
      yourBalanceActionButton
    </p>
  </Card>
);

// TODO dynamically pull the sprite IDs from sprite.svg
const Icons = () => (
  <Card title="Icons">
    {[
      "search",
      "up-down-arrow",
      "chevron-up",
      "chevron-down",
      "chevron-left",
      "chevron-right",
      "setting",
      "info",
      "hamburger",
      "close",
      "close-thin",
      "globe",
      "dust-broom",
      "arrow-right",
      "close-small",
      "tune",
      "help-circle",
      "kado-logo",
      "transak-logo",
      "more-menu",
      "sort-up",
      "sort-down",
      "check-mark",
      "minus",
      "walletconnect",
      "alert-triangle",
      "twitter",
      "medium",
      "github",
      "wallet",
      "lightning",
      "lightning-small",
      "left-right-arrow",
      "sandbox",
      "arrow-right",
      "zoom-in",
      "zoom-out",
      "refresh-ccw",
      "superfluid-osmo",
      "bell",
      "email",
      "telegram",
      "smartphone",
      "open-book",
      "pie-chart",
      "gift",
      "down-arrow",
      "swap",
      "alert-circle",
      "chart",
      "vote",
      "external-link",
      "web",
      "X",
      "star",
      "sleep-bell",
    ].map((icon) => (
      <Component key={icon} title={icon}>
        <Icon id={icon as SpriteIconId} className="text-white-full" />
      </Component>
    ))}
  </Card>
);

const Tooltips = () => (
  <Card title="Tooltips">
    <Component title="Tooltip Text">
      <Tooltip
        content="tooltip content"
        className="h-8 w-32 border-2 border-osmoverse-500"
      >
        <span className="m-auto">Hover Me</span>
      </Tooltip>
    </Component>
    <Component title="Tooltip Icon">
      <Tooltip
        content="tooltip content"
        className="h-8 w-32 border-2 border-osmoverse-500"
      >
        <Icon
          id={"alert-circle" as SpriteIconId}
          className="m-auto text-white-full"
        />
      </Tooltip>
    </Component>
  </Card>
);

const Assets = () => (
  <Card title="Assets">
    <Component title="Copy">
      <CopyIcon />
    </Component>
    <Component title="Credit Card">
      <CreditCardIcon />
    </Component>
    <Component title="External Link">
      <ExternalLinkIcon />
    </Component>
    <Component title="Logout">
      <LogOutIcon />
    </Component>
    <Component title="QR">
      <QRIcon />
    </Component>
    <Component title="Right Arrow">
      <RightArrowIcon />
    </Component>
    <Component title="Unlock">
      <UnlockIcon />
    </Component>
    <Component title="Fallback Image">
      <FallbackImg
        src=""
        fallbacksrc="/icons/superfluid-osmo.svg"
        className="h-16"
      />
    </Component>
    <Component title="Gradient View">
      <GradientView />
    </Component>

    <Component title="Pool Assets">
      <PoolAssetsIcon
        assets={[
          {
            coinDenom: "Osmo",
            coinImageUrl: "/icons/superfluid-osmo.svg",
            networkName: "osmosis-1",
            poolShare: new RatePretty(0.5),
          },
          {
            coinDenom: "Osmo",
            coinImageUrl: "/icons/superfluid-osmo.svg",
            networkName: "osmosis-1",
            poolShare: new RatePretty(0.5),
          },
          {
            coinDenom: "Osmo",
            coinImageUrl: "/icons/superfluid-osmo.svg",
            networkName: "osmosis-1",
            poolShare: new RatePretty(0.5),
          },
        ]}
      />
    </Component>
    <Component title="Pool Assets Name">
      <PoolAssetsName assetDenoms={["OSMO", "BTC"]} />
    </Component>
    <Component title="Coins">
      <CoinsIcon className="h-32" />
    </Component>
    <Component title="Rate Ring 25%">
      <RateRing className="my-auto" percentage={new RatePretty(0.25)} />
    </Component>
    <Component title="Rate Ring 50%">
      <RateRing className="my-auto" percentage={new RatePretty(0.5)} />
    </Component>
    <Component title="Rate Ring 75%">
      <RateRing className="my-auto" percentage={new RatePretty(0.75)} />
    </Component>
    <Component title="Rate Ring 100%">
      <RateRing className="my-auto" percentage={new RatePretty(1)} />
    </Component>
    <Component title="Token">
      <Token
        coinDenom="Osmo"
        coinImageUrl="/icons/superfluid-osmo.svg"
        networkName="osmosis-1"
        poolShare={new RatePretty(0.5)}
      />
    </Component>
  </Card>
);

const Inputs = () => {
  const [searchBox, setSearchBox] = useState("");
  const [inputBox, setInputBox] = useState("");
  return (
    <Card title="Inputs">
      <Component title="Search Box">
        <SearchBox
          currentValue={searchBox}
          onInput={(query: string) => {
            setSearchBox(query);
          }}
          placeholder="search"
        />
      </Component>
      <Component title="Search Box Right Icon">
        <SearchBox
          currentValue={searchBox}
          onInput={(query: string) => {
            setSearchBox(query);
          }}
          placeholder="search"
          rightIcon={() => <Icon id="tune" className="" />}
        />
      </Component>
      <Component title="Search Box Disabled">
        <SearchBox
          disabled
          currentValue={searchBox}
          onInput={(query: string) => {
            setSearchBox(query);
          }}
          placeholder="search"
        />
      </Component>

      <Component title="Input Box">
        <InputBox currentValue={inputBox} onInput={setInputBox} rightEntry />
      </Component>

      <Component title="Input Box No Border">
        <InputBox
          style="no-border"
          currentValue={inputBox}
          onInput={setInputBox}
        />
      </Component>

      <Component title="Input Box Active">
        <InputBox
          style="active"
          currentValue={inputBox}
          onInput={setInputBox}
        />
      </Component>

      <Component title="Input Box Error">
        <InputBox style="error" currentValue={inputBox} onInput={setInputBox} />
      </Component>
      <Component title="Input Box Trailing Symbol">
        <InputBox
          currentValue={inputBox}
          onInput={setInputBox}
          trailingSymbol="%"
        />
      </Component>
      <Component title="Input Box Right Entry">
        <InputBox currentValue={inputBox} onInput={setInputBox} rightEntry />
      </Component>
      <Component title="Input Box Label Buttons">
        <InputBox
          currentValue={inputBox}
          onInput={setInputBox}
          labelButtons={[
            {
              label: "Enter",
              className:
                "bg-wosmongton-100 hover:bg-wosmongton-100 border-0 rounded-md",
              onClick: () => console.log("clicked"),
              disabled: false,
            },
          ]}
        />
      </Component>
    </Card>
  );
};

const InputsShadcn = () => {
  const [searchBox, setSearchBox] = useState("");
  return (
    <Card title="Inputs (Shadcn)">
      <Component title="Regular">
        <InputShadcn
          value={searchBox}
          onChange={(e) => setSearchBox(e.currentTarget.value)}
          placeholder="search"
        />
      </Component>
      <Component title="Disabled">
        <InputShadcn
          disabled
          value={searchBox}
          onChange={(e) => setSearchBox(e.currentTarget.value)}
          placeholder="search"
        />
      </Component>
    </Card>
  );
};

import QRCode from "~/components/qrcode";

const QRCodes = () => (
  <Card title="QR Codes">
    <Component title="QR Code">
      <div className="w-[180px] rounded-lg bg-white-full p-2">
        <QRCode value="cosmos14crmqa4yng28rdlzn3fsdq0rkykgqhz62mysq3" />
      </div>
    </Component>
  </Card>
);

const Steppers = () => {
  const steps = ["step1", "step2", "step3"];
  return (
    <Card title="Steppers">
      <Component title="Stepper">
        <Stepper autoplay={{ delayInMs: 1000 }}>
          {steps.map((step) => (
            <Step key={step}>
              <span className="b-wosmongton-700 m-2 rounded-xl border-2 p-2">
                {step}
              </span>
            </Step>
          ))}
        </Stepper>
      </Component>
      <Component title="Stepper Stop On Hover">
        <Stepper autoplay={{ delayInMs: 1000, stopOnHover: true }}>
          {steps.map((step) => (
            <Step key={step}>
              <span className="b-wosmongton-700 m-2 rounded-xl border-2 p-2">
                {step}
              </span>
            </Step>
          ))}
        </Stepper>
      </Component>
      <Component title="Stepper Stop On Last Slide">
        <Stepper autoplay={{ delayInMs: 1000, stopOnLastSlide: true }}>
          {steps.map((step) => (
            <Step key={step}>
              <span className="b-wosmongton-700 m-2 rounded-xl border-2 p-2">
                {step}
              </span>
            </Step>
          ))}
        </Stepper>
      </Component>
    </Card>
  );
};

const Components: NextPage = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h1>Components Library</h1>

      <Switches />

      <Buttons />

      <Checkboxes />

      <RadiosShadcn />
      <Radios />

      <InputsShadcn />
      <Inputs />

      <Sliders />

      <FontSize />
      <Color />
      <Icons />
      <Assets />

      <CustomButtons />
      <Tooltips />
      <Loaders />

      <RadiosWithOptions />

      <MenuDropdowns />
      <CheckboxSelects />
      <StakeTabs />
      <QRCodes />
      <Steppers />
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
