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

import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { SpriteIconId } from "~/config";
import { TargetGroupFragment } from "~/integrations/notifi/hooks/use-notifi-setting";
import { InputWithIcon } from "~/integrations/notifi/notifi-subscription-card/fetched-card/input-with-icon";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  iconId: SpriteIconId;
  selected: boolean;
  setSelected: (selected: boolean) => void;
  verifyTargets: () => Promise<TargetGroupFragment | undefined>;
}

export const InputEmail: FunctionComponent<Props> = ({
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

  const { reload, isAuthenticated, resendEmailVerificationLink } =
    useNotifiSubscribe({
      targetGroupName: "Default",
    });

  const emailRegex = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

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
      const existingTargetId = targetGroup?.emailTargets?.[0]?.id;
      const originalEmail = targetGroup?.emailTargets?.[0]?.emailAddress;
      const newEmail = inputProps.value?.toString();

      if (existingTargetId && originalEmail === newEmail) {
        return resendEmailVerificationLink(existingTargetId)
          .catch(() => {
            console.error("You cannot send link too often");
          })
          .finally(() => setIsVerificationRequested(true));
      }

      verifyTargets()
        .then(() => {
          setIsVerificationRequested(true);
        })
        .catch((e) => {
          console.error(e);
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
          isVerificationRequested || targetGroup?.emailTargets?.[0]?.isConfirmed
        }
      />
      <Switch
        className={`${
          !selected || targetGroup?.emailTargets?.[0]?.isConfirmed
            ? ""
            : "hidden"
        }`}
        checked={selected}
        onCheckedChange={(toggled) => setSelected(toggled)}
      />
      <Button
        size="sm"
        variant="outline"
        className={
          selected && !targetGroup?.emailTargets?.[0]?.isConfirmed
            ? ""
            : "hidden"
        }
        disabled={
          !emailRegex.test(inputProps.value?.toString() ?? "") ||
          isVerificationRequested
        }
        onClick={onClick}
      >
        {isVerificationRequested ? "Pending" : "Verify"}
      </Button>
    </div>
  );
};
