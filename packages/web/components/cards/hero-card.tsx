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
    <div className="relative pt-7">
      <div className="body2 mb-2 font-bold text-osmoverse-200">
        {label ? label : t("store.featured")}
      </div>
      <a href={externalUrl} target="_blank" rel="noopener noreferrer">
        <div
          className="relative flex h-[400px] items-end rounded-lg bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        >
          <div className="text-white ml-8 mb-8 max-w-35">
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
      </a>
    </div>
  );
};

export default HeroCard;
