import { queryOsmosisCMS } from "@osmosis-labs/server";
import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import React, { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import IconButton from "~/components/buttons/icon-button";
import Spinner from "~/components/loaders/spinner";
import { ArrowButton } from "~/components/ui/button";
import { useFeatureFlags, useTranslation } from "~/hooks";
import { useDisclosure } from "~/hooks/use-disclosure";
import { useLocalStorageState } from "~/hooks/window/use-localstorage-state";
import { ModalBase } from "~/modals/base";

const NavbarOsmosisUpdates = () => {
  const { t } = useTranslation();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const featureFlags = useFeatureFlags();
  const [closedUpdateUrl, setClosedUpdateUrl] = useLocalStorageState(
    "osmosis-updates-closed-url",
    ""
  );
  /**
   * Fetches the latest update from the osmosis-labs/fe-content repo
   * @see https://github.com/osmosis-labs/fe-content/blob/main/cms/osmosis-update.json
   */
  const { data, isLoading } = useQuery(["osmosis-updates"], async () =>
    queryOsmosisCMS<{ iframeUrl: string }>({
      filePath: "cms/osmosis-update.json",
    })
  );

  const hasNoUpdates = !data?.iframeUrl && !isLoading;

  if (!featureFlags.osmosisUpdatesPopUp) return null;

  if (
    hasNoUpdates ||
    (closedUpdateUrl.length > 0 && closedUpdateUrl === data?.iframeUrl) ||
    isLoading
  ) {
    return null;
  }

  return (
    <>
      <div
        className={classNames(
          "relative rounded-2xl bg-osmoverse-800 p-4 shadow-[0px_6px_8px_0px_#09052433]",
          "animate-[slideInUpExtreme_0.25s_cubic-bezier(0.46,0.47,0.4,1.5)]"
        )}
      >
        <IconButton
          mode="unstyled"
          className="transition-color absolute right-2 top-2 !h-5 !w-5 !px-0 text-osmoverse-400 hover:text-osmoverse-100"
          aria-label="Close"
          icon={<Icon id="close-thin" />}
          onClick={() => {
            if (!data?.iframeUrl) return;
            setClosedUpdateUrl(data?.iframeUrl);
          }}
        />
        <div className="flex flex-col gap-2">
          <h1 className="body2 text-osmoverse-100">
            {t("osmosisUpdates.osmosisUpdates")}
          </h1>
          <ArrowButton
            className="caption !items-start gap-4 !text-left !text-bullish-300"
            classes={{
              arrowRight: "!w-4 !h-4",
            }}
            onClick={onOpen}
          >
            <div className=" flex items-start gap-1">
              <Icon id="gift" className="h-4 w-4" />
              {t("osmosisUpdates.seeWhatsNew")}
            </div>
          </ArrowButton>
        </div>
      </div>

      <OsmosisUpdateModal
        isOpen={isOpen}
        onClose={onClose}
        iframeUrl={data?.iframeUrl}
      />
    </>
  );
};

const OsmosisUpdateModal: FunctionComponent<{
  iframeUrl?: string;
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose, iframeUrl }) => {
  if (!iframeUrl) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={onClose}
      className="relative flex h-[80vh] w-[80vw] !max-w-[1920px] flex-col items-center justify-center border-4 border-wosmongton-300 !px-0 !py-0 sm:h-[90vh] sm:w-[90vh]"
    >
      <Spinner className="absolute" />
      <iframe
        className="z-10 h-full w-full"
        src={iframeUrl + "%26hide-ui%3D1"}
      ></iframe>
    </ModalBase>
  );
};

export default NavbarOsmosisUpdates;
