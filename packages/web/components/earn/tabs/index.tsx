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

interface TabProps {
  controlledIdx: number;
  setIdx: (v: number) => void;
  externalControl: boolean;
  className: string;
}

export const Tabs = ({
  children,
  className,
  controlledIdx,
  setIdx,
  externalControl,
}: PropsWithChildren<Partial<TabProps>>) => {
  const [internalIdx, setInternalIdx] = useState(0);

  if (externalControl && controlledIdx && setIdx) {
    return (
      <TabContext.Provider
        value={{
          selectedIdx: controlledIdx,
          setSelectedIdx: setIdx,
        }}
      >
        <div className={className}>{children}</div>
      </TabContext.Provider>
    );
  }

  return (
    <TabContext.Provider
      value={{
        selectedIdx: internalIdx,
        setSelectedIdx: setInternalIdx,
      }}
    >
      <div className={className}>{children}</div>
    </TabContext.Provider>
  );
};

interface TabButtonProps {
  tabidx?: number;
  className?: string;
}

export const TabButtons = ({
  children,
}: {
  children: ReactElement<TabButtonProps>[];
}) => {
  const tabButtons = Children.map(children, (tabButton, idx) => {
    return cloneElement(tabButton, {
      tabidx: idx,
    });
  });
  return <div className="flex">{tabButtons}</div>;
};

export const TabButton = ({
  children,
  tabidx,
  className,
  textClassName,
  withTextOpacity,
  withBasePadding,
}: PropsWithChildren<
  TabButtonProps & {
    textClassName?: string;
    withTextOpacity?: boolean;
    withBasePadding?: boolean;
  }
>) => {
  const { selectedIdx, setSelectedIdx } = useContext(TabContext);
  return (
    <button
      onClick={() => setSelectedIdx(tabidx!)}
      className={classNames(
        "flex items-center justify-center text-center transition-colors duration-300 ease-in-out",
        {
          "bg-osmoverse-850 opacity-100": selectedIdx === tabidx,
          "opacity-30": withTextOpacity && selectedIdx !== tabidx,
          "1.5xs:px-4": withBasePadding,
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
      tabidx: idx,
    });
  });
  return <>{tabPanels}</>;
};

export const TabPanel = ({
  children,
  tabidx,
  className,
  displayMode,
}: PropsWithChildren<TabButtonProps & { displayMode?: "flex" | "block" }>) => {
  const { selectedIdx } = useContext(TabContext);
  const isSelected = selectedIdx === tabidx;
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
    </div>
  );
};

export const TabHeader = ({
  children,
}: {
  className?: string;
  children: ((selectedIdx: number) => ReactElement) | ReactElement;
}) => {
  const { selectedIdx } = useContext(TabContext);

  return (
    <div
      className={classNames(`bg-osmoverse-850`, {
        "rounded-tr-3x4pxlinset": selectedIdx === 0,
        "rounded-tl-3x4pxlinset": selectedIdx !== 0,
      })}
    >
      {typeof children === "function" ? children(selectedIdx) : children}
    </div>
  );
};
