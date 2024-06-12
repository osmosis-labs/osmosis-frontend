import { queryOrderbookMakerFee } from "../queries";
import { ContractOsmoAddressSchema } from "../queries/complex/parameter-types";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const orderbookRouter = createTRPCRouter({
  getMakerFee: publicProcedure
    .input(ContractOsmoAddressSchema.required())
    .query(async ({ input, ctx }) => {
      const { contractOsmoAddress } = input;
      const { data } = await queryOrderbookMakerFee({
        orderbookAddress: contractOsmoAddress,
        chainList: ctx.chainList,
      });
      return {
        makerFee: data,
      };
    }),
});
