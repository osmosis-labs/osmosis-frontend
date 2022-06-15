export declare type AccountLockedCoins = {
    coins: {
        denom: string;
        amount: string;
    }[];
};
export declare type AccountUnlockingCoins = {
    coins: {
        denom: string;
        amount: string;
    }[];
};
export declare type AccountUnlockableCoins = {
    coins: {
        denom: string;
        amount: string;
    }[];
};
export declare type AccountLockedLongerDuration = {
    locks: {
        ID: string;
        owner: string;
        duration: string;
        end_time: string;
        coins: {
            denom: string;
            amount: string;
        }[];
    }[];
};
export declare type SyntheticLockupsByLockId = {
    synthetic_locks: {
        underlying_lock_id: string;
        synth_denom: string;
        end_time: string;
        duration: string;
    }[];
};
