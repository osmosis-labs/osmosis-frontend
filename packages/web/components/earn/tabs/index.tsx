import classNames from "classnames";
import {
  Children,
  cloneElement,
  createContext,
  PropsWithChildren,
  ReactElement,
  useContext,
  useState,
} from "react";

interface TabContextProps {
  selectedIdx: number;
  setSelectedIdx: (idx: number) => void;
}

const TabContext = createContext<TabContextProps>({
  selectedIdx: 0,
  setSelectedIdx: () => {},
});

export const Tabs = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const set = (idx: number) => setSelectedIdx(idx);

  return (
    <TabContext.Provider value={{ selectedIdx, setSelectedIdx: set }}>
      <div className={className}>{children}</div>
    </TabContext.Provider>
  );
};

interface TabButtonProps {
  tabIdx?: number;
  className?: string;
}

export const TabButtons = ({
  children,
}: {
  children: ReactElement<TabButtonProps>[];
}) => {
  const tabButtons = Children.map(children, (tabButton, idx) => {
    return cloneElement(tabButton, {
      tabIdx: idx,
    });
  });
  return <div className="flex">{tabButtons}</div>;
};

export const TabButton = ({
  children,
  tabIdx,
  className,
  textClassName,
  withTextOpacity,
}: PropsWithChildren<
  TabButtonProps & { textClassName?: string; withTextOpacity?: boolean }
>) => {
  const { selectedIdx, setSelectedIdx } = useContext(TabContext);
  return (
    <button
      onClick={() => setSelectedIdx(tabIdx!)}
      className={classNames(
        "flex items-center justify-center text-center transition-colors duration-300 ease-in-out",
        {
          "bg-osmoverse-850 opacity-100": selectedIdx === tabIdx,
          "opacity-30": withTextOpacity && selectedIdx !== tabIdx,
        },
        className
      )}
    >
      <h6
        className={classNames(
          "text-lg font-semibold text-osmoverse-100 1.5xs:text-base",
          textClassName
        )}
      >
        {children}
      </h6>
    </button>
  );
};

export const TabPanels = ({
  children,
}: {
  children: ReactElement<TabButtonProps>[];
}) => {
  const tabPanels = Children.map(children, (tabPanel, idx) => {
    return cloneElement(tabPanel, {
      tabIdx: idx,
    });
  });
  return <>{tabPanels}</>;
};

export const TabPanel = ({
  children,
  tabIdx,
  className,
  showBottomBlock,
  displayMode,
}: PropsWithChildren<
  TabButtonProps & { showBottomBlock?: boolean; displayMode?: "flex" | "block" }
>) => {
  const { selectedIdx } = useContext(TabContext);
  const isSelected = selectedIdx === tabIdx;
  return (
    <div
      className={classNames(
        "bg-osmoverse-850",
        {
          [displayMode as string]: isSelected,
        },
        className
      )}
    >
      {isSelected && children}
      {showBottomBlock && isSelected && (
        <div className="h-12 rounded-br-5xl rounded-bl-5xl bg-[#241E4B]" />
      )}
    </div>
  );
};

export const TabHeader = ({
  children,
}: PropsWithChildren<{ className?: string }>) => {
  const { selectedIdx } = useContext(TabContext);

  return (
    <div
      className={classNames(`bg-osmoverse-850`, {
        "rounded-tr-3x4pxlinset": selectedIdx === 0,
        "rounded-tl-3x4pxlinset": selectedIdx !== 0,
      })}
    >
      {children}
    </div>
  );
};
