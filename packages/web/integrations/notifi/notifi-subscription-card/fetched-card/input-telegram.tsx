import {
  useNotifiClientContext,
  useNotifiSubscribe,
} from "@notifi-network/notifi-react-card";
import {
  FunctionComponent,
  InputHTMLAttributes,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Button } from "~/components/buttons";
import { Switch } from "~/components/control";
import { SpriteIconId } from "~/config";
import { TargetGroupFragment } from "~/integrations/notifi/hooks/use-notifi-setting";
import { InputWithIcon } from "~/integrations/notifi/notifi-subscription-card/fetched-card/input-with-icon";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  iconId: SpriteIconId;
  selected: boolean;
  setSelected: (selected: boolean) => void;
  verifyTargets: () => Promise<TargetGroupFragment | undefined>;
}

export const InputTelegram: FunctionComponent<Props> = ({
  iconId,
  selected,
  setSelected,
  verifyTargets,
  ...inputProps
}: Props) => {
  const { client } = useNotifiClientContext();

  const [isVerificationRequested, setIsVerificationRequested] =
    useState<boolean>(false);

  const targetGroup = useMemo(() => {
    return client.data?.targetGroups?.find((it) => it.name === "Default");
  }, [client]);

  const { reload, isAuthenticated } = useNotifiSubscribe({
    targetGroupName: "Default",
  });

  const telegramVerificationLink = useMemo<string | undefined>(() => {
    const telegramTarget = targetGroup?.telegramTargets?.[0];
    if (telegramTarget === undefined || telegramTarget.isConfirmed) {
      return undefined;
    }
    return telegramTarget.confirmationUrl;
  }, [client, targetGroup]);

  const telegramRegex = new RegExp(/^(\@)?([A-Za-z0-9_]{1,})$/);

  useEffect(() => {
    return () => {
      setIsVerificationRequested(false);
    };
  }, [(targetGroup?.emailTargets ?? []).length]);

  useEffect(() => {
    const handler = () => {
      // Ensure target is up-to-date after user returns to tab from 3rd party verification site
      if (!isAuthenticated) {
        return;
      }
      reload();
    };

    window.addEventListener("focus", handler);
    return () => {
      window.removeEventListener("focus", handler);
    };
  }, [isAuthenticated]);

  const onClick = async () => {
    if (inputProps.value?.toString()) {
      const existingTargetId = targetGroup?.telegramTargets?.[0]?.id;
      const originalTelegramId = targetGroup?.telegramTargets?.[0]?.telegramId;
      const newTelegramId = inputProps.value?.toString();

      if (existingTargetId && originalTelegramId === newTelegramId) {
        window.open(telegramVerificationLink ?? "", "_blank");
        setIsVerificationRequested(true);
        return;
      }

      verifyTargets()
        .then((targetGroup) => {
          const telegramTarget = targetGroup?.telegramTargets?.[0];
          if (!telegramTarget || telegramTarget.isConfirmed) return;
          window.open(telegramTarget.confirmationUrl ?? "", "_blank");
          setIsVerificationRequested(true);
        })
        .catch((e) => {
          console.log("error", e);
        });
    }
  };

  inputProps.onFocus = () => {
    if (!inputProps.value) {
      setSelected(true);
    }
  };
  inputProps.onBlur = () => {
    if (!inputProps.value) {
      setSelected(false);
    }
  };

  return (
    <div className="subtitle1 flex cursor-pointer select-none items-center justify-between gap-2 text-osmoverse-200">
      <InputWithIcon
        iconId={iconId}
        {...inputProps}
        className="w-[270px]"
        disabled={
          isVerificationRequested ||
          targetGroup?.telegramTargets?.[0]?.isConfirmed
        }
      />
      <Switch
        labelClassName=""
        containerClassName={`${
          !selected || targetGroup?.telegramTargets?.[0]?.isConfirmed
            ? ""
            : "hidden"
        }`}
        labelPosition="left"
        isOn={selected}
        onToggle={(toggled) => setSelected(toggled)}
      ></Switch>

      <Button
        className={`${
          selected && !targetGroup?.telegramTargets?.[0]?.isConfirmed
            ? ""
            : "hidden"
        } h-7 ${
          isVerificationRequested ? "w-[5.5625rem]" : "w-[4.625rem]"
        } rounded-[50rem] text-button`}
        size={"unstyled"}
        disabled={
          !telegramRegex.test(inputProps.value?.toString() ?? "") ||
          isVerificationRequested
        }
        onClick={onClick}
      >
        {isVerificationRequested ? "Pending" : "Verify"}
      </Button>
    </div>
  );
};
