import Image from "next/image";
import { useTranslation } from "react-multi-lang";

const ErrorFallback = () => {
  const t = useTranslation();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-8 pt-4 text-center">
      <div className="flex gap-2">
        <Image
          src="/icons/error-x.svg"
          alt={t("505.title")}
          height={25}
          width={25}
        />
        <p className="text-lg font-bold">An error occurred</p>
      </div>
      <p>
        Please submit a{" "}
        <a
          href="https://bugs.osmosis.zone"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          bug report
        </a>{" "}
        or get{" "}
        <a
          href="https://support.osmosis.zone"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          support
        </a>
      </p>
    </div>
  );
};

export default ErrorFallback;
