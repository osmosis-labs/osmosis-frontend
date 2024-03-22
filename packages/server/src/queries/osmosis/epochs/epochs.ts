import { createNodeQuery } from "../../../queries/base-utils";

export interface Epochs {
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

export const queryEpochs = createNodeQuery<Epochs>({
  path: "/osmosis/epochs/v1beta1/epochs",
});
