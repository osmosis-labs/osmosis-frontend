import React, { useEffect, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { Icon } from "../assets";
import { IconLink } from "./icon-link";

interface HeroCardProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  fallbackImageUrl: string;
  label?: string;
  githubUrl?: string;
  twitterUrl?: string;
  externalUrl: string;
  mediumUrl?: string;
}

export const HeroCard: React.FC<HeroCardProps> = ({
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
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(imageUrl);
  const t = useTranslation();

  useEffect(() => {
    const image = new Image();
    image.src = imageUrl;
    image.onerror = () => {
      setBackgroundImageUrl(fallbackImageUrl);
    };
  }, [imageUrl, fallbackImageUrl]);

  return (
    <div className="relative pt-8">
      <div className="body2 mb-2 pl-6 font-bold text-osmoverse-200">
        {label ? label : t("store.featured")}
      </div>
      <a href={externalUrl} target="_blank" rel="noopener noreferrer">
        <div className="heroImage flex items-end overflow-hidden rounded-lg">
          <div
            className="backgroundImage"
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
          ></div>
          <div className="gradient"></div>
          <div className="content text-white relative z-10 ml-9 mb-9 max-w-35">
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
        </div>
        <style jsx>{`
          .heroImage {
            position: relative;
            height: 400px;
          }
          .backgroundImage {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            transition: transform 0.5s ease-in-out;
          }
          .heroImage:hover .backgroundImage {
            transform: scale(1.15);
          }
          .gradient {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(transparent, rgba(0, 0, 0, 1));
            z-index: 1;
          }
          .content {
            position: relative;
            z-index: 2;
          }
        `}</style>
      </a>
    </div>
  );
};
``;
