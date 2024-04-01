import Image from "next/image";

import LinkButton from "~/components/buttons/link-button";
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
    <main className="flex px-8">
      <div className="flex w-full justify-between pt-8 pb-4">
        <h1 className="text-h3 font-h3"> Hello World</h1>
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
    </main>
  );
};

export default Transactions;
