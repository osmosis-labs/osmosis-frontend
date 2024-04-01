import Image from "next/image";

import LinkButton from "~/components/buttons/link-button";
import { Spinner } from "~/components/loaders";
import { Button } from "~/components/ui/button";
import { useNavBar } from "~/hooks";

export const Transactions: React.FC = () => {
  useNavBar({
    title: (
      <LinkButton
        className="mr-auto md:invisible"
        icon={
          <Image
            alt="left"
            src="/icons/arrow-left.svg"
            width={24}
            height={24}
            className="text-osmoverse-200"
          />
        }
        // TODO add translations
        label="Portfolio"
        ariaLabel="Portfolio"
        href="/portfolio"
      />
    ),
    ctas: [],
  });

  return (
    <main className="flex flex-col px-8">
      <div className="flex w-full justify-between pt-8 pb-4">
        <h1 className="text-h3 font-h3">Transactions</h1>
        <div className="flex gap-3">
          <Button
            // TODO update with new variant
            size="md"
          >
            Explorer &#x2197;
          </Button>
          <Button
            // TODO update with new variant
            size="md"
          >
            Tax Reports &#x2197;
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4 px-4 pt-8 pb-3">
        <div className="text-osmoverse-300">Pending</div>
        <hr className="text-osmoverse-700" />
      </div>
      <div className="w-container m-4 flex h-12 justify-between">
        <div className="flex items-center gap-4">
          <Spinner className="h-8 w-8 pb-4 text-wosmongton-500" />
          <p className="text-osmoverse-100">Swapping</p>
        </div>
        <div className="flex gap-4">
          <Image
            alt="USDC"
            src="/tokens/generated/osmo.svg"
            height={32}
            width={32}
          />
          <div className="flex flex-col text-right text-osmoverse-400">
            <div className="text-subtitle1">- $100.00</div>
            <div className="text-body2">10 OSMO</div>
          </div>
          <Image
            alt="right"
            src="/icons/arrow-right.svg"
            width={24}
            height={24}
            className="text-osmoverse-600"
          />
          <Image
            alt="USDC"
            src="/tokens/generated/usdc.svg"
            height={32}
            width={32}
          />
          <div className="flex flex-col text-right text-osmoverse-400">
            <div className="text-subtitle1">+ $100.00</div>
            <div className="text-body2">100 USDC</div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Transactions;
