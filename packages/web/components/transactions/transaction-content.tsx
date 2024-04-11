import { TransactionRow } from "~/components/transactions/transaction-row";
import { Button } from "~/components/ui/button";

const EXAMPLE_METADATA = [
  {
    type: "osmosis-ui",
    value: [
      {
        txType: "swap",
        txMessageIndex: 0,
        txFee: [
          {
            denom: "uosmo",
            amount: "1",
            usd: 1,
          },
        ],
        txInfo: {
          tokenIn: {
            denom:
              "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
            amount: "100",
            usd: 10,
          },
          tokenOut: {
            denom:
              "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB",
            amount: "200",
            usd: 30,
          },
        },
      },
    ],
  },
];

export const TransactionContent = ({
  setOpen,
  open,
  transactions,
}: {
  setOpen: (open: boolean) => void;
  open: boolean;
  transactions: any;
}) => {
  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full justify-between pt-8 pb-4">
        <h1 className="text-h3 font-h3">Transactions</h1>
        <div className="flex gap-3">
          <Button variant="secondary" size="md">
            Explorer &#x2197;
          </Button>
          <Button variant="secondary" size="md">
            Tax Reports &#x2197;
          </Button>
        </div>
      </div>

      {/* TODO - parse by date, into groups */}

      <div className="flex flex-col gap-4 px-4 pt-8 pb-3">
        <div className="text-osmoverse-300">Example Transaction Data</div>
        <hr className="text-osmoverse-700" />
      </div>

      {transactions.map((transaction: any) => (
        <TransactionRow
          key={transaction._id}
          status={transaction.code === 0 ? "Success" : "Failure"}
          setOpen={setOpen}
          open={open}
          metadata={transaction.metadata}
        />
      ))}

      {/* <div className="flex flex-col gap-4 px-4 pt-8 pb-3">
        <div className="text-osmoverse-300">Pending</div>
        <hr className="text-osmoverse-700" />
      </div>
      <TransactionRow
        status="Pending"
        setOpen={setOpen}
        open={open}
        metadata={EXAMPLE_METADATA}
      />

      <div className="flex flex-col gap-4 px-4 pt-8 pb-3">
        <div className="text-osmoverse-300">Earlier Today</div>
        <hr className="text-osmoverse-700" />
      </div>
      <TransactionRow
        status="Success"
        setOpen={setOpen}
        open={open}
        metadata={EXAMPLE_METADATA}
      />
      <TransactionRow
        status="Failure"
        setOpen={setOpen}
        open={open}
        metadata={EXAMPLE_METADATA}
      />

      <div className="flex flex-col gap-4 px-4 pt-8 pb-3">
        <div className="text-osmoverse-300">Yesterday</div>
        <hr className="text-osmoverse-700" />
      </div>
      <TransactionRow
        status="Success"
        setOpen={setOpen}
        open={open}
        metadata={EXAMPLE_METADATA}
      />

      <div className="flex flex-col gap-4 px-4 pt-8 pb-3">
        <div className="text-osmoverse-300">March 11</div>
        <hr className="text-osmoverse-700" />
      </div>
      <TransactionRow
        status="Success"
        setOpen={setOpen}
        open={open}
        metadata={EXAMPLE_METADATA}
      />
      <TransactionRow
        status="Success"
        setOpen={setOpen}
        open={open}
        metadata={EXAMPLE_METADATA}
      />

      <div className="flex flex-col gap-4 px-4 pt-8 pb-3">
        <div className="text-osmoverse-300">February 8</div>
        <hr className="text-osmoverse-700" />
      </div>
      <TransactionRow
        status="Failure"
        setOpen={setOpen}
        open={open}
        metadata={EXAMPLE_METADATA}
      />
      <TransactionRow
        status="Failure"
        setOpen={setOpen}
        open={open}
        metadata={EXAMPLE_METADATA}
      />

      <div className="flex flex-col gap-4 px-4 pt-8 pb-3">
        <div className="text-osmoverse-300">December 29, 2023</div>
        <hr className="text-osmoverse-700" />
      </div>
      <TransactionRow
        status="Success"
        setOpen={setOpen}
        open={open}
        metadata={EXAMPLE_METADATA}
      />
      <TransactionRow
        status="Success"
        setOpen={setOpen}
        open={open}
        metadata={EXAMPLE_METADATA}
      />

      <div className="flex flex-col gap-4 px-4 pt-8 pb-3">
        <div className="text-osmoverse-300">July 7, 2022</div>
        <hr className="text-osmoverse-700" />
      </div>
      <TransactionRow
        status="Success"
        setOpen={setOpen}
        open={open}
        metadata={EXAMPLE_METADATA}
      />
      <TransactionRow
        status="Success"
        setOpen={setOpen}
        open={open}
        metadata={EXAMPLE_METADATA}
      /> */}
    </div>
  );
};
