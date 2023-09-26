import Image from "next/image";

import caretDown from "../../public/icons/caret-down.svg";

export default function RelatedAssets() {
  return (
    <div className="flex flex-col gap-8 rounded-5xl border border-osmoverse-800 bg-osmoverse-900 p-10 xs:p-8">
      <p className="text-lg font-h6">Related Assets</p>
      <RelatedAsset />
    </div>
  );
}

function RelatedAsset() {
  return (
    <div className="flex flex-row items-center justify-between self-stretch">
      <div className="flex flex-row items-center justify-center gap-3">
        {/* <Image
      src={''}
      alt="coin name"
      width={52}
      height={52}
      /> */}
        <div className="h-[52px] w-[52px] rounded-full bg-white-full" />
        <div className="flex flex-col gap-1">
          <p className="text-base font-subtitle1 leading-6 text-osmoverse-100">
            Atom
          </p>
          <p className="text-sm font-body2 font-medium leading-5 text-osmoverse-300">
            Cosmos Hub
          </p>
        </div>
      </div>
      <div className="flex flex-row items-center gap-5">
        <div className="flex flex-col items-end gap-1">
          <h6 className="text-lg font-h6 leading-6 text-osmoverse-100">
            $9.47
          </h6>
          <p className="text-sm font-subtitle2 font-medium leading-5 text-osmoverse-300">
            +12%
          </p>
        </div>
        <Image
          src={caretDown}
          alt="Right-pointing caret"
          width={24}
          height={24}
          className="-rotate-90"
        />
      </div>
    </div>
  );
}
