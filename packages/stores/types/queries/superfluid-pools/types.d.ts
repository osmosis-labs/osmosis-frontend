import { CoinPretty } from "@keplr-wallet/unit";
import { Duration } from "dayjs/plugin/duration";
export declare type SuperfluidParams = {
    params: {
        minimum_risk_factor: string;
    };
};
export declare type SuperfluidAssetMultiplier = {
    osmo_equivalent_multiplier: {
        epoch_number: string;
        denom: string;
        multiplier: string;
    };
};
export declare type SuperfluidAllAssets = {
    assets: [
        {
            denom: string;
            asset_type: string;
        }
    ];
};
export declare type SuperfluidDelegationRecordsResponse = {
    delegator_address: string;
    validator_address: string;
    delegation_amount: {
        denom: string;
        amount: string;
    };
};
export declare type SuperfluidDelegationsResponse = {
    superfluid_delegation_records: SuperfluidDelegationRecordsResponse[];
    total_undelegated_coins: [
        {
            denom: string;
            amount: string;
        }
    ];
};
export declare type SuperfluidDelegation = {
    delegator_address: string;
    validator_address: string;
    amount: CoinPretty;
};
export declare type SuperfluidUndelegationRecordsResponse = {
    delegator_address: string;
    validator_address: string;
    delegation_amount: {
        denom: string;
        amount: string;
    };
};
export declare type SuperfluidUndelegationsResponse = {
    superfluid_delegation_records: SuperfluidUndelegationRecordsResponse[];
    synthetic_locks: [
        {
            duration: string;
            end_time: string;
            synth_denom: string;
            underlying_lock_id: string;
        }
    ];
    total_delegated_coins: [
        {
            denom: string;
            amount: string;
        }
    ];
};
export declare type SuperfluidUndelegation = {
    delegator_address: string;
    validator_address: string;
    amount: CoinPretty;
    duration: Duration;
    end_time: Date;
    lock_id: string;
};
