import React from "react";

import { api } from "~/utils/trpc";

const TRPCTest = () => {
  const { data, isLoading } = api.bridgeTransfer.hello.useQuery({
    text: "hello",
  });
  return <div>{isLoading ? "Loading...." : data?.greeting}</div>;
};

export default TRPCTest;
