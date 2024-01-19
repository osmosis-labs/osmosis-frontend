// import { NextPage } from "next";
// import { useState } from "react";

// import { CheckBox } from "~/components/control/checkbox";
// import { useTranslation } from "~/hooks";

// const Components: NextPage = () => {
//   const { t } = useTranslation();

//   const [checked, setChecked] = useState(false);

//   return (
//     <div className="flex flex-col">
//       <h3>Control</h3>
//       <h4>Checkbox</h4>
//       regular
//       <CheckBox isOn={checked} onToggle={() => setChecked(!checked)} />
//       indeterminate
//       <CheckBox
//         isOn={checked}
//         onToggle={() => setChecked(!checked)}
//         isIndeterminate={true}
//       />
//       disabled
//       <CheckBox
//         disabled={true}
//         isOn={checked}
//         onToggle={() => setChecked(!checked)}
//       />
//       children
//       <CheckBox
//         isOn={checked}
//         onToggle={() => setChecked(!checked)}
//         isIndeterminate={true}
//       >
//         <div>child component</div>
//       </CheckBox>
//       superfluid
//       <CheckBox
//         borderStyles="border-superfluid"
//         backgroundStyles="bg-superfluid"
//         isOn={checked}
//         onToggle={() => setChecked(!checked)}
//       />
//       rust-700
//       <CheckBox
//         borderStyles="border-rust-700"
//         backgroundStyles="bg-gradient-negative"
//         isOn={checked}
//         onToggle={() => setChecked(!checked)}
//       />
//       wosmongton-200
//       <CheckBox
//         backgroundStyles="bg-wosmongton-200"
//         borderStyles="border-wosmongton-200"
//         isOn={checked}
//         onToggle={() => setChecked(!checked)}
//       />
//     </div>
//   );
// };

// export default Components;

import { NextPage } from "next";
import { useState } from "react";

import { CheckBox } from "~/components/control/checkbox";
import { useTranslation } from "~/hooks";

const Components: NextPage = () => {
  const { t } = useTranslation();
  const [checked, setChecked] = useState(false);

  // Function to handle the checkbox state toggle
  const handleToggle = () => setChecked(!checked);

  // Component for rendering each checkbox variant
  const Component = ({
    title,
    children,
  }: {
    title: string;
    children: JSX.Element;
  }) => (
    <div className="flex flex-col gap-2">
      <h6>{title}</h6>
      {children}
    </div>
  );

  return (
    <div className="flex flex-col p-4">
      <h1>Components Library</h1>
      <h2>Control</h2>
      <div className="flex flex-col gap-2">
        <h3>Checkbox</h3>
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
      </div>
    </div>
  );
};

export default Components;
