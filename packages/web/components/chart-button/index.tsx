import classNames from "classnames";
import Image from "next/image";
import React, { ReactElement } from "react";

export default function ChartButton(props: {
  src?: string;
  alt?: string;
  label?: string;
  selected: boolean;
  onClick: () => void;
}): ReactElement {
  const isImage = !!props.src && !props.label;
  const isLabel = !!props.label && !props.src;

  return (
    <button
      className={classNames(
        "flex h-6 cursor-pointer flex-row items-center justify-center",
        "rounded-lg bg-osmoverse-800 px-2 text-caption hover:bg-osmoverse-900",
        "whitespace-nowrap",
        {
          "!bg-osmoverse-600": props.selected,
        }
      )}
      onClick={props.onClick}
    >
      {isImage && (
        <Image
          alt={props.alt}
          src={props.src as string}
          width={16}
          height={16}
        />
      )}
      {isLabel && props.label}
    </button>
  );
}
