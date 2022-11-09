import { FunctionComponent, ReactElement, useState, useRef } from "react";
import classNames from "classnames";
import { CustomClasses } from "../types";

export const TabBox: FunctionComponent<
  {
    tabs: ({
      title: string | ReactElement;
      content: ReactElement;
    } & CustomClasses)[];
    /** Manage state yourself by passing in the current tab index and handler.
     *  If undefined, tab selection logic will be managed for you.
     *  Useful for setting current tab externally.
     */
    tabSelection?: {
      selectedTabIndex: number;
      onTabSelected: (index: number) => void;
    };
    /** Use React to re-render tab contents instead of hiding non-current tabs with CSS.
     *  Useful if using small components with `useEffect` hooks, though less efficient and state-resetting.
     */
    rerenderTabs?: boolean;
  } & CustomClasses
> = ({ tabs, tabSelection, rerenderTabs, className }) => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const tabscrollRef = useRef(null);

  const selectedTabI =
    tabSelection?.selectedTabIndex !== undefined
      ? tabSelection.selectedTabIndex
      : selectedTabIndex;
  const setTabI = tabSelection?.onTabSelected || setSelectedTabIndex;

  const scrollTabIntoView = (index: number) => {
    const tab = document.getElementById(`tab-box-${index}`);
    if (tab) {
      tab.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  return (
    <div className={classNames(className)}>
      <div className="flex py-4 whitespace-nowrap overflow-x-auto no-scrollbar">
        {tabs.map(({ title, className: tabClassName }, index) => (
          <button
            id={`tab-box-${index}`}
            ref={tabscrollRef}
            key={index}
            className={classNames(
              "w-full text-center py-1 px-5 cursor-pointer",
              tabClassName
            )}
            onClick={() => {
              setTabI(index);
              scrollTabIntoView(index);
            }}
          >
            {typeof title === "string" ? (
              <span
                className={classNames("subtitle1 text-wosmongton-100", {
                  "border-b-4 border-wosmongton-100": selectedTabI === index,
                  "border-b opacity-40 border-white-full/[.12] hover:opacity-60":
                    selectedTabI !== index,
                })}
              >
                {title}
              </span>
            ) : (
              <>{title}</>
            )}
          </button>
        ))}
      </div>
      <div>
        {rerenderTabs
          ? tabs.find((_tab, index) => index === selectedTabI)?.content ?? (
              <span>Tab not found</span>
            )
          : tabs.map(({ content }, index) => (
              <div
                key={index}
                className={classNames({ hidden: index !== selectedTabI })} // use css to hide and keep components in memory
              >
                {content}
              </div>
            ))}
      </div>
    </div>
  );
};
