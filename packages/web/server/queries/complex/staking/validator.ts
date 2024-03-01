import { Dec, RatePretty } from "@keplr-wallet/unit";
import { BondStatus } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { queryValidators } from "~/server/queries/cosmos";
import { queryValidatorThumbnail } from "~/server/queries/keybase";
import { DEFAULT_LRU_OPTIONS } from "~/utils/cache";

const validatorsCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

export async function getValidators({ status }: { status: BondStatus }) {
  return cachified({
    cache: validatorsCache,
    key: "validators",
    ttl: 1000 * 60 * 5, // 5 minutes
    staleWhileRevalidate: 1000 * 60 * 10, // 10 mins
    getFreshValue: async () => {
      return (await queryValidators({ status })).validators;
    },
  });
}

export async function getValidatorInfo({
  validatorBech32Address,
}: {
  validatorBech32Address: string;
}) {
  return cachified({
    cache: validatorsCache,
    key: `validator-${validatorBech32Address}`,
    ttl: 1000 * 10, // 10 seconds
    staleWhileRevalidate: 1000 * 60 * 10, // 10 mins
    getFreshValue: async () => {
      let jailed = false;
      let inactive = false;
      let validators = await getValidators({ status: BondStatus.Bonded });
      let validator = validators.find(
        (validator) => validator.operator_address === validatorBech32Address
      );

      if (!validator) {
        validators = await getValidators({ status: BondStatus.Unbonded });
        validator = validators.find(
          (validator) => validator.operator_address === validatorBech32Address
        );
        inactive = true;
        if (validator?.jailed) jailed = true;
      }

      let thumbnail: string | undefined;
      if (validator) {
        const validator = validators.find(
          (val) => val.operator_address === validatorBech32Address
        );

        if (!validator) {
          thumbnail = "";
        } else if (!validator.description.identity) {
          thumbnail = "";
        } else {
          const identity = validator.description.identity;
          thumbnail = await queryValidatorThumbnail({ identity });
        }
      }

      const commissionRateRaw = validator?.commission.commission_rates.rate;

      return {
        validatorName: validator?.description.moniker,
        validatorCommission: commissionRateRaw
          ? new RatePretty(new Dec(commissionRateRaw))
          : undefined,
        validatorImgSrc: thumbnail,
        inactive: jailed ? "jailed" : inactive ? "inactive" : undefined,
      };
    },
  });
}
