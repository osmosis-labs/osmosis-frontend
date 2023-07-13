import {
  useNotifiClientContext,
  useNotifiSubscriptionContext,
} from "@notifi-network/notifi-react-card";
import { FunctionComponent, useEffect, useRef } from "react";

import { useNotifiConfig } from "../notifi-config-context";
import { useNotifiModalContext } from "../notifi-modal-context";
import { ErrorCard } from "./error-card";
import { ExpiredCard } from "./expired-card";
import { FetchedCard } from "./fetched-card";
import { LoadingCard } from "./loading-card";

export const NotifiSubscriptionCard: FunctionComponent = () => {
  const { setLocation, setIsOverLayEnabled } = useNotifiModalContext();

  const { client } = useNotifiClientContext();

  const config = useNotifiConfig();

  const { cardView, setCardView, setEmail, setTelegramId, setPhoneNumber } =
    useNotifiSubscriptionContext();
  const firstLoadRef = useRef(false);

  useEffect(() => {
    if (client.isInitialized && firstLoadRef.current !== true) {
      firstLoadRef.current = true;

      if (client.isAuthenticated) {
        setLocation("history");
      } else if (client.isTokenExpired) {
        setLocation("expired");
      } else {
        setIsOverLayEnabled(true);
        setLocation("signup");
      }
    }
  }, [client, setCardView, setLocation]);

  const { data } = client;
  useEffect(() => {
    const targetGroup = data?.targetGroups?.find((it) => it.name === "Default");
    setEmail(targetGroup?.emailTargets?.[0]?.emailAddress ?? "");
    setPhoneNumber(targetGroup?.smsTargets?.[0]?.phoneNumber ?? "");
    setTelegramId(targetGroup?.telegramTargets?.[0]?.telegramId ?? "");
  }, [data, setEmail, setPhoneNumber, setTelegramId]);

  if (!client.isInitialized || config.state === "loading") {
    return <LoadingCard />;
  } else if (client.isTokenExpired || cardView.state === "expired") {
    return <ExpiredCard />;
  } else if (config.state === "error") {
    return <ErrorCard error={config.reason} />;
  } else if (cardView.state === "error") {
    return <ErrorCard error={cardView.reason} />;
  } else {
    return <FetchedCard data={config.data} />;
  }
};
