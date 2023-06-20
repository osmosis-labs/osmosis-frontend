import React, { FunctionComponent } from "react";

import { EventName } from "~/config";
import { useAmplitudeAnalytics } from "~/hooks";

import { Icon } from "../assets";
import { IconLink } from "./icon-link";

export const AppDisplayCard: FunctionComponent<{
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  externalUrl?: string;
  mediumUrl?: string;
  index: number;
}> = ({
  title,
  subtitle,
  imageUrl,
  twitterUrl,
  githubUrl,
  externalUrl,
  mediumUrl,
  index,
}) => {
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
      { appName: title, isFeatured: false, isBanner: false, position: index },
    ]);
    window.open(externalUrlWithUTM, "_blank", "noopener noreferrer");
  };

  return (
    <>
      <style jsx>{`
        .app-display-card:hover .card-image {
          transform: scale(1.15);
          transition: transform 0.3s ease-in-out;
        }
        .card-image {
          background-image: url(${imageUrl});
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          transition: transform 0.3s ease-in-out;
        }
      `}</style>
      <div className="cursor-pointer" onClick={handleAppClicked}>
        <div className="app-display-card bg-white h-[320px] overflow-hidden rounded-2xl bg-osmoverse-800 shadow-md xl:h-[330px] lg:h-[330px] md:h-[360px] sm:h-[290px] xs:h-[330px]">
          <div className="overflow-hidden rounded-2xl">
            <div className="card-image  min-h-[190px] xl:min-h-[180px] lg:min-h-[140px] md:min-h-[210px]  sm:min-h-[160px]  xs:min-h-[210px]"></div>
          </div>
          <div className="flex h-[120px] flex-col px-6 pt-4 pb-8 xl:h-[160px] lg:h-[150px] md:h-[140px] sm:h-[120px]">
            <div className="flex items-center space-x-3">
              <h6 className="font-semibold">{title}</h6>
              {!!twitterUrl && (
                <IconLink url={twitterUrl} ariaLabel="Twitter">
                  <Icon
                    id="twitter"
                    height="14px"
                    width="14px"
                    fill="#958FC0"
                  />
                </IconLink>
              )}
              {!!mediumUrl && (
                <IconLink url={mediumUrl} ariaLabel="Medium">
                  <Icon id="medium" height="14px" width="14px" fill="#958FC0" />
                </IconLink>
              )}
              {!!githubUrl && (
                <IconLink url={githubUrl} ariaLabel="GitHub">
                  <Icon id="github" height="14px" width="14px" fill="#958FC0" />
                </IconLink>
              )}
            </div>
            <p className="pt-3 text-xs text-osmoverse-200">{subtitle}</p>
          </div>
        </div>
      </div>
    </>
  );
};
