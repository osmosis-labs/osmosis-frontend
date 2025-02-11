import { useState } from "react";

import { Icon } from "~/components/assets";
import { MenuToggle } from "~/components/control";
import { Spinner } from "~/components/loaders";
import { CreateMobileSession } from "~/components/mobile-sessions/create-mobile-session";
import { Screen, ScreenManager } from "~/components/screen-manager";
import { GoBackButton, IconButton } from "~/components/ui/button";
import { useTranslation } from "~/hooks/language";
import { isAuthenticatorMobileSession } from "~/hooks/mutations/mobile-session/use-create-mobile-session";
import { useRemoveMobileSession } from "~/hooks/mutations/mobile-session/use-remove-mobile-session";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

interface MobileSessionsProps {
  onClose: () => void;
}

type ViewIds = "existing-sessions" | "create-session";

export function MobileSessions({ onClose }: MobileSessionsProps) {
  const { accountStore } = useStore();
  const accountAddress = accountStore.getWallet(
    accountStore.osmosisChainId
  )?.address;
  const { t } = useTranslation();
  const [currentScreen, setCurrentScreen] = useState<ViewIds>("create-session");

  const { data, isLoading } =
    api.local.oneClickTrading.getAuthenticators.useQuery(
      {
        userOsmoAddress: accountAddress!,
      },
      {
        enabled: !!accountAddress,
        select: (data) => {
          if (!data.authenticators) {
            return { authenticators: [] };
          }
          return {
            authenticators: data.authenticators
              .filter((authenticator) =>
                isAuthenticatorMobileSession({ authenticator })
              )
              // Sort by createdAt in descending order
              .reverse(),
          };
        },
      }
    );

  return (
    <div className="flex flex-col gap-4 items-center w-full pt-6">
      <GoBackButton
        onClick={() => {
          onClose();
        }}
        className="absolute top-7 left-8"
      />
      <MenuToggle
        options={
          [
            {
              id: "create-session",
              display: t("mobileSessions.createSession"),
            },
            {
              id: "existing-sessions",
              display: t("mobileSessions.existingSessions"),
            },
          ] as { id: ViewIds; display: string }[]
        }
        selectedOptionId={currentScreen}
        onSelect={(optionId) => setCurrentScreen(optionId as ViewIds)}
        classes={{
          root: "max-w-xs w-full",
        }}
      />

      <ScreenManager currentScreen={currentScreen}>
        <Screen screenName="existing-sessions">
          <div className="max-h-[300px] min-h-[30px] overflow-auto w-full flex flex-col gap-3">
            {isLoading ? (
              <div className="h-6 w-6 self-center">
                <Spinner />
              </div>
            ) : (
              data?.authenticators.map((authenticator) => (
                <AuthenticatorItem
                  key={authenticator.id}
                  id={authenticator.id}
                />
              ))
            )}
          </div>
        </Screen>
        <Screen screenName="create-session">
          <CreateMobileSession />
        </Screen>
      </ScreenManager>
    </div>
  );
}

interface AuthenticatorItemProps {
  id: string;
}

export function AuthenticatorItem({ id }: AuthenticatorItemProps) {
  const removeMobileSession = useRemoveMobileSession();
  const apiUtils = api.useUtils();

  const onDisconnect = async (authenticatorId: string) => {
    removeMobileSession.mutate(
      {
        authenticatorId,
      },
      {
        onSuccess: () => {
          apiUtils.local.oneClickTrading.getAuthenticators.invalidate();
        },
      }
    );
  };

  return (
    <div className="flex justify-between items-center">
      <h1 className="body1">Connected Device {id}</h1>
      <IconButton
        aria-label="End Session"
        onClick={() => onDisconnect(id)}
        disabled={removeMobileSession.isLoading}
      >
        {removeMobileSession.isLoading ? (
          <Spinner className="h-4 w-4" />
        ) : (
          <Icon id="trash" />
        )}
      </IconButton>
    </div>
  );
}
