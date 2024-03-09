import { expose } from "comlink";

import { appRouter } from "~/server/api/root";

import { superjson } from "../superjson";

const caller = appRouter.createCaller({});

expose({
  async processRequest(rawOp: any) {
    const op: any = superjson.parse(rawOp);
    const data = await (caller[op.path] as (input: unknown) => unknown)(
      op.input
    );
    return superjson.stringify(data);
  },
});
