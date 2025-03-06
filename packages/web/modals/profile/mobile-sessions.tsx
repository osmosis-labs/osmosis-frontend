import { useState } from "react";

import { Icon } from "~/components/assets";
import { MenuToggle } from "~/components/control";
import { Spinner } from "~/components/loaders";
import { CreateMobileSession } from "~/components/mobile-sessions/create-mobile-session";
import { Screen, ScreenManager } from "~/components/screen-manager";
import { Button, GoBackButton, IconButton } from "~/components/ui/button";
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
  const removeMobileSession = useRemoveMobileSession();
  const apiUtils = api.useUtils();

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
          console.log(data.authenticators);
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

  const handleClearAllSessions = () => {
    if (!data || !data.authenticators || data.authenticators.length === 0)
      return;

    const authenticatorIds = data.authenticators.map(
      (authenticator) => authenticator.id
    );

    removeMobileSession.mutate(
      {
        authenticatorIds,
      },
      {
        onSuccess: () => {
          apiUtils.local.oneClickTrading.getAuthenticators.invalidate();
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full pt-6 max-w-md mx-auto">
      <GoBackButton
        onClick={onClose}
        className="absolute top-7 left-8 hover:bg-osmoverse-800 transition-colors"
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
          root: "max-w-xs w-full shadow-sm",
          toggleContainer: "font-medium",
        }}
      />

      <div className="w-full rounded-xl p-6 shadow-md">
        <ScreenManager currentScreen={currentScreen}>
          <Screen screenName="existing-sessions">
            <div className="flex flex-col gap-4 w-full">
              <div className="max-h-[300px] min-h-[30px] overflow-auto w-full flex flex-col gap-4">
                {isLoading ? (
                  <div className="h-10 w-full flex items-center justify-center">
                    <Spinner className="h-6 w-6" />
                  </div>
                ) : data?.authenticators.length === 0 ? (
                  <div className="text-center py-4 text-osmoverse-300">
                    No connected devices found
                  </div>
                ) : (
                  data?.authenticators.map((authenticator) => (
                    <AuthenticatorItem
                      key={authenticator.id}
                      id={authenticator.id}
                      disabled={removeMobileSession.isLoading}
                    />
                  ))
                )}
              </div>

              {data &&
                data.authenticators &&
                data.authenticators.length > 1 && (
                  <Button
                    variant="secondary"
                    className="mt-4 w-full"
                    onClick={handleClearAllSessions}
                    disabled={removeMobileSession.isLoading}
                  >
                    {removeMobileSession.isLoading ? (
                      <Spinner className="h-4 w-4 mr-2" />
                    ) : (
                      <Icon id="trash" className="h-5 w-5 mr-2" />
                    )}
                    Clear All Sessions
                  </Button>
                )}
            </div>
          </Screen>
          <Screen screenName="create-session">
            <CreateMobileSession />
          </Screen>
        </ScreenManager>
      </div>
    </div>
  );
}

interface AuthenticatorItemProps {
  id: string;
  disabled?: boolean;
}

export function AuthenticatorItem({ id, disabled }: AuthenticatorItemProps) {
  const removeMobileSession = useRemoveMobileSession();
  const apiUtils = api.useUtils();
  const { accountStore } = useStore();
  const accountAddress = accountStore.getWallet(
    accountStore.osmosisChainId
  )?.address;

  // Fetch metadata for this authenticator
  const { data: metadataData, isLoading: isMetadataLoading } =
    api.edge.mobileSession.fetchMetadata.useQuery(
      {
        accountAddress: accountAddress || "",
        authenticatorId: id,
      },
      {
        enabled: !!accountAddress,
        staleTime: 5 * 60 * 1000, // 5 minutes
      }
    );

  const onDisconnect = async (authenticatorId: string) => {
    removeMobileSession.mutate(
      {
        authenticatorIds: [authenticatorId],
      },
      {
        onSuccess: () => {
          apiUtils.local.oneClickTrading.getAuthenticators.invalidate();
        },
      }
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get device display name from brand and model
  const getDeviceDisplayName = () => {
    if (!metadataData?.metadata) return "Mobile Device";

    const { deviceBrand, deviceModel } = metadataData.metadata;
    if (deviceBrand && deviceModel) {
      return `${deviceBrand} ${deviceModel}`;
    } else if (deviceBrand) {
      return deviceBrand;
    } else if (deviceModel) {
      return deviceModel;
    }
    return "Mobile Device";
  };

  return (
    <div className="flex justify-between items-center p-3 bg-osmoverse-825 rounded-lg hover:bg-osmoverse-800 transition-colors">
      <div className="flex items-center gap-3">
        <div className="bg-osmoverse-700 p-2 rounded-full">
          <Icon id="smartphone" className="h-5 w-5 text-wosmongton-100" />
        </div>

        <div>
          <h3 className="body1 font-medium text-white-full">
            {getDeviceDisplayName()}
          </h3>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-osmoverse-300">ID: {id}</p>
            {isMetadataLoading ? (
              <p className="text-xs text-osmoverse-300">Loading metadata...</p>
            ) : metadataData?.metadata?.createdAt ? (
              <p className="text-xs text-osmoverse-300">
                Created: {formatDate(metadataData.metadata.createdAt)}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <IconButton
        aria-label="End Session"
        onClick={() => onDisconnect(id)}
        disabled={removeMobileSession.isLoading}
        variant="ghost"
        className="hover:bg-rust-700/30 hover:text-rust-200 transition-colors"
      >
        {removeMobileSession.isLoading ? (
          <Spinner className="h-4 w-4" />
        ) : (
          <Icon id="trash" className="h-5 w-5" />
        )}
      </IconButton>
    </div>
  );
}
