import React, { memo, useEffect, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { EventName } from "~/config";
import { useAmplitudeAnalytics } from "~/hooks";

import { Icon } from "../assets";
import { IconLink } from "./icon-link";

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
}> = memo(
  ({
    title,
    subtitle,
    imageUrl,
    fallbackImageUrl,
    label,
    githubUrl,
    externalUrl,
    mediumUrl,
    twitterUrl,
  }) => {
    const [backgroundImageUrl, setBackgroundImageUrl] = useState<
      string | undefined
    >(imageUrl);

    const t = useTranslation();
    const { logEvent } = useAmplitudeAnalytics();

    useEffect(() => {
      const image = new Image();
      image.src = imageUrl;
      image.onerror = () => {
        setBackgroundImageUrl(fallbackImageUrl);
      };
    }, [imageUrl, fallbackImageUrl]);

    const handleAppClicked = () => {
      logEvent([
        EventName.AppStore.appClicked,
        { appName: title, isFeatured: true, isBanner: true },
      ]);
    };

    return (
      <div className="relative pt-8">
        <div className="body2 mb-2 pl-6 font-bold text-osmoverse-200">
          {label ? label : t("store.featured")}
        </div>
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleAppClicked}
          className="heroImage relative flex items-end overflow-hidden rounded-lg"
        >
          <div
            className="backgroundImage absolute top-0 left-0 h-full w-full"
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
          ></div>
          <div className="gradient bg-gradient-to-b absolute top-0 left-0 z-10 h-full w-full from-transparent to-black"></div>
          <div className="content text-white relative z-20 ml-9 mb-9 max-w-35">
            <div className="flex items-center space-x-6">
              <h4 className="pb-2 text-h4 font-h4">{title}</h4>
              {twitterUrl && (
                <IconLink url={twitterUrl} ariaLabel="Twitter">
                  <Icon id="twitter" height="16px" width="16px" fill="white" />
                </IconLink>
              )}
              {mediumUrl && (
                <IconLink url={mediumUrl} ariaLabel="Medium">
                  <Icon id="medium" height="16px" width="16px" fill="white" />
                </IconLink>
              )}
              {githubUrl && (
                <IconLink url={githubUrl} ariaLabel="GitHub">
                  <Icon id="github" height="16px" width="16px" fill="white" />
                </IconLink>
              )}
            </div>
            <p className="body2">{subtitle}</p>
          </div>
          <style jsx>{`
            .heroImage {
              height: 400px;
            }
            .backgroundImage {
              background-size: cover;
              background-position: center;
              background-repeat: no-repeat;
              transition: transform 0.5s ease-in-out;
            }
            .heroImage:hover .backgroundImage {
              transform: scale(1.15);
            }
          `}</style>
        </a>
      </div>
    );
  }
);
