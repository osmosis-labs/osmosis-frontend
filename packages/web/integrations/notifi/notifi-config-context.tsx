import {
  SubscriptionCardState,
  useSubscriptionCard,
} from "@notifi-network/notifi-react-card";
import {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useContext,
} from "react";

const NotifiConfig = createContext<SubscriptionCardState>({
  state: "loading",
});

export const useNotifiConfig = () => {
  return useContext(NotifiConfig);
};

type Input = Parameters<typeof useSubscriptionCard>[0];

export const NotifiConfigContext: FunctionComponent<
  PropsWithChildren<Input>
> = ({ children, ...input }) => {
  const card = useSubscriptionCard(input);

  return <NotifiConfig.Provider value={card}>{children}</NotifiConfig.Provider>;
};
