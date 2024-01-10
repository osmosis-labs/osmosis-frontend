import {
  useNotifiClientContext,
  useNotifiSubscriptionContext,
} from "@notifi-network/notifi-react-card";
import { FunctionComponent, useEffect, useRef } from "react";

import { useNotifiConfig } from "~/integrations/notifi/notifi-config-context";
import { useNotifiModalContext } from "~/integrations/notifi/notifi-modal-context";
import { ErrorCard } from "~/integrations/notifi/notifi-subscription-card/error-card";
import { FetchedCard } from "~/integrations/notifi/notifi-subscription-card/fetched-card";
import { LoadingCard } from "~/integrations/notifi/notifi-subscription-card/loading-card";

type Props = {
  isPopoverOrModalBaseOpen: boolean;
  closeCard: () => void;
};

export const NotifiSubscriptionCard: FunctionComponent<Props> = ({
  isPopoverOrModalBaseOpen,
  closeCard,
}) => {
  const { setIsOverLayEnabled, renderView, setIsCardOpen, setCloseCard } =
    useNotifiModalContext();

  const { client } = useNotifiClientContext();

  const config = useNotifiConfig();

  const { cardView, setEmail, setTelegramId, setPhoneNumber } =
    useNotifiSubscriptionContext();
  const firstLoadRef = useRef(false);

  useEffect(() => {
    setIsCardOpen(isPopoverOrModalBaseOpen);
    setCloseCard(() => closeCard);
  }, [isPopoverOrModalBaseOpen]);

  useEffect(() => {
    if (client.isInitialized && firstLoadRef.current !== true) {
      firstLoadRef.current = true;

      if (client.isAuthenticated) {
        renderView("history");
      } else if (client.isTokenExpired) {
        renderView("expired");
      } else {
        setIsOverLayEnabled(true);
        renderView("signup");
      }
    }
  }, [client, renderView]);

  const { data } = client;
  useEffect(() => {
    const targetGroup = data?.targetGroups?.find((it) => it.name === "Default");
    setEmail(targetGroup?.emailTargets?.[0]?.emailAddress ?? "");
    setPhoneNumber(targetGroup?.smsTargets?.[0]?.phoneNumber ?? "");
    setTelegramId(targetGroup?.telegramTargets?.[0]?.telegramId ?? "");
  }, [data, setEmail, setPhoneNumber, setTelegramId]);

  if (!client.isInitialized || config.state === "loading") {
    return <LoadingCard />;
  } else if (config.state === "error") {
    return <ErrorCard error={config.reason} />;
  } else if (cardView.state === "error") {
    return <ErrorCard error={cardView.reason} />;
  } else {
    return <FetchedCard data={config.data} />;
  }
};
