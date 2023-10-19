import { NotifiFrontendClient } from "@notifi-network/notifi-frontend-client";
import {
  useNotifiClientContext,
  useNotifiForm,
} from "@notifi-network/notifi-react-card";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useNotifiConfig } from "~/integrations/notifi/notifi-config-context";

export type TargetGroupFragment = Awaited<
  ReturnType<NotifiFrontendClient["getTargetGroups"]>
>[number];

type TargetStates = Readonly<{
  targetGroup: TargetGroupFragment | undefined;
  emailSelected: boolean;
  telegramSelected: boolean;
  smsSelected: boolean;
}>;

export const useNotifiSetting = () => {
  const config = useNotifiConfig();
  const { client } = useNotifiClientContext();
  const {
    setEmail: setFormEmail,
    setPhoneNumber: setFormPhoneNumber,
    setTelegram: setFormTelegram,
  } = useNotifiForm();
  const [alertStates, setAlertStates] = useState<Record<string, boolean>>({});
  const [targetStates, setTargetStates] = useState<TargetStates>({
    targetGroup: undefined,
    emailSelected: false,
    telegramSelected: false,
    smsSelected: false,
  });

  const initialAlertStates = useMemo<Record<string, boolean>>(() => {
    if (config.state !== "fetched") {
      return {};
    }

    const alerts = client.data?.alerts ?? [];
    const newStates: Record<string, boolean> = {};
    config.data.eventTypes.forEach((row) => {
      const isActive = alerts.find((it) => it?.name === row.name) !== undefined;
      newStates[row.name] = isActive;
    });
    return newStates;
  }, [client, config]);

  useEffect(() => {
    if (
      Object.keys(alertStates).length === 0 &&
      Object.keys(initialAlertStates).length !== 0
    ) {
      setAlertStates(initialAlertStates);
    }
  }, [initialAlertStates, alertStates]);

  const needsSave = useMemo<"alerts" | "targets" | null>(() => {
    // Changed alerts need save
    if (config.state === "fetched") {
      for (let i = 0; i < config.data.eventTypes.length; ++i) {
        const row = config.data.eventTypes[i];
        if (initialAlertStates[row.name] !== alertStates[row.name]) {
          return "alerts";
        }
      }
    }

    const isOriginalEmailExist = !!targetStates.targetGroup?.emailTargets?.[0];
    const isOriginalPhoneNumberExist =
      !!targetStates.targetGroup?.smsTargets?.[0];
    const isOriginalTelegramExist =
      !!targetStates.targetGroup?.telegramTargets?.[0];
    if (
      (isOriginalEmailExist && !targetStates.emailSelected) ||
      (isOriginalPhoneNumberExist && !targetStates.smsSelected) ||
      (isOriginalTelegramExist && !targetStates.telegramSelected)
    ) {
      return "targets";
    } else {
      return null;
    }
  }, [config, targetStates, initialAlertStates, alertStates]);

  const revertChanges = useCallback(() => {
    setAlertStates(initialAlertStates);
    const targetGroup = client.data?.targetGroups?.find(
      (it) => it.name === "Default"
    );
    if (targetGroup === undefined) {
      return;
    }
    const emailTarget = targetGroup.emailTargets?.[0];
    const emailSelected = emailTarget !== undefined;
    const telegramTarget = targetGroup.telegramTargets?.[0];
    const telegramSelected = telegramTarget !== undefined;
    const smsTarget = targetGroup.smsTargets?.[0];
    const smsSelected = smsTarget !== undefined;
    setFormEmail(emailTarget?.emailAddress ?? "");
    setFormTelegram(telegramTarget?.telegramId ?? "");
    setFormPhoneNumber(smsTarget?.phoneNumber ?? "");
    setTargetStates({
      targetGroup,
      emailSelected,
      telegramSelected,
      smsSelected,
    });
  }, []);

  useEffect(() => {
    const targetGroup = client.data?.targetGroups?.find(
      (it) => it.name === "Default"
    );
    if (targetGroup === targetStates.targetGroup) {
      return;
    }

    if (targetGroup !== undefined) {
      const emailTarget = targetGroup.emailTargets?.[0];
      const emailSelected = emailTarget !== undefined;
      const telegramTarget = targetGroup.telegramTargets?.[0];
      const telegramSelected = telegramTarget !== undefined;
      const smsTarget = targetGroup.smsTargets?.[0];
      const smsSelected = smsTarget !== undefined;
      setFormEmail(emailTarget?.emailAddress ?? "");
      setFormTelegram(telegramTarget?.telegramId ?? "");
      setFormPhoneNumber(smsTarget?.phoneNumber ?? "");
      setTargetStates({
        targetGroup,
        emailSelected,
        telegramSelected,
        smsSelected,
      });
    } else {
      setTargetStates({
        targetGroup: undefined,
        emailSelected: false,
        telegramSelected: false,
        smsSelected: false,
      });
    }
  }, [client, targetStates, setFormEmail, setFormPhoneNumber, setFormTelegram]);

  return {
    alertStates,
    setAlertStates,
    targetStates,
    setTargetStates,
    needsSave,
    revertChanges,
  };
};
