import Image from "next/image";

import LinkButton from "~/components/buttons/link-button";
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

  return <div>Hello World</div>;
};

export default Transactions;
