import { useNotifiSubscriptionContext } from "@notifi-network/notifi-react-card";
import {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ModalBaseProps } from "~/modals";

import { useNotifiConfig } from "./notifi-config-context";

type Location = "history" | "expired" | "signup" | "edit" | "historyDetail";

interface NotifiModalFunctions {
  account: string;
  location: Location;
  innerState: Partial<ModalBaseProps>;
  isOverLayEnabled: boolean;
  setIsOverLayEnabled: (isOverLayEnabled: boolean) => void;
  setLocation: (newLocation: Location) => void;
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
  const config = useNotifiConfig();
  const titles = useMemo(() => {
    if (config.state === "fetched" && config.data.titles?.active) {
      return config.data.titles;
    }
    return undefined;
  }, [config]);

  useEffect(() => {
    switch (location) {
      case "history": {
        setCardView({ state: "history" });
        setInnerState({
          title: titles?.historyView || "Notifications",
          onRequestBack: () => {
            setLocation("edit");
          },
          backIcon: "setting",
        });
        break;
      }
      case "expired": {
        setCardView({ state: "expired" });
        setInnerState({ title: titles?.expiredView || "Token expired" });
        break;
      }
      case "signup": {
        setCardView({ state: "signup" });
        setInnerState({ title: titles?.signupView || "" });
        break;
      }
      case "edit": {
        setCardView({ state: "edit" });
        setInnerState({
          title: titles?.editView || "Notification settings",
          onRequestBack: () => {
            setLocation("history");
          },
        });
        break;
      }
      case "historyDetail": {
        setCardView({ state: "history" });
        setInnerState({
          title: titles?.alertDetailsView || "Notification Details",
          onRequestBack: () => {
            setLocation("history");
          },
        });
        break;
      }
    }
  }, [location, setCardView, titles]);

  return (
    <NotifiModalContext.Provider
      value={{
        account,
        innerState,
        location,
        setLocation,
        isOverLayEnabled,
        setIsOverLayEnabled,
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
