import * as $protobuf from 'protobufjs';
/** Namespace cosmos. */
export namespace cosmos {
	/** Namespace base. */
	namespace base {
		/** Namespace v1beta1. */
		namespace v1beta1 {
			/** Properties of a Coin. */
			interface ICoin {
				/** Coin denom */
				denom?: string | null;

				/** Coin amount */
				amount?: string | null;
			}

			/** Represents a Coin. */
			class Coin implements ICoin {
				/**
				 * Constructs a new Coin.
				 * @param [p] Properties to set
				 */
				constructor(p?: cosmos.base.v1beta1.ICoin);

				/** Coin denom. */
				public denom: string;

				/** Coin amount. */
				public amount: string;

				/**
				 * Creates a new Coin instance using the specified properties.
				 * @param [properties] Properties to set
				 * @returns Coin instance
				 */
				public static create(properties?: cosmos.base.v1beta1.ICoin): cosmos.base.v1beta1.Coin;

				/**
				 * Encodes the specified Coin message. Does not implicitly {@link cosmos.base.v1beta1.Coin.verify|verify} messages.
				 * @param m Coin message or plain object to encode
				 * @param [w] Writer to encode to
				 * @returns Writer
				 */
				public static encode(m: cosmos.base.v1beta1.ICoin, w?: $protobuf.Writer): $protobuf.Writer;

				/**
				 * Decodes a Coin message from the specified reader or buffer.
				 * @param r Reader or buffer to decode from
				 * @param [l] Message length if known beforehand
				 * @returns Coin
				 * @throws {Error} If the payload is not a reader or valid buffer
				 * @throws {$protobuf.util.ProtocolError} If required fields are missing
				 */
				public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.base.v1beta1.Coin;

				/**
				 * Creates a Coin message from a plain object. Also converts values to their respective internal types.
				 * @param d Plain object
				 * @returns Coin
				 */
				public static fromObject(d: { [k: string]: any }): cosmos.base.v1beta1.Coin;

				/**
				 * Creates a plain object from a Coin message. Also converts values to other types if specified.
				 * @param m Coin
				 * @param [o] Conversion options
				 * @returns Plain object
				 */
				public static toObject(m: cosmos.base.v1beta1.Coin, o?: $protobuf.IConversionOptions): { [k: string]: any };

				/**
				 * Converts this Coin to JSON.
				 * @returns JSON object
				 */
				public toJSON(): { [k: string]: any };
			}

			/** Properties of a DecCoin. */
			interface IDecCoin {
				/** DecCoin denom */
				denom?: string | null;

				/** DecCoin amount */
				amount?: string | null;
			}

			/** Represents a DecCoin. */
			class DecCoin implements IDecCoin {
				/**
				 * Constructs a new DecCoin.
				 * @param [p] Properties to set
				 */
				constructor(p?: cosmos.base.v1beta1.IDecCoin);

				/** DecCoin denom. */
				public denom: string;

				/** DecCoin amount. */
				public amount: string;

				/**
				 * Creates a new DecCoin instance using the specified properties.
				 * @param [properties] Properties to set
				 * @returns DecCoin instance
				 */
				public static create(properties?: cosmos.base.v1beta1.IDecCoin): cosmos.base.v1beta1.DecCoin;

				/**
				 * Encodes the specified DecCoin message. Does not implicitly {@link cosmos.base.v1beta1.DecCoin.verify|verify} messages.
				 * @param m DecCoin message or plain object to encode
				 * @param [w] Writer to encode to
				 * @returns Writer
				 */
				public static encode(m: cosmos.base.v1beta1.IDecCoin, w?: $protobuf.Writer): $protobuf.Writer;

				/**
				 * Decodes a DecCoin message from the specified reader or buffer.
				 * @param r Reader or buffer to decode from
				 * @param [l] Message length if known beforehand
				 * @returns DecCoin
				 * @throws {Error} If the payload is not a reader or valid buffer
				 * @throws {$protobuf.util.ProtocolError} If required fields are missing
				 */
				public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.base.v1beta1.DecCoin;

				/**
				 * Creates a DecCoin message from a plain object. Also converts values to their respective internal types.
				 * @param d Plain object
				 * @returns DecCoin
				 */
				public static fromObject(d: { [k: string]: any }): cosmos.base.v1beta1.DecCoin;

				/**
				 * Creates a plain object from a DecCoin message. Also converts values to other types if specified.
				 * @param m DecCoin
				 * @param [o] Conversion options
				 * @returns Plain object
				 */
				public static toObject(m: cosmos.base.v1beta1.DecCoin, o?: $protobuf.IConversionOptions): { [k: string]: any };

				/**
				 * Converts this DecCoin to JSON.
				 * @returns JSON object
				 */
				public toJSON(): { [k: string]: any };
			}

			/** Properties of an IntProto. */
			interface IIntProto {
				/** IntProto int */
				int?: string | null;
			}

			/** Represents an IntProto. */
			class IntProto implements IIntProto {
				/**
				 * Constructs a new IntProto.
				 * @param [p] Properties to set
				 */
				constructor(p?: cosmos.base.v1beta1.IIntProto);

				/** IntProto int. */
				public int: string;

				/**
				 * Creates a new IntProto instance using the specified properties.
				 * @param [properties] Properties to set
				 * @returns IntProto instance
				 */
				public static create(properties?: cosmos.base.v1beta1.IIntProto): cosmos.base.v1beta1.IntProto;

				/**
				 * Encodes the specified IntProto message. Does not implicitly {@link cosmos.base.v1beta1.IntProto.verify|verify} messages.
				 * @param m IntProto message or plain object to encode
				 * @param [w] Writer to encode to
				 * @returns Writer
				 */
				public static encode(m: cosmos.base.v1beta1.IIntProto, w?: $protobuf.Writer): $protobuf.Writer;

				/**
				 * Decodes an IntProto message from the specified reader or buffer.
				 * @param r Reader or buffer to decode from
				 * @param [l] Message length if known beforehand
				 * @returns IntProto
				 * @throws {Error} If the payload is not a reader or valid buffer
				 * @throws {$protobuf.util.ProtocolError} If required fields are missing
				 */
				public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.base.v1beta1.IntProto;

				/**
				 * Creates an IntProto message from a plain object. Also converts values to their respective internal types.
				 * @param d Plain object
				 * @returns IntProto
				 */
				public static fromObject(d: { [k: string]: any }): cosmos.base.v1beta1.IntProto;

				/**
				 * Creates a plain object from an IntProto message. Also converts values to other types if specified.
				 * @param m IntProto
				 * @param [o] Conversion options
				 * @returns Plain object
				 */
				public static toObject(m: cosmos.base.v1beta1.IntProto, o?: $protobuf.IConversionOptions): { [k: string]: any };

				/**
				 * Converts this IntProto to JSON.
				 * @returns JSON object
				 */
				public toJSON(): { [k: string]: any };
			}

			/** Properties of a DecProto. */
			interface IDecProto {
				/** DecProto dec */
				dec?: string | null;
			}

			/** Represents a DecProto. */
			class DecProto implements IDecProto {
				/**
				 * Constructs a new DecProto.
				 * @param [p] Properties to set
				 */
				constructor(p?: cosmos.base.v1beta1.IDecProto);

				/** DecProto dec. */
				public dec: string;

				/**
				 * Creates a new DecProto instance using the specified properties.
				 * @param [properties] Properties to set
				 * @returns DecProto instance
				 */
				public static create(properties?: cosmos.base.v1beta1.IDecProto): cosmos.base.v1beta1.DecProto;

				/**
				 * Encodes the specified DecProto message. Does not implicitly {@link cosmos.base.v1beta1.DecProto.verify|verify} messages.
				 * @param m DecProto message or plain object to encode
				 * @param [w] Writer to encode to
				 * @returns Writer
				 */
				public static encode(m: cosmos.base.v1beta1.IDecProto, w?: $protobuf.Writer): $protobuf.Writer;

				/**
				 * Decodes a DecProto message from the specified reader or buffer.
				 * @param r Reader or buffer to decode from
				 * @param [l] Message length if known beforehand
				 * @returns DecProto
				 * @throws {Error} If the payload is not a reader or valid buffer
				 * @throws {$protobuf.util.ProtocolError} If required fields are missing
				 */
				public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.base.v1beta1.DecProto;

				/**
				 * Creates a DecProto message from a plain object. Also converts values to their respective internal types.
				 * @param d Plain object
				 * @returns DecProto
				 */
				public static fromObject(d: { [k: string]: any }): cosmos.base.v1beta1.DecProto;

				/**
				 * Creates a plain object from a DecProto message. Also converts values to other types if specified.
				 * @param m DecProto
				 * @param [o] Conversion options
				 * @returns Plain object
				 */
				public static toObject(m: cosmos.base.v1beta1.DecProto, o?: $protobuf.IConversionOptions): { [k: string]: any };

				/**
				 * Converts this DecProto to JSON.
				 * @returns JSON object
				 */
				public toJSON(): { [k: string]: any };
			}
		}
	}

	/** Namespace bank. */
	namespace bank {
		/** Namespace v1beta1. */
		namespace v1beta1 {
			/** Properties of a Params. */
			interface IParams {
				/** Params sendEnabled */
				sendEnabled?: cosmos.bank.v1beta1.ISendEnabled[] | null;

				/** Params defaultSendEnabled */
				defaultSendEnabled?: boolean | null;
			}

			/** Represents a Params. */
			class Params implements IParams {
				/**
				 * Constructs a new Params.
				 * @param [p] Properties to set
				 */
				constructor(p?: cosmos.bank.v1beta1.IParams);

				/** Params sendEnabled. */
				public sendEnabled: cosmos.bank.v1beta1.ISendEnabled[];

				/** Params defaultSendEnabled. */
				public defaultSendEnabled: boolean;

				/**
				 * Creates a new Params instance using the specified properties.
				 * @param [properties] Properties to set
				 * @returns Params instance
				 */
				public static create(properties?: cosmos.bank.v1beta1.IParams): cosmos.bank.v1beta1.Params;

				/**
				 * Encodes the specified Params message. Does not implicitly {@link cosmos.bank.v1beta1.Params.verify|verify} messages.
				 * @param m Params message or plain object to encode
				 * @param [w] Writer to encode to
				 * @returns Writer
				 */
				public static encode(m: cosmos.bank.v1beta1.IParams, w?: $protobuf.Writer): $protobuf.Writer;

				/**
				 * Decodes a Params message from the specified reader or buffer.
				 * @param r Reader or buffer to decode from
				 * @param [l] Message length if known beforehand
				 * @returns Params
				 * @throws {Error} If the payload is not a reader or valid buffer
				 * @throws {$protobuf.util.ProtocolError} If required fields are missing
				 */
				public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.bank.v1beta1.Params;

				/**
				 * Creates a Params message from a plain object. Also converts values to their respective internal types.
				 * @param d Plain object
				 * @returns Params
				 */
				public static fromObject(d: { [k: string]: any }): cosmos.bank.v1beta1.Params;

				/**
				 * Creates a plain object from a Params message. Also converts values to other types if specified.
				 * @param m Params
				 * @param [o] Conversion options
				 * @returns Plain object
				 */
				public static toObject(m: cosmos.bank.v1beta1.Params, o?: $protobuf.IConversionOptions): { [k: string]: any };

				/**
				 * Converts this Params to JSON.
				 * @returns JSON object
				 */
				public toJSON(): { [k: string]: any };
			}

			/** Properties of a SendEnabled. */
			interface ISendEnabled {
				/** SendEnabled denom */
				denom?: string | null;

				/** SendEnabled enabled */
				enabled?: boolean | null;
			}

			/** Represents a SendEnabled. */
			class SendEnabled implements ISendEnabled {
				/**
				 * Constructs a new SendEnabled.
				 * @param [p] Properties to set
				 */
				constructor(p?: cosmos.bank.v1beta1.ISendEnabled);

				/** SendEnabled denom. */
				public denom: string;

				/** SendEnabled enabled. */
				public enabled: boolean;

				/**
				 * Creates a new SendEnabled instance using the specified properties.
				 * @param [properties] Properties to set
				 * @returns SendEnabled instance
				 */
				public static create(properties?: cosmos.bank.v1beta1.ISendEnabled): cosmos.bank.v1beta1.SendEnabled;

				/**
				 * Encodes the specified SendEnabled message. Does not implicitly {@link cosmos.bank.v1beta1.SendEnabled.verify|verify} messages.
				 * @param m SendEnabled message or plain object to encode
				 * @param [w] Writer to encode to
				 * @returns Writer
				 */
				public static encode(m: cosmos.bank.v1beta1.ISendEnabled, w?: $protobuf.Writer): $protobuf.Writer;

				/**
				 * Decodes a SendEnabled message from the specified reader or buffer.
				 * @param r Reader or buffer to decode from
				 * @param [l] Message length if known beforehand
				 * @returns SendEnabled
				 * @throws {Error} If the payload is not a reader or valid buffer
				 * @throws {$protobuf.util.ProtocolError} If required fields are missing
				 */
				public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.bank.v1beta1.SendEnabled;

				/**
				 * Creates a SendEnabled message from a plain object. Also converts values to their respective internal types.
				 * @param d Plain object
				 * @returns SendEnabled
				 */
				public static fromObject(d: { [k: string]: any }): cosmos.bank.v1beta1.SendEnabled;

				/**
				 * Creates a plain object from a SendEnabled message. Also converts values to other types if specified.
				 * @param m SendEnabled
				 * @param [o] Conversion options
				 * @returns Plain object
				 */
				public static toObject(
					m: cosmos.bank.v1beta1.SendEnabled,
					o?: $protobuf.IConversionOptions
				): { [k: string]: any };

				/**
				 * Converts this SendEnabled to JSON.
				 * @returns JSON object
				 */
				public toJSON(): { [k: string]: any };
			}

			/** Properties of an Input. */
			interface IInput {
				/** Input address */
				address?: string | null;

				/** Input coins */
				coins?: cosmos.base.v1beta1.ICoin[] | null;
			}

			/** Represents an Input. */
			class Input implements IInput {
				/**
				 * Constructs a new Input.
				 * @param [p] Properties to set
				 */
				constructor(p?: cosmos.bank.v1beta1.IInput);

				/** Input address. */
				public address: string;

				/** Input coins. */
				public coins: cosmos.base.v1beta1.ICoin[];

				/**
				 * Creates a new Input instance using the specified properties.
				 * @param [properties] Properties to set
				 * @returns Input instance
				 */
				public static create(properties?: cosmos.bank.v1beta1.IInput): cosmos.bank.v1beta1.Input;

				/**
				 * Encodes the specified Input message. Does not implicitly {@link cosmos.bank.v1beta1.Input.verify|verify} messages.
				 * @param m Input message or plain object to encode
				 * @param [w] Writer to encode to
				 * @returns Writer
				 */
				public static encode(m: cosmos.bank.v1beta1.IInput, w?: $protobuf.Writer): $protobuf.Writer;

				/**
				 * Decodes an Input message from the specified reader or buffer.
				 * @param r Reader or buffer to decode from
				 * @param [l] Message length if known beforehand
				 * @returns Input
				 * @throws {Error} If the payload is not a reader or valid buffer
				 * @throws {$protobuf.util.ProtocolError} If required fields are missing
				 */
				public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.bank.v1beta1.Input;

				/**
				 * Creates an Input message from a plain object. Also converts values to their respective internal types.
				 * @param d Plain object
				 * @returns Input
				 */
				public static fromObject(d: { [k: string]: any }): cosmos.bank.v1beta1.Input;

				/**
				 * Creates a plain object from an Input message. Also converts values to other types if specified.
				 * @param m Input
				 * @param [o] Conversion options
				 * @returns Plain object
				 */
				public static toObject(m: cosmos.bank.v1beta1.Input, o?: $protobuf.IConversionOptions): { [k: string]: any };

				/**
				 * Converts this Input to JSON.
				 * @returns JSON object
				 */
				public toJSON(): { [k: string]: any };
			}

			/** Properties of an Output. */
			interface IOutput {
				/** Output address */
				address?: string | null;

				/** Output coins */
				coins?: cosmos.base.v1beta1.ICoin[] | null;
			}

			/** Represents an Output. */
			class Output implements IOutput {
				/**
				 * Constructs a new Output.
				 * @param [p] Properties to set
				 */
				constructor(p?: cosmos.bank.v1beta1.IOutput);

				/** Output address. */
				public address: string;

				/** Output coins. */
				public coins: cosmos.base.v1beta1.ICoin[];

				/**
				 * Creates a new Output instance using the specified properties.
				 * @param [properties] Properties to set
				 * @returns Output instance
				 */
				public static create(properties?: cosmos.bank.v1beta1.IOutput): cosmos.bank.v1beta1.Output;

				/**
				 * Encodes the specified Output message. Does not implicitly {@link cosmos.bank.v1beta1.Output.verify|verify} messages.
				 * @param m Output message or plain object to encode
				 * @param [w] Writer to encode to
				 * @returns Writer
				 */
				public static encode(m: cosmos.bank.v1beta1.IOutput, w?: $protobuf.Writer): $protobuf.Writer;

				/**
				 * Decodes an Output message from the specified reader or buffer.
				 * @param r Reader or buffer to decode from
				 * @param [l] Message length if known beforehand
				 * @returns Output
				 * @throws {Error} If the payload is not a reader or valid buffer
				 * @throws {$protobuf.util.ProtocolError} If required fields are missing
				 */
				public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.bank.v1beta1.Output;

				/**
				 * Creates an Output message from a plain object. Also converts values to their respective internal types.
				 * @param d Plain object
				 * @returns Output
				 */
				public static fromObject(d: { [k: string]: any }): cosmos.bank.v1beta1.Output;

				/**
				 * Creates a plain object from an Output message. Also converts values to other types if specified.
				 * @param m Output
				 * @param [o] Conversion options
				 * @returns Plain object
				 */
				public static toObject(m: cosmos.bank.v1beta1.Output, o?: $protobuf.IConversionOptions): { [k: string]: any };

				/**
				 * Converts this Output to JSON.
				 * @returns JSON object
				 */
				public toJSON(): { [k: string]: any };
			}

			/** Properties of a Supply. */
			interface ISupply {
				/** Supply total */
				total?: cosmos.base.v1beta1.ICoin[] | null;
			}

			/** Represents a Supply. */
			class Supply implements ISupply {
				/**
				 * Constructs a new Supply.
				 * @param [p] Properties to set
				 */
				constructor(p?: cosmos.bank.v1beta1.ISupply);

				/** Supply total. */
				public total: cosmos.base.v1beta1.ICoin[];

				/**
				 * Creates a new Supply instance using the specified properties.
				 * @param [properties] Properties to set
				 * @returns Supply instance
				 */
				public static create(properties?: cosmos.bank.v1beta1.ISupply): cosmos.bank.v1beta1.Supply;

				/**
				 * Encodes the specified Supply message. Does not implicitly {@link cosmos.bank.v1beta1.Supply.verify|verify} messages.
				 * @param m Supply message or plain object to encode
				 * @param [w] Writer to encode to
				 * @returns Writer
				 */
				public static encode(m: cosmos.bank.v1beta1.ISupply, w?: $protobuf.Writer): $protobuf.Writer;

				/**
				 * Decodes a Supply message from the specified reader or buffer.
				 * @param r Reader or buffer to decode from
				 * @param [l] Message length if known beforehand
				 * @returns Supply
				 * @throws {Error} If the payload is not a reader or valid buffer
				 * @throws {$protobuf.util.ProtocolError} If required fields are missing
				 */
				public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.bank.v1beta1.Supply;

				/**
				 * Creates a Supply message from a plain object. Also converts values to their respective internal types.
				 * @param d Plain object
				 * @returns Supply
				 */
				public static fromObject(d: { [k: string]: any }): cosmos.bank.v1beta1.Supply;

				/**
				 * Creates a plain object from a Supply message. Also converts values to other types if specified.
				 * @param m Supply
				 * @param [o] Conversion options
				 * @returns Plain object
				 */
				public static toObject(m: cosmos.bank.v1beta1.Supply, o?: $protobuf.IConversionOptions): { [k: string]: any };

				/**
				 * Converts this Supply to JSON.
				 * @returns JSON object
				 */
				public toJSON(): { [k: string]: any };
			}

			/** Properties of a DenomUnit. */
			interface IDenomUnit {
				/** DenomUnit denom */
				denom?: string | null;

				/** DenomUnit exponent */
				exponent?: number | null;

				/** DenomUnit aliases */
				aliases?: string[] | null;
			}

			/** Represents a DenomUnit. */
			class DenomUnit implements IDenomUnit {
				/**
				 * Constructs a new DenomUnit.
				 * @param [p] Properties to set
				 */
				constructor(p?: cosmos.bank.v1beta1.IDenomUnit);

				/** DenomUnit denom. */
				public denom: string;

				/** DenomUnit exponent. */
				public exponent: number;

				/** DenomUnit aliases. */
				public aliases: string[];

				/**
				 * Creates a new DenomUnit instance using the specified properties.
				 * @param [properties] Properties to set
				 * @returns DenomUnit instance
				 */
				public static create(properties?: cosmos.bank.v1beta1.IDenomUnit): cosmos.bank.v1beta1.DenomUnit;

				/**
				 * Encodes the specified DenomUnit message. Does not implicitly {@link cosmos.bank.v1beta1.DenomUnit.verify|verify} messages.
				 * @param m DenomUnit message or plain object to encode
				 * @param [w] Writer to encode to
				 * @returns Writer
				 */
				public static encode(m: cosmos.bank.v1beta1.IDenomUnit, w?: $protobuf.Writer): $protobuf.Writer;

				/**
				 * Decodes a DenomUnit message from the specified reader or buffer.
				 * @param r Reader or buffer to decode from
				 * @param [l] Message length if known beforehand
				 * @returns DenomUnit
				 * @throws {Error} If the payload is not a reader or valid buffer
				 * @throws {$protobuf.util.ProtocolError} If required fields are missing
				 */
				public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.bank.v1beta1.DenomUnit;

				/**
				 * Creates a DenomUnit message from a plain object. Also converts values to their respective internal types.
				 * @param d Plain object
				 * @returns DenomUnit
				 */
				public static fromObject(d: { [k: string]: any }): cosmos.bank.v1beta1.DenomUnit;

				/**
				 * Creates a plain object from a DenomUnit message. Also converts values to other types if specified.
				 * @param m DenomUnit
				 * @param [o] Conversion options
				 * @returns Plain object
				 */
				public static toObject(
					m: cosmos.bank.v1beta1.DenomUnit,
					o?: $protobuf.IConversionOptions
				): { [k: string]: any };

				/**
				 * Converts this DenomUnit to JSON.
				 * @returns JSON object
				 */
				public toJSON(): { [k: string]: any };
			}

			/** Properties of a Metadata. */
			interface IMetadata {
				/** Metadata description */
				description?: string | null;

				/** Metadata denomUnits */
				denomUnits?: cosmos.bank.v1beta1.IDenomUnit[] | null;

				/** Metadata base */
				base?: string | null;

				/** Metadata display */
				display?: string | null;

				/** Metadata name */
				name?: string | null;

				/** Metadata symbol */
				symbol?: string | null;
			}

			/** Represents a Metadata. */
			class Metadata implements IMetadata {
				/**
				 * Constructs a new Metadata.
				 * @param [p] Properties to set
				 */
				constructor(p?: cosmos.bank.v1beta1.IMetadata);

				/** Metadata description. */
				public description: string;

				/** Metadata denomUnits. */
				public denomUnits: cosmos.bank.v1beta1.IDenomUnit[];

				/** Metadata base. */
				public base: string;

				/** Metadata display. */
				public display: string;

				/** Metadata name. */
				public name: string;

				/** Metadata symbol. */
				public symbol: string;

				/**
				 * Creates a new Metadata instance using the specified properties.
				 * @param [properties] Properties to set
				 * @returns Metadata instance
				 */
				public static create(properties?: cosmos.bank.v1beta1.IMetadata): cosmos.bank.v1beta1.Metadata;

				/**
				 * Encodes the specified Metadata message. Does not implicitly {@link cosmos.bank.v1beta1.Metadata.verify|verify} messages.
				 * @param m Metadata message or plain object to encode
				 * @param [w] Writer to encode to
				 * @returns Writer
				 */
				public static encode(m: cosmos.bank.v1beta1.IMetadata, w?: $protobuf.Writer): $protobuf.Writer;

				/**
				 * Decodes a Metadata message from the specified reader or buffer.
				 * @param r Reader or buffer to decode from
				 * @param [l] Message length if known beforehand
				 * @returns Metadata
				 * @throws {Error} If the payload is not a reader or valid buffer
				 * @throws {$protobuf.util.ProtocolError} If required fields are missing
				 */
				public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.bank.v1beta1.Metadata;

				/**
				 * Creates a Metadata message from a plain object. Also converts values to their respective internal types.
				 * @param d Plain object
				 * @returns Metadata
				 */
				public static fromObject(d: { [k: string]: any }): cosmos.bank.v1beta1.Metadata;

				/**
				 * Creates a plain object from a Metadata message. Also converts values to other types if specified.
				 * @param m Metadata
				 * @param [o] Conversion options
				 * @returns Plain object
				 */
				public static toObject(m: cosmos.bank.v1beta1.Metadata, o?: $protobuf.IConversionOptions): { [k: string]: any };

				/**
				 * Converts this Metadata to JSON.
				 * @returns JSON object
				 */
				public toJSON(): { [k: string]: any };
			}
		}
	}
}

/** Namespace osmosis. */
export namespace osmosis {
	/** Namespace gamm. */
	namespace gamm {
		/** Namespace v1beta1. */
		namespace v1beta1 {
			/** Properties of a PoolAsset. */
			interface IPoolAsset {
				/** PoolAsset token */
				token?: cosmos.base.v1beta1.ICoin | null;

				/** PoolAsset weight */
				weight?: string | null;
			}

			/** Represents a PoolAsset. */
			class PoolAsset implements IPoolAsset {
				/**
				 * Constructs a new PoolAsset.
				 * @param [p] Properties to set
				 */
				constructor(p?: osmosis.gamm.v1beta1.IPoolAsset);

				/** PoolAsset token. */
				public token?: cosmos.base.v1beta1.ICoin | null;

				/** PoolAsset weight. */
				public weight: string;

				/**
				 * Creates a new PoolAsset instance using the specified properties.
				 * @param [properties] Properties to set
				 * @returns PoolAsset instance
				 */
				public static create(properties?: osmosis.gamm.v1beta1.IPoolAsset): osmosis.gamm.v1beta1.PoolAsset;

				/**
				 * Encodes the specified PoolAsset message. Does not implicitly {@link osmosis.gamm.v1beta1.PoolAsset.verify|verify} messages.
				 * @param m PoolAsset message or plain object to encode
				 * @param [w] Writer to encode to
				 * @returns Writer
				 */
				public static encode(m: osmosis.gamm.v1beta1.IPoolAsset, w?: $protobuf.Writer): $protobuf.Writer;

				/**
				 * Decodes a PoolAsset message from the specified reader or buffer.
				 * @param r Reader or buffer to decode from
				 * @param [l] Message length if known beforehand
				 * @returns PoolAsset
				 * @throws {Error} If the payload is not a reader or valid buffer
				 * @throws {$protobuf.util.ProtocolError} If required fields are missing
				 */
				public static decode(r: $protobuf.Reader | Uint8Array, l?: number): osmosis.gamm.v1beta1.PoolAsset;

				/**
				 * Creates a PoolAsset message from a plain object. Also converts values to their respective internal types.
				 * @param d Plain object
				 * @returns PoolAsset
				 */
				public static fromObject(d: { [k: string]: any }): osmosis.gamm.v1beta1.PoolAsset;

				/**
				 * Creates a plain object from a PoolAsset message. Also converts values to other types if specified.
				 * @param m PoolAsset
				 * @param [o] Conversion options
				 * @returns Plain object
				 */
				public static toObject(
					m: osmosis.gamm.v1beta1.PoolAsset,
					o?: $protobuf.IConversionOptions
				): { [k: string]: any };

				/**
				 * Converts this PoolAsset to JSON.
				 * @returns JSON object
				 */
				public toJSON(): { [k: string]: any };
			}

			/** Properties of a SmoothWeightChangeParams. */
			interface ISmoothWeightChangeParams {
				/** SmoothWeightChangeParams startTime */
				startTime?: google.protobuf.ITimestamp | null;

				/** SmoothWeightChangeParams duration */
				duration?: google.protobuf.IDuration | null;

				/** SmoothWeightChangeParams initialPoolWeights */
				initialPoolWeights?: osmosis.gamm.v1beta1.IPoolAsset[] | null;

				/** SmoothWeightChangeParams targetPoolWeights */
				targetPoolWeights?: osmosis.gamm.v1beta1.IPoolAsset[] | null;
			}

			/** Represents a SmoothWeightChangeParams. */
			class SmoothWeightChangeParams implements ISmoothWeightChangeParams {
				/**
				 * Constructs a new SmoothWeightChangeParams.
				 * @param [p] Properties to set
				 */
				constructor(p?: osmosis.gamm.v1beta1.ISmoothWeightChangeParams);

				/** SmoothWeightChangeParams startTime. */
				public startTime?: google.protobuf.ITimestamp | null;

				/** SmoothWeightChangeParams duration. */
				public duration?: google.protobuf.IDuration | null;

				/** SmoothWeightChangeParams initialPoolWeights. */
				public initialPoolWeights: osmosis.gamm.v1beta1.IPoolAsset[];

				/** SmoothWeightChangeParams targetPoolWeights. */
				public targetPoolWeights: osmosis.gamm.v1beta1.IPoolAsset[];

				/**
				 * Creates a new SmoothWeightChangeParams instance using the specified properties.
				 * @param [properties] Properties to set
				 * @returns SmoothWeightChangeParams instance
				 */
				public static create(
					properties?: osmosis.gamm.v1beta1.ISmoothWeightChangeParams
				): osmosis.gamm.v1beta1.SmoothWeightChangeParams;

				/**
				 * Encodes the specified SmoothWeightChangeParams message. Does not implicitly {@link osmosis.gamm.v1beta1.SmoothWeightChangeParams.verify|verify} messages.
				 * @param m SmoothWeightChangeParams message or plain object to encode
				 * @param [w] Writer to encode to
				 * @returns Writer
				 */
				public static encode(m: osmosis.gamm.v1beta1.ISmoothWeightChangeParams, w?: $protobuf.Writer): $protobuf.Writer;

				/**
				 * Decodes a SmoothWeightChangeParams message from the specified reader or buffer.
				 * @param r Reader or buffer to decode from
				 * @param [l] Message length if known beforehand
				 * @returns SmoothWeightChangeParams
				 * @throws {Error} If the payload is not a reader or valid buffer
				 * @throws {$protobuf.util.ProtocolError} If required fields are missing
				 */
				public static decode(
					r: $protobuf.Reader | Uint8Array,
					l?: number
				): osmosis.gamm.v1beta1.SmoothWeightChangeParams;

				/**
				 * Creates a SmoothWeightChangeParams message from a plain object. Also converts values to their respective internal types.
				 * @param d Plain object
				 * @returns SmoothWeightChangeParams
				 */
				public static fromObject(d: { [k: string]: any }): osmosis.gamm.v1beta1.SmoothWeightChangeParams;

				/**
				 * Creates a plain object from a SmoothWeightChangeParams message. Also converts values to other types if specified.
				 * @param m SmoothWeightChangeParams
				 * @param [o] Conversion options
				 * @returns Plain object
				 */
				public static toObject(
					m: osmosis.gamm.v1beta1.SmoothWeightChangeParams,
					o?: $protobuf.IConversionOptions
				): { [k: string]: any };

				/**
				 * Converts this SmoothWeightChangeParams to JSON.
				 * @returns JSON object
				 */
				public toJSON(): { [k: string]: any };
			}

			/** Properties of a PoolParams. */
			interface IPoolParams {
				/** PoolParams swapFee */
				swapFee?: string | null;

				/** PoolParams exitFee */
				exitFee?: string | null;

				/** PoolParams smoothWeightChangeParams */
				smoothWeightChangeParams?: osmosis.gamm.v1beta1.ISmoothWeightChangeParams | null;
			}

			/** Represents a PoolParams. */
			class PoolParams implements IPoolParams {
				/**
				 * Constructs a new PoolParams.
				 * @param [p] Properties to set
				 */
				constructor(p?: osmosis.gamm.v1beta1.IPoolParams);

				/** PoolParams swapFee. */
				public swapFee: string;

				/** PoolParams exitFee. */
				public exitFee: string;

				/** PoolParams smoothWeightChangeParams. */
				public smoothWeightChangeParams?: osmosis.gamm.v1beta1.ISmoothWeightChangeParams | null;

				/**
				 * Creates a new PoolParams instance using the specified properties.
				 * @param [properties] Properties to set
				 * @returns PoolParams instance
				 */
				public static create(properties?: osmosis.gamm.v1beta1.IPoolParams): osmosis.gamm.v1beta1.PoolParams;

				/**
				 * Encodes the specified PoolParams message. Does not implicitly {@link osmosis.gamm.v1beta1.PoolParams.verify|verify} messages.
				 * @param m PoolParams message or plain object to encode
				 * @param [w] Writer to encode to
				 * @returns Writer
				 */
				public static encode(m: osmosis.gamm.v1beta1.IPoolParams, w?: $protobuf.Writer): $protobuf.Writer;

				/**
				 * Decodes a PoolParams message from the specified reader or buffer.
				 * @param r Reader or buffer to decode from
				 * @param [l] Message length if known beforehand
				 * @returns PoolParams
				 * @throws {Error} If the payload is not a reader or valid buffer
				 * @throws {$protobuf.util.ProtocolError} If required fields are missing
				 */
				public static decode(r: $protobuf.Reader | Uint8Array, l?: number): osmosis.gamm.v1beta1.PoolParams;

				/**
				 * Creates a PoolParams message from a plain object. Also converts values to their respective internal types.
				 * @param d Plain object
				 * @returns PoolParams
				 */
				public static fromObject(d: { [k: string]: any }): osmosis.gamm.v1beta1.PoolParams;

				/**
				 * Creates a plain object from a PoolParams message. Also converts values to other types if specified.
				 * @param m PoolParams
				 * @param [o] Conversion options
				 * @returns Plain object
				 */
				public static toObject(
					m: osmosis.gamm.v1beta1.PoolParams,
					o?: $protobuf.IConversionOptions
				): { [k: string]: any };

				/**
				 * Converts this PoolParams to JSON.
				 * @returns JSON object
				 */
				public toJSON(): { [k: string]: any };
			}

			/** Properties of a MsgCreatePool. */
			interface IMsgCreatePool {
				/** MsgCreatePool sender */
				sender?: string | null;

				/** MsgCreatePool poolParams */
				poolParams?: osmosis.gamm.v1beta1.IPoolParams | null;

				/** MsgCreatePool poolAssets */
				poolAssets?: osmosis.gamm.v1beta1.IPoolAsset[] | null;

				/** MsgCreatePool futurePoolGovernor */
				futurePoolGovernor?: string | null;
			}

			/** Represents a MsgCreatePool. */
			class MsgCreatePool implements IMsgCreatePool {
				/**
				 * Constructs a new MsgCreatePool.
				 * @param [p] Properties to set
				 */
				constructor(p?: osmosis.gamm.v1beta1.IMsgCreatePool);

				/** MsgCreatePool sender. */
				public sender: string;

				/** MsgCreatePool poolParams. */
				public poolParams?: osmosis.gamm.v1beta1.IPoolParams | null;

				/** MsgCreatePool poolAssets. */
				public poolAssets: osmosis.gamm.v1beta1.IPoolAsset[];

				/** MsgCreatePool futurePoolGovernor. */
				public futurePoolGovernor: string;

				/**
				 * Creates a new MsgCreatePool instance using the specified properties.
				 * @param [properties] Properties to set
				 * @returns MsgCreatePool instance
				 */
				public static create(properties?: osmosis.gamm.v1beta1.IMsgCreatePool): osmosis.gamm.v1beta1.MsgCreatePool;

				/**
				 * Encodes the specified MsgCreatePool message. Does not implicitly {@link osmosis.gamm.v1beta1.MsgCreatePool.verify|verify} messages.
				 * @param m MsgCreatePool message or plain object to encode
				 * @param [w] Writer to encode to
				 * @returns Writer
				 */
				public static encode(m: osmosis.gamm.v1beta1.IMsgCreatePool, w?: $protobuf.Writer): $protobuf.Writer;

				/**
				 * Decodes a MsgCreatePool message from the specified reader or buffer.
				 * @param r Reader or buffer to decode from
				 * @param [l] Message length if known beforehand
				 * @returns MsgCreatePool
				 * @throws {Error} If the payload is not a reader or valid buffer
				 * @throws {$protobuf.util.ProtocolError} If required fields are missing
				 */
				public static decode(r: $protobuf.Reader | Uint8Array, l?: number): osmosis.gamm.v1beta1.MsgCreatePool;

				/**
				 * Creates a MsgCreatePool message from a plain object. Also converts values to their respective internal types.
				 * @param d Plain object
				 * @returns MsgCreatePool
				 */
				public static fromObject(d: { [k: string]: any }): osmosis.gamm.v1beta1.MsgCreatePool;

				/**
				 * Creates a plain object from a MsgCreatePool message. Also converts values to other types if specified.
				 * @param m MsgCreatePool
				 * @param [o] Conversion options
				 * @returns Plain object
				 */
				public static toObject(
					m: osmosis.gamm.v1beta1.MsgCreatePool,
					o?: $protobuf.IConversionOptions
				): { [k: string]: any };

				/**
				 * Converts this MsgCreatePool to JSON.
				 * @returns JSON object
				 */
				public toJSON(): { [k: string]: any };
			}

			/** Properties of a MsgJoinPool. */
			interface IMsgJoinPool {
				/** MsgJoinPool sender */
				sender?: string | null;

				/** MsgJoinPool poolId */
				poolId?: Long | null;

				/** MsgJoinPool shareOutAmount */
				shareOutAmount?: string | null;

				/** MsgJoinPool tokenInMaxs */
				tokenInMaxs?: cosmos.base.v1beta1.ICoin[] | null;
			}

			/** Represents a MsgJoinPool. */
			class MsgJoinPool implements IMsgJoinPool {
				/**
				 * Constructs a new MsgJoinPool.
				 * @param [p] Properties to set
				 */
				constructor(p?: osmosis.gamm.v1beta1.IMsgJoinPool);

				/** MsgJoinPool sender. */
				public sender: string;

				/** MsgJoinPool poolId. */
				public poolId: Long;

				/** MsgJoinPool shareOutAmount. */
				public shareOutAmount: string;

				/** MsgJoinPool tokenInMaxs. */
				public tokenInMaxs: cosmos.base.v1beta1.ICoin[];

				/**
				 * Creates a new MsgJoinPool instance using the specified properties.
				 * @param [properties] Properties to set
				 * @returns MsgJoinPool instance
				 */
				public static create(properties?: osmosis.gamm.v1beta1.IMsgJoinPool): osmosis.gamm.v1beta1.MsgJoinPool;

				/**
				 * Encodes the specified MsgJoinPool message. Does not implicitly {@link osmosis.gamm.v1beta1.MsgJoinPool.verify|verify} messages.
				 * @param m MsgJoinPool message or plain object to encode
				 * @param [w] Writer to encode to
				 * @returns Writer
				 */
				public static encode(m: osmosis.gamm.v1beta1.IMsgJoinPool, w?: $protobuf.Writer): $protobuf.Writer;

				/**
				 * Decodes a MsgJoinPool message from the specified reader or buffer.
				 * @param r Reader or buffer to decode from
				 * @param [l] Message length if known beforehand
				 * @returns MsgJoinPool
				 * @throws {Error} If the payload is not a reader or valid buffer
				 * @throws {$protobuf.util.ProtocolError} If required fields are missing
				 */
				public static decode(r: $protobuf.Reader | Uint8Array, l?: number): osmosis.gamm.v1beta1.MsgJoinPool;

				/**
				 * Creates a MsgJoinPool message from a plain object. Also converts values to their respective internal types.
				 * @param d Plain object
				 * @returns MsgJoinPool
				 */
				public static fromObject(d: { [k: string]: any }): osmosis.gamm.v1beta1.MsgJoinPool;

				/**
				 * Creates a plain object from a MsgJoinPool message. Also converts values to other types if specified.
				 * @param m MsgJoinPool
				 * @param [o] Conversion options
				 * @returns Plain object
				 */
				public static toObject(
					m: osmosis.gamm.v1beta1.MsgJoinPool,
					o?: $protobuf.IConversionOptions
				): { [k: string]: any };

				/**
				 * Converts this MsgJoinPool to JSON.
				 * @returns JSON object
				 */
				public toJSON(): { [k: string]: any };
			}

			/** Properties of a MsgExitPool. */
			interface IMsgExitPool {
				/** MsgExitPool sender */
				sender?: string | null;

				/** MsgExitPool poolId */
				poolId?: Long | null;

				/** MsgExitPool shareInAmount */
				shareInAmount?: string | null;

				/** MsgExitPool tokenOutMins */
				tokenOutMins?: cosmos.base.v1beta1.ICoin[] | null;
			}

			/** Represents a MsgExitPool. */
			class MsgExitPool implements IMsgExitPool {
				/**
				 * Constructs a new MsgExitPool.
				 * @param [p] Properties to set
				 */
				constructor(p?: osmosis.gamm.v1beta1.IMsgExitPool);

				/** MsgExitPool sender. */
				public sender: string;

				/** MsgExitPool poolId. */
				public poolId: Long;

				/** MsgExitPool shareInAmount. */
				public shareInAmount: string;

				/** MsgExitPool tokenOutMins. */
				public tokenOutMins: cosmos.base.v1beta1.ICoin[];

				/**
				 * Creates a new MsgExitPool instance using the specified properties.
				 * @param [properties] Properties to set
				 * @returns MsgExitPool instance
				 */
				public static create(properties?: osmosis.gamm.v1beta1.IMsgExitPool): osmosis.gamm.v1beta1.MsgExitPool;

				/**
				 * Encodes the specified MsgExitPool message. Does not implicitly {@link osmosis.gamm.v1beta1.MsgExitPool.verify|verify} messages.
				 * @param m MsgExitPool message or plain object to encode
				 * @param [w] Writer to encode to
				 * @returns Writer
				 */
				public static encode(m: osmosis.gamm.v1beta1.IMsgExitPool, w?: $protobuf.Writer): $protobuf.Writer;

				/**
				 * Decodes a MsgExitPool message from the specified reader or buffer.
				 * @param r Reader or buffer to decode from
				 * @param [l] Message length if known beforehand
				 * @returns MsgExitPool
				 * @throws {Error} If the payload is not a reader or valid buffer
				 * @throws {$protobuf.util.ProtocolError} If required fields are missing
				 */
				public static decode(r: $protobuf.Reader | Uint8Array, l?: number): osmosis.gamm.v1beta1.MsgExitPool;

				/**
				 * Creates a MsgExitPool message from a plain object. Also converts values to their respective internal types.
				 * @param d Plain object
				 * @returns MsgExitPool
				 */
				public static fromObject(d: { [k: string]: any }): osmosis.gamm.v1beta1.MsgExitPool;

				/**
				 * Creates a plain object from a MsgExitPool message. Also converts values to other types if specified.
				 * @param m MsgExitPool
				 * @param [o] Conversion options
				 * @returns Plain object
				 */
				public static toObject(
					m: osmosis.gamm.v1beta1.MsgExitPool,
					o?: $protobuf.IConversionOptions
				): { [k: string]: any };

				/**
				 * Converts this MsgExitPool to JSON.
				 * @returns JSON object
				 */
				public toJSON(): { [k: string]: any };
			}

			/** Properties of a SwapAmountInRoute. */
			interface ISwapAmountInRoute {
				/** SwapAmountInRoute poolId */
				poolId?: Long | null;

				/** SwapAmountInRoute tokenOutDenom */
				tokenOutDenom?: string | null;
			}

			/** Represents a SwapAmountInRoute. */
			class SwapAmountInRoute implements ISwapAmountInRoute {
				/**
				 * Constructs a new SwapAmountInRoute.
				 * @param [p] Properties to set
				 */
				constructor(p?: osmosis.gamm.v1beta1.ISwapAmountInRoute);

				/** SwapAmountInRoute poolId. */
				public poolId: Long;

				/** SwapAmountInRoute tokenOutDenom. */
				public tokenOutDenom: string;

				/**
				 * Creates a new SwapAmountInRoute instance using the specified properties.
				 * @param [properties] Properties to set
				 * @returns SwapAmountInRoute instance
				 */
				public static create(
					properties?: osmosis.gamm.v1beta1.ISwapAmountInRoute
				): osmosis.gamm.v1beta1.SwapAmountInRoute;

				/**
				 * Encodes the specified SwapAmountInRoute message. Does not implicitly {@link osmosis.gamm.v1beta1.SwapAmountInRoute.verify|verify} messages.
				 * @param m SwapAmountInRoute message or plain object to encode
				 * @param [w] Writer to encode to
				 * @returns Writer
				 */
				public static encode(m: osmosis.gamm.v1beta1.ISwapAmountInRoute, w?: $protobuf.Writer): $protobuf.Writer;

				/**
				 * Decodes a SwapAmountInRoute message from the specified reader or buffer.
				 * @param r Reader or buffer to decode from
				 * @param [l] Message length if known beforehand
				 * @returns SwapAmountInRoute
				 * @throws {Error} If the payload is not a reader or valid buffer
				 * @throws {$protobuf.util.ProtocolError} If required fields are missing
				 */
				public static decode(r: $protobuf.Reader | Uint8Array, l?: number): osmosis.gamm.v1beta1.SwapAmountInRoute;

				/**
				 * Creates a SwapAmountInRoute message from a plain object. Also converts values to their respective internal types.
				 * @param d Plain object
				 * @returns SwapAmountInRoute
				 */
				public static fromObject(d: { [k: string]: any }): osmosis.gamm.v1beta1.SwapAmountInRoute;

				/**
				 * Creates a plain object from a SwapAmountInRoute message. Also converts values to other types if specified.
				 * @param m SwapAmountInRoute
				 * @param [o] Conversion options
				 * @returns Plain object
				 */
				public static toObject(
					m: osmosis.gamm.v1beta1.SwapAmountInRoute,
					o?: $protobuf.IConversionOptions
				): { [k: string]: any };

				/**
				 * Converts this SwapAmountInRoute to JSON.
				 * @returns JSON object
				 */
				public toJSON(): { [k: string]: any };
			}

			/** Properties of a MsgSwapExactAmountIn. */
			interface IMsgSwapExactAmountIn {
				/** MsgSwapExactAmountIn sender */
				sender?: string | null;

				/** MsgSwapExactAmountIn routes */
				routes?: osmosis.gamm.v1beta1.ISwapAmountInRoute[] | null;

				/** MsgSwapExactAmountIn tokenIn */
				tokenIn?: cosmos.base.v1beta1.ICoin | null;

				/** MsgSwapExactAmountIn tokenOutMinAmount */
				tokenOutMinAmount?: string | null;
			}

			/** Represents a MsgSwapExactAmountIn. */
			class MsgSwapExactAmountIn implements IMsgSwapExactAmountIn {
				/**
				 * Constructs a new MsgSwapExactAmountIn.
				 * @param [p] Properties to set
				 */
				constructor(p?: osmosis.gamm.v1beta1.IMsgSwapExactAmountIn);

				/** MsgSwapExactAmountIn sender. */
				public sender: string;

				/** MsgSwapExactAmountIn routes. */
				public routes: osmosis.gamm.v1beta1.ISwapAmountInRoute[];

				/** MsgSwapExactAmountIn tokenIn. */
				public tokenIn?: cosmos.base.v1beta1.ICoin | null;

				/** MsgSwapExactAmountIn tokenOutMinAmount. */
				public tokenOutMinAmount: string;

				/**
				 * Creates a new MsgSwapExactAmountIn instance using the specified properties.
				 * @param [properties] Properties to set
				 * @returns MsgSwapExactAmountIn instance
				 */
				public static create(
					properties?: osmosis.gamm.v1beta1.IMsgSwapExactAmountIn
				): osmosis.gamm.v1beta1.MsgSwapExactAmountIn;

				/**
				 * Encodes the specified MsgSwapExactAmountIn message. Does not implicitly {@link osmosis.gamm.v1beta1.MsgSwapExactAmountIn.verify|verify} messages.
				 * @param m MsgSwapExactAmountIn message or plain object to encode
				 * @param [w] Writer to encode to
				 * @returns Writer
				 */
				public static encode(m: osmosis.gamm.v1beta1.IMsgSwapExactAmountIn, w?: $protobuf.Writer): $protobuf.Writer;

				/**
				 * Decodes a MsgSwapExactAmountIn message from the specified reader or buffer.
				 * @param r Reader or buffer to decode from
				 * @param [l] Message length if known beforehand
				 * @returns MsgSwapExactAmountIn
				 * @throws {Error} If the payload is not a reader or valid buffer
				 * @throws {$protobuf.util.ProtocolError} If required fields are missing
				 */
				public static decode(r: $protobuf.Reader | Uint8Array, l?: number): osmosis.gamm.v1beta1.MsgSwapExactAmountIn;

				/**
				 * Creates a MsgSwapExactAmountIn message from a plain object. Also converts values to their respective internal types.
				 * @param d Plain object
				 * @returns MsgSwapExactAmountIn
				 */
				public static fromObject(d: { [k: string]: any }): osmosis.gamm.v1beta1.MsgSwapExactAmountIn;

				/**
				 * Creates a plain object from a MsgSwapExactAmountIn message. Also converts values to other types if specified.
				 * @param m MsgSwapExactAmountIn
				 * @param [o] Conversion options
				 * @returns Plain object
				 */
				public static toObject(
					m: osmosis.gamm.v1beta1.MsgSwapExactAmountIn,
					o?: $protobuf.IConversionOptions
				): { [k: string]: any };

				/**
				 * Converts this MsgSwapExactAmountIn to JSON.
				 * @returns JSON object
				 */
				public toJSON(): { [k: string]: any };
			}

			/** Properties of a SwapAmountOutRoute. */
			interface ISwapAmountOutRoute {
				/** SwapAmountOutRoute poolId */
				poolId?: Long | null;

				/** SwapAmountOutRoute tokenInDenom */
				tokenInDenom?: string | null;
			}

			/** Represents a SwapAmountOutRoute. */
			class SwapAmountOutRoute implements ISwapAmountOutRoute {
				/**
				 * Constructs a new SwapAmountOutRoute.
				 * @param [p] Properties to set
				 */
				constructor(p?: osmosis.gamm.v1beta1.ISwapAmountOutRoute);

				/** SwapAmountOutRoute poolId. */
				public poolId: Long;

				/** SwapAmountOutRoute tokenInDenom. */
				public tokenInDenom: string;

				/**
				 * Creates a new SwapAmountOutRoute instance using the specified properties.
				 * @param [properties] Properties to set
				 * @returns SwapAmountOutRoute instance
				 */
				public static create(
					properties?: osmosis.gamm.v1beta1.ISwapAmountOutRoute
				): osmosis.gamm.v1beta1.SwapAmountOutRoute;

				/**
				 * Encodes the specified SwapAmountOutRoute message. Does not implicitly {@link osmosis.gamm.v1beta1.SwapAmountOutRoute.verify|verify} messages.
				 * @param m SwapAmountOutRoute message or plain object to encode
				 * @param [w] Writer to encode to
				 * @returns Writer
				 */
				public static encode(m: osmosis.gamm.v1beta1.ISwapAmountOutRoute, w?: $protobuf.Writer): $protobuf.Writer;

				/**
				 * Decodes a SwapAmountOutRoute message from the specified reader or buffer.
				 * @param r Reader or buffer to decode from
				 * @param [l] Message length if known beforehand
				 * @returns SwapAmountOutRoute
				 * @throws {Error} If the payload is not a reader or valid buffer
				 * @throws {$protobuf.util.ProtocolError} If required fields are missing
				 */
				public static decode(r: $protobuf.Reader | Uint8Array, l?: number): osmosis.gamm.v1beta1.SwapAmountOutRoute;

				/**
				 * Creates a SwapAmountOutRoute message from a plain object. Also converts values to their respective internal types.
				 * @param d Plain object
				 * @returns SwapAmountOutRoute
				 */
				public static fromObject(d: { [k: string]: any }): osmosis.gamm.v1beta1.SwapAmountOutRoute;

				/**
				 * Creates a plain object from a SwapAmountOutRoute message. Also converts values to other types if specified.
				 * @param m SwapAmountOutRoute
				 * @param [o] Conversion options
				 * @returns Plain object
				 */
				public static toObject(
					m: osmosis.gamm.v1beta1.SwapAmountOutRoute,
					o?: $protobuf.IConversionOptions
				): { [k: string]: any };

				/**
				 * Converts this SwapAmountOutRoute to JSON.
				 * @returns JSON object
				 */
				public toJSON(): { [k: string]: any };
			}

			/** Properties of a MsgSwapExactAmountOut. */
			interface IMsgSwapExactAmountOut {
				/** MsgSwapExactAmountOut sender */
				sender?: string | null;

				/** MsgSwapExactAmountOut routes */
				routes?: osmosis.gamm.v1beta1.ISwapAmountOutRoute[] | null;

				/** MsgSwapExactAmountOut tokenInMaxAmount */
				tokenInMaxAmount?: string | null;

				/** MsgSwapExactAmountOut tokenOut */
				tokenOut?: cosmos.base.v1beta1.ICoin | null;
			}

			/** Represents a MsgSwapExactAmountOut. */
			class MsgSwapExactAmountOut implements IMsgSwapExactAmountOut {
				/**
				 * Constructs a new MsgSwapExactAmountOut.
				 * @param [p] Properties to set
				 */
				constructor(p?: osmosis.gamm.v1beta1.IMsgSwapExactAmountOut);

				/** MsgSwapExactAmountOut sender. */
				public sender: string;

				/** MsgSwapExactAmountOut routes. */
				public routes: osmosis.gamm.v1beta1.ISwapAmountOutRoute[];

				/** MsgSwapExactAmountOut tokenInMaxAmount. */
				public tokenInMaxAmount: string;

				/** MsgSwapExactAmountOut tokenOut. */
				public tokenOut?: cosmos.base.v1beta1.ICoin | null;

				/**
				 * Creates a new MsgSwapExactAmountOut instance using the specified properties.
				 * @param [properties] Properties to set
				 * @returns MsgSwapExactAmountOut instance
				 */
				public static create(
					properties?: osmosis.gamm.v1beta1.IMsgSwapExactAmountOut
				): osmosis.gamm.v1beta1.MsgSwapExactAmountOut;

				/**
				 * Encodes the specified MsgSwapExactAmountOut message. Does not implicitly {@link osmosis.gamm.v1beta1.MsgSwapExactAmountOut.verify|verify} messages.
				 * @param m MsgSwapExactAmountOut message or plain object to encode
				 * @param [w] Writer to encode to
				 * @returns Writer
				 */
				public static encode(m: osmosis.gamm.v1beta1.IMsgSwapExactAmountOut, w?: $protobuf.Writer): $protobuf.Writer;

				/**
				 * Decodes a MsgSwapExactAmountOut message from the specified reader or buffer.
				 * @param r Reader or buffer to decode from
				 * @param [l] Message length if known beforehand
				 * @returns MsgSwapExactAmountOut
				 * @throws {Error} If the payload is not a reader or valid buffer
				 * @throws {$protobuf.util.ProtocolError} If required fields are missing
				 */
				public static decode(r: $protobuf.Reader | Uint8Array, l?: number): osmosis.gamm.v1beta1.MsgSwapExactAmountOut;

				/**
				 * Creates a MsgSwapExactAmountOut message from a plain object. Also converts values to their respective internal types.
				 * @param d Plain object
				 * @returns MsgSwapExactAmountOut
				 */
				public static fromObject(d: { [k: string]: any }): osmosis.gamm.v1beta1.MsgSwapExactAmountOut;

				/**
				 * Creates a plain object from a MsgSwapExactAmountOut message. Also converts values to other types if specified.
				 * @param m MsgSwapExactAmountOut
				 * @param [o] Conversion options
				 * @returns Plain object
				 */
				public static toObject(
					m: osmosis.gamm.v1beta1.MsgSwapExactAmountOut,
					o?: $protobuf.IConversionOptions
				): { [k: string]: any };

				/**
				 * Converts this MsgSwapExactAmountOut to JSON.
				 * @returns JSON object
				 */
				public toJSON(): { [k: string]: any };
			}

			/** Properties of a MsgJoinSwapExternAmountIn. */
			interface IMsgJoinSwapExternAmountIn {
				/** MsgJoinSwapExternAmountIn sender */
				sender?: string | null;

				/** MsgJoinSwapExternAmountIn poolId */
				poolId?: Long | null;

				/** MsgJoinSwapExternAmountIn tokenIn */
				tokenIn?: cosmos.base.v1beta1.ICoin | null;

				/** MsgJoinSwapExternAmountIn shareOutMinAmount */
				shareOutMinAmount?: string | null;
			}

			/** Represents a MsgJoinSwapExternAmountIn. */
			class MsgJoinSwapExternAmountIn implements IMsgJoinSwapExternAmountIn {
				/**
				 * Constructs a new MsgJoinSwapExternAmountIn.
				 * @param [p] Properties to set
				 */
				constructor(p?: osmosis.gamm.v1beta1.IMsgJoinSwapExternAmountIn);

				/** MsgJoinSwapExternAmountIn sender. */
				public sender: string;

				/** MsgJoinSwapExternAmountIn poolId. */
				public poolId: Long;

				/** MsgJoinSwapExternAmountIn tokenIn. */
				public tokenIn?: cosmos.base.v1beta1.ICoin | null;

				/** MsgJoinSwapExternAmountIn shareOutMinAmount. */
				public shareOutMinAmount: string;

				/**
				 * Creates a new MsgJoinSwapExternAmountIn instance using the specified properties.
				 * @param [properties] Properties to set
				 * @returns MsgJoinSwapExternAmountIn instance
				 */
				public static create(
					properties?: osmosis.gamm.v1beta1.IMsgJoinSwapExternAmountIn
				): osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn;

				/**
				 * Encodes the specified MsgJoinSwapExternAmountIn message. Does not implicitly {@link osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn.verify|verify} messages.
				 * @param m MsgJoinSwapExternAmountIn message or plain object to encode
				 * @param [w] Writer to encode to
				 * @returns Writer
				 */
				public static encode(
					m: osmosis.gamm.v1beta1.IMsgJoinSwapExternAmountIn,
					w?: $protobuf.Writer
				): $protobuf.Writer;

				/**
				 * Decodes a MsgJoinSwapExternAmountIn message from the specified reader or buffer.
				 * @param r Reader or buffer to decode from
				 * @param [l] Message length if known beforehand
				 * @returns MsgJoinSwapExternAmountIn
				 * @throws {Error} If the payload is not a reader or valid buffer
				 * @throws {$protobuf.util.ProtocolError} If required fields are missing
				 */
				public static decode(
					r: $protobuf.Reader | Uint8Array,
					l?: number
				): osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn;

				/**
				 * Creates a MsgJoinSwapExternAmountIn message from a plain object. Also converts values to their respective internal types.
				 * @param d Plain object
				 * @returns MsgJoinSwapExternAmountIn
				 */
				public static fromObject(d: { [k: string]: any }): osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn;

				/**
				 * Creates a plain object from a MsgJoinSwapExternAmountIn message. Also converts values to other types if specified.
				 * @param m MsgJoinSwapExternAmountIn
				 * @param [o] Conversion options
				 * @returns Plain object
				 */
				public static toObject(
					m: osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn,
					o?: $protobuf.IConversionOptions
				): { [k: string]: any };

				/**
				 * Converts this MsgJoinSwapExternAmountIn to JSON.
				 * @returns JSON object
				 */
				public toJSON(): { [k: string]: any };
			}

			/** Properties of a MsgJoinSwapShareAmountOut. */
			interface IMsgJoinSwapShareAmountOut {
				/** MsgJoinSwapShareAmountOut sender */
				sender?: string | null;

				/** MsgJoinSwapShareAmountOut poolId */
				poolId?: Long | null;

				/** MsgJoinSwapShareAmountOut tokenInDenom */
				tokenInDenom?: string | null;

				/** MsgJoinSwapShareAmountOut shareOutAmount */
				shareOutAmount?: string | null;

				/** MsgJoinSwapShareAmountOut tokenInMaxAmount */
				tokenInMaxAmount?: string | null;
			}

			/** Represents a MsgJoinSwapShareAmountOut. */
			class MsgJoinSwapShareAmountOut implements IMsgJoinSwapShareAmountOut {
				/**
				 * Constructs a new MsgJoinSwapShareAmountOut.
				 * @param [p] Properties to set
				 */
				constructor(p?: osmosis.gamm.v1beta1.IMsgJoinSwapShareAmountOut);

				/** MsgJoinSwapShareAmountOut sender. */
				public sender: string;

				/** MsgJoinSwapShareAmountOut poolId. */
				public poolId: Long;

				/** MsgJoinSwapShareAmountOut tokenInDenom. */
				public tokenInDenom: string;

				/** MsgJoinSwapShareAmountOut shareOutAmount. */
				public shareOutAmount: string;

				/** MsgJoinSwapShareAmountOut tokenInMaxAmount. */
				public tokenInMaxAmount: string;

				/**
				 * Creates a new MsgJoinSwapShareAmountOut instance using the specified properties.
				 * @param [properties] Properties to set
				 * @returns MsgJoinSwapShareAmountOut instance
				 */
				public static create(
					properties?: osmosis.gamm.v1beta1.IMsgJoinSwapShareAmountOut
				): osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOut;

				/**
				 * Encodes the specified MsgJoinSwapShareAmountOut message. Does not implicitly {@link osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOut.verify|verify} messages.
				 * @param m MsgJoinSwapShareAmountOut message or plain object to encode
				 * @param [w] Writer to encode to
				 * @returns Writer
				 */
				public static encode(
					m: osmosis.gamm.v1beta1.IMsgJoinSwapShareAmountOut,
					w?: $protobuf.Writer
				): $protobuf.Writer;

				/**
				 * Decodes a MsgJoinSwapShareAmountOut message from the specified reader or buffer.
				 * @param r Reader or buffer to decode from
				 * @param [l] Message length if known beforehand
				 * @returns MsgJoinSwapShareAmountOut
				 * @throws {Error} If the payload is not a reader or valid buffer
				 * @throws {$protobuf.util.ProtocolError} If required fields are missing
				 */
				public static decode(
					r: $protobuf.Reader | Uint8Array,
					l?: number
				): osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOut;

				/**
				 * Creates a MsgJoinSwapShareAmountOut message from a plain object. Also converts values to their respective internal types.
				 * @param d Plain object
				 * @returns MsgJoinSwapShareAmountOut
				 */
				public static fromObject(d: { [k: string]: any }): osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOut;

				/**
				 * Creates a plain object from a MsgJoinSwapShareAmountOut message. Also converts values to other types if specified.
				 * @param m MsgJoinSwapShareAmountOut
				 * @param [o] Conversion options
				 * @returns Plain object
				 */
				public static toObject(
					m: osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOut,
					o?: $protobuf.IConversionOptions
				): { [k: string]: any };

				/**
				 * Converts this MsgJoinSwapShareAmountOut to JSON.
				 * @returns JSON object
				 */
				public toJSON(): { [k: string]: any };
			}

			/** Properties of a MsgExitSwapShareAmountIn. */
			interface IMsgExitSwapShareAmountIn {
				/** MsgExitSwapShareAmountIn sender */
				sender?: string | null;

				/** MsgExitSwapShareAmountIn poolId */
				poolId?: Long | null;

				/** MsgExitSwapShareAmountIn tokenOutDenom */
				tokenOutDenom?: string | null;

				/** MsgExitSwapShareAmountIn shareInAmount */
				shareInAmount?: string | null;

				/** MsgExitSwapShareAmountIn tokenOutMinAmount */
				tokenOutMinAmount?: string | null;
			}

			/** Represents a MsgExitSwapShareAmountIn. */
			class MsgExitSwapShareAmountIn implements IMsgExitSwapShareAmountIn {
				/**
				 * Constructs a new MsgExitSwapShareAmountIn.
				 * @param [p] Properties to set
				 */
				constructor(p?: osmosis.gamm.v1beta1.IMsgExitSwapShareAmountIn);

				/** MsgExitSwapShareAmountIn sender. */
				public sender: string;

				/** MsgExitSwapShareAmountIn poolId. */
				public poolId: Long;

				/** MsgExitSwapShareAmountIn tokenOutDenom. */
				public tokenOutDenom: string;

				/** MsgExitSwapShareAmountIn shareInAmount. */
				public shareInAmount: string;

				/** MsgExitSwapShareAmountIn tokenOutMinAmount. */
				public tokenOutMinAmount: string;

				/**
				 * Creates a new MsgExitSwapShareAmountIn instance using the specified properties.
				 * @param [properties] Properties to set
				 * @returns MsgExitSwapShareAmountIn instance
				 */
				public static create(
					properties?: osmosis.gamm.v1beta1.IMsgExitSwapShareAmountIn
				): osmosis.gamm.v1beta1.MsgExitSwapShareAmountIn;

				/**
				 * Encodes the specified MsgExitSwapShareAmountIn message. Does not implicitly {@link osmosis.gamm.v1beta1.MsgExitSwapShareAmountIn.verify|verify} messages.
				 * @param m MsgExitSwapShareAmountIn message or plain object to encode
				 * @param [w] Writer to encode to
				 * @returns Writer
				 */
				public static encode(m: osmosis.gamm.v1beta1.IMsgExitSwapShareAmountIn, w?: $protobuf.Writer): $protobuf.Writer;

				/**
				 * Decodes a MsgExitSwapShareAmountIn message from the specified reader or buffer.
				 * @param r Reader or buffer to decode from
				 * @param [l] Message length if known beforehand
				 * @returns MsgExitSwapShareAmountIn
				 * @throws {Error} If the payload is not a reader or valid buffer
				 * @throws {$protobuf.util.ProtocolError} If required fields are missing
				 */
				public static decode(
					r: $protobuf.Reader | Uint8Array,
					l?: number
				): osmosis.gamm.v1beta1.MsgExitSwapShareAmountIn;

				/**
				 * Creates a MsgExitSwapShareAmountIn message from a plain object. Also converts values to their respective internal types.
				 * @param d Plain object
				 * @returns MsgExitSwapShareAmountIn
				 */
				public static fromObject(d: { [k: string]: any }): osmosis.gamm.v1beta1.MsgExitSwapShareAmountIn;

				/**
				 * Creates a plain object from a MsgExitSwapShareAmountIn message. Also converts values to other types if specified.
				 * @param m MsgExitSwapShareAmountIn
				 * @param [o] Conversion options
				 * @returns Plain object
				 */
				public static toObject(
					m: osmosis.gamm.v1beta1.MsgExitSwapShareAmountIn,
					o?: $protobuf.IConversionOptions
				): { [k: string]: any };

				/**
				 * Converts this MsgExitSwapShareAmountIn to JSON.
				 * @returns JSON object
				 */
				public toJSON(): { [k: string]: any };
			}

			/** Properties of a MsgExitSwapExternAmountOut. */
			interface IMsgExitSwapExternAmountOut {
				/** MsgExitSwapExternAmountOut sender */
				sender?: string | null;

				/** MsgExitSwapExternAmountOut poolId */
				poolId?: Long | null;

				/** MsgExitSwapExternAmountOut tokenOut */
				tokenOut?: cosmos.base.v1beta1.ICoin | null;

				/** MsgExitSwapExternAmountOut shareInMaxAmount */
				shareInMaxAmount?: string | null;
			}

			/** Represents a MsgExitSwapExternAmountOut. */
			class MsgExitSwapExternAmountOut implements IMsgExitSwapExternAmountOut {
				/**
				 * Constructs a new MsgExitSwapExternAmountOut.
				 * @param [p] Properties to set
				 */
				constructor(p?: osmosis.gamm.v1beta1.IMsgExitSwapExternAmountOut);

				/** MsgExitSwapExternAmountOut sender. */
				public sender: string;

				/** MsgExitSwapExternAmountOut poolId. */
				public poolId: Long;

				/** MsgExitSwapExternAmountOut tokenOut. */
				public tokenOut?: cosmos.base.v1beta1.ICoin | null;

				/** MsgExitSwapExternAmountOut shareInMaxAmount. */
				public shareInMaxAmount: string;

				/**
				 * Creates a new MsgExitSwapExternAmountOut instance using the specified properties.
				 * @param [properties] Properties to set
				 * @returns MsgExitSwapExternAmountOut instance
				 */
				public static create(
					properties?: osmosis.gamm.v1beta1.IMsgExitSwapExternAmountOut
				): osmosis.gamm.v1beta1.MsgExitSwapExternAmountOut;

				/**
				 * Encodes the specified MsgExitSwapExternAmountOut message. Does not implicitly {@link osmosis.gamm.v1beta1.MsgExitSwapExternAmountOut.verify|verify} messages.
				 * @param m MsgExitSwapExternAmountOut message or plain object to encode
				 * @param [w] Writer to encode to
				 * @returns Writer
				 */
				public static encode(
					m: osmosis.gamm.v1beta1.IMsgExitSwapExternAmountOut,
					w?: $protobuf.Writer
				): $protobuf.Writer;

				/**
				 * Decodes a MsgExitSwapExternAmountOut message from the specified reader or buffer.
				 * @param r Reader or buffer to decode from
				 * @param [l] Message length if known beforehand
				 * @returns MsgExitSwapExternAmountOut
				 * @throws {Error} If the payload is not a reader or valid buffer
				 * @throws {$protobuf.util.ProtocolError} If required fields are missing
				 */
				public static decode(
					r: $protobuf.Reader | Uint8Array,
					l?: number
				): osmosis.gamm.v1beta1.MsgExitSwapExternAmountOut;

				/**
				 * Creates a MsgExitSwapExternAmountOut message from a plain object. Also converts values to their respective internal types.
				 * @param d Plain object
				 * @returns MsgExitSwapExternAmountOut
				 */
				public static fromObject(d: { [k: string]: any }): osmosis.gamm.v1beta1.MsgExitSwapExternAmountOut;

				/**
				 * Creates a plain object from a MsgExitSwapExternAmountOut message. Also converts values to other types if specified.
				 * @param m MsgExitSwapExternAmountOut
				 * @param [o] Conversion options
				 * @returns Plain object
				 */
				public static toObject(
					m: osmosis.gamm.v1beta1.MsgExitSwapExternAmountOut,
					o?: $protobuf.IConversionOptions
				): { [k: string]: any };

				/**
				 * Converts this MsgExitSwapExternAmountOut to JSON.
				 * @returns JSON object
				 */
				public toJSON(): { [k: string]: any };
			}
		}
	}

	/** Namespace lockup. */
	namespace lockup {
		/** LockQueryType enum. */
		enum LockQueryType {
			ByDuration = 0,
			ByTime = 1,
		}

		/** Properties of a QueryCondition. */
		interface IQueryCondition {
			/** QueryCondition lockQueryType */
			lockQueryType?: osmosis.lockup.LockQueryType | null;

			/** QueryCondition denom */
			denom?: string | null;

			/** QueryCondition duration */
			duration?: google.protobuf.IDuration | null;

			/** QueryCondition timestamp */
			timestamp?: google.protobuf.ITimestamp | null;
		}

		/** Represents a QueryCondition. */
		class QueryCondition implements IQueryCondition {
			/**
			 * Constructs a new QueryCondition.
			 * @param [p] Properties to set
			 */
			constructor(p?: osmosis.lockup.IQueryCondition);

			/** QueryCondition lockQueryType. */
			public lockQueryType: osmosis.lockup.LockQueryType;

			/** QueryCondition denom. */
			public denom: string;

			/** QueryCondition duration. */
			public duration?: google.protobuf.IDuration | null;

			/** QueryCondition timestamp. */
			public timestamp?: google.protobuf.ITimestamp | null;

			/**
			 * Creates a new QueryCondition instance using the specified properties.
			 * @param [properties] Properties to set
			 * @returns QueryCondition instance
			 */
			public static create(properties?: osmosis.lockup.IQueryCondition): osmosis.lockup.QueryCondition;

			/**
			 * Encodes the specified QueryCondition message. Does not implicitly {@link osmosis.lockup.QueryCondition.verify|verify} messages.
			 * @param m QueryCondition message or plain object to encode
			 * @param [w] Writer to encode to
			 * @returns Writer
			 */
			public static encode(m: osmosis.lockup.IQueryCondition, w?: $protobuf.Writer): $protobuf.Writer;

			/**
			 * Decodes a QueryCondition message from the specified reader or buffer.
			 * @param r Reader or buffer to decode from
			 * @param [l] Message length if known beforehand
			 * @returns QueryCondition
			 * @throws {Error} If the payload is not a reader or valid buffer
			 * @throws {$protobuf.util.ProtocolError} If required fields are missing
			 */
			public static decode(r: $protobuf.Reader | Uint8Array, l?: number): osmosis.lockup.QueryCondition;

			/**
			 * Creates a QueryCondition message from a plain object. Also converts values to their respective internal types.
			 * @param d Plain object
			 * @returns QueryCondition
			 */
			public static fromObject(d: { [k: string]: any }): osmosis.lockup.QueryCondition;

			/**
			 * Creates a plain object from a QueryCondition message. Also converts values to other types if specified.
			 * @param m QueryCondition
			 * @param [o] Conversion options
			 * @returns Plain object
			 */
			public static toObject(m: osmosis.lockup.QueryCondition, o?: $protobuf.IConversionOptions): { [k: string]: any };

			/**
			 * Converts this QueryCondition to JSON.
			 * @returns JSON object
			 */
			public toJSON(): { [k: string]: any };
		}

		/** Properties of a MsgLockTokens. */
		interface IMsgLockTokens {
			/** MsgLockTokens owner */
			owner?: string | null;

			/** MsgLockTokens duration */
			duration?: google.protobuf.IDuration | null;

			/** MsgLockTokens coins */
			coins?: cosmos.base.v1beta1.ICoin[] | null;
		}

		/** Represents a MsgLockTokens. */
		class MsgLockTokens implements IMsgLockTokens {
			/**
			 * Constructs a new MsgLockTokens.
			 * @param [p] Properties to set
			 */
			constructor(p?: osmosis.lockup.IMsgLockTokens);

			/** MsgLockTokens owner. */
			public owner: string;

			/** MsgLockTokens duration. */
			public duration?: google.protobuf.IDuration | null;

			/** MsgLockTokens coins. */
			public coins: cosmos.base.v1beta1.ICoin[];

			/**
			 * Creates a new MsgLockTokens instance using the specified properties.
			 * @param [properties] Properties to set
			 * @returns MsgLockTokens instance
			 */
			public static create(properties?: osmosis.lockup.IMsgLockTokens): osmosis.lockup.MsgLockTokens;

			/**
			 * Encodes the specified MsgLockTokens message. Does not implicitly {@link osmosis.lockup.MsgLockTokens.verify|verify} messages.
			 * @param m MsgLockTokens message or plain object to encode
			 * @param [w] Writer to encode to
			 * @returns Writer
			 */
			public static encode(m: osmosis.lockup.IMsgLockTokens, w?: $protobuf.Writer): $protobuf.Writer;

			/**
			 * Decodes a MsgLockTokens message from the specified reader or buffer.
			 * @param r Reader or buffer to decode from
			 * @param [l] Message length if known beforehand
			 * @returns MsgLockTokens
			 * @throws {Error} If the payload is not a reader or valid buffer
			 * @throws {$protobuf.util.ProtocolError} If required fields are missing
			 */
			public static decode(r: $protobuf.Reader | Uint8Array, l?: number): osmosis.lockup.MsgLockTokens;

			/**
			 * Creates a MsgLockTokens message from a plain object. Also converts values to their respective internal types.
			 * @param d Plain object
			 * @returns MsgLockTokens
			 */
			public static fromObject(d: { [k: string]: any }): osmosis.lockup.MsgLockTokens;

			/**
			 * Creates a plain object from a MsgLockTokens message. Also converts values to other types if specified.
			 * @param m MsgLockTokens
			 * @param [o] Conversion options
			 * @returns Plain object
			 */
			public static toObject(m: osmosis.lockup.MsgLockTokens, o?: $protobuf.IConversionOptions): { [k: string]: any };

			/**
			 * Converts this MsgLockTokens to JSON.
			 * @returns JSON object
			 */
			public toJSON(): { [k: string]: any };
		}

		/** Properties of a MsgBeginUnlockingAll. */
		interface IMsgBeginUnlockingAll {
			/** MsgBeginUnlockingAll owner */
			owner?: string | null;
		}

		/** Represents a MsgBeginUnlockingAll. */
		class MsgBeginUnlockingAll implements IMsgBeginUnlockingAll {
			/**
			 * Constructs a new MsgBeginUnlockingAll.
			 * @param [p] Properties to set
			 */
			constructor(p?: osmosis.lockup.IMsgBeginUnlockingAll);

			/** MsgBeginUnlockingAll owner. */
			public owner: string;

			/**
			 * Creates a new MsgBeginUnlockingAll instance using the specified properties.
			 * @param [properties] Properties to set
			 * @returns MsgBeginUnlockingAll instance
			 */
			public static create(properties?: osmosis.lockup.IMsgBeginUnlockingAll): osmosis.lockup.MsgBeginUnlockingAll;

			/**
			 * Encodes the specified MsgBeginUnlockingAll message. Does not implicitly {@link osmosis.lockup.MsgBeginUnlockingAll.verify|verify} messages.
			 * @param m MsgBeginUnlockingAll message or plain object to encode
			 * @param [w] Writer to encode to
			 * @returns Writer
			 */
			public static encode(m: osmosis.lockup.IMsgBeginUnlockingAll, w?: $protobuf.Writer): $protobuf.Writer;

			/**
			 * Decodes a MsgBeginUnlockingAll message from the specified reader or buffer.
			 * @param r Reader or buffer to decode from
			 * @param [l] Message length if known beforehand
			 * @returns MsgBeginUnlockingAll
			 * @throws {Error} If the payload is not a reader or valid buffer
			 * @throws {$protobuf.util.ProtocolError} If required fields are missing
			 */
			public static decode(r: $protobuf.Reader | Uint8Array, l?: number): osmosis.lockup.MsgBeginUnlockingAll;

			/**
			 * Creates a MsgBeginUnlockingAll message from a plain object. Also converts values to their respective internal types.
			 * @param d Plain object
			 * @returns MsgBeginUnlockingAll
			 */
			public static fromObject(d: { [k: string]: any }): osmosis.lockup.MsgBeginUnlockingAll;

			/**
			 * Creates a plain object from a MsgBeginUnlockingAll message. Also converts values to other types if specified.
			 * @param m MsgBeginUnlockingAll
			 * @param [o] Conversion options
			 * @returns Plain object
			 */
			public static toObject(
				m: osmosis.lockup.MsgBeginUnlockingAll,
				o?: $protobuf.IConversionOptions
			): { [k: string]: any };

			/**
			 * Converts this MsgBeginUnlockingAll to JSON.
			 * @returns JSON object
			 */
			public toJSON(): { [k: string]: any };
		}

		/** Properties of a MsgBeginUnlocking. */
		interface IMsgBeginUnlocking {
			/** MsgBeginUnlocking owner */
			owner?: string | null;

			/** MsgBeginUnlocking ID */
			ID?: Long | null;
		}

		/** Represents a MsgBeginUnlocking. */
		class MsgBeginUnlocking implements IMsgBeginUnlocking {
			/**
			 * Constructs a new MsgBeginUnlocking.
			 * @param [p] Properties to set
			 */
			constructor(p?: osmosis.lockup.IMsgBeginUnlocking);

			/** MsgBeginUnlocking owner. */
			public owner: string;

			/** MsgBeginUnlocking ID. */
			public ID: Long;

			/**
			 * Creates a new MsgBeginUnlocking instance using the specified properties.
			 * @param [properties] Properties to set
			 * @returns MsgBeginUnlocking instance
			 */
			public static create(properties?: osmosis.lockup.IMsgBeginUnlocking): osmosis.lockup.MsgBeginUnlocking;

			/**
			 * Encodes the specified MsgBeginUnlocking message. Does not implicitly {@link osmosis.lockup.MsgBeginUnlocking.verify|verify} messages.
			 * @param m MsgBeginUnlocking message or plain object to encode
			 * @param [w] Writer to encode to
			 * @returns Writer
			 */
			public static encode(m: osmosis.lockup.IMsgBeginUnlocking, w?: $protobuf.Writer): $protobuf.Writer;

			/**
			 * Decodes a MsgBeginUnlocking message from the specified reader or buffer.
			 * @param r Reader or buffer to decode from
			 * @param [l] Message length if known beforehand
			 * @returns MsgBeginUnlocking
			 * @throws {Error} If the payload is not a reader or valid buffer
			 * @throws {$protobuf.util.ProtocolError} If required fields are missing
			 */
			public static decode(r: $protobuf.Reader | Uint8Array, l?: number): osmosis.lockup.MsgBeginUnlocking;

			/**
			 * Creates a MsgBeginUnlocking message from a plain object. Also converts values to their respective internal types.
			 * @param d Plain object
			 * @returns MsgBeginUnlocking
			 */
			public static fromObject(d: { [k: string]: any }): osmosis.lockup.MsgBeginUnlocking;

			/**
			 * Creates a plain object from a MsgBeginUnlocking message. Also converts values to other types if specified.
			 * @param m MsgBeginUnlocking
			 * @param [o] Conversion options
			 * @returns Plain object
			 */
			public static toObject(
				m: osmosis.lockup.MsgBeginUnlocking,
				o?: $protobuf.IConversionOptions
			): { [k: string]: any };

			/**
			 * Converts this MsgBeginUnlocking to JSON.
			 * @returns JSON object
			 */
			public toJSON(): { [k: string]: any };
		}
	}

	/** Namespace incentives. */
	namespace incentives {
		/** Properties of a MsgCreateGauge. */
		interface IMsgCreateGauge {
			/** MsgCreateGauge isPerpetual */
			isPerpetual?: boolean | null;

			/** MsgCreateGauge owner */
			owner?: string | null;

			/** MsgCreateGauge distributeTo */
			distributeTo?: osmosis.lockup.IQueryCondition | null;

			/** MsgCreateGauge coins */
			coins?: cosmos.base.v1beta1.ICoin[] | null;

			/** MsgCreateGauge startTime */
			startTime?: google.protobuf.ITimestamp | null;

			/** MsgCreateGauge numEpochsPaidOver */
			numEpochsPaidOver?: Long | null;
		}

		/** Represents a MsgCreateGauge. */
		class MsgCreateGauge implements IMsgCreateGauge {
			/**
			 * Constructs a new MsgCreateGauge.
			 * @param [p] Properties to set
			 */
			constructor(p?: osmosis.incentives.IMsgCreateGauge);

			/** MsgCreateGauge isPerpetual. */
			public isPerpetual: boolean;

			/** MsgCreateGauge owner. */
			public owner: string;

			/** MsgCreateGauge distributeTo. */
			public distributeTo?: osmosis.lockup.IQueryCondition | null;

			/** MsgCreateGauge coins. */
			public coins: cosmos.base.v1beta1.ICoin[];

			/** MsgCreateGauge startTime. */
			public startTime?: google.protobuf.ITimestamp | null;

			/** MsgCreateGauge numEpochsPaidOver. */
			public numEpochsPaidOver: Long;

			/**
			 * Creates a new MsgCreateGauge instance using the specified properties.
			 * @param [properties] Properties to set
			 * @returns MsgCreateGauge instance
			 */
			public static create(properties?: osmosis.incentives.IMsgCreateGauge): osmosis.incentives.MsgCreateGauge;

			/**
			 * Encodes the specified MsgCreateGauge message. Does not implicitly {@link osmosis.incentives.MsgCreateGauge.verify|verify} messages.
			 * @param m MsgCreateGauge message or plain object to encode
			 * @param [w] Writer to encode to
			 * @returns Writer
			 */
			public static encode(m: osmosis.incentives.IMsgCreateGauge, w?: $protobuf.Writer): $protobuf.Writer;

			/**
			 * Decodes a MsgCreateGauge message from the specified reader or buffer.
			 * @param r Reader or buffer to decode from
			 * @param [l] Message length if known beforehand
			 * @returns MsgCreateGauge
			 * @throws {Error} If the payload is not a reader or valid buffer
			 * @throws {$protobuf.util.ProtocolError} If required fields are missing
			 */
			public static decode(r: $protobuf.Reader | Uint8Array, l?: number): osmosis.incentives.MsgCreateGauge;

			/**
			 * Creates a MsgCreateGauge message from a plain object. Also converts values to their respective internal types.
			 * @param d Plain object
			 * @returns MsgCreateGauge
			 */
			public static fromObject(d: { [k: string]: any }): osmosis.incentives.MsgCreateGauge;

			/**
			 * Creates a plain object from a MsgCreateGauge message. Also converts values to other types if specified.
			 * @param m MsgCreateGauge
			 * @param [o] Conversion options
			 * @returns Plain object
			 */
			public static toObject(
				m: osmosis.incentives.MsgCreateGauge,
				o?: $protobuf.IConversionOptions
			): { [k: string]: any };

			/**
			 * Converts this MsgCreateGauge to JSON.
			 * @returns JSON object
			 */
			public toJSON(): { [k: string]: any };
		}

		/** Properties of a MsgAddToGauge. */
		interface IMsgAddToGauge {
			/** MsgAddToGauge owner */
			owner?: string | null;

			/** MsgAddToGauge gaugeId */
			gaugeId?: Long | null;

			/** MsgAddToGauge rewards */
			rewards?: cosmos.base.v1beta1.ICoin[] | null;
		}

		/** Represents a MsgAddToGauge. */
		class MsgAddToGauge implements IMsgAddToGauge {
			/**
			 * Constructs a new MsgAddToGauge.
			 * @param [p] Properties to set
			 */
			constructor(p?: osmosis.incentives.IMsgAddToGauge);

			/** MsgAddToGauge owner. */
			public owner: string;

			/** MsgAddToGauge gaugeId. */
			public gaugeId: Long;

			/** MsgAddToGauge rewards. */
			public rewards: cosmos.base.v1beta1.ICoin[];

			/**
			 * Creates a new MsgAddToGauge instance using the specified properties.
			 * @param [properties] Properties to set
			 * @returns MsgAddToGauge instance
			 */
			public static create(properties?: osmosis.incentives.IMsgAddToGauge): osmosis.incentives.MsgAddToGauge;

			/**
			 * Encodes the specified MsgAddToGauge message. Does not implicitly {@link osmosis.incentives.MsgAddToGauge.verify|verify} messages.
			 * @param m MsgAddToGauge message or plain object to encode
			 * @param [w] Writer to encode to
			 * @returns Writer
			 */
			public static encode(m: osmosis.incentives.IMsgAddToGauge, w?: $protobuf.Writer): $protobuf.Writer;

			/**
			 * Decodes a MsgAddToGauge message from the specified reader or buffer.
			 * @param r Reader or buffer to decode from
			 * @param [l] Message length if known beforehand
			 * @returns MsgAddToGauge
			 * @throws {Error} If the payload is not a reader or valid buffer
			 * @throws {$protobuf.util.ProtocolError} If required fields are missing
			 */
			public static decode(r: $protobuf.Reader | Uint8Array, l?: number): osmosis.incentives.MsgAddToGauge;

			/**
			 * Creates a MsgAddToGauge message from a plain object. Also converts values to their respective internal types.
			 * @param d Plain object
			 * @returns MsgAddToGauge
			 */
			public static fromObject(d: { [k: string]: any }): osmosis.incentives.MsgAddToGauge;

			/**
			 * Creates a plain object from a MsgAddToGauge message. Also converts values to other types if specified.
			 * @param m MsgAddToGauge
			 * @param [o] Conversion options
			 * @returns Plain object
			 */
			public static toObject(
				m: osmosis.incentives.MsgAddToGauge,
				o?: $protobuf.IConversionOptions
			): { [k: string]: any };

			/**
			 * Converts this MsgAddToGauge to JSON.
			 * @returns JSON object
			 */
			public toJSON(): { [k: string]: any };
		}
	}
}

/** Namespace google. */
export namespace google {
	/** Namespace protobuf. */
	namespace protobuf {
		/** Properties of a Duration. */
		interface IDuration {
			/** Duration seconds */
			seconds?: Long | null;

			/** Duration nanos */
			nanos?: number | null;
		}

		/** Represents a Duration. */
		class Duration implements IDuration {
			/**
			 * Constructs a new Duration.
			 * @param [p] Properties to set
			 */
			constructor(p?: google.protobuf.IDuration);

			/** Duration seconds. */
			public seconds: Long;

			/** Duration nanos. */
			public nanos: number;

			/**
			 * Creates a new Duration instance using the specified properties.
			 * @param [properties] Properties to set
			 * @returns Duration instance
			 */
			public static create(properties?: google.protobuf.IDuration): google.protobuf.Duration;

			/**
			 * Encodes the specified Duration message. Does not implicitly {@link google.protobuf.Duration.verify|verify} messages.
			 * @param m Duration message or plain object to encode
			 * @param [w] Writer to encode to
			 * @returns Writer
			 */
			public static encode(m: google.protobuf.IDuration, w?: $protobuf.Writer): $protobuf.Writer;

			/**
			 * Decodes a Duration message from the specified reader or buffer.
			 * @param r Reader or buffer to decode from
			 * @param [l] Message length if known beforehand
			 * @returns Duration
			 * @throws {Error} If the payload is not a reader or valid buffer
			 * @throws {$protobuf.util.ProtocolError} If required fields are missing
			 */
			public static decode(r: $protobuf.Reader | Uint8Array, l?: number): google.protobuf.Duration;

			/**
			 * Creates a Duration message from a plain object. Also converts values to their respective internal types.
			 * @param d Plain object
			 * @returns Duration
			 */
			public static fromObject(d: { [k: string]: any }): google.protobuf.Duration;

			/**
			 * Creates a plain object from a Duration message. Also converts values to other types if specified.
			 * @param m Duration
			 * @param [o] Conversion options
			 * @returns Plain object
			 */
			public static toObject(m: google.protobuf.Duration, o?: $protobuf.IConversionOptions): { [k: string]: any };

			/**
			 * Converts this Duration to JSON.
			 * @returns JSON object
			 */
			public toJSON(): { [k: string]: any };
		}

		/** Properties of a Timestamp. */
		interface ITimestamp {
			/** Timestamp seconds */
			seconds?: Long | null;

			/** Timestamp nanos */
			nanos?: number | null;
		}

		/** Represents a Timestamp. */
		class Timestamp implements ITimestamp {
			/**
			 * Constructs a new Timestamp.
			 * @param [p] Properties to set
			 */
			constructor(p?: google.protobuf.ITimestamp);

			/** Timestamp seconds. */
			public seconds: Long;

			/** Timestamp nanos. */
			public nanos: number;

			/**
			 * Creates a new Timestamp instance using the specified properties.
			 * @param [properties] Properties to set
			 * @returns Timestamp instance
			 */
			public static create(properties?: google.protobuf.ITimestamp): google.protobuf.Timestamp;

			/**
			 * Encodes the specified Timestamp message. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
			 * @param m Timestamp message or plain object to encode
			 * @param [w] Writer to encode to
			 * @returns Writer
			 */
			public static encode(m: google.protobuf.ITimestamp, w?: $protobuf.Writer): $protobuf.Writer;

			/**
			 * Decodes a Timestamp message from the specified reader or buffer.
			 * @param r Reader or buffer to decode from
			 * @param [l] Message length if known beforehand
			 * @returns Timestamp
			 * @throws {Error} If the payload is not a reader or valid buffer
			 * @throws {$protobuf.util.ProtocolError} If required fields are missing
			 */
			public static decode(r: $protobuf.Reader | Uint8Array, l?: number): google.protobuf.Timestamp;

			/**
			 * Creates a Timestamp message from a plain object. Also converts values to their respective internal types.
			 * @param d Plain object
			 * @returns Timestamp
			 */
			public static fromObject(d: { [k: string]: any }): google.protobuf.Timestamp;

			/**
			 * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
			 * @param m Timestamp
			 * @param [o] Conversion options
			 * @returns Plain object
			 */
			public static toObject(m: google.protobuf.Timestamp, o?: $protobuf.IConversionOptions): { [k: string]: any };

			/**
			 * Converts this Timestamp to JSON.
			 * @returns JSON object
			 */
			public toJSON(): { [k: string]: any };
		}
	}
}
