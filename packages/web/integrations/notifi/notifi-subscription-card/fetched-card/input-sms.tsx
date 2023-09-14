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

export const InputSms: FunctionComponent<Props> = ({
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

  const smsRegex = new RegExp(/^(\+1)([0-9]{10})$/);

  useEffect(() => {
    return () => {
      setIsVerificationRequested(false);
    };
  }, [(targetGroup?.smsTargets ?? []).length]);

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
      verifyTargets()
        .then(() => {
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
          isVerificationRequested || targetGroup?.smsTargets?.[0]?.isConfirmed
        }
      />
      <Switch
        labelClassName=""
        containerClassName={`${
          !selected || targetGroup?.smsTargets?.[0]?.isConfirmed ? "" : "hidden"
        }`}
        labelPosition="left"
        isOn={selected}
        onToggle={(toggled) => setSelected(toggled)}
      ></Switch>

      <Button
        className={`${
          selected && !targetGroup?.smsTargets?.[0]?.isConfirmed ? "" : "hidden"
        } h-7 ${
          isVerificationRequested ? "w-[5.5625rem]" : "w-[4.625rem]"
        } rounded-[50rem] text-button`}
        size={"unstyled"}
        disabled={
          !smsRegex.test(inputProps.value?.toString() ?? "") ||
          isVerificationRequested
        }
        onClick={onClick}
      >
        {isVerificationRequested ? "Pending" : "Verify"}
      </Button>
    </div>
  );
};
