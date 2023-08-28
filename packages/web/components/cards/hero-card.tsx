import React from "react";
import { useTranslation } from "react-multi-lang";

import { Icon } from "~/components/assets";
import { IconLink } from "~/components/cards/icon-link";
import { EventName } from "~/config";
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
  const t = useTranslation();
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
        className="heroImage relative flex h-[400px]  cursor-pointer items-end overflow-hidden rounded-2xl sm:h-[300px]"
      >
        <div
          className="backgroundImage absolute left-0 top-0 z-10 h-full w-full  bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${imageUrl})`,
          }}
        ></div>

        <div className="gradient absolute left-0 top-0 z-20 h-full w-full bg-gradient-hero-card"></div>
        <div className="content text-white relative z-30 m-9 max-w-[45%] sm:max-w-full">
          <div className="flex items-center space-x-6">
            <h4 className="pb-2 font-h4 text-h4">{title}</h4>
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
          <p className="body2">{subtitle}</p>
        </div>
        <style jsx>{`
          .backgroundImage {
            transition: transform 0.5s ease-in-out;
          }
          .heroImage:hover .backgroundImage {
            transform: scale(1.15);
          }
        `}</style>
      </div>
    </div>
  );
};
