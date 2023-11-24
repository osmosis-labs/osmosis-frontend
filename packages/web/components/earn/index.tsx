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
}: PropsWithChildren<TabButtonProps>) => {
  const { selectedIdx, setSelectedIdx } = useContext(TabContext);
  return (
    <button
      onClick={() => setSelectedIdx(tabIdx!)}
      className={`flex min-h-[100px] flex-1 items-center justify-center rounded-tl-3x4pxlinset rounded-tr-3x4pxlinset transition-colors duration-300 ease-in-out ${
        selectedIdx === tabIdx ? "bg-osmoverse-850" : ""
      } text-center`}
    >
      <p className="text-xl font-semibold text-osmoverse-100">{children}</p>
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
}: PropsWithChildren<TabButtonProps>) => {
  const { selectedIdx } = useContext(TabContext);
  return (
    <div
      className={`${
        selectedIdx === tabIdx ? "flex" : "hidden"
      } h-[689px] flex-col ${
        selectedIdx === 0 ? "rounded-tr-3x4pxlinset" : "rounded-tl-3x4pxlinset"
      } bg-osmoverse-850`}
    >
      {children}
    </div>
  );
};
