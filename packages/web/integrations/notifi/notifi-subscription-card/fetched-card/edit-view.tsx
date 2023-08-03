import {
  AlertConfiguration,
  useNotifiClientContext,
  useNotifiForm,
  useNotifiSubscribe,
  useNotifiSubscriptionContext,
} from "@notifi-network/notifi-react-card";
import classNames from "classnames";
import { FunctionComponent, useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-multi-lang";

import { Button } from "~/components/buttons";
import { useNotifiSetting } from "~/integrations/notifi/hooks/use-notifi-setting";
import { useNotifiConfig } from "~/integrations/notifi/notifi-config-context";
import { useNotifiModalContext } from "~/integrations/notifi/notifi-modal-context";
import { AlertList } from "~/integrations/notifi/notifi-subscription-card/fetched-card/alert-list";
import styles from "~/integrations/notifi/notifi-subscription-card/fetched-card/edit-view.module.css";
import { InputEmail } from "~/integrations/notifi/notifi-subscription-card/fetched-card/input-email";
import { InputSms } from "~/integrations/notifi/notifi-subscription-card/fetched-card/input-sms";
import { InputTelegram } from "~/integrations/notifi/notifi-subscription-card/fetched-card/input-telegram";

export const EditView: FunctionComponent = () => {
  const config = useNotifiConfig();
  const { account, setIsInCardOverlayEnabled, isInCardOverlayEnabled } =
    useNotifiModalContext();
  const { subscribe } = useNotifiSubscribe({
    targetGroupName: "Default",
  });
  const t = useTranslation();
  const { client } = useNotifiClientContext();

  const { loading, setLoading } = useNotifiSubscriptionContext();

  const { formState, setEmail, setPhoneNumber, setTelegram } = useNotifiForm();

  const { setIsPreventingCardClosed, isPreventingCardClosed } =
    useNotifiModalContext();

  const {
    alertStates,
    setAlertStates,
    targetStates,
    setTargetStates,
    needsSave,
    revertChanges,
  } = useNotifiSetting();
  const { setInnerState, renderView, isCardOpen } = useNotifiModalContext();

  const toggleDiscardChangesModal = useCallback(
    (enable?: boolean) => {
      setIsInCardOverlayEnabled((prev) => enable ?? !prev);
      setIsPreventingCardClosed((prev) => enable ?? !prev);
    },
    [setIsInCardOverlayEnabled]
  );

  useEffect(() => {
    if (isPreventingCardClosed && !isCardOpen) {
      toggleDiscardChangesModal(true);
    }
  }, [isCardOpen]);

  useEffect(() => {
    // Reason not in hooks/: adopt custom logic with local variable before renderView
    setInnerState((prev) => ({
      ...prev,
      onRequestBack: () => {
        if (needsSave) {
          toggleDiscardChangesModal(true);
          return setIsPreventingCardClosed(true);
        }
        renderView("history");
      },
    }));

    setIsPreventingCardClosed(needsSave ? true : false);
    return () => toggleDiscardChangesModal(false);
  }, [needsSave]);

  const isSaveOrDiscardModalShown = useMemo(
    () => isPreventingCardClosed && isInCardOverlayEnabled,
    [isPreventingCardClosed, isInCardOverlayEnabled]
  );

  const onClickSave = useCallback(async () => {
    if (config.state !== "fetched") return new Error("config not fetched");
    if (needsSave === null) return;
    const broadcastMessageConfiguration = (
      await import("@notifi-network/notifi-react-card")
    ).broadcastMessageConfiguration;
    const fusionToggleConfiguration = (
      await import("@notifi-network/notifi-react-card")
    ).fusionToggleConfiguration;
    const resolveStringRef = (await import("@notifi-network/notifi-react-card"))
      .resolveStringRef;

    const {
      email: emailToSave,
      phoneNumber: smsToSave,
      telegram: telegramToSave,
    } = formState;
    const { emailSelected, telegramSelected, smsSelected } = targetStates;

    const inputs: Record<string, unknown> = {
      userWallet: account,
    };

    try {
      if (needsSave === "alerts") {
        const alertConfigurations: Record<string, AlertConfiguration | null> =
          {};
        for (let i = 0; i < config.data.eventTypes.length; ++i) {
          const row = config.data.eventTypes[i];
          const alert = client.data?.alerts?.find(
            (it) => it?.name === row.name
          );

          const isEnabled = alertStates[row.name] === true;
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
      }
      await client.ensureTargetGroup({
        name: "Default",
        emailAddress: emailSelected ? emailToSave : undefined,
        phoneNumber: smsSelected ? smsToSave : undefined,
        telegramId: telegramSelected ? telegramToSave : undefined,
        discordId: undefined,
      });
    } catch (e: unknown) {}
  }, [
    account,
    client,
    config,
    targetStates,
    formState,
    needsSave,
    subscribe,
    alertStates,
  ]);

  const verifyTargets = useCallback(
    async (preventDefault?: boolean) => {
      if (preventDefault) return;
      return await client.ensureTargetGroup({
        name: "Default",
        emailAddress: targetStates.emailSelected ? formState.email : undefined,
        phoneNumber: targetStates.smsSelected
          ? formState.phoneNumber
          : undefined,
        telegramId: targetStates.telegramSelected
          ? formState.telegram.startsWith("@")
            ? formState.telegram.substring(1)
            : formState.telegram
          : undefined,
        discordId: undefined,
      });
    },
    [client, targetStates, formState]
  );

  return (
    <div className="flex h-full flex-col">
      <p className="mb-3 px-10 text-caption font-caption text-osmoverse-200">
        Add additional channels to receive your notifications.
      </p>
      <div className="mb-[1.25rem] flex flex-col gap-3 px-10">
        <InputEmail
          verifyTargets={verifyTargets}
          iconId="email"
          type="email"
          placeholder="Email"
          value={formState.email}
          onChange={(e) => {
            const newValue = e.currentTarget.value;
            if (newValue === "") {
              setTargetStates((previous) => ({
                ...previous,
                emailSelected: false,
              }));
            } else {
              setTargetStates((previous) => ({
                ...previous,
                emailSelected: true,
              }));
            }
            setEmail(newValue);
          }}
          selected={targetStates.emailSelected}
          setSelected={(selected) => {
            setTargetStates((previous) => ({
              ...previous,
              emailSelected: selected,
            }));
          }}
        />
        <InputTelegram
          iconId="telegram"
          type="text"
          placeholder="Telegram"
          value={formState.telegram}
          verifyTargets={verifyTargets}
          onChange={(e) => {
            const newValue = e.currentTarget.value;
            if (newValue === "") {
              setTargetStates((previous) => ({
                ...previous,
                telegramSelected: false,
              }));
            } else {
              setTargetStates((previous) => ({
                ...previous,
                telegramSelected: true,
              }));
            }
            setTelegram(newValue);
          }}
          selected={targetStates.telegramSelected}
          setSelected={(selected) => {
            setTargetStates((previous) => ({
              ...previous,
              telegramSelected: selected,
            }));
          }}
        />
        <InputSms
          verifyTargets={verifyTargets}
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
              setTargetStates((previous) => ({
                ...previous,
                smsSelected: false,
              }));
            } else if (newValue !== "") {
              setTargetStates((previous) => ({
                ...previous,
                smsSelected: true,
              }));
            }
            setPhoneNumber(newValue);
          }}
          selected={targetStates.smsSelected}
          setSelected={(selected) => {
            setTargetStates((previous) => ({
              ...previous,
              smsSelected: selected,
            }));
          }}
        />
      </div>
      <AlertList
        disabled={loading}
        toggleStates={alertStates}
        setToggleStates={setAlertStates}
      />
      {!!needsSave && !isSaveOrDiscardModalShown ? (
        <div
          className={classNames(
            styles.saveSection,
            "sticky bottom-0 left-0 right-0  px-[2.5rem] pt-[1.25rem] pb-[2.25rem] md:p-5"
          )}
        >
          <Button
            mode="primary"
            disabled={loading}
            onClick={() => onClickSave()}
          >
            {t("notifi.saveChanges")}
          </Button>
        </div>
      ) : null}
      <div
        className={`bg-black-full absolute top-[-4.8125rem] left-0 right-0 bottom-0 flex flex-col items-center justify-center ${
          isSaveOrDiscardModalShown ? "" : "hidden"
        }`}
      >
        <div className="fixed z-[10] flex w-[15.875rem] flex-col items-center gap-3">
          <p className="z-[52] mb-3 w-full text-center text-subtitle1">
            {t("notifi.unsavedChangeModalInfo")}
          </p>
          <Button
            className="z-[5] w-[20.8125rem]"
            size={"normal"}
            disabled={loading}
            onClick={() => {
              setLoading(true);
              onClickSave().finally(() => {
                setLoading(false);
                toggleDiscardChangesModal(false);
                renderView("history");
              });
            }}
          >
            {t("notifi.saveChanges")}
          </Button>
          <Button
            className="z-[52] w-[20.8125rem]"
            size={"normal"}
            mode={"secondary"}
            disabled={loading}
            onClick={() => {
              revertChanges();
              toggleDiscardChangesModal(false);
              renderView("history");
            }}
          >
            {t("notifi.discardButton")}
          </Button>
        </div>
      </div>
    </div>
  );
};
