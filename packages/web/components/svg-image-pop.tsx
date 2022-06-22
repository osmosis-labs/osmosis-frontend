import React, { FunctionComponent, useState, useEffect } from "react";
import classNames from "classnames";

export const SvgImagePop: FunctionComponent<React.SVGProps<SVGImageElement>> = (
  props
) => {
  const [isPopped, setIsPopped] = useState(false);
  const [showSparks, setShowSparks] = useState(false);

  useEffect(() => {
    if (showSparks) {
      setTimeout(() => {
        setIsPopped(true);
      }, 200);
    }
  }, [showSparks, setShowSparks, setIsPopped]);

  if (isPopped) {
    return null;
  }

  return (
    <image
      {...props}
      className={classNames("hover:!-translate-y-1", props.className)}
      style={{ cursor: "pointer" }}
      onClick={() => {
        const audio = new Audio(
          "https://soundbible.com/mp3/Balloon%20Popping-SoundBible.com-1247261379.mp3"
        );
        audio.volume = audio.volume / 3;
        audio.play();
        setShowSparks(true);
      }}
      href={showSparks ? "/sparks-birthday.svg" : props.href}
    />
  );
};
