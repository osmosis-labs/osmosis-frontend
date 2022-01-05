import React, { FunctionComponent } from "react";
import classNames from "classnames";

export const poolCardIconBackgroundColorsToTailwindBgImage = {
  socialLive: "bg-gradients-socialLive",
  greenBeach: "bg-gradients-greenBeach",
  kashmir: "bg-gradients-kashmir",
  frost: "bg-gradients-frost",
  cherry: "bg-gradients-cherry",
  sunset: "bg-gradients-sunset",
  orangeCoral: "bg-gradients-orangeCoral",
  pinky: "bg-gradients-pinky",
} as const;

export const PoolCardIconBackgroundColors: (keyof typeof poolCardIconBackgroundColorsToTailwindBgImage)[] =
  [
    "socialLive",
    "greenBeach",
    "kashmir",
    "frost",
    "cherry",
    "sunset",
    "orangeCoral",
    "pinky",
  ];

export type PoolCardIconBackgroundColor =
  keyof typeof poolCardIconBackgroundColorsToTailwindBgImage;

export const PoolCardBase: FunctionComponent<{
  containerClassName?: string;
  innerContainerClassName?: string;
  iconContainerClassName?: string;
  iconBackgroundClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;

  icon: React.ReactElement;
  iconBackgroundColor: PoolCardIconBackgroundColor;
  title: string;
  subtitle: string;

  onClick?: () => void;
}> = ({
  containerClassName,
  innerContainerClassName,
  iconContainerClassName,
  iconBackgroundClassName,
  icon,
  iconBackgroundColor,
  titleClassName,
  subtitleClassName,
  title,
  subtitle,
  onClick,
  children,
}) => {
  return (
    <div
      className={classNames(
        "relative px-[1.875rem] py-[1.5rem] bg-card rounded-[0.75rem] after:rounded-[0.75rem] after:absolute after:inset-0",
        {
          /*
           Changing "border-width" increases the component's size.
           We can prevent this problem by using the "ring" in the tailwind.
           "ring" uses the box-shadow to remain the component's size.
           However, we can't use the multiple box-shadow by using tailwind.
           So, add the after content [''] and make it fill the component.
           If component is hovered, add the "ring" property to after content
           and add the box-shadow to the component itself.
           */
          ["hover:after:ring-enabledGold hover:after:ring-[1px] hover:after:ring-inset hover:shadow-lg hover:cursor-pointer"]:
            onClick != null,
        },
        containerClassName
      )}
      onClick={onClick}
    >
      <div
        className={classNames(
          "flex flex-row mb-[1rem]",
          innerContainerClassName
        )}
      >
        <div
          className={classNames(
            "w-[5.25rem] h-[5.25rem] rounded-full border-[1px] border-enabledGold flex items-center justify-center mr-[1.5rem] shrink-0",
            iconContainerClassName
          )}
        >
          <div
            className={classNames(
              "w-[4.5rem] h-[4.5rem] bg-blue rounded-full flex items-center justify-center",
              poolCardIconBackgroundColorsToTailwindBgImage[
                iconBackgroundColor
              ],
              iconBackgroundClassName
            )}
          >
            {icon}
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <h5 className={classNames("text-white-full", titleClassName)}>
            {title}
          </h5>
          <div
            className={classNames(
              "subtitle2 text-white-mid",
              subtitleClassName
            )}
          >
            {subtitle}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};
