import { NextPage } from "next";
import { useState } from "react";

import { CheckBox } from "~/components/control/checkbox";
import { CheckboxSelect } from "~/components/control/checkbox-select";
import { Radio } from "~/components/control/radio";

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
      <ul>
        <li>Language Select</li>
        <li>Menu Dropdown</li>
        <li>Menu Toggle</li>
        <li>Page List</li>
        <li>Pool Token Select</li>
        <li>Select Menu</li>
        <li>Slider</li>
        <li>Sort Menu</li>
        <li>Stake Tab</li>
        <li>Switch</li>
        <li>Tab Box</li>
        <li>Toggle</li>
        <li>Token Select With Drawer</li>
        <li>Token Select</li>
      </ul>
    </div>
  );
};

export default Components;
