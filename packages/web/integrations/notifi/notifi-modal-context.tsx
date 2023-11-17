import { useNotifiSubscriptionContext } from "@notifi-network/notifi-react-card";
import {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { useNotifiConfig } from "~/integrations/notifi/notifi-config-context";
import { HistoryRowData } from "~/integrations/notifi/notifi-subscription-card/fetched-card/history-rows";
import { ModalBaseProps } from "~/modals";

type Location = "history" | "expired" | "signup" | "edit" | "historyDetail";

interface NotifiModalFunctions {
  account: string;
  location: Location;
  innerState: Partial<ModalBaseProps>;
  selectedHistoryEntry?: HistoryRowData;
  setSelectedHistoryEntry: React.Dispatch<
    React.SetStateAction<HistoryRowData | undefined>
  >;
  renderView: (location: Location) => void;
  setInnerState: React.Dispatch<React.SetStateAction<Partial<ModalBaseProps>>>;
  /** The following 8 states for modalBase/Popover pop-up status*/
  isOverLayEnabled: boolean; // The background overlay (outside of the card)
  setIsOverLayEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  isInCardOverlayEnabled: boolean; // The background overlay (inside of the card)
  setIsInCardOverlayEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  isCardOpen: boolean;
  setIsCardOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isPreventingCardClosed: boolean; // Preventing card from closing while isCardOpen is true
  setIsPreventingCardClosed: React.Dispatch<React.SetStateAction<boolean>>;
  closeCard?: () => void; // close notification popover/modalBase
  setCloseCard: React.Dispatch<
    React.SetStateAction<(() => void | undefined) | undefined>
  >;
}

const NotifiModalContext = createContext<NotifiModalFunctions>({
  innerState: {},
} as unknown as NotifiModalFunctions);

export const NotifiModalContextProvider: FunctionComponent<
  PropsWithChildren<{ account: string }>
> = ({ account, children }) => {
  const { setCardView } = useNotifiSubscriptionContext();
  const [innerState, setInnerState] = useState<Partial<ModalBaseProps>>({});
  const [location, setLocation] = useState<Location>("signup");
  const [isOverLayEnabled, setIsOverLayEnabled] = useState(false);
  const [isInCardOverlayEnabled, setIsInCardOverlayEnabled] = useState(false);
  const [isPreventingCardClosed, setIsPreventingCardClosed] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(true);
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState<
    HistoryRowData | undefined
  >(undefined);
  const [closeCard, setCloseCard] = useState<() => void>();
  const config = useNotifiConfig();
  const titles = useMemo(() => {
    if (config.state === "fetched" && config.data.titles?.active) {
      return config.data.titles;
    }
    return undefined;
  }, [config]);

  const renderView = useCallback(
    // The is so that we are able to render custom view other than default SDK cardViews (history, expired, signup, edit)
    (location: Location) => {
      switch (location) {
        case "history": {
          setCardView({ state: "history" });
          setInnerState({
            title: titles?.historyView || "Notifications",
            onRequestBack: () => {
              renderView("edit");
            },
            backIcon: "setting",
          });
          setLocation("history");
          break;
        }
        case "expired": {
          setCardView({ state: "expired" });
          setInnerState({ title: titles?.expiredView || "Token expired" });
          setLocation("expired");
          break;
        }
        case "signup": {
          setCardView({ state: "signup" });
          setInnerState({ title: titles?.signupView || "" });
          setLocation("signup");
          break;
        }
        case "edit": {
          setCardView({ state: "edit" });
          setInnerState({
            title: titles?.editView || "Notification settings",
            onRequestBack: () => {
              renderView("history");
            },
          });
          setLocation("edit");
          break;
        }
        case "historyDetail": {
          setCardView({ state: "history" });
          setInnerState({
            title: titles?.alertDetailsView || "Notification Details",
            onRequestBack: () => {
              renderView("history");
              setSelectedHistoryEntry(undefined);
            },
          });
          setLocation("historyDetail");
          break;
        }
      }
    },
    [setCardView, titles]
  );

  return (
    <NotifiModalContext.Provider
      value={{
        renderView,
        account,
        innerState,
        selectedHistoryEntry,
        setSelectedHistoryEntry,
        location,
        isOverLayEnabled,
        isInCardOverlayEnabled,
        setIsOverLayEnabled,
        setIsInCardOverlayEnabled,
        isPreventingCardClosed,
        setIsPreventingCardClosed,
        isCardOpen,
        setIsCardOpen,
        setInnerState,
        closeCard,
        setCloseCard,
      }}
    >
      {children}
    </NotifiModalContext.Provider>
  );
};

export const useNotifiModalContext = (): NotifiModalFunctions => {
  const context = useContext(NotifiModalContext);
  return context;
};
