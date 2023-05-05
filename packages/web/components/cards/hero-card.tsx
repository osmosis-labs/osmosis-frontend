import React, { useEffect, useState } from "react";
import { useTranslation } from "react-multi-lang";

interface HeroCardProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  fallbackImageUrl: string;
  label?: string;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  title,
  subtitle,
  imageUrl,
  fallbackImageUrl,
  label,
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
      <div
        className="relative flex h-[400px] items-end rounded-lg bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      >
        <div className="text-white ml-8 mb-8 max-w-35">
          <h4 className="pb-2 text-h4 font-h4">{title}</h4>
          <p className="body2">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default HeroCard;
