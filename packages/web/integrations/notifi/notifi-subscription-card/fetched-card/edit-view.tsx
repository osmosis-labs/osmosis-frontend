import { NotifiFrontendClient } from "@notifi-network/notifi-frontend-client";
import {
  AlertConfiguration,
  broadcastMessageConfiguration,
  fusionToggleConfiguration,
  resolveStringRef,
  useNotifiClientContext,
  useNotifiForm,
  useNotifiSubscribe,
  useNotifiSubscriptionContext,
} from "@notifi-network/notifi-react-card";
import classNames from "classnames";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Button } from "~/components/buttons";

import { useNotifiConfig } from "../../notifi-config-context";
import { useNotifiModalContext } from "../../notifi-modal-context";
import { AlertList } from "./alert-list";
import styles from "./edit-view.module.css";

type TargetGroupFragment = Awaited<
  ReturnType<NotifiFrontendClient["getTargetGroups"]>
>[number];

type EditState = Readonly<{
  targetGroup: TargetGroupFragment | undefined;
  emailSelected: boolean;
  telegramSelected: boolean;
  smsSelected: boolean;
}>;

export const EditView: FunctionComponent = () => {
  const config = useNotifiConfig();
  const { account } = useNotifiModalContext();
  const { subscribe } = useNotifiSubscribe({
    targetGroupName: "Default",
  });

  const { client } = useNotifiClientContext();

  const {
    email: originalEmail,
    phoneNumber: originalPhoneNunmber,
    telegramId: originalTelegram,
    loading,
  } = useNotifiSubscriptionContext();

  const { formState, setEmail, setPhoneNumber, setTelegram } = useNotifiForm();

  const initialToggleStates = useMemo<Record<string, boolean>>(() => {
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

  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({});
  const [editState, setEditState] = useState<EditState>({
    targetGroup: undefined,
    emailSelected: false,
    telegramSelected: false,
    smsSelected: false,
  });

  const needsSave = useMemo<"alerts" | "targets" | null>(() => {
    if (config.state === "fetched") {
      for (let i = 0; i < config.data.eventTypes.length; ++i) {
        const row = config.data.eventTypes[i];
        if (initialToggleStates[row.name] !== toggleStates[row.name]) {
          return "alerts";
        }
      }
    }

    if (editState.targetGroup === undefined) {
      return (editState.emailSelected && formState.email !== "") ||
        (editState.telegramSelected && formState.telegram !== "") ||
        (editState.smsSelected && formState.phoneNumber !== "")
        ? "targets"
        : null;
    } else {
      let tgId = originalTelegram;
      if (tgId.startsWith("@")) {
        tgId = tgId.substring(1);
      }
      return (editState.emailSelected && formState.email !== originalEmail) ||
        (!editState.emailSelected && originalEmail !== "") ||
        (editState.smsSelected &&
          formState.phoneNumber !== originalPhoneNunmber) ||
        (!editState.smsSelected && originalPhoneNunmber !== "") ||
        (editState.telegramSelected && formState.telegram !== tgId) ||
        (!editState.telegramSelected && tgId !== "")
        ? "targets"
        : null;
    }
  }, [
    config,
    editState,
    formState,
    initialToggleStates,
    originalEmail,
    originalPhoneNunmber,
    originalTelegram,
    toggleStates,
  ]);

  const onClickSave = useCallback(async () => {
    if (needsSave === null) {
      return;
    }

    const {
      email: emailToSave,
      phoneNumber: smsToSave,
      telegram: telegramToSave,
    } = formState;
    const { emailSelected, telegramSelected, smsSelected } = editState;

    const inputs: Record<string, unknown> = {
      userWallet: account,
    };

    try {
      if (needsSave === "alerts" && config.state === "fetched") {
        const alertConfigurations: Record<string, AlertConfiguration | null> =
          {};
        for (let i = 0; i < config.data.eventTypes.length; ++i) {
          const row = config.data.eventTypes[i];
          const alert = client.data?.alerts?.find(
            (it) => it?.name === row.name
          );

          const isEnabled = toggleStates[row.name] === true;
          if (alert === undefined && isEnabled) {
            let alertConfiguration = null;
            if (row.type === "broadcast") {
              const topicName = resolveStringRef(
                row.name,
                row.broadcastId,
                inputs
              );
              alertConfiguration = broadcastMessageConfiguration({
                topicName,
              });
            } else if (row.type === "fusionToggle") {
              const fusionId = resolveStringRef(
                row.name,
                row.fusionEventId,
                inputs
              );
              const fusionSourceAddress = resolveStringRef(
                row.name,
                row.sourceAddress,
                inputs
              ).toLowerCase();
              alertConfiguration = fusionToggleConfiguration({
                fusionId,
                fusionSourceAddress,
                alertFrequency: row.alertFrequency,
              });
            } else if (row.type === "fusion") {
              const fusionId = resolveStringRef(
                row.name,
                row.fusionEventId,
                inputs
              );
              const fusionSourceAddress = resolveStringRef(
                row.name,
                row.sourceAddress,
                inputs
              ).toLowerCase();
              alertConfiguration = fusionToggleConfiguration({
                fusionId,
                fusionSourceAddress,
                alertFrequency: row.alertFrequency,
              });
            }
            alertConfigurations[row.name] = alertConfiguration;
          } else if (alert !== undefined && !isEnabled) {
            alertConfigurations[row.name] = null;
          }
        }

        await subscribe(
          alertConfigurations as Record<string, AlertConfiguration>
        );
      } else if (needsSave === "targets") {
        await client.ensureTargetGroup({
          name: "Default",
          emailAddress: emailSelected ? emailToSave : undefined,
          phoneNumber: smsSelected ? smsToSave : undefined,
          telegramId: telegramSelected ? telegramToSave : undefined,
          discordId: undefined,
        });
      }
    } catch (e: unknown) {}
  }, [
    account,
    client,
    config,
    editState,
    formState,
    needsSave,
    subscribe,
    toggleStates,
  ]);

  useEffect(() => {
    if (
      Object.keys(toggleStates).length === 0 &&
      Object.keys(initialToggleStates).length !== 0
    ) {
      setToggleStates(initialToggleStates);
    }
  }, [initialToggleStates, toggleStates]);

  useEffect(() => {
    const targetGroup = client.data?.targetGroups?.find(
      (it) => it.name === "Default"
    );
    if (targetGroup === editState.targetGroup) {
      return;
    }

    if (targetGroup !== undefined) {
      const emailTarget = targetGroup.emailTargets?.[0];
      const emailSelected = emailTarget !== undefined;
      const telegramTarget = targetGroup.telegramTargets?.[0];
      const telegramSelected = telegramTarget !== undefined;
      const smsTarget = targetGroup.smsTargets?.[0];
      const smsSelected = smsTarget !== undefined;

      setEmail(emailTarget?.emailAddress ?? "");
      setTelegram(telegramTarget?.telegramId ?? "");
      setPhoneNumber(smsTarget?.phoneNumber ?? "");
      setEditState({
        targetGroup,
        emailSelected,
        telegramSelected,
        smsSelected,
      });
    } else {
      setEditState({
        targetGroup: undefined,
        emailSelected: false,
        telegramSelected: false,
        smsSelected: false,
      });
    }
  }, [client, editState, setEmail, setPhoneNumber, setTelegram]);

  // DO NOT REMOVE: Might support target-subscription
  // const telegramVerificationLink = useMemo<string | undefined>(() => {
  //   const targetGroup = client.data?.targetGroups?.find((it) => it.name === "Default");
  //   const telegramTarget = targetGroup?.telegramTargets?.[0];
  //   if (telegramTarget === undefined || telegramTarget.isConfirmed) {
  //     return undefined;
  //   }

  //   return telegramTarget.confirmationUrl;
  // }, [client]);

  return (
    <div className="flex flex-col space-y-2">
      {/* DO NOT REMOVE: Might support target-subscription next phase
      <p className="text-center text-caption font-caption text-osmoverse-200">
        Add destinations for your notifications.
      </p>
      <InputWithSwitch
        iconId="email"
        type="email"
        placeholder="Email"
        value={formState.email}
        onChange={(e) => {
          const newValue = e.currentTarget.value;
          if (newValue === "") {
            setEditState((previous) => ({
              ...previous,
              emailSelected: false,
            }));
          } else {
            setEditState((previous) => ({
              ...previous,
              emailSelected: true,
            }));
          }
          setEmail(newValue);
        }}
        selected={editState.emailSelected}
        setSelected={(selected) => {
          setEditState((previous) => ({
            ...previous,
            emailSelected: selected,
          }));
        }}
      />
      <InputWithSwitch
        iconId="telegram"
        type="text"
        placeholder="Telegram"
        value={formState.telegram}
        onChange={(e) => {
          const newValue = e.currentTarget.value;
          if (newValue === "") {
            setEditState((previous) => ({
              ...previous,
              telegramSelected: false,
            }));
          } else {
            setEditState((previous) => ({
              ...previous,
              telegramSelected: true,
            }));
          }
          setTelegram(newValue);
        }}
        selected={editState.telegramSelected}
        setSelected={(selected) => {
          setEditState((previous) => ({
            ...previous,
            telegramSelected: selected,
          }));
        }}
      />
      {telegramVerificationLink !== undefined ? (
        <p className="w-[342px] self-center text-caption font-caption">
          <a
            href={telegramVerificationLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Verify telegram
          </a>
        </p>
      ) : null}
      <InputWithSwitch
        iconId="smartphone"
        type="tel"
        placeholder="SMS"
        value={formState.phoneNumber}
        onChange={(e) => {
          let newValue = e.currentTarget.value;
          if (newValue !== "" && !newValue.startsWith("+")) {
            newValue = "+1" + newValue;
          }
          if (newValue === "") {
            setEditState((previous) => ({
              ...previous,
              smsSelected: false,
            }));
          } else if (newValue !== "") {
            setEditState((previous) => ({
              ...previous,
              smsSelected: true,
            }));
          }
          setPhoneNumber(newValue);
        }}
        selected={editState.smsSelected}
        setSelected={(selected) => {
          setEditState((previous) => ({
            ...previous,
            smsSelected: selected,
          }));
        }}
      /> */}
      <AlertList
        disabled={loading}
        toggleStates={toggleStates}
        setToggleStates={setToggleStates}
      />
      {needsSave !== null ? (
        <div
          className={classNames(
            styles.saveSection,
            "sticky bottom-0 left-0 right-0 flex flex-col p-3 md:p-5"
          )}
        >
          <Button
            mode="primary"
            disabled={loading}
            onClick={() => onClickSave()}
          >
            Save changes
          </Button>
        </div>
      ) : null}
    </div>
  );
};
