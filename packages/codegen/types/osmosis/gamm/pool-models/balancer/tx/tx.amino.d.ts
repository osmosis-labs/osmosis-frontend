import { AminoMsg } from "@cosmjs/amino";
import { MsgCreateBalancerPool } from "./tx";
export interface AminoMsgCreateBalancerPool extends AminoMsg {
    type: "osmosis/gamm/poolmodels/balancer/create-balancer-pool";
    value: {
        sender: string;
        pool_params: {
            swap_fee: string;
            exit_fee: string;
            smooth_weight_change_params: {
                start_time: {
                    seconds: string;
                    nanos: number;
                };
                duration: {
                    seconds: string;
                    nanos: number;
                };
                initial_pool_weights: {
                    token: {
                        denom: string;
                        amount: string;
                    };
                    weight: string;
                }[];
                target_pool_weights: {
                    token: {
                        denom: string;
                        amount: string;
                    };
                    weight: string;
                }[];
            };
        };
        pool_assets: {
            token: {
                denom: string;
                amount: string;
            };
            weight: string;
        }[];
        future_pool_governor: string;
    };
}
export declare const AminoConverter: {
    "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool": {
        aminoType: string;
        toAmino: ({ sender, poolParams, poolAssets, futurePoolGovernor }: MsgCreateBalancerPool) => AminoMsgCreateBalancerPool["value"];
        fromAmino: ({ sender, pool_params, pool_assets, future_pool_governor }: AminoMsgCreateBalancerPool["value"]) => MsgCreateBalancerPool;
    };
};
