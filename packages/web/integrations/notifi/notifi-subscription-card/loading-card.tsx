import { FunctionComponent } from "react";

import Spinner from "~/components/spinner";

export const LoadingCard: FunctionComponent = () => {
  return (
    <>
      <div className="flex h-[30rem] items-center justify-center">
        <Spinner className="h-[5rem] w-[5rem] text-white-full" />
      </div>
    </>
  );
};
