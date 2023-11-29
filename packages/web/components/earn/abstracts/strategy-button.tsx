import Image from "next/image";

interface StrategyButtonProps {
  imageURI: string;
  label: string;
  resp: string;
}

export const StrategyButton = ({ imageURI, label }: StrategyButtonProps) => {
  return (
    <div className="flex min-w-[186px] items-center gap-4 py-1 px-4">
      <button className="inline-flex max-h-11 w-11 items-center justify-center rounded-lg bg-osmoverse-825 px-2 py-3">
        <Image src={imageURI} alt={`${label} image`} width={28} height={28} />
      </button>
      <span className="text-base font-subtitle1 text-osmoverse-200">
        {label}
      </span>
    </div>
  );
};
