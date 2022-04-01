import { FunctionComponent, ReactElement, useState } from "react";
import classNames from "classnames";
import { CustomClasses } from "../types";

export const TabBox: FunctionComponent<
  {
    tabs: {
      title: string;
      content: ReactElement;
    }[];
    /** Manage state yourself by passing in the current tab index and handler.
     *  If undefined, tab selection logic will be managed for you.
     *  Useful for setting current tab externally.
     */
    tabSelection?: {
      selectedTabIndex: number;
      onTabSelected: (index: number) => void;
    };
  } & CustomClasses
> = ({ tabs, tabSelection, className }) => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const selectedTabI =
    tabSelection?.selectedTabIndex !== undefined
      ? tabSelection.selectedTabIndex
      : selectedTabIndex;
  const setTabI = tabSelection?.onTabSelected || setSelectedTabIndex;

  return (
    <div className={classNames(className)}>
      <div className="flex my-4">
        {tabs.map(({ title }, index) => (
          <div
            key={index}
            className={classNames(
              "w-full text-center p-1 border-secondary-200 cursor-pointer",
              {
                "border-b-2": selectedTabI === index,
                "border-b opacity-40 hover:opacity-60": selectedTabI !== index,
              }
            )}
            onClick={() => setTabI(index)}
          >
            <span className="text-title text-secondary-200">{title}</span>
          </div>
        ))}
      </div>
      <div>
        {tabs.find((_tab, index) => index === selectedTabI)?.content ?? (
          <span>Tab not found</span>
        )}
      </div>
    </div>
  );
};
