import React from "react";

import { api } from "~/utils/trpc";

type Props = {};

const TestTRPC = (props: Props) => {
  api.edge.assets.assets.useQuery({ text: "hello" });
  api.bridgeTransfer.hello.useQuery({ text: "hello2" });
  return <div>TestTRPC</div>;
};

export default TestTRPC;
