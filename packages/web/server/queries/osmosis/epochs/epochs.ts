import { apiClient } from "@osmosis-labs/utils";

import { ChainList } from "~/config/generated/chain-list";

interface Epochs {
  epochs: [
    {
      identifier: string;
      start_time: string;
      duration: string;
      current_epoch: string;
      current_epoch_start_time: string;
      epoch_counting_started: boolean;
      current_epoch_ended: boolean;
    }
  ];
}

export async function queryEpochs(): Promise<Epochs> {
  const url = new URL(
    "/osmosis/epochs/v1beta1/epochs",
    ChainList[0].apis.rest[0].address
  );
  return apiClient<Epochs>(url.toString());
}
