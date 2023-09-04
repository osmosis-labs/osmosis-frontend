import classNames from "classnames";
import React, { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { IconLink } from "~/components/cards/icon-link";
import { EventName } from "~/config";
import { useAmplitudeAnalytics } from "~/hooks";

export const AppCard: FunctionComponent<{
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  externalUrl?: string;
  mediumUrl?: string;
  index: number;
}> = ({
  title = "",
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
    <article className="relative cursor-pointer" onClick={handleAppClicked}>
      <div className="bg-white group h-full overflow-hidden rounded-2xl bg-osmoverse-800 shadow-md">
        <div className="overflow-hidden rounded-2xl">
          <img
            src={imageUrl}
            className={classNames(
              "h-[190px] w-full xl:h-[180px] lg:h-[140px] md:h-[210px] sm:h-[160px] xs:h-[210px]",
              "transform transition-transform duration-[0.42s] ease-in-out group-hover:scale-[1.15]", // Zoom in animation
              "bg-center bg-no-repeat object-cover"
            )}
            alt={`${title} image`}
          ></img>
        </div>
        <div className="flex flex-col px-6 pt-4 pb-8 sm:px-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1
              className={classNames(
                "text-h6 font-h6 font-semibold",
                title.split(" ").length === 1 &&
                  title.length >= 10 &&
                  "xs:text-body1"
              )}
            >
              {title}
            </h1>
            <div className="flex items-center gap-2">
              {!!twitterUrl && (
                <IconLink url={twitterUrl} ariaLabel="Twitter">
                  <Icon
                    id="twitter"
                    height="14px"
                    width="14px"
                    className="fill-osmoverse-400"
                  />
                </IconLink>
              )}
              {!!mediumUrl && (
                <IconLink url={mediumUrl} ariaLabel="Medium">
                  <Icon
                    id="medium"
                    height="14px"
                    width="14px"
                    className="fill-osmoverse-400"
                  />
                </IconLink>
              )}
              {!!githubUrl && (
                <IconLink url={githubUrl} ariaLabel="GitHub">
                  <Icon
                    id="github"
                    height="14px"
                    width="14px"
                    className="fill-osmoverse-400"
                  />
                </IconLink>
              )}
            </div>
          </div>
          <p className="pt-3 text-xs text-osmoverse-200">{subtitle}</p>
        </div>
      </div>
    </article>
  );
};
