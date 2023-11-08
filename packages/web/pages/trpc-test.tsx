import React from "react";

import { api } from "~/utils/trpc";

const TRPCTest = () => {
  const appResponse = api.bridgeTransfer.hello.useQuery({
    text: "hello",
  });
  const edgeResponse = api.edge.pools.hello.useQuery({
    text: "hello from edge",
  });
  return (
    <div>
      <div>
        {appResponse.isLoading ? "Loading...." : appResponse.data?.greeting}
      </div>
      <div>
        {edgeResponse.isLoading ? "Loading...." : edgeResponse.data?.greeting}
      </div>
    </div>
  );
};

export default TRPCTest;
