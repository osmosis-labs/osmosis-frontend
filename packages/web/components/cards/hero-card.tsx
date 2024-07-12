import classNames from "classnames";
import React from "react";

import { Icon } from "~/components/assets";
import { IconLink } from "~/components/cards/icon-link";
import { EventName } from "~/config";
import { useTranslation } from "~/hooks";
import { useAmplitudeAnalytics } from "~/hooks";

export const HeroCard: React.FunctionComponent<{
  title: string;
  subtitle: string;
  imageUrl: string;
  fallbackImageUrl?: string;
  label?: string;
  githubUrl?: string;
  twitterUrl?: string;
  externalUrl: string;
  mediumUrl?: string;
}> = ({
  title,
  subtitle,
  imageUrl,
  label,
  githubUrl,
  externalUrl,
  mediumUrl,
  twitterUrl,
}) => {
  const { t } = useTranslation();
  const { logEvent } = useAmplitudeAnalytics();

  const utmParams = new URLSearchParams({
    utm_source: "OsmosisAppStore",
    utm_medium: "AppCard",
    utm_campaign: title || "UntitledApp",
  }).toString();

  const externalUrlWithUTM = externalUrl + `?${utmParams}`;

  const handleAppClicked = () => {
    logEvent([
      EventName.AppStore.appClicked,
      { appName: title, isFeatured: true, isBanner: true },
    ]);
    window.open(externalUrlWithUTM, "_blank", "noopener noreferrer");
  };

  return (
    <div className="relative pt-8">
      <div className="body2 mb-2 pl-6 font-bold text-osmoverse-200">
        {label ? label : t("store.featured")}
      </div>
      <div
        onClick={handleAppClicked}
        className="group relative flex h-[400px] cursor-pointer items-end overflow-hidden rounded-2xl sm:h-[300px]"
      >
        <img
          src={imageUrl}
          alt={`Featured app: ${title}`}
          className={classNames(
            "absolute left-0 top-0 z-10 h-full w-full bg-center bg-no-repeat object-cover",
            "transform transition-transform duration-[0.5s] ease-in-out group-hover:scale-[1.15]"
          )}
        ></img>

        <div className="gradient absolute left-0 top-0 z-20 h-full w-full bg-gradient-hero-card"></div>
        <div className="content text-white relative z-30 m-9 max-w-[45%] sm:max-w-full">
          <div className="mb-2 flex flex-wrap items-center gap-x-6 gap-y-3">
            <h4 className=" text-h4 font-h4">{title}</h4>
            <div className="flex items-center gap-2">
              {!!twitterUrl && (
                <IconLink url={twitterUrl} ariaLabel="Twitter">
                  <Icon id="twitter" height="16px" width="16px" fill="white" />
                </IconLink>
              )}
              {!!mediumUrl && (
                <IconLink url={mediumUrl} ariaLabel="Medium">
                  <Icon id="medium" height="16px" width="16px" fill="white" />
                </IconLink>
              )}
              {!!githubUrl && (
                <IconLink url={githubUrl} ariaLabel="GitHub">
                  <Icon id="github" height="16px" width="16px" fill="white" />
                </IconLink>
              )}
            </div>
          </div>
          <p className="body2">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};
