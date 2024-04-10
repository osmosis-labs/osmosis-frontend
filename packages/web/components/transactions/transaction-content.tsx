import { TransactionRow } from "~/components/transactions/transaction-row";
import { Button } from "~/components/ui/button";

export const TransactionContent = ({
  setOpen,
  open,
}: {
  setOpen: (open: boolean) => void;
  open: boolean;
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
        <div className="text-osmoverse-300">Pending</div>
        <hr className="text-osmoverse-700" />
      </div>
      <TransactionRow status="Pending" setOpen={setOpen} open={open} />

      <div className="flex flex-col gap-4 px-4 pt-8 pb-3">
        <div className="text-osmoverse-300">Earlier Today</div>
        <hr className="text-osmoverse-700" />
      </div>
      <TransactionRow status="Success" setOpen={setOpen} open={open} />
      <TransactionRow status="Failure" setOpen={setOpen} open={open} />

      <div className="flex flex-col gap-4 px-4 pt-8 pb-3">
        <div className="text-osmoverse-300">Yesterday</div>
        <hr className="text-osmoverse-700" />
      </div>
      <TransactionRow status="Success" setOpen={setOpen} open={open} />

      <div className="flex flex-col gap-4 px-4 pt-8 pb-3">
        <div className="text-osmoverse-300">March 11</div>
        <hr className="text-osmoverse-700" />
      </div>
      <TransactionRow status="Success" setOpen={setOpen} open={open} />
      <TransactionRow status="Success" setOpen={setOpen} open={open} />

      <div className="flex flex-col gap-4 px-4 pt-8 pb-3">
        <div className="text-osmoverse-300">February 8</div>
        <hr className="text-osmoverse-700" />
      </div>
      <TransactionRow status="Failure" setOpen={setOpen} open={open} />
      <TransactionRow status="Failure" setOpen={setOpen} open={open} />

      <div className="flex flex-col gap-4 px-4 pt-8 pb-3">
        <div className="text-osmoverse-300">December 29, 2023</div>
        <hr className="text-osmoverse-700" />
      </div>
      <TransactionRow status="Success" setOpen={setOpen} open={open} />
      <TransactionRow status="Success" setOpen={setOpen} open={open} />

      <div className="flex flex-col gap-4 px-4 pt-8 pb-3">
        <div className="text-osmoverse-300">July 7, 2022</div>
        <hr className="text-osmoverse-700" />
      </div>
      <TransactionRow status="Success" setOpen={setOpen} open={open} />
      <TransactionRow status="Success" setOpen={setOpen} open={open} />
    </div>
  );
};
