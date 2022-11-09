/** Simple base config dealing with a user's address. */
export declare class UserConfig {
    protected bech32Address: string;
    constructor(bech32Address?: string);
    setBech32Address(bech32Address: string): void;
}
