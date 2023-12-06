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
      <h3 className="text-xl font-semibold text-osmoverse-100">{children}</h3>
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
      } flex-col rounded-br-5xl rounded-bl-5xl bg-osmoverse-850`}
    >
      {children}
      <div className="h-12 rounded-br-5xl rounded-bl-5xl bg-[#241E4B]" />
    </div>
  );
};

export const TabHeader = ({ children }: PropsWithChildren<unknown>) => {
  const { selectedIdx } = useContext(TabContext);

  return (
    <div
      className={`${
        selectedIdx === 0 ? "rounded-tr-3x4pxlinset" : "rounded-tl-3x4pxlinset"
      } bg-osmoverse-850`}
    >
      {children}
    </div>
  );
};
