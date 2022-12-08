import * as $protobuf from "protobufjs";
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
        public static create(
          properties?: cosmos.base.v1beta1.ICoin
        ): cosmos.base.v1beta1.Coin;

        /**
         * Encodes the specified Coin message. Does not implicitly {@link cosmos.base.v1beta1.Coin.verify|verify} messages.
         * @param m Coin message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.base.v1beta1.ICoin,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a Coin message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Coin
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.base.v1beta1.Coin;

        /**
         * Creates a Coin message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Coin
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.base.v1beta1.Coin;

        /**
         * Creates a plain object from a Coin message. Also converts values to other types if specified.
         * @param m Coin
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.base.v1beta1.Coin,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

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
        public static create(
          properties?: cosmos.base.v1beta1.IDecCoin
        ): cosmos.base.v1beta1.DecCoin;

        /**
         * Encodes the specified DecCoin message. Does not implicitly {@link cosmos.base.v1beta1.DecCoin.verify|verify} messages.
         * @param m DecCoin message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.base.v1beta1.IDecCoin,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a DecCoin message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns DecCoin
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.base.v1beta1.DecCoin;

        /**
         * Creates a DecCoin message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns DecCoin
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.base.v1beta1.DecCoin;

        /**
         * Creates a plain object from a DecCoin message. Also converts values to other types if specified.
         * @param m DecCoin
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.base.v1beta1.DecCoin,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

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
        public static create(
          properties?: cosmos.base.v1beta1.IIntProto
        ): cosmos.base.v1beta1.IntProto;

        /**
         * Encodes the specified IntProto message. Does not implicitly {@link cosmos.base.v1beta1.IntProto.verify|verify} messages.
         * @param m IntProto message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.base.v1beta1.IIntProto,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes an IntProto message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns IntProto
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.base.v1beta1.IntProto;

        /**
         * Creates an IntProto message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns IntProto
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.base.v1beta1.IntProto;

        /**
         * Creates a plain object from an IntProto message. Also converts values to other types if specified.
         * @param m IntProto
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.base.v1beta1.IntProto,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

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
        public static create(
          properties?: cosmos.base.v1beta1.IDecProto
        ): cosmos.base.v1beta1.DecProto;

        /**
         * Encodes the specified DecProto message. Does not implicitly {@link cosmos.base.v1beta1.DecProto.verify|verify} messages.
         * @param m DecProto message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.base.v1beta1.IDecProto,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a DecProto message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns DecProto
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.base.v1beta1.DecProto;

        /**
         * Creates a DecProto message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns DecProto
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.base.v1beta1.DecProto;

        /**
         * Creates a plain object from a DecProto message. Also converts values to other types if specified.
         * @param m DecProto
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.base.v1beta1.DecProto,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

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
        public static create(
          properties?: cosmos.bank.v1beta1.IParams
        ): cosmos.bank.v1beta1.Params;

        /**
         * Encodes the specified Params message. Does not implicitly {@link cosmos.bank.v1beta1.Params.verify|verify} messages.
         * @param m Params message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.IParams,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a Params message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Params
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.bank.v1beta1.Params;

        /**
         * Creates a Params message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Params
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.bank.v1beta1.Params;

        /**
         * Creates a plain object from a Params message. Also converts values to other types if specified.
         * @param m Params
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.Params,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

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
        public static create(
          properties?: cosmos.bank.v1beta1.ISendEnabled
        ): cosmos.bank.v1beta1.SendEnabled;

        /**
         * Encodes the specified SendEnabled message. Does not implicitly {@link cosmos.bank.v1beta1.SendEnabled.verify|verify} messages.
         * @param m SendEnabled message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.ISendEnabled,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a SendEnabled message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns SendEnabled
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.bank.v1beta1.SendEnabled;

        /**
         * Creates a SendEnabled message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns SendEnabled
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.bank.v1beta1.SendEnabled;

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
        public static create(
          properties?: cosmos.bank.v1beta1.IInput
        ): cosmos.bank.v1beta1.Input;

        /**
         * Encodes the specified Input message. Does not implicitly {@link cosmos.bank.v1beta1.Input.verify|verify} messages.
         * @param m Input message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.IInput,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes an Input message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Input
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.bank.v1beta1.Input;

        /**
         * Creates an Input message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Input
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.bank.v1beta1.Input;

        /**
         * Creates a plain object from an Input message. Also converts values to other types if specified.
         * @param m Input
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.Input,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

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
        public static create(
          properties?: cosmos.bank.v1beta1.IOutput
        ): cosmos.bank.v1beta1.Output;

        /**
         * Encodes the specified Output message. Does not implicitly {@link cosmos.bank.v1beta1.Output.verify|verify} messages.
         * @param m Output message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.IOutput,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes an Output message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Output
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.bank.v1beta1.Output;

        /**
         * Creates an Output message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Output
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.bank.v1beta1.Output;

        /**
         * Creates a plain object from an Output message. Also converts values to other types if specified.
         * @param m Output
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.Output,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

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
        public static create(
          properties?: cosmos.bank.v1beta1.ISupply
        ): cosmos.bank.v1beta1.Supply;

        /**
         * Encodes the specified Supply message. Does not implicitly {@link cosmos.bank.v1beta1.Supply.verify|verify} messages.
         * @param m Supply message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.ISupply,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a Supply message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Supply
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.bank.v1beta1.Supply;

        /**
         * Creates a Supply message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Supply
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.bank.v1beta1.Supply;

        /**
         * Creates a plain object from a Supply message. Also converts values to other types if specified.
         * @param m Supply
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.Supply,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

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
        public static create(
          properties?: cosmos.bank.v1beta1.IDenomUnit
        ): cosmos.bank.v1beta1.DenomUnit;

        /**
         * Encodes the specified DenomUnit message. Does not implicitly {@link cosmos.bank.v1beta1.DenomUnit.verify|verify} messages.
         * @param m DenomUnit message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.IDenomUnit,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a DenomUnit message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns DenomUnit
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.bank.v1beta1.DenomUnit;

        /**
         * Creates a DenomUnit message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns DenomUnit
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.bank.v1beta1.DenomUnit;

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
        public static create(
          properties?: cosmos.bank.v1beta1.IMetadata
        ): cosmos.bank.v1beta1.Metadata;

        /**
         * Encodes the specified Metadata message. Does not implicitly {@link cosmos.bank.v1beta1.Metadata.verify|verify} messages.
         * @param m Metadata message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.IMetadata,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a Metadata message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Metadata
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.bank.v1beta1.Metadata;

        /**
         * Creates a Metadata message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Metadata
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.bank.v1beta1.Metadata;

        /**
         * Creates a plain object from a Metadata message. Also converts values to other types if specified.
         * @param m Metadata
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.Metadata,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

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
      /** Represents a Msg */
      class Msg extends $protobuf.rpc.Service {
        /**
         * Constructs a new Msg service.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         */
        constructor(
          rpcImpl: $protobuf.RPCImpl,
          requestDelimited?: boolean,
          responseDelimited?: boolean
        );

        /**
         * Creates new Msg service using the specified rpc implementation.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         * @returns RPC service. Useful where requests and/or responses are streamed.
         */
        public static create(
          rpcImpl: $protobuf.RPCImpl,
          requestDelimited?: boolean,
          responseDelimited?: boolean
        ): Msg;

        /**
         * Calls JoinPool.
         * @param request MsgJoinPool message or plain object
         * @param callback Node-style callback called with the error, if any, and MsgJoinPoolResponse
         */
        public joinPool(
          request: osmosis.gamm.v1beta1.IMsgJoinPool,
          callback: osmosis.gamm.v1beta1.Msg.JoinPoolCallback
        ): void;

        /**
         * Calls JoinPool.
         * @param request MsgJoinPool message or plain object
         * @returns Promise
         */
        public joinPool(
          request: osmosis.gamm.v1beta1.IMsgJoinPool
        ): Promise<osmosis.gamm.v1beta1.MsgJoinPoolResponse>;

        /**
         * Calls ExitPool.
         * @param request MsgExitPool message or plain object
         * @param callback Node-style callback called with the error, if any, and MsgExitPoolResponse
         */
        public exitPool(
          request: osmosis.gamm.v1beta1.IMsgExitPool,
          callback: osmosis.gamm.v1beta1.Msg.ExitPoolCallback
        ): void;

        /**
         * Calls ExitPool.
         * @param request MsgExitPool message or plain object
         * @returns Promise
         */
        public exitPool(
          request: osmosis.gamm.v1beta1.IMsgExitPool
        ): Promise<osmosis.gamm.v1beta1.MsgExitPoolResponse>;

        /**
         * Calls SwapExactAmountIn.
         * @param request MsgSwapExactAmountIn message or plain object
         * @param callback Node-style callback called with the error, if any, and MsgSwapExactAmountInResponse
         */
        public swapExactAmountIn(
          request: osmosis.gamm.v1beta1.IMsgSwapExactAmountIn,
          callback: osmosis.gamm.v1beta1.Msg.SwapExactAmountInCallback
        ): void;

        /**
         * Calls SwapExactAmountIn.
         * @param request MsgSwapExactAmountIn message or plain object
         * @returns Promise
         */
        public swapExactAmountIn(
          request: osmosis.gamm.v1beta1.IMsgSwapExactAmountIn
        ): Promise<osmosis.gamm.v1beta1.MsgSwapExactAmountInResponse>;

        /**
         * Calls SwapExactAmountOut.
         * @param request MsgSwapExactAmountOut message or plain object
         * @param callback Node-style callback called with the error, if any, and MsgSwapExactAmountOutResponse
         */
        public swapExactAmountOut(
          request: osmosis.gamm.v1beta1.IMsgSwapExactAmountOut,
          callback: osmosis.gamm.v1beta1.Msg.SwapExactAmountOutCallback
        ): void;

        /**
         * Calls SwapExactAmountOut.
         * @param request MsgSwapExactAmountOut message or plain object
         * @returns Promise
         */
        public swapExactAmountOut(
          request: osmosis.gamm.v1beta1.IMsgSwapExactAmountOut
        ): Promise<osmosis.gamm.v1beta1.MsgSwapExactAmountOutResponse>;

        /**
         * Calls JoinSwapExternAmountIn.
         * @param request MsgJoinSwapExternAmountIn message or plain object
         * @param callback Node-style callback called with the error, if any, and MsgJoinSwapExternAmountInResponse
         */
        public joinSwapExternAmountIn(
          request: osmosis.gamm.v1beta1.IMsgJoinSwapExternAmountIn,
          callback: osmosis.gamm.v1beta1.Msg.JoinSwapExternAmountInCallback
        ): void;

        /**
         * Calls JoinSwapExternAmountIn.
         * @param request MsgJoinSwapExternAmountIn message or plain object
         * @returns Promise
         */
        public joinSwapExternAmountIn(
          request: osmosis.gamm.v1beta1.IMsgJoinSwapExternAmountIn
        ): Promise<osmosis.gamm.v1beta1.MsgJoinSwapExternAmountInResponse>;

        /**
         * Calls JoinSwapShareAmountOut.
         * @param request MsgJoinSwapShareAmountOut message or plain object
         * @param callback Node-style callback called with the error, if any, and MsgJoinSwapShareAmountOutResponse
         */
        public joinSwapShareAmountOut(
          request: osmosis.gamm.v1beta1.IMsgJoinSwapShareAmountOut,
          callback: osmosis.gamm.v1beta1.Msg.JoinSwapShareAmountOutCallback
        ): void;

        /**
         * Calls JoinSwapShareAmountOut.
         * @param request MsgJoinSwapShareAmountOut message or plain object
         * @returns Promise
         */
        public joinSwapShareAmountOut(
          request: osmosis.gamm.v1beta1.IMsgJoinSwapShareAmountOut
        ): Promise<osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOutResponse>;

        /**
         * Calls ExitSwapExternAmountOut.
         * @param request MsgExitSwapExternAmountOut message or plain object
         * @param callback Node-style callback called with the error, if any, and MsgExitSwapExternAmountOutResponse
         */
        public exitSwapExternAmountOut(
          request: osmosis.gamm.v1beta1.IMsgExitSwapExternAmountOut,
          callback: osmosis.gamm.v1beta1.Msg.ExitSwapExternAmountOutCallback
        ): void;

        /**
         * Calls ExitSwapExternAmountOut.
         * @param request MsgExitSwapExternAmountOut message or plain object
         * @returns Promise
         */
        public exitSwapExternAmountOut(
          request: osmosis.gamm.v1beta1.IMsgExitSwapExternAmountOut
        ): Promise<osmosis.gamm.v1beta1.MsgExitSwapExternAmountOutResponse>;

        /**
         * Calls ExitSwapShareAmountIn.
         * @param request MsgExitSwapShareAmountIn message or plain object
         * @param callback Node-style callback called with the error, if any, and MsgExitSwapShareAmountInResponse
         */
        public exitSwapShareAmountIn(
          request: osmosis.gamm.v1beta1.IMsgExitSwapShareAmountIn,
          callback: osmosis.gamm.v1beta1.Msg.ExitSwapShareAmountInCallback
        ): void;

        /**
         * Calls ExitSwapShareAmountIn.
         * @param request MsgExitSwapShareAmountIn message or plain object
         * @returns Promise
         */
        public exitSwapShareAmountIn(
          request: osmosis.gamm.v1beta1.IMsgExitSwapShareAmountIn
        ): Promise<osmosis.gamm.v1beta1.MsgExitSwapShareAmountInResponse>;
      }

      namespace Msg {
        /**
         * Callback as used by {@link osmosis.gamm.v1beta1.Msg#joinPool}.
         * @param error Error, if any
         * @param [response] MsgJoinPoolResponse
         */
        type JoinPoolCallback = (
          error: Error | null,
          response?: osmosis.gamm.v1beta1.MsgJoinPoolResponse
        ) => void;

        /**
         * Callback as used by {@link osmosis.gamm.v1beta1.Msg#exitPool}.
         * @param error Error, if any
         * @param [response] MsgExitPoolResponse
         */
        type ExitPoolCallback = (
          error: Error | null,
          response?: osmosis.gamm.v1beta1.MsgExitPoolResponse
        ) => void;

        /**
         * Callback as used by {@link osmosis.gamm.v1beta1.Msg#swapExactAmountIn}.
         * @param error Error, if any
         * @param [response] MsgSwapExactAmountInResponse
         */
        type SwapExactAmountInCallback = (
          error: Error | null,
          response?: osmosis.gamm.v1beta1.MsgSwapExactAmountInResponse
        ) => void;

        /**
         * Callback as used by {@link osmosis.gamm.v1beta1.Msg#swapExactAmountOut}.
         * @param error Error, if any
         * @param [response] MsgSwapExactAmountOutResponse
         */
        type SwapExactAmountOutCallback = (
          error: Error | null,
          response?: osmosis.gamm.v1beta1.MsgSwapExactAmountOutResponse
        ) => void;

        /**
         * Callback as used by {@link osmosis.gamm.v1beta1.Msg#joinSwapExternAmountIn}.
         * @param error Error, if any
         * @param [response] MsgJoinSwapExternAmountInResponse
         */
        type JoinSwapExternAmountInCallback = (
          error: Error | null,
          response?: osmosis.gamm.v1beta1.MsgJoinSwapExternAmountInResponse
        ) => void;

        /**
         * Callback as used by {@link osmosis.gamm.v1beta1.Msg#joinSwapShareAmountOut}.
         * @param error Error, if any
         * @param [response] MsgJoinSwapShareAmountOutResponse
         */
        type JoinSwapShareAmountOutCallback = (
          error: Error | null,
          response?: osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOutResponse
        ) => void;

        /**
         * Callback as used by {@link osmosis.gamm.v1beta1.Msg#exitSwapExternAmountOut}.
         * @param error Error, if any
         * @param [response] MsgExitSwapExternAmountOutResponse
         */
        type ExitSwapExternAmountOutCallback = (
          error: Error | null,
          response?: osmosis.gamm.v1beta1.MsgExitSwapExternAmountOutResponse
        ) => void;

        /**
         * Callback as used by {@link osmosis.gamm.v1beta1.Msg#exitSwapShareAmountIn}.
         * @param error Error, if any
         * @param [response] MsgExitSwapShareAmountInResponse
         */
        type ExitSwapShareAmountInCallback = (
          error: Error | null,
          response?: osmosis.gamm.v1beta1.MsgExitSwapShareAmountInResponse
        ) => void;
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
        public static create(
          properties?: osmosis.gamm.v1beta1.IMsgJoinPool
        ): osmosis.gamm.v1beta1.MsgJoinPool;

        /**
         * Encodes the specified MsgJoinPool message. Does not implicitly {@link osmosis.gamm.v1beta1.MsgJoinPool.verify|verify} messages.
         * @param m MsgJoinPool message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: osmosis.gamm.v1beta1.IMsgJoinPool,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a MsgJoinPool message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns MsgJoinPool
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): osmosis.gamm.v1beta1.MsgJoinPool;

        /**
         * Creates a MsgJoinPool message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgJoinPool
         */
        public static fromObject(d: {
          [k: string]: any;
        }): osmosis.gamm.v1beta1.MsgJoinPool;

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

      /** Properties of a MsgJoinPoolResponse. */
      interface IMsgJoinPoolResponse {
        /** MsgJoinPoolResponse shareOutAmount */
        shareOutAmount?: string | null;

        /** MsgJoinPoolResponse tokenIn */
        tokenIn?: cosmos.base.v1beta1.ICoin[] | null;
      }

      /** Represents a MsgJoinPoolResponse. */
      class MsgJoinPoolResponse implements IMsgJoinPoolResponse {
        /**
         * Constructs a new MsgJoinPoolResponse.
         * @param [p] Properties to set
         */
        constructor(p?: osmosis.gamm.v1beta1.IMsgJoinPoolResponse);

        /** MsgJoinPoolResponse shareOutAmount. */
        public shareOutAmount: string;

        /** MsgJoinPoolResponse tokenIn. */
        public tokenIn: cosmos.base.v1beta1.ICoin[];

        /**
         * Creates a new MsgJoinPoolResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MsgJoinPoolResponse instance
         */
        public static create(
          properties?: osmosis.gamm.v1beta1.IMsgJoinPoolResponse
        ): osmosis.gamm.v1beta1.MsgJoinPoolResponse;

        /**
         * Encodes the specified MsgJoinPoolResponse message. Does not implicitly {@link osmosis.gamm.v1beta1.MsgJoinPoolResponse.verify|verify} messages.
         * @param m MsgJoinPoolResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: osmosis.gamm.v1beta1.IMsgJoinPoolResponse,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a MsgJoinPoolResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns MsgJoinPoolResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): osmosis.gamm.v1beta1.MsgJoinPoolResponse;

        /**
         * Creates a MsgJoinPoolResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgJoinPoolResponse
         */
        public static fromObject(d: {
          [k: string]: any;
        }): osmosis.gamm.v1beta1.MsgJoinPoolResponse;

        /**
         * Creates a plain object from a MsgJoinPoolResponse message. Also converts values to other types if specified.
         * @param m MsgJoinPoolResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: osmosis.gamm.v1beta1.MsgJoinPoolResponse,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this MsgJoinPoolResponse to JSON.
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
        public static create(
          properties?: osmosis.gamm.v1beta1.IMsgExitPool
        ): osmosis.gamm.v1beta1.MsgExitPool;

        /**
         * Encodes the specified MsgExitPool message. Does not implicitly {@link osmosis.gamm.v1beta1.MsgExitPool.verify|verify} messages.
         * @param m MsgExitPool message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: osmosis.gamm.v1beta1.IMsgExitPool,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a MsgExitPool message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns MsgExitPool
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): osmosis.gamm.v1beta1.MsgExitPool;

        /**
         * Creates a MsgExitPool message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgExitPool
         */
        public static fromObject(d: {
          [k: string]: any;
        }): osmosis.gamm.v1beta1.MsgExitPool;

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

      /** Properties of a MsgExitPoolResponse. */
      interface IMsgExitPoolResponse {
        /** MsgExitPoolResponse tokenOut */
        tokenOut?: cosmos.base.v1beta1.ICoin[] | null;
      }

      /** Represents a MsgExitPoolResponse. */
      class MsgExitPoolResponse implements IMsgExitPoolResponse {
        /**
         * Constructs a new MsgExitPoolResponse.
         * @param [p] Properties to set
         */
        constructor(p?: osmosis.gamm.v1beta1.IMsgExitPoolResponse);

        /** MsgExitPoolResponse tokenOut. */
        public tokenOut: cosmos.base.v1beta1.ICoin[];

        /**
         * Creates a new MsgExitPoolResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MsgExitPoolResponse instance
         */
        public static create(
          properties?: osmosis.gamm.v1beta1.IMsgExitPoolResponse
        ): osmosis.gamm.v1beta1.MsgExitPoolResponse;

        /**
         * Encodes the specified MsgExitPoolResponse message. Does not implicitly {@link osmosis.gamm.v1beta1.MsgExitPoolResponse.verify|verify} messages.
         * @param m MsgExitPoolResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: osmosis.gamm.v1beta1.IMsgExitPoolResponse,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a MsgExitPoolResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns MsgExitPoolResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): osmosis.gamm.v1beta1.MsgExitPoolResponse;

        /**
         * Creates a MsgExitPoolResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgExitPoolResponse
         */
        public static fromObject(d: {
          [k: string]: any;
        }): osmosis.gamm.v1beta1.MsgExitPoolResponse;

        /**
         * Creates a plain object from a MsgExitPoolResponse message. Also converts values to other types if specified.
         * @param m MsgExitPoolResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: osmosis.gamm.v1beta1.MsgExitPoolResponse,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this MsgExitPoolResponse to JSON.
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
        public static encode(
          m: osmosis.gamm.v1beta1.ISwapAmountInRoute,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a SwapAmountInRoute message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns SwapAmountInRoute
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): osmosis.gamm.v1beta1.SwapAmountInRoute;

        /**
         * Creates a SwapAmountInRoute message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns SwapAmountInRoute
         */
        public static fromObject(d: {
          [k: string]: any;
        }): osmosis.gamm.v1beta1.SwapAmountInRoute;

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
        public static encode(
          m: osmosis.gamm.v1beta1.IMsgSwapExactAmountIn,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a MsgSwapExactAmountIn message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns MsgSwapExactAmountIn
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): osmosis.gamm.v1beta1.MsgSwapExactAmountIn;

        /**
         * Creates a MsgSwapExactAmountIn message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgSwapExactAmountIn
         */
        public static fromObject(d: {
          [k: string]: any;
        }): osmosis.gamm.v1beta1.MsgSwapExactAmountIn;

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

      /** Properties of a MsgSwapExactAmountInResponse. */
      interface IMsgSwapExactAmountInResponse {
        /** MsgSwapExactAmountInResponse tokenOutAmount */
        tokenOutAmount?: string | null;
      }

      /** Represents a MsgSwapExactAmountInResponse. */
      class MsgSwapExactAmountInResponse
        implements IMsgSwapExactAmountInResponse
      {
        /**
         * Constructs a new MsgSwapExactAmountInResponse.
         * @param [p] Properties to set
         */
        constructor(p?: osmosis.gamm.v1beta1.IMsgSwapExactAmountInResponse);

        /** MsgSwapExactAmountInResponse tokenOutAmount. */
        public tokenOutAmount: string;

        /**
         * Creates a new MsgSwapExactAmountInResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MsgSwapExactAmountInResponse instance
         */
        public static create(
          properties?: osmosis.gamm.v1beta1.IMsgSwapExactAmountInResponse
        ): osmosis.gamm.v1beta1.MsgSwapExactAmountInResponse;

        /**
         * Encodes the specified MsgSwapExactAmountInResponse message. Does not implicitly {@link osmosis.gamm.v1beta1.MsgSwapExactAmountInResponse.verify|verify} messages.
         * @param m MsgSwapExactAmountInResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: osmosis.gamm.v1beta1.IMsgSwapExactAmountInResponse,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a MsgSwapExactAmountInResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns MsgSwapExactAmountInResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): osmosis.gamm.v1beta1.MsgSwapExactAmountInResponse;

        /**
         * Creates a MsgSwapExactAmountInResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgSwapExactAmountInResponse
         */
        public static fromObject(d: {
          [k: string]: any;
        }): osmosis.gamm.v1beta1.MsgSwapExactAmountInResponse;

        /**
         * Creates a plain object from a MsgSwapExactAmountInResponse message. Also converts values to other types if specified.
         * @param m MsgSwapExactAmountInResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: osmosis.gamm.v1beta1.MsgSwapExactAmountInResponse,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this MsgSwapExactAmountInResponse to JSON.
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
        public static encode(
          m: osmosis.gamm.v1beta1.ISwapAmountOutRoute,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a SwapAmountOutRoute message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns SwapAmountOutRoute
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): osmosis.gamm.v1beta1.SwapAmountOutRoute;

        /**
         * Creates a SwapAmountOutRoute message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns SwapAmountOutRoute
         */
        public static fromObject(d: {
          [k: string]: any;
        }): osmosis.gamm.v1beta1.SwapAmountOutRoute;

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
        public static encode(
          m: osmosis.gamm.v1beta1.IMsgSwapExactAmountOut,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a MsgSwapExactAmountOut message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns MsgSwapExactAmountOut
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): osmosis.gamm.v1beta1.MsgSwapExactAmountOut;

        /**
         * Creates a MsgSwapExactAmountOut message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgSwapExactAmountOut
         */
        public static fromObject(d: {
          [k: string]: any;
        }): osmosis.gamm.v1beta1.MsgSwapExactAmountOut;

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

      /** Properties of a MsgSwapExactAmountOutResponse. */
      interface IMsgSwapExactAmountOutResponse {
        /** MsgSwapExactAmountOutResponse tokenInAmount */
        tokenInAmount?: string | null;
      }

      /** Represents a MsgSwapExactAmountOutResponse. */
      class MsgSwapExactAmountOutResponse
        implements IMsgSwapExactAmountOutResponse
      {
        /**
         * Constructs a new MsgSwapExactAmountOutResponse.
         * @param [p] Properties to set
         */
        constructor(p?: osmosis.gamm.v1beta1.IMsgSwapExactAmountOutResponse);

        /** MsgSwapExactAmountOutResponse tokenInAmount. */
        public tokenInAmount: string;

        /**
         * Creates a new MsgSwapExactAmountOutResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MsgSwapExactAmountOutResponse instance
         */
        public static create(
          properties?: osmosis.gamm.v1beta1.IMsgSwapExactAmountOutResponse
        ): osmosis.gamm.v1beta1.MsgSwapExactAmountOutResponse;

        /**
         * Encodes the specified MsgSwapExactAmountOutResponse message. Does not implicitly {@link osmosis.gamm.v1beta1.MsgSwapExactAmountOutResponse.verify|verify} messages.
         * @param m MsgSwapExactAmountOutResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: osmosis.gamm.v1beta1.IMsgSwapExactAmountOutResponse,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a MsgSwapExactAmountOutResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns MsgSwapExactAmountOutResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): osmosis.gamm.v1beta1.MsgSwapExactAmountOutResponse;

        /**
         * Creates a MsgSwapExactAmountOutResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgSwapExactAmountOutResponse
         */
        public static fromObject(d: {
          [k: string]: any;
        }): osmosis.gamm.v1beta1.MsgSwapExactAmountOutResponse;

        /**
         * Creates a plain object from a MsgSwapExactAmountOutResponse message. Also converts values to other types if specified.
         * @param m MsgSwapExactAmountOutResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: osmosis.gamm.v1beta1.MsgSwapExactAmountOutResponse,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this MsgSwapExactAmountOutResponse to JSON.
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
        public static fromObject(d: {
          [k: string]: any;
        }): osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn;

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

      /** Properties of a MsgJoinSwapExternAmountInResponse. */
      interface IMsgJoinSwapExternAmountInResponse {
        /** MsgJoinSwapExternAmountInResponse shareOutAmount */
        shareOutAmount?: string | null;
      }

      /** Represents a MsgJoinSwapExternAmountInResponse. */
      class MsgJoinSwapExternAmountInResponse
        implements IMsgJoinSwapExternAmountInResponse
      {
        /**
         * Constructs a new MsgJoinSwapExternAmountInResponse.
         * @param [p] Properties to set
         */
        constructor(
          p?: osmosis.gamm.v1beta1.IMsgJoinSwapExternAmountInResponse
        );

        /** MsgJoinSwapExternAmountInResponse shareOutAmount. */
        public shareOutAmount: string;

        /**
         * Creates a new MsgJoinSwapExternAmountInResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MsgJoinSwapExternAmountInResponse instance
         */
        public static create(
          properties?: osmosis.gamm.v1beta1.IMsgJoinSwapExternAmountInResponse
        ): osmosis.gamm.v1beta1.MsgJoinSwapExternAmountInResponse;

        /**
         * Encodes the specified MsgJoinSwapExternAmountInResponse message. Does not implicitly {@link osmosis.gamm.v1beta1.MsgJoinSwapExternAmountInResponse.verify|verify} messages.
         * @param m MsgJoinSwapExternAmountInResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: osmosis.gamm.v1beta1.IMsgJoinSwapExternAmountInResponse,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a MsgJoinSwapExternAmountInResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns MsgJoinSwapExternAmountInResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): osmosis.gamm.v1beta1.MsgJoinSwapExternAmountInResponse;

        /**
         * Creates a MsgJoinSwapExternAmountInResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgJoinSwapExternAmountInResponse
         */
        public static fromObject(d: {
          [k: string]: any;
        }): osmosis.gamm.v1beta1.MsgJoinSwapExternAmountInResponse;

        /**
         * Creates a plain object from a MsgJoinSwapExternAmountInResponse message. Also converts values to other types if specified.
         * @param m MsgJoinSwapExternAmountInResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: osmosis.gamm.v1beta1.MsgJoinSwapExternAmountInResponse,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this MsgJoinSwapExternAmountInResponse to JSON.
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
        public static fromObject(d: {
          [k: string]: any;
        }): osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOut;

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

      /** Properties of a MsgJoinSwapShareAmountOutResponse. */
      interface IMsgJoinSwapShareAmountOutResponse {
        /** MsgJoinSwapShareAmountOutResponse tokenInAmount */
        tokenInAmount?: string | null;
      }

      /** Represents a MsgJoinSwapShareAmountOutResponse. */
      class MsgJoinSwapShareAmountOutResponse
        implements IMsgJoinSwapShareAmountOutResponse
      {
        /**
         * Constructs a new MsgJoinSwapShareAmountOutResponse.
         * @param [p] Properties to set
         */
        constructor(
          p?: osmosis.gamm.v1beta1.IMsgJoinSwapShareAmountOutResponse
        );

        /** MsgJoinSwapShareAmountOutResponse tokenInAmount. */
        public tokenInAmount: string;

        /**
         * Creates a new MsgJoinSwapShareAmountOutResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MsgJoinSwapShareAmountOutResponse instance
         */
        public static create(
          properties?: osmosis.gamm.v1beta1.IMsgJoinSwapShareAmountOutResponse
        ): osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOutResponse;

        /**
         * Encodes the specified MsgJoinSwapShareAmountOutResponse message. Does not implicitly {@link osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOutResponse.verify|verify} messages.
         * @param m MsgJoinSwapShareAmountOutResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: osmosis.gamm.v1beta1.IMsgJoinSwapShareAmountOutResponse,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a MsgJoinSwapShareAmountOutResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns MsgJoinSwapShareAmountOutResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOutResponse;

        /**
         * Creates a MsgJoinSwapShareAmountOutResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgJoinSwapShareAmountOutResponse
         */
        public static fromObject(d: {
          [k: string]: any;
        }): osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOutResponse;

        /**
         * Creates a plain object from a MsgJoinSwapShareAmountOutResponse message. Also converts values to other types if specified.
         * @param m MsgJoinSwapShareAmountOutResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOutResponse,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this MsgJoinSwapShareAmountOutResponse to JSON.
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
        public static encode(
          m: osmosis.gamm.v1beta1.IMsgExitSwapShareAmountIn,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

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
        public static fromObject(d: {
          [k: string]: any;
        }): osmosis.gamm.v1beta1.MsgExitSwapShareAmountIn;

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

      /** Properties of a MsgExitSwapShareAmountInResponse. */
      interface IMsgExitSwapShareAmountInResponse {
        /** MsgExitSwapShareAmountInResponse tokenOutAmount */
        tokenOutAmount?: string | null;
      }

      /** Represents a MsgExitSwapShareAmountInResponse. */
      class MsgExitSwapShareAmountInResponse
        implements IMsgExitSwapShareAmountInResponse
      {
        /**
         * Constructs a new MsgExitSwapShareAmountInResponse.
         * @param [p] Properties to set
         */
        constructor(p?: osmosis.gamm.v1beta1.IMsgExitSwapShareAmountInResponse);

        /** MsgExitSwapShareAmountInResponse tokenOutAmount. */
        public tokenOutAmount: string;

        /**
         * Creates a new MsgExitSwapShareAmountInResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MsgExitSwapShareAmountInResponse instance
         */
        public static create(
          properties?: osmosis.gamm.v1beta1.IMsgExitSwapShareAmountInResponse
        ): osmosis.gamm.v1beta1.MsgExitSwapShareAmountInResponse;

        /**
         * Encodes the specified MsgExitSwapShareAmountInResponse message. Does not implicitly {@link osmosis.gamm.v1beta1.MsgExitSwapShareAmountInResponse.verify|verify} messages.
         * @param m MsgExitSwapShareAmountInResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: osmosis.gamm.v1beta1.IMsgExitSwapShareAmountInResponse,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a MsgExitSwapShareAmountInResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns MsgExitSwapShareAmountInResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): osmosis.gamm.v1beta1.MsgExitSwapShareAmountInResponse;

        /**
         * Creates a MsgExitSwapShareAmountInResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgExitSwapShareAmountInResponse
         */
        public static fromObject(d: {
          [k: string]: any;
        }): osmosis.gamm.v1beta1.MsgExitSwapShareAmountInResponse;

        /**
         * Creates a plain object from a MsgExitSwapShareAmountInResponse message. Also converts values to other types if specified.
         * @param m MsgExitSwapShareAmountInResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: osmosis.gamm.v1beta1.MsgExitSwapShareAmountInResponse,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this MsgExitSwapShareAmountInResponse to JSON.
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
        public static fromObject(d: {
          [k: string]: any;
        }): osmosis.gamm.v1beta1.MsgExitSwapExternAmountOut;

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

      /** Properties of a MsgExitSwapExternAmountOutResponse. */
      interface IMsgExitSwapExternAmountOutResponse {
        /** MsgExitSwapExternAmountOutResponse shareInAmount */
        shareInAmount?: string | null;
      }

      /** Represents a MsgExitSwapExternAmountOutResponse. */
      class MsgExitSwapExternAmountOutResponse
        implements IMsgExitSwapExternAmountOutResponse
      {
        /**
         * Constructs a new MsgExitSwapExternAmountOutResponse.
         * @param [p] Properties to set
         */
        constructor(
          p?: osmosis.gamm.v1beta1.IMsgExitSwapExternAmountOutResponse
        );

        /** MsgExitSwapExternAmountOutResponse shareInAmount. */
        public shareInAmount: string;

        /**
         * Creates a new MsgExitSwapExternAmountOutResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MsgExitSwapExternAmountOutResponse instance
         */
        public static create(
          properties?: osmosis.gamm.v1beta1.IMsgExitSwapExternAmountOutResponse
        ): osmosis.gamm.v1beta1.MsgExitSwapExternAmountOutResponse;

        /**
         * Encodes the specified MsgExitSwapExternAmountOutResponse message. Does not implicitly {@link osmosis.gamm.v1beta1.MsgExitSwapExternAmountOutResponse.verify|verify} messages.
         * @param m MsgExitSwapExternAmountOutResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: osmosis.gamm.v1beta1.IMsgExitSwapExternAmountOutResponse,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a MsgExitSwapExternAmountOutResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns MsgExitSwapExternAmountOutResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): osmosis.gamm.v1beta1.MsgExitSwapExternAmountOutResponse;

        /**
         * Creates a MsgExitSwapExternAmountOutResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgExitSwapExternAmountOutResponse
         */
        public static fromObject(d: {
          [k: string]: any;
        }): osmosis.gamm.v1beta1.MsgExitSwapExternAmountOutResponse;

        /**
         * Creates a plain object from a MsgExitSwapExternAmountOutResponse message. Also converts values to other types if specified.
         * @param m MsgExitSwapExternAmountOutResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: osmosis.gamm.v1beta1.MsgExitSwapExternAmountOutResponse,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this MsgExitSwapExternAmountOutResponse to JSON.
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
        public static encode(
          m: osmosis.gamm.v1beta1.ISmoothWeightChangeParams,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

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
        public static fromObject(d: {
          [k: string]: any;
        }): osmosis.gamm.v1beta1.SmoothWeightChangeParams;

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
        public static create(
          properties?: osmosis.gamm.v1beta1.IPoolParams
        ): osmosis.gamm.v1beta1.PoolParams;

        /**
         * Encodes the specified PoolParams message. Does not implicitly {@link osmosis.gamm.v1beta1.PoolParams.verify|verify} messages.
         * @param m PoolParams message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: osmosis.gamm.v1beta1.IPoolParams,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a PoolParams message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns PoolParams
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): osmosis.gamm.v1beta1.PoolParams;

        /**
         * Creates a PoolParams message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns PoolParams
         */
        public static fromObject(d: {
          [k: string]: any;
        }): osmosis.gamm.v1beta1.PoolParams;

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
        public static create(
          properties?: osmosis.gamm.v1beta1.IPoolAsset
        ): osmosis.gamm.v1beta1.PoolAsset;

        /**
         * Encodes the specified PoolAsset message. Does not implicitly {@link osmosis.gamm.v1beta1.PoolAsset.verify|verify} messages.
         * @param m PoolAsset message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: osmosis.gamm.v1beta1.IPoolAsset,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a PoolAsset message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns PoolAsset
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): osmosis.gamm.v1beta1.PoolAsset;

        /**
         * Creates a PoolAsset message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns PoolAsset
         */
        public static fromObject(d: {
          [k: string]: any;
        }): osmosis.gamm.v1beta1.PoolAsset;

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

      /** Properties of a Pool. */
      interface IPool {
        /** Pool address */
        address?: string | null;

        /** Pool id */
        id?: Long | null;

        /** Pool poolParams */
        poolParams?: osmosis.gamm.v1beta1.IPoolParams | null;

        /** Pool futurePoolGovernor */
        futurePoolGovernor?: string | null;

        /** Pool totalShares */
        totalShares?: cosmos.base.v1beta1.ICoin | null;

        /** Pool poolAssets */
        poolAssets?: osmosis.gamm.v1beta1.IPoolAsset[] | null;

        /** Pool totalWeight */
        totalWeight?: string | null;
      }

      /** Represents a Pool. */
      class Pool implements IPool {
        /**
         * Constructs a new Pool.
         * @param [p] Properties to set
         */
        constructor(p?: osmosis.gamm.v1beta1.IPool);

        /** Pool address. */
        public address: string;

        /** Pool id. */
        public id: Long;

        /** Pool poolParams. */
        public poolParams?: osmosis.gamm.v1beta1.IPoolParams | null;

        /** Pool futurePoolGovernor. */
        public futurePoolGovernor: string;

        /** Pool totalShares. */
        public totalShares?: cosmos.base.v1beta1.ICoin | null;

        /** Pool poolAssets. */
        public poolAssets: osmosis.gamm.v1beta1.IPoolAsset[];

        /** Pool totalWeight. */
        public totalWeight: string;

        /**
         * Creates a new Pool instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Pool instance
         */
        public static create(
          properties?: osmosis.gamm.v1beta1.IPool
        ): osmosis.gamm.v1beta1.Pool;

        /**
         * Encodes the specified Pool message. Does not implicitly {@link osmosis.gamm.v1beta1.Pool.verify|verify} messages.
         * @param m Pool message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: osmosis.gamm.v1beta1.IPool,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a Pool message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Pool
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): osmosis.gamm.v1beta1.Pool;

        /**
         * Creates a Pool message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Pool
         */
        public static fromObject(d: {
          [k: string]: any;
        }): osmosis.gamm.v1beta1.Pool;

        /**
         * Creates a plain object from a Pool message. Also converts values to other types if specified.
         * @param m Pool
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: osmosis.gamm.v1beta1.Pool,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this Pool to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }
    }

    /** Namespace poolmodels. */
    namespace poolmodels {
      /** Namespace balancer. */
      namespace balancer {
        /** Namespace v1beta1. */
        namespace v1beta1 {
          /** Represents a Msg */
          class Msg extends $protobuf.rpc.Service {
            /**
             * Constructs a new Msg service.
             * @param rpcImpl RPC implementation
             * @param [requestDelimited=false] Whether requests are length-delimited
             * @param [responseDelimited=false] Whether responses are length-delimited
             */
            constructor(
              rpcImpl: $protobuf.RPCImpl,
              requestDelimited?: boolean,
              responseDelimited?: boolean
            );

            /**
             * Creates new Msg service using the specified rpc implementation.
             * @param rpcImpl RPC implementation
             * @param [requestDelimited=false] Whether requests are length-delimited
             * @param [responseDelimited=false] Whether responses are length-delimited
             * @returns RPC service. Useful where requests and/or responses are streamed.
             */
            public static create(
              rpcImpl: $protobuf.RPCImpl,
              requestDelimited?: boolean,
              responseDelimited?: boolean
            ): Msg;

            /**
             * Calls CreateBalancerPool.
             * @param request MsgCreateBalancerPool message or plain object
             * @param callback Node-style callback called with the error, if any, and MsgCreateBalancerPoolResponse
             */
            public createBalancerPool(
              request: osmosis.gamm.poolmodels.balancer.v1beta1.IMsgCreateBalancerPool,
              callback: osmosis.gamm.poolmodels.balancer.v1beta1.Msg.CreateBalancerPoolCallback
            ): void;

            /**
             * Calls CreateBalancerPool.
             * @param request MsgCreateBalancerPool message or plain object
             * @returns Promise
             */
            public createBalancerPool(
              request: osmosis.gamm.poolmodels.balancer.v1beta1.IMsgCreateBalancerPool
            ): Promise<osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPoolResponse>;
          }

          namespace Msg {
            /**
             * Callback as used by {@link osmosis.gamm.poolmodels.balancer.v1beta1.Msg#createBalancerPool}.
             * @param error Error, if any
             * @param [response] MsgCreateBalancerPoolResponse
             */
            type CreateBalancerPoolCallback = (
              error: Error | null,
              response?: osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPoolResponse
            ) => void;
          }

          /** Properties of a MsgCreateBalancerPool. */
          interface IMsgCreateBalancerPool {
            /** MsgCreateBalancerPool sender */
            sender?: string | null;

            /** MsgCreateBalancerPool poolParams */
            poolParams?: osmosis.gamm.v1beta1.IPoolParams | null;

            /** MsgCreateBalancerPool poolAssets */
            poolAssets?: osmosis.gamm.v1beta1.IPoolAsset[] | null;

            /** MsgCreateBalancerPool futurePoolGovernor */
            futurePoolGovernor?: string | null;
          }

          /** Represents a MsgCreateBalancerPool. */
          class MsgCreateBalancerPool implements IMsgCreateBalancerPool {
            /**
             * Constructs a new MsgCreateBalancerPool.
             * @param [p] Properties to set
             */
            constructor(
              p?: osmosis.gamm.poolmodels.balancer.v1beta1.IMsgCreateBalancerPool
            );

            /** MsgCreateBalancerPool sender. */
            public sender: string;

            /** MsgCreateBalancerPool poolParams. */
            public poolParams?: osmosis.gamm.v1beta1.IPoolParams | null;

            /** MsgCreateBalancerPool poolAssets. */
            public poolAssets: osmosis.gamm.v1beta1.IPoolAsset[];

            /** MsgCreateBalancerPool futurePoolGovernor. */
            public futurePoolGovernor: string;

            /**
             * Creates a new MsgCreateBalancerPool instance using the specified properties.
             * @param [properties] Properties to set
             * @returns MsgCreateBalancerPool instance
             */
            public static create(
              properties?: osmosis.gamm.poolmodels.balancer.v1beta1.IMsgCreateBalancerPool
            ): osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool;

            /**
             * Encodes the specified MsgCreateBalancerPool message. Does not implicitly {@link osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool.verify|verify} messages.
             * @param m MsgCreateBalancerPool message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(
              m: osmosis.gamm.poolmodels.balancer.v1beta1.IMsgCreateBalancerPool,
              w?: $protobuf.Writer
            ): $protobuf.Writer;

            /**
             * Decodes a MsgCreateBalancerPool message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns MsgCreateBalancerPool
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(
              r: $protobuf.Reader | Uint8Array,
              l?: number
            ): osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool;

            /**
             * Creates a MsgCreateBalancerPool message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns MsgCreateBalancerPool
             */
            public static fromObject(d: {
              [k: string]: any;
            }): osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool;

            /**
             * Creates a plain object from a MsgCreateBalancerPool message. Also converts values to other types if specified.
             * @param m MsgCreateBalancerPool
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(
              m: osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool,
              o?: $protobuf.IConversionOptions
            ): { [k: string]: any };

            /**
             * Converts this MsgCreateBalancerPool to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
          }

          /** Properties of a MsgCreateBalancerPoolResponse. */
          interface IMsgCreateBalancerPoolResponse {
            /** MsgCreateBalancerPoolResponse poolId */
            poolId?: Long | null;
          }

          /** Represents a MsgCreateBalancerPoolResponse. */
          class MsgCreateBalancerPoolResponse
            implements IMsgCreateBalancerPoolResponse
          {
            /**
             * Constructs a new MsgCreateBalancerPoolResponse.
             * @param [p] Properties to set
             */
            constructor(
              p?: osmosis.gamm.poolmodels.balancer.v1beta1.IMsgCreateBalancerPoolResponse
            );

            /** MsgCreateBalancerPoolResponse poolId. */
            public poolId: Long;

            /**
             * Creates a new MsgCreateBalancerPoolResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns MsgCreateBalancerPoolResponse instance
             */
            public static create(
              properties?: osmosis.gamm.poolmodels.balancer.v1beta1.IMsgCreateBalancerPoolResponse
            ): osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPoolResponse;

            /**
             * Encodes the specified MsgCreateBalancerPoolResponse message. Does not implicitly {@link osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPoolResponse.verify|verify} messages.
             * @param m MsgCreateBalancerPoolResponse message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(
              m: osmosis.gamm.poolmodels.balancer.v1beta1.IMsgCreateBalancerPoolResponse,
              w?: $protobuf.Writer
            ): $protobuf.Writer;

            /**
             * Decodes a MsgCreateBalancerPoolResponse message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns MsgCreateBalancerPoolResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(
              r: $protobuf.Reader | Uint8Array,
              l?: number
            ): osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPoolResponse;

            /**
             * Creates a MsgCreateBalancerPoolResponse message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns MsgCreateBalancerPoolResponse
             */
            public static fromObject(d: {
              [k: string]: any;
            }): osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPoolResponse;

            /**
             * Creates a plain object from a MsgCreateBalancerPoolResponse message. Also converts values to other types if specified.
             * @param m MsgCreateBalancerPoolResponse
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(
              m: osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPoolResponse,
              o?: $protobuf.IConversionOptions
            ): { [k: string]: any };

            /**
             * Converts this MsgCreateBalancerPoolResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
          }
        }
      }

      /** Namespace stableswap. */
      namespace stableswap {
        /** Namespace v1beta1. */
        namespace v1beta1 {
          /** Properties of a PoolParams. */
          interface IPoolParams {
            /** PoolParams swapFee */
            swapFee?: string | null;

            /** PoolParams exitFee */
            exitFee?: string | null;
          }

          /** Represents a PoolParams. */
          class PoolParams implements IPoolParams {
            /**
             * Constructs a new PoolParams.
             * @param [p] Properties to set
             */
            constructor(
              p?: osmosis.gamm.poolmodels.stableswap.v1beta1.IPoolParams
            );

            /** PoolParams swapFee. */
            public swapFee: string;

            /** PoolParams exitFee. */
            public exitFee: string;

            /**
             * Creates a new PoolParams instance using the specified properties.
             * @param [properties] Properties to set
             * @returns PoolParams instance
             */
            public static create(
              properties?: osmosis.gamm.poolmodels.stableswap.v1beta1.IPoolParams
            ): osmosis.gamm.poolmodels.stableswap.v1beta1.PoolParams;

            /**
             * Encodes the specified PoolParams message. Does not implicitly {@link osmosis.gamm.poolmodels.stableswap.v1beta1.PoolParams.verify|verify} messages.
             * @param m PoolParams message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(
              m: osmosis.gamm.poolmodels.stableswap.v1beta1.IPoolParams,
              w?: $protobuf.Writer
            ): $protobuf.Writer;

            /**
             * Decodes a PoolParams message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns PoolParams
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(
              r: $protobuf.Reader | Uint8Array,
              l?: number
            ): osmosis.gamm.poolmodels.stableswap.v1beta1.PoolParams;

            /**
             * Creates a PoolParams message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns PoolParams
             */
            public static fromObject(d: {
              [k: string]: any;
            }): osmosis.gamm.poolmodels.stableswap.v1beta1.PoolParams;

            /**
             * Creates a plain object from a PoolParams message. Also converts values to other types if specified.
             * @param m PoolParams
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(
              m: osmosis.gamm.poolmodels.stableswap.v1beta1.PoolParams,
              o?: $protobuf.IConversionOptions
            ): { [k: string]: any };

            /**
             * Converts this PoolParams to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
          }

          /** Properties of a Pool. */
          interface IPool {
            /** Pool address */
            address?: string | null;

            /** Pool id */
            id?: Long | null;

            /** Pool poolParams */
            poolParams?: osmosis.gamm.poolmodels.stableswap.v1beta1.IPoolParams | null;

            /** Pool futurePoolGovernor */
            futurePoolGovernor?: string | null;

            /** Pool totalShares */
            totalShares?: cosmos.base.v1beta1.ICoin | null;

            /** Pool poolLiquidity */
            poolLiquidity?: cosmos.base.v1beta1.ICoin[] | null;

            /** Pool scalingFactors */
            scalingFactors?: Long[] | null;

            /** Pool scalingFactorController */
            scalingFactorController?: string | null;
          }

          /** Represents a Pool. */
          class Pool implements IPool {
            /**
             * Constructs a new Pool.
             * @param [p] Properties to set
             */
            constructor(p?: osmosis.gamm.poolmodels.stableswap.v1beta1.IPool);

            /** Pool address. */
            public address: string;

            /** Pool id. */
            public id: Long;

            /** Pool poolParams. */
            public poolParams?: osmosis.gamm.poolmodels.stableswap.v1beta1.IPoolParams | null;

            /** Pool futurePoolGovernor. */
            public futurePoolGovernor: string;

            /** Pool totalShares. */
            public totalShares?: cosmos.base.v1beta1.ICoin | null;

            /** Pool poolLiquidity. */
            public poolLiquidity: cosmos.base.v1beta1.ICoin[];

            /** Pool scalingFactors. */
            public scalingFactors: Long[];

            /** Pool scalingFactorController. */
            public scalingFactorController: string;

            /**
             * Creates a new Pool instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Pool instance
             */
            public static create(
              properties?: osmosis.gamm.poolmodels.stableswap.v1beta1.IPool
            ): osmosis.gamm.poolmodels.stableswap.v1beta1.Pool;

            /**
             * Encodes the specified Pool message. Does not implicitly {@link osmosis.gamm.poolmodels.stableswap.v1beta1.Pool.verify|verify} messages.
             * @param m Pool message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(
              m: osmosis.gamm.poolmodels.stableswap.v1beta1.IPool,
              w?: $protobuf.Writer
            ): $protobuf.Writer;

            /**
             * Decodes a Pool message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns Pool
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(
              r: $protobuf.Reader | Uint8Array,
              l?: number
            ): osmosis.gamm.poolmodels.stableswap.v1beta1.Pool;

            /**
             * Creates a Pool message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns Pool
             */
            public static fromObject(d: {
              [k: string]: any;
            }): osmosis.gamm.poolmodels.stableswap.v1beta1.Pool;

            /**
             * Creates a plain object from a Pool message. Also converts values to other types if specified.
             * @param m Pool
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(
              m: osmosis.gamm.poolmodels.stableswap.v1beta1.Pool,
              o?: $protobuf.IConversionOptions
            ): { [k: string]: any };

            /**
             * Converts this Pool to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
          }

          /** Represents a Msg */
          class Msg extends $protobuf.rpc.Service {
            /**
             * Constructs a new Msg service.
             * @param rpcImpl RPC implementation
             * @param [requestDelimited=false] Whether requests are length-delimited
             * @param [responseDelimited=false] Whether responses are length-delimited
             */
            constructor(
              rpcImpl: $protobuf.RPCImpl,
              requestDelimited?: boolean,
              responseDelimited?: boolean
            );

            /**
             * Creates new Msg service using the specified rpc implementation.
             * @param rpcImpl RPC implementation
             * @param [requestDelimited=false] Whether requests are length-delimited
             * @param [responseDelimited=false] Whether responses are length-delimited
             * @returns RPC service. Useful where requests and/or responses are streamed.
             */
            public static create(
              rpcImpl: $protobuf.RPCImpl,
              requestDelimited?: boolean,
              responseDelimited?: boolean
            ): Msg;

            /**
             * Calls CreateStableswapPool.
             * @param request MsgCreateStableswapPool message or plain object
             * @param callback Node-style callback called with the error, if any, and MsgCreateStableswapPoolResponse
             */
            public createStableswapPool(
              request: osmosis.gamm.poolmodels.stableswap.v1beta1.IMsgCreateStableswapPool,
              callback: osmosis.gamm.poolmodels.stableswap.v1beta1.Msg.CreateStableswapPoolCallback
            ): void;

            /**
             * Calls CreateStableswapPool.
             * @param request MsgCreateStableswapPool message or plain object
             * @returns Promise
             */
            public createStableswapPool(
              request: osmosis.gamm.poolmodels.stableswap.v1beta1.IMsgCreateStableswapPool
            ): Promise<osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPoolResponse>;

            /**
             * Calls StableSwapAdjustScalingFactors.
             * @param request MsgStableSwapAdjustScalingFactors message or plain object
             * @param callback Node-style callback called with the error, if any, and MsgStableSwapAdjustScalingFactorsResponse
             */
            public stableSwapAdjustScalingFactors(
              request: osmosis.gamm.poolmodels.stableswap.v1beta1.IMsgStableSwapAdjustScalingFactors,
              callback: osmosis.gamm.poolmodels.stableswap.v1beta1.Msg.StableSwapAdjustScalingFactorsCallback
            ): void;

            /**
             * Calls StableSwapAdjustScalingFactors.
             * @param request MsgStableSwapAdjustScalingFactors message or plain object
             * @returns Promise
             */
            public stableSwapAdjustScalingFactors(
              request: osmosis.gamm.poolmodels.stableswap.v1beta1.IMsgStableSwapAdjustScalingFactors
            ): Promise<osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactorsResponse>;
          }

          namespace Msg {
            /**
             * Callback as used by {@link osmosis.gamm.poolmodels.stableswap.v1beta1.Msg#createStableswapPool}.
             * @param error Error, if any
             * @param [response] MsgCreateStableswapPoolResponse
             */
            type CreateStableswapPoolCallback = (
              error: Error | null,
              response?: osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPoolResponse
            ) => void;

            /**
             * Callback as used by {@link osmosis.gamm.poolmodels.stableswap.v1beta1.Msg#stableSwapAdjustScalingFactors}.
             * @param error Error, if any
             * @param [response] MsgStableSwapAdjustScalingFactorsResponse
             */
            type StableSwapAdjustScalingFactorsCallback = (
              error: Error | null,
              response?: osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactorsResponse
            ) => void;
          }

          /** Properties of a MsgCreateStableswapPool. */
          interface IMsgCreateStableswapPool {
            /** MsgCreateStableswapPool sender */
            sender?: string | null;

            /** MsgCreateStableswapPool poolParams */
            poolParams?: osmosis.gamm.poolmodels.stableswap.v1beta1.IPoolParams | null;

            /** MsgCreateStableswapPool initialPoolLiquidity */
            initialPoolLiquidity?: cosmos.base.v1beta1.ICoin[] | null;

            /** MsgCreateStableswapPool scalingFactors */
            scalingFactors?: Long[] | null;

            /** MsgCreateStableswapPool futurePoolGovernor */
            futurePoolGovernor?: string | null;

            /** MsgCreateStableswapPool scalingFactorController */
            scalingFactorController?: string | null;
          }

          /** Represents a MsgCreateStableswapPool. */
          class MsgCreateStableswapPool implements IMsgCreateStableswapPool {
            /**
             * Constructs a new MsgCreateStableswapPool.
             * @param [p] Properties to set
             */
            constructor(
              p?: osmosis.gamm.poolmodels.stableswap.v1beta1.IMsgCreateStableswapPool
            );

            /** MsgCreateStableswapPool sender. */
            public sender: string;

            /** MsgCreateStableswapPool poolParams. */
            public poolParams?: osmosis.gamm.poolmodels.stableswap.v1beta1.IPoolParams | null;

            /** MsgCreateStableswapPool initialPoolLiquidity. */
            public initialPoolLiquidity: cosmos.base.v1beta1.ICoin[];

            /** MsgCreateStableswapPool scalingFactors. */
            public scalingFactors: Long[];

            /** MsgCreateStableswapPool futurePoolGovernor. */
            public futurePoolGovernor: string;

            /** MsgCreateStableswapPool scalingFactorController. */
            public scalingFactorController: string;

            /**
             * Creates a new MsgCreateStableswapPool instance using the specified properties.
             * @param [properties] Properties to set
             * @returns MsgCreateStableswapPool instance
             */
            public static create(
              properties?: osmosis.gamm.poolmodels.stableswap.v1beta1.IMsgCreateStableswapPool
            ): osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool;

            /**
             * Encodes the specified MsgCreateStableswapPool message. Does not implicitly {@link osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool.verify|verify} messages.
             * @param m MsgCreateStableswapPool message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(
              m: osmosis.gamm.poolmodels.stableswap.v1beta1.IMsgCreateStableswapPool,
              w?: $protobuf.Writer
            ): $protobuf.Writer;

            /**
             * Decodes a MsgCreateStableswapPool message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns MsgCreateStableswapPool
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(
              r: $protobuf.Reader | Uint8Array,
              l?: number
            ): osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool;

            /**
             * Creates a MsgCreateStableswapPool message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns MsgCreateStableswapPool
             */
            public static fromObject(d: {
              [k: string]: any;
            }): osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool;

            /**
             * Creates a plain object from a MsgCreateStableswapPool message. Also converts values to other types if specified.
             * @param m MsgCreateStableswapPool
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(
              m: osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool,
              o?: $protobuf.IConversionOptions
            ): { [k: string]: any };

            /**
             * Converts this MsgCreateStableswapPool to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
          }

          /** Properties of a MsgCreateStableswapPoolResponse. */
          interface IMsgCreateStableswapPoolResponse {
            /** MsgCreateStableswapPoolResponse poolId */
            poolId?: Long | null;
          }

          /** Represents a MsgCreateStableswapPoolResponse. */
          class MsgCreateStableswapPoolResponse
            implements IMsgCreateStableswapPoolResponse
          {
            /**
             * Constructs a new MsgCreateStableswapPoolResponse.
             * @param [p] Properties to set
             */
            constructor(
              p?: osmosis.gamm.poolmodels.stableswap.v1beta1.IMsgCreateStableswapPoolResponse
            );

            /** MsgCreateStableswapPoolResponse poolId. */
            public poolId: Long;

            /**
             * Creates a new MsgCreateStableswapPoolResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns MsgCreateStableswapPoolResponse instance
             */
            public static create(
              properties?: osmosis.gamm.poolmodels.stableswap.v1beta1.IMsgCreateStableswapPoolResponse
            ): osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPoolResponse;

            /**
             * Encodes the specified MsgCreateStableswapPoolResponse message. Does not implicitly {@link osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPoolResponse.verify|verify} messages.
             * @param m MsgCreateStableswapPoolResponse message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(
              m: osmosis.gamm.poolmodels.stableswap.v1beta1.IMsgCreateStableswapPoolResponse,
              w?: $protobuf.Writer
            ): $protobuf.Writer;

            /**
             * Decodes a MsgCreateStableswapPoolResponse message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns MsgCreateStableswapPoolResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(
              r: $protobuf.Reader | Uint8Array,
              l?: number
            ): osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPoolResponse;

            /**
             * Creates a MsgCreateStableswapPoolResponse message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns MsgCreateStableswapPoolResponse
             */
            public static fromObject(d: {
              [k: string]: any;
            }): osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPoolResponse;

            /**
             * Creates a plain object from a MsgCreateStableswapPoolResponse message. Also converts values to other types if specified.
             * @param m MsgCreateStableswapPoolResponse
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(
              m: osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPoolResponse,
              o?: $protobuf.IConversionOptions
            ): { [k: string]: any };

            /**
             * Converts this MsgCreateStableswapPoolResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
          }

          /** Properties of a MsgStableSwapAdjustScalingFactors. */
          interface IMsgStableSwapAdjustScalingFactors {
            /** MsgStableSwapAdjustScalingFactors sender */
            sender?: string | null;

            /** MsgStableSwapAdjustScalingFactors poolId */
            poolId?: Long | null;

            /** MsgStableSwapAdjustScalingFactors scalingFactors */
            scalingFactors?: Long[] | null;
          }

          /** Represents a MsgStableSwapAdjustScalingFactors. */
          class MsgStableSwapAdjustScalingFactors
            implements IMsgStableSwapAdjustScalingFactors
          {
            /**
             * Constructs a new MsgStableSwapAdjustScalingFactors.
             * @param [p] Properties to set
             */
            constructor(
              p?: osmosis.gamm.poolmodels.stableswap.v1beta1.IMsgStableSwapAdjustScalingFactors
            );

            /** MsgStableSwapAdjustScalingFactors sender. */
            public sender: string;

            /** MsgStableSwapAdjustScalingFactors poolId. */
            public poolId: Long;

            /** MsgStableSwapAdjustScalingFactors scalingFactors. */
            public scalingFactors: Long[];

            /**
             * Creates a new MsgStableSwapAdjustScalingFactors instance using the specified properties.
             * @param [properties] Properties to set
             * @returns MsgStableSwapAdjustScalingFactors instance
             */
            public static create(
              properties?: osmosis.gamm.poolmodels.stableswap.v1beta1.IMsgStableSwapAdjustScalingFactors
            ): osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactors;

            /**
             * Encodes the specified MsgStableSwapAdjustScalingFactors message. Does not implicitly {@link osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactors.verify|verify} messages.
             * @param m MsgStableSwapAdjustScalingFactors message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(
              m: osmosis.gamm.poolmodels.stableswap.v1beta1.IMsgStableSwapAdjustScalingFactors,
              w?: $protobuf.Writer
            ): $protobuf.Writer;

            /**
             * Decodes a MsgStableSwapAdjustScalingFactors message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns MsgStableSwapAdjustScalingFactors
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(
              r: $protobuf.Reader | Uint8Array,
              l?: number
            ): osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactors;

            /**
             * Creates a MsgStableSwapAdjustScalingFactors message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns MsgStableSwapAdjustScalingFactors
             */
            public static fromObject(d: {
              [k: string]: any;
            }): osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactors;

            /**
             * Creates a plain object from a MsgStableSwapAdjustScalingFactors message. Also converts values to other types if specified.
             * @param m MsgStableSwapAdjustScalingFactors
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(
              m: osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactors,
              o?: $protobuf.IConversionOptions
            ): { [k: string]: any };

            /**
             * Converts this MsgStableSwapAdjustScalingFactors to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
          }

          /** Properties of a MsgStableSwapAdjustScalingFactorsResponse. */
          interface IMsgStableSwapAdjustScalingFactorsResponse {}

          /** Represents a MsgStableSwapAdjustScalingFactorsResponse. */
          class MsgStableSwapAdjustScalingFactorsResponse
            implements IMsgStableSwapAdjustScalingFactorsResponse
          {
            /**
             * Constructs a new MsgStableSwapAdjustScalingFactorsResponse.
             * @param [p] Properties to set
             */
            constructor(
              p?: osmosis.gamm.poolmodels.stableswap.v1beta1.IMsgStableSwapAdjustScalingFactorsResponse
            );

            /**
             * Creates a new MsgStableSwapAdjustScalingFactorsResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns MsgStableSwapAdjustScalingFactorsResponse instance
             */
            public static create(
              properties?: osmosis.gamm.poolmodels.stableswap.v1beta1.IMsgStableSwapAdjustScalingFactorsResponse
            ): osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactorsResponse;

            /**
             * Encodes the specified MsgStableSwapAdjustScalingFactorsResponse message. Does not implicitly {@link osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactorsResponse.verify|verify} messages.
             * @param m MsgStableSwapAdjustScalingFactorsResponse message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(
              m: osmosis.gamm.poolmodels.stableswap.v1beta1.IMsgStableSwapAdjustScalingFactorsResponse,
              w?: $protobuf.Writer
            ): $protobuf.Writer;

            /**
             * Decodes a MsgStableSwapAdjustScalingFactorsResponse message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns MsgStableSwapAdjustScalingFactorsResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(
              r: $protobuf.Reader | Uint8Array,
              l?: number
            ): osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactorsResponse;

            /**
             * Creates a MsgStableSwapAdjustScalingFactorsResponse message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns MsgStableSwapAdjustScalingFactorsResponse
             */
            public static fromObject(d: {
              [k: string]: any;
            }): osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactorsResponse;

            /**
             * Creates a plain object from a MsgStableSwapAdjustScalingFactorsResponse message. Also converts values to other types if specified.
             * @param m MsgStableSwapAdjustScalingFactorsResponse
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(
              m: osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactorsResponse,
              o?: $protobuf.IConversionOptions
            ): { [k: string]: any };

            /**
             * Converts this MsgStableSwapAdjustScalingFactorsResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
          }
        }
      }
    }
  }

  /** Namespace superfluid. */
  namespace superfluid {
    /** Represents a Msg */
    class Msg extends $protobuf.rpc.Service {
      /**
       * Constructs a new Msg service.
       * @param rpcImpl RPC implementation
       * @param [requestDelimited=false] Whether requests are length-delimited
       * @param [responseDelimited=false] Whether responses are length-delimited
       */
      constructor(
        rpcImpl: $protobuf.RPCImpl,
        requestDelimited?: boolean,
        responseDelimited?: boolean
      );

      /**
       * Creates new Msg service using the specified rpc implementation.
       * @param rpcImpl RPC implementation
       * @param [requestDelimited=false] Whether requests are length-delimited
       * @param [responseDelimited=false] Whether responses are length-delimited
       * @returns RPC service. Useful where requests and/or responses are streamed.
       */
      public static create(
        rpcImpl: $protobuf.RPCImpl,
        requestDelimited?: boolean,
        responseDelimited?: boolean
      ): Msg;

      /**
       * Calls SuperfluidDelegate.
       * @param request MsgSuperfluidDelegate message or plain object
       * @param callback Node-style callback called with the error, if any, and MsgSuperfluidDelegateResponse
       */
      public superfluidDelegate(
        request: osmosis.superfluid.IMsgSuperfluidDelegate,
        callback: osmosis.superfluid.Msg.SuperfluidDelegateCallback
      ): void;

      /**
       * Calls SuperfluidDelegate.
       * @param request MsgSuperfluidDelegate message or plain object
       * @returns Promise
       */
      public superfluidDelegate(
        request: osmosis.superfluid.IMsgSuperfluidDelegate
      ): Promise<osmosis.superfluid.MsgSuperfluidDelegateResponse>;

      /**
       * Calls SuperfluidUndelegate.
       * @param request MsgSuperfluidUndelegate message or plain object
       * @param callback Node-style callback called with the error, if any, and MsgSuperfluidUndelegateResponse
       */
      public superfluidUndelegate(
        request: osmosis.superfluid.IMsgSuperfluidUndelegate,
        callback: osmosis.superfluid.Msg.SuperfluidUndelegateCallback
      ): void;

      /**
       * Calls SuperfluidUndelegate.
       * @param request MsgSuperfluidUndelegate message or plain object
       * @returns Promise
       */
      public superfluidUndelegate(
        request: osmosis.superfluid.IMsgSuperfluidUndelegate
      ): Promise<osmosis.superfluid.MsgSuperfluidUndelegateResponse>;

      /**
       * Calls SuperfluidUnbondLock.
       * @param request MsgSuperfluidUnbondLock message or plain object
       * @param callback Node-style callback called with the error, if any, and MsgSuperfluidUnbondLockResponse
       */
      public superfluidUnbondLock(
        request: osmosis.superfluid.IMsgSuperfluidUnbondLock,
        callback: osmosis.superfluid.Msg.SuperfluidUnbondLockCallback
      ): void;

      /**
       * Calls SuperfluidUnbondLock.
       * @param request MsgSuperfluidUnbondLock message or plain object
       * @returns Promise
       */
      public superfluidUnbondLock(
        request: osmosis.superfluid.IMsgSuperfluidUnbondLock
      ): Promise<osmosis.superfluid.MsgSuperfluidUnbondLockResponse>;

      /**
       * Calls LockAndSuperfluidDelegate.
       * @param request MsgLockAndSuperfluidDelegate message or plain object
       * @param callback Node-style callback called with the error, if any, and MsgLockAndSuperfluidDelegateResponse
       */
      public lockAndSuperfluidDelegate(
        request: osmosis.superfluid.IMsgLockAndSuperfluidDelegate,
        callback: osmosis.superfluid.Msg.LockAndSuperfluidDelegateCallback
      ): void;

      /**
       * Calls LockAndSuperfluidDelegate.
       * @param request MsgLockAndSuperfluidDelegate message or plain object
       * @returns Promise
       */
      public lockAndSuperfluidDelegate(
        request: osmosis.superfluid.IMsgLockAndSuperfluidDelegate
      ): Promise<osmosis.superfluid.MsgLockAndSuperfluidDelegateResponse>;

      /**
       * Calls UnPoolWhitelistedPool.
       * @param request MsgUnPoolWhitelistedPool message or plain object
       * @param callback Node-style callback called with the error, if any, and MsgUnPoolWhitelistedPoolResponse
       */
      public unPoolWhitelistedPool(
        request: osmosis.superfluid.IMsgUnPoolWhitelistedPool,
        callback: osmosis.superfluid.Msg.UnPoolWhitelistedPoolCallback
      ): void;

      /**
       * Calls UnPoolWhitelistedPool.
       * @param request MsgUnPoolWhitelistedPool message or plain object
       * @returns Promise
       */
      public unPoolWhitelistedPool(
        request: osmosis.superfluid.IMsgUnPoolWhitelistedPool
      ): Promise<osmosis.superfluid.MsgUnPoolWhitelistedPoolResponse>;
    }

    namespace Msg {
      /**
       * Callback as used by {@link osmosis.superfluid.Msg#superfluidDelegate}.
       * @param error Error, if any
       * @param [response] MsgSuperfluidDelegateResponse
       */
      type SuperfluidDelegateCallback = (
        error: Error | null,
        response?: osmosis.superfluid.MsgSuperfluidDelegateResponse
      ) => void;

      /**
       * Callback as used by {@link osmosis.superfluid.Msg#superfluidUndelegate}.
       * @param error Error, if any
       * @param [response] MsgSuperfluidUndelegateResponse
       */
      type SuperfluidUndelegateCallback = (
        error: Error | null,
        response?: osmosis.superfluid.MsgSuperfluidUndelegateResponse
      ) => void;

      /**
       * Callback as used by {@link osmosis.superfluid.Msg#superfluidUnbondLock}.
       * @param error Error, if any
       * @param [response] MsgSuperfluidUnbondLockResponse
       */
      type SuperfluidUnbondLockCallback = (
        error: Error | null,
        response?: osmosis.superfluid.MsgSuperfluidUnbondLockResponse
      ) => void;

      /**
       * Callback as used by {@link osmosis.superfluid.Msg#lockAndSuperfluidDelegate}.
       * @param error Error, if any
       * @param [response] MsgLockAndSuperfluidDelegateResponse
       */
      type LockAndSuperfluidDelegateCallback = (
        error: Error | null,
        response?: osmosis.superfluid.MsgLockAndSuperfluidDelegateResponse
      ) => void;

      /**
       * Callback as used by {@link osmosis.superfluid.Msg#unPoolWhitelistedPool}.
       * @param error Error, if any
       * @param [response] MsgUnPoolWhitelistedPoolResponse
       */
      type UnPoolWhitelistedPoolCallback = (
        error: Error | null,
        response?: osmosis.superfluid.MsgUnPoolWhitelistedPoolResponse
      ) => void;
    }

    /** Properties of a MsgSuperfluidDelegate. */
    interface IMsgSuperfluidDelegate {
      /** MsgSuperfluidDelegate sender */
      sender?: string | null;

      /** MsgSuperfluidDelegate lockId */
      lockId?: Long | null;

      /** MsgSuperfluidDelegate valAddr */
      valAddr?: string | null;
    }

    /** Represents a MsgSuperfluidDelegate. */
    class MsgSuperfluidDelegate implements IMsgSuperfluidDelegate {
      /**
       * Constructs a new MsgSuperfluidDelegate.
       * @param [p] Properties to set
       */
      constructor(p?: osmosis.superfluid.IMsgSuperfluidDelegate);

      /** MsgSuperfluidDelegate sender. */
      public sender: string;

      /** MsgSuperfluidDelegate lockId. */
      public lockId: Long;

      /** MsgSuperfluidDelegate valAddr. */
      public valAddr: string;

      /**
       * Creates a new MsgSuperfluidDelegate instance using the specified properties.
       * @param [properties] Properties to set
       * @returns MsgSuperfluidDelegate instance
       */
      public static create(
        properties?: osmosis.superfluid.IMsgSuperfluidDelegate
      ): osmosis.superfluid.MsgSuperfluidDelegate;

      /**
       * Encodes the specified MsgSuperfluidDelegate message. Does not implicitly {@link osmosis.superfluid.MsgSuperfluidDelegate.verify|verify} messages.
       * @param m MsgSuperfluidDelegate message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: osmosis.superfluid.IMsgSuperfluidDelegate,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a MsgSuperfluidDelegate message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns MsgSuperfluidDelegate
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): osmosis.superfluid.MsgSuperfluidDelegate;

      /**
       * Creates a MsgSuperfluidDelegate message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns MsgSuperfluidDelegate
       */
      public static fromObject(d: {
        [k: string]: any;
      }): osmosis.superfluid.MsgSuperfluidDelegate;

      /**
       * Creates a plain object from a MsgSuperfluidDelegate message. Also converts values to other types if specified.
       * @param m MsgSuperfluidDelegate
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: osmosis.superfluid.MsgSuperfluidDelegate,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this MsgSuperfluidDelegate to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a MsgSuperfluidDelegateResponse. */
    interface IMsgSuperfluidDelegateResponse {}

    /** Represents a MsgSuperfluidDelegateResponse. */
    class MsgSuperfluidDelegateResponse
      implements IMsgSuperfluidDelegateResponse
    {
      /**
       * Constructs a new MsgSuperfluidDelegateResponse.
       * @param [p] Properties to set
       */
      constructor(p?: osmosis.superfluid.IMsgSuperfluidDelegateResponse);

      /**
       * Creates a new MsgSuperfluidDelegateResponse instance using the specified properties.
       * @param [properties] Properties to set
       * @returns MsgSuperfluidDelegateResponse instance
       */
      public static create(
        properties?: osmosis.superfluid.IMsgSuperfluidDelegateResponse
      ): osmosis.superfluid.MsgSuperfluidDelegateResponse;

      /**
       * Encodes the specified MsgSuperfluidDelegateResponse message. Does not implicitly {@link osmosis.superfluid.MsgSuperfluidDelegateResponse.verify|verify} messages.
       * @param m MsgSuperfluidDelegateResponse message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: osmosis.superfluid.IMsgSuperfluidDelegateResponse,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a MsgSuperfluidDelegateResponse message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns MsgSuperfluidDelegateResponse
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): osmosis.superfluid.MsgSuperfluidDelegateResponse;

      /**
       * Creates a MsgSuperfluidDelegateResponse message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns MsgSuperfluidDelegateResponse
       */
      public static fromObject(d: {
        [k: string]: any;
      }): osmosis.superfluid.MsgSuperfluidDelegateResponse;

      /**
       * Creates a plain object from a MsgSuperfluidDelegateResponse message. Also converts values to other types if specified.
       * @param m MsgSuperfluidDelegateResponse
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: osmosis.superfluid.MsgSuperfluidDelegateResponse,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this MsgSuperfluidDelegateResponse to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a MsgSuperfluidUndelegate. */
    interface IMsgSuperfluidUndelegate {
      /** MsgSuperfluidUndelegate sender */
      sender?: string | null;

      /** MsgSuperfluidUndelegate lockId */
      lockId?: Long | null;
    }

    /** Represents a MsgSuperfluidUndelegate. */
    class MsgSuperfluidUndelegate implements IMsgSuperfluidUndelegate {
      /**
       * Constructs a new MsgSuperfluidUndelegate.
       * @param [p] Properties to set
       */
      constructor(p?: osmosis.superfluid.IMsgSuperfluidUndelegate);

      /** MsgSuperfluidUndelegate sender. */
      public sender: string;

      /** MsgSuperfluidUndelegate lockId. */
      public lockId: Long;

      /**
       * Creates a new MsgSuperfluidUndelegate instance using the specified properties.
       * @param [properties] Properties to set
       * @returns MsgSuperfluidUndelegate instance
       */
      public static create(
        properties?: osmosis.superfluid.IMsgSuperfluidUndelegate
      ): osmosis.superfluid.MsgSuperfluidUndelegate;

      /**
       * Encodes the specified MsgSuperfluidUndelegate message. Does not implicitly {@link osmosis.superfluid.MsgSuperfluidUndelegate.verify|verify} messages.
       * @param m MsgSuperfluidUndelegate message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: osmosis.superfluid.IMsgSuperfluidUndelegate,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a MsgSuperfluidUndelegate message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns MsgSuperfluidUndelegate
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): osmosis.superfluid.MsgSuperfluidUndelegate;

      /**
       * Creates a MsgSuperfluidUndelegate message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns MsgSuperfluidUndelegate
       */
      public static fromObject(d: {
        [k: string]: any;
      }): osmosis.superfluid.MsgSuperfluidUndelegate;

      /**
       * Creates a plain object from a MsgSuperfluidUndelegate message. Also converts values to other types if specified.
       * @param m MsgSuperfluidUndelegate
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: osmosis.superfluid.MsgSuperfluidUndelegate,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this MsgSuperfluidUndelegate to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a MsgSuperfluidUndelegateResponse. */
    interface IMsgSuperfluidUndelegateResponse {}

    /** Represents a MsgSuperfluidUndelegateResponse. */
    class MsgSuperfluidUndelegateResponse
      implements IMsgSuperfluidUndelegateResponse
    {
      /**
       * Constructs a new MsgSuperfluidUndelegateResponse.
       * @param [p] Properties to set
       */
      constructor(p?: osmosis.superfluid.IMsgSuperfluidUndelegateResponse);

      /**
       * Creates a new MsgSuperfluidUndelegateResponse instance using the specified properties.
       * @param [properties] Properties to set
       * @returns MsgSuperfluidUndelegateResponse instance
       */
      public static create(
        properties?: osmosis.superfluid.IMsgSuperfluidUndelegateResponse
      ): osmosis.superfluid.MsgSuperfluidUndelegateResponse;

      /**
       * Encodes the specified MsgSuperfluidUndelegateResponse message. Does not implicitly {@link osmosis.superfluid.MsgSuperfluidUndelegateResponse.verify|verify} messages.
       * @param m MsgSuperfluidUndelegateResponse message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: osmosis.superfluid.IMsgSuperfluidUndelegateResponse,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a MsgSuperfluidUndelegateResponse message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns MsgSuperfluidUndelegateResponse
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): osmosis.superfluid.MsgSuperfluidUndelegateResponse;

      /**
       * Creates a MsgSuperfluidUndelegateResponse message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns MsgSuperfluidUndelegateResponse
       */
      public static fromObject(d: {
        [k: string]: any;
      }): osmosis.superfluid.MsgSuperfluidUndelegateResponse;

      /**
       * Creates a plain object from a MsgSuperfluidUndelegateResponse message. Also converts values to other types if specified.
       * @param m MsgSuperfluidUndelegateResponse
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: osmosis.superfluid.MsgSuperfluidUndelegateResponse,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this MsgSuperfluidUndelegateResponse to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a MsgSuperfluidUnbondLock. */
    interface IMsgSuperfluidUnbondLock {
      /** MsgSuperfluidUnbondLock sender */
      sender?: string | null;

      /** MsgSuperfluidUnbondLock lockId */
      lockId?: Long | null;
    }

    /** Represents a MsgSuperfluidUnbondLock. */
    class MsgSuperfluidUnbondLock implements IMsgSuperfluidUnbondLock {
      /**
       * Constructs a new MsgSuperfluidUnbondLock.
       * @param [p] Properties to set
       */
      constructor(p?: osmosis.superfluid.IMsgSuperfluidUnbondLock);

      /** MsgSuperfluidUnbondLock sender. */
      public sender: string;

      /** MsgSuperfluidUnbondLock lockId. */
      public lockId: Long;

      /**
       * Creates a new MsgSuperfluidUnbondLock instance using the specified properties.
       * @param [properties] Properties to set
       * @returns MsgSuperfluidUnbondLock instance
       */
      public static create(
        properties?: osmosis.superfluid.IMsgSuperfluidUnbondLock
      ): osmosis.superfluid.MsgSuperfluidUnbondLock;

      /**
       * Encodes the specified MsgSuperfluidUnbondLock message. Does not implicitly {@link osmosis.superfluid.MsgSuperfluidUnbondLock.verify|verify} messages.
       * @param m MsgSuperfluidUnbondLock message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: osmosis.superfluid.IMsgSuperfluidUnbondLock,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a MsgSuperfluidUnbondLock message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns MsgSuperfluidUnbondLock
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): osmosis.superfluid.MsgSuperfluidUnbondLock;

      /**
       * Creates a MsgSuperfluidUnbondLock message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns MsgSuperfluidUnbondLock
       */
      public static fromObject(d: {
        [k: string]: any;
      }): osmosis.superfluid.MsgSuperfluidUnbondLock;

      /**
       * Creates a plain object from a MsgSuperfluidUnbondLock message. Also converts values to other types if specified.
       * @param m MsgSuperfluidUnbondLock
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: osmosis.superfluid.MsgSuperfluidUnbondLock,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this MsgSuperfluidUnbondLock to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a MsgSuperfluidUnbondLockResponse. */
    interface IMsgSuperfluidUnbondLockResponse {}

    /** Represents a MsgSuperfluidUnbondLockResponse. */
    class MsgSuperfluidUnbondLockResponse
      implements IMsgSuperfluidUnbondLockResponse
    {
      /**
       * Constructs a new MsgSuperfluidUnbondLockResponse.
       * @param [p] Properties to set
       */
      constructor(p?: osmosis.superfluid.IMsgSuperfluidUnbondLockResponse);

      /**
       * Creates a new MsgSuperfluidUnbondLockResponse instance using the specified properties.
       * @param [properties] Properties to set
       * @returns MsgSuperfluidUnbondLockResponse instance
       */
      public static create(
        properties?: osmosis.superfluid.IMsgSuperfluidUnbondLockResponse
      ): osmosis.superfluid.MsgSuperfluidUnbondLockResponse;

      /**
       * Encodes the specified MsgSuperfluidUnbondLockResponse message. Does not implicitly {@link osmosis.superfluid.MsgSuperfluidUnbondLockResponse.verify|verify} messages.
       * @param m MsgSuperfluidUnbondLockResponse message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: osmosis.superfluid.IMsgSuperfluidUnbondLockResponse,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a MsgSuperfluidUnbondLockResponse message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns MsgSuperfluidUnbondLockResponse
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): osmosis.superfluid.MsgSuperfluidUnbondLockResponse;

      /**
       * Creates a MsgSuperfluidUnbondLockResponse message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns MsgSuperfluidUnbondLockResponse
       */
      public static fromObject(d: {
        [k: string]: any;
      }): osmosis.superfluid.MsgSuperfluidUnbondLockResponse;

      /**
       * Creates a plain object from a MsgSuperfluidUnbondLockResponse message. Also converts values to other types if specified.
       * @param m MsgSuperfluidUnbondLockResponse
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: osmosis.superfluid.MsgSuperfluidUnbondLockResponse,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this MsgSuperfluidUnbondLockResponse to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a MsgLockAndSuperfluidDelegate. */
    interface IMsgLockAndSuperfluidDelegate {
      /** MsgLockAndSuperfluidDelegate sender */
      sender?: string | null;

      /** MsgLockAndSuperfluidDelegate coins */
      coins?: cosmos.base.v1beta1.ICoin[] | null;

      /** MsgLockAndSuperfluidDelegate valAddr */
      valAddr?: string | null;
    }

    /** Represents a MsgLockAndSuperfluidDelegate. */
    class MsgLockAndSuperfluidDelegate
      implements IMsgLockAndSuperfluidDelegate
    {
      /**
       * Constructs a new MsgLockAndSuperfluidDelegate.
       * @param [p] Properties to set
       */
      constructor(p?: osmosis.superfluid.IMsgLockAndSuperfluidDelegate);

      /** MsgLockAndSuperfluidDelegate sender. */
      public sender: string;

      /** MsgLockAndSuperfluidDelegate coins. */
      public coins: cosmos.base.v1beta1.ICoin[];

      /** MsgLockAndSuperfluidDelegate valAddr. */
      public valAddr: string;

      /**
       * Creates a new MsgLockAndSuperfluidDelegate instance using the specified properties.
       * @param [properties] Properties to set
       * @returns MsgLockAndSuperfluidDelegate instance
       */
      public static create(
        properties?: osmosis.superfluid.IMsgLockAndSuperfluidDelegate
      ): osmosis.superfluid.MsgLockAndSuperfluidDelegate;

      /**
       * Encodes the specified MsgLockAndSuperfluidDelegate message. Does not implicitly {@link osmosis.superfluid.MsgLockAndSuperfluidDelegate.verify|verify} messages.
       * @param m MsgLockAndSuperfluidDelegate message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: osmosis.superfluid.IMsgLockAndSuperfluidDelegate,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a MsgLockAndSuperfluidDelegate message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns MsgLockAndSuperfluidDelegate
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): osmosis.superfluid.MsgLockAndSuperfluidDelegate;

      /**
       * Creates a MsgLockAndSuperfluidDelegate message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns MsgLockAndSuperfluidDelegate
       */
      public static fromObject(d: {
        [k: string]: any;
      }): osmosis.superfluid.MsgLockAndSuperfluidDelegate;

      /**
       * Creates a plain object from a MsgLockAndSuperfluidDelegate message. Also converts values to other types if specified.
       * @param m MsgLockAndSuperfluidDelegate
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: osmosis.superfluid.MsgLockAndSuperfluidDelegate,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this MsgLockAndSuperfluidDelegate to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a MsgLockAndSuperfluidDelegateResponse. */
    interface IMsgLockAndSuperfluidDelegateResponse {
      /** MsgLockAndSuperfluidDelegateResponse ID */
      ID?: Long | null;
    }

    /** Represents a MsgLockAndSuperfluidDelegateResponse. */
    class MsgLockAndSuperfluidDelegateResponse
      implements IMsgLockAndSuperfluidDelegateResponse
    {
      /**
       * Constructs a new MsgLockAndSuperfluidDelegateResponse.
       * @param [p] Properties to set
       */
      constructor(p?: osmosis.superfluid.IMsgLockAndSuperfluidDelegateResponse);

      /** MsgLockAndSuperfluidDelegateResponse ID. */
      public ID: Long;

      /**
       * Creates a new MsgLockAndSuperfluidDelegateResponse instance using the specified properties.
       * @param [properties] Properties to set
       * @returns MsgLockAndSuperfluidDelegateResponse instance
       */
      public static create(
        properties?: osmosis.superfluid.IMsgLockAndSuperfluidDelegateResponse
      ): osmosis.superfluid.MsgLockAndSuperfluidDelegateResponse;

      /**
       * Encodes the specified MsgLockAndSuperfluidDelegateResponse message. Does not implicitly {@link osmosis.superfluid.MsgLockAndSuperfluidDelegateResponse.verify|verify} messages.
       * @param m MsgLockAndSuperfluidDelegateResponse message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: osmosis.superfluid.IMsgLockAndSuperfluidDelegateResponse,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a MsgLockAndSuperfluidDelegateResponse message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns MsgLockAndSuperfluidDelegateResponse
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): osmosis.superfluid.MsgLockAndSuperfluidDelegateResponse;

      /**
       * Creates a MsgLockAndSuperfluidDelegateResponse message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns MsgLockAndSuperfluidDelegateResponse
       */
      public static fromObject(d: {
        [k: string]: any;
      }): osmosis.superfluid.MsgLockAndSuperfluidDelegateResponse;

      /**
       * Creates a plain object from a MsgLockAndSuperfluidDelegateResponse message. Also converts values to other types if specified.
       * @param m MsgLockAndSuperfluidDelegateResponse
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: osmosis.superfluid.MsgLockAndSuperfluidDelegateResponse,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this MsgLockAndSuperfluidDelegateResponse to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a MsgUnPoolWhitelistedPool. */
    interface IMsgUnPoolWhitelistedPool {
      /** MsgUnPoolWhitelistedPool sender */
      sender?: string | null;

      /** MsgUnPoolWhitelistedPool poolId */
      poolId?: Long | null;
    }

    /** Represents a MsgUnPoolWhitelistedPool. */
    class MsgUnPoolWhitelistedPool implements IMsgUnPoolWhitelistedPool {
      /**
       * Constructs a new MsgUnPoolWhitelistedPool.
       * @param [p] Properties to set
       */
      constructor(p?: osmosis.superfluid.IMsgUnPoolWhitelistedPool);

      /** MsgUnPoolWhitelistedPool sender. */
      public sender: string;

      /** MsgUnPoolWhitelistedPool poolId. */
      public poolId: Long;

      /**
       * Creates a new MsgUnPoolWhitelistedPool instance using the specified properties.
       * @param [properties] Properties to set
       * @returns MsgUnPoolWhitelistedPool instance
       */
      public static create(
        properties?: osmosis.superfluid.IMsgUnPoolWhitelistedPool
      ): osmosis.superfluid.MsgUnPoolWhitelistedPool;

      /**
       * Encodes the specified MsgUnPoolWhitelistedPool message. Does not implicitly {@link osmosis.superfluid.MsgUnPoolWhitelistedPool.verify|verify} messages.
       * @param m MsgUnPoolWhitelistedPool message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: osmosis.superfluid.IMsgUnPoolWhitelistedPool,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a MsgUnPoolWhitelistedPool message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns MsgUnPoolWhitelistedPool
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): osmosis.superfluid.MsgUnPoolWhitelistedPool;

      /**
       * Creates a MsgUnPoolWhitelistedPool message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns MsgUnPoolWhitelistedPool
       */
      public static fromObject(d: {
        [k: string]: any;
      }): osmosis.superfluid.MsgUnPoolWhitelistedPool;

      /**
       * Creates a plain object from a MsgUnPoolWhitelistedPool message. Also converts values to other types if specified.
       * @param m MsgUnPoolWhitelistedPool
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: osmosis.superfluid.MsgUnPoolWhitelistedPool,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this MsgUnPoolWhitelistedPool to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a MsgUnPoolWhitelistedPoolResponse. */
    interface IMsgUnPoolWhitelistedPoolResponse {
      /** MsgUnPoolWhitelistedPoolResponse exitedLockIds */
      exitedLockIds?: Long[] | null;
    }

    /** Represents a MsgUnPoolWhitelistedPoolResponse. */
    class MsgUnPoolWhitelistedPoolResponse
      implements IMsgUnPoolWhitelistedPoolResponse
    {
      /**
       * Constructs a new MsgUnPoolWhitelistedPoolResponse.
       * @param [p] Properties to set
       */
      constructor(p?: osmosis.superfluid.IMsgUnPoolWhitelistedPoolResponse);

      /** MsgUnPoolWhitelistedPoolResponse exitedLockIds. */
      public exitedLockIds: Long[];

      /**
       * Creates a new MsgUnPoolWhitelistedPoolResponse instance using the specified properties.
       * @param [properties] Properties to set
       * @returns MsgUnPoolWhitelistedPoolResponse instance
       */
      public static create(
        properties?: osmosis.superfluid.IMsgUnPoolWhitelistedPoolResponse
      ): osmosis.superfluid.MsgUnPoolWhitelistedPoolResponse;

      /**
       * Encodes the specified MsgUnPoolWhitelistedPoolResponse message. Does not implicitly {@link osmosis.superfluid.MsgUnPoolWhitelistedPoolResponse.verify|verify} messages.
       * @param m MsgUnPoolWhitelistedPoolResponse message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: osmosis.superfluid.IMsgUnPoolWhitelistedPoolResponse,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a MsgUnPoolWhitelistedPoolResponse message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns MsgUnPoolWhitelistedPoolResponse
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): osmosis.superfluid.MsgUnPoolWhitelistedPoolResponse;

      /**
       * Creates a MsgUnPoolWhitelistedPoolResponse message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns MsgUnPoolWhitelistedPoolResponse
       */
      public static fromObject(d: {
        [k: string]: any;
      }): osmosis.superfluid.MsgUnPoolWhitelistedPoolResponse;

      /**
       * Creates a plain object from a MsgUnPoolWhitelistedPoolResponse message. Also converts values to other types if specified.
       * @param m MsgUnPoolWhitelistedPoolResponse
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: osmosis.superfluid.MsgUnPoolWhitelistedPoolResponse,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this MsgUnPoolWhitelistedPoolResponse to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }
  }

  /** Namespace lockup. */
  namespace lockup {
    /** Properties of a PeriodLock. */
    interface IPeriodLock {
      /** PeriodLock ID */
      ID?: Long | null;

      /** PeriodLock owner */
      owner?: string | null;

      /** PeriodLock duration */
      duration?: google.protobuf.IDuration | null;

      /** PeriodLock endTime */
      endTime?: google.protobuf.ITimestamp | null;

      /** PeriodLock coins */
      coins?: cosmos.base.v1beta1.ICoin[] | null;
    }

    /** Represents a PeriodLock. */
    class PeriodLock implements IPeriodLock {
      /**
       * Constructs a new PeriodLock.
       * @param [p] Properties to set
       */
      constructor(p?: osmosis.lockup.IPeriodLock);

      /** PeriodLock ID. */
      public ID: Long;

      /** PeriodLock owner. */
      public owner: string;

      /** PeriodLock duration. */
      public duration?: google.protobuf.IDuration | null;

      /** PeriodLock endTime. */
      public endTime?: google.protobuf.ITimestamp | null;

      /** PeriodLock coins. */
      public coins: cosmos.base.v1beta1.ICoin[];

      /**
       * Creates a new PeriodLock instance using the specified properties.
       * @param [properties] Properties to set
       * @returns PeriodLock instance
       */
      public static create(
        properties?: osmosis.lockup.IPeriodLock
      ): osmosis.lockup.PeriodLock;

      /**
       * Encodes the specified PeriodLock message. Does not implicitly {@link osmosis.lockup.PeriodLock.verify|verify} messages.
       * @param m PeriodLock message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: osmosis.lockup.IPeriodLock,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a PeriodLock message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns PeriodLock
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): osmosis.lockup.PeriodLock;

      /**
       * Creates a PeriodLock message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns PeriodLock
       */
      public static fromObject(d: {
        [k: string]: any;
      }): osmosis.lockup.PeriodLock;

      /**
       * Creates a plain object from a PeriodLock message. Also converts values to other types if specified.
       * @param m PeriodLock
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: osmosis.lockup.PeriodLock,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this PeriodLock to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

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
      public static create(
        properties?: osmosis.lockup.IQueryCondition
      ): osmosis.lockup.QueryCondition;

      /**
       * Encodes the specified QueryCondition message. Does not implicitly {@link osmosis.lockup.QueryCondition.verify|verify} messages.
       * @param m QueryCondition message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: osmosis.lockup.IQueryCondition,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a QueryCondition message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns QueryCondition
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): osmosis.lockup.QueryCondition;

      /**
       * Creates a QueryCondition message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns QueryCondition
       */
      public static fromObject(d: {
        [k: string]: any;
      }): osmosis.lockup.QueryCondition;

      /**
       * Creates a plain object from a QueryCondition message. Also converts values to other types if specified.
       * @param m QueryCondition
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: osmosis.lockup.QueryCondition,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this QueryCondition to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a SyntheticLock. */
    interface ISyntheticLock {
      /** SyntheticLock underlyingLockId */
      underlyingLockId?: Long | null;

      /** SyntheticLock synthDenom */
      synthDenom?: string | null;

      /** SyntheticLock endTime */
      endTime?: google.protobuf.ITimestamp | null;

      /** SyntheticLock duration */
      duration?: google.protobuf.IDuration | null;
    }

    /** Represents a SyntheticLock. */
    class SyntheticLock implements ISyntheticLock {
      /**
       * Constructs a new SyntheticLock.
       * @param [p] Properties to set
       */
      constructor(p?: osmosis.lockup.ISyntheticLock);

      /** SyntheticLock underlyingLockId. */
      public underlyingLockId: Long;

      /** SyntheticLock synthDenom. */
      public synthDenom: string;

      /** SyntheticLock endTime. */
      public endTime?: google.protobuf.ITimestamp | null;

      /** SyntheticLock duration. */
      public duration?: google.protobuf.IDuration | null;

      /**
       * Creates a new SyntheticLock instance using the specified properties.
       * @param [properties] Properties to set
       * @returns SyntheticLock instance
       */
      public static create(
        properties?: osmosis.lockup.ISyntheticLock
      ): osmosis.lockup.SyntheticLock;

      /**
       * Encodes the specified SyntheticLock message. Does not implicitly {@link osmosis.lockup.SyntheticLock.verify|verify} messages.
       * @param m SyntheticLock message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: osmosis.lockup.ISyntheticLock,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a SyntheticLock message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns SyntheticLock
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): osmosis.lockup.SyntheticLock;

      /**
       * Creates a SyntheticLock message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns SyntheticLock
       */
      public static fromObject(d: {
        [k: string]: any;
      }): osmosis.lockup.SyntheticLock;

      /**
       * Creates a plain object from a SyntheticLock message. Also converts values to other types if specified.
       * @param m SyntheticLock
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: osmosis.lockup.SyntheticLock,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this SyntheticLock to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Represents a Msg */
    class Msg extends $protobuf.rpc.Service {
      /**
       * Constructs a new Msg service.
       * @param rpcImpl RPC implementation
       * @param [requestDelimited=false] Whether requests are length-delimited
       * @param [responseDelimited=false] Whether responses are length-delimited
       */
      constructor(
        rpcImpl: $protobuf.RPCImpl,
        requestDelimited?: boolean,
        responseDelimited?: boolean
      );

      /**
       * Creates new Msg service using the specified rpc implementation.
       * @param rpcImpl RPC implementation
       * @param [requestDelimited=false] Whether requests are length-delimited
       * @param [responseDelimited=false] Whether responses are length-delimited
       * @returns RPC service. Useful where requests and/or responses are streamed.
       */
      public static create(
        rpcImpl: $protobuf.RPCImpl,
        requestDelimited?: boolean,
        responseDelimited?: boolean
      ): Msg;

      /**
       * Calls LockTokens.
       * @param request MsgLockTokens message or plain object
       * @param callback Node-style callback called with the error, if any, and MsgLockTokensResponse
       */
      public lockTokens(
        request: osmosis.lockup.IMsgLockTokens,
        callback: osmosis.lockup.Msg.LockTokensCallback
      ): void;

      /**
       * Calls LockTokens.
       * @param request MsgLockTokens message or plain object
       * @returns Promise
       */
      public lockTokens(
        request: osmosis.lockup.IMsgLockTokens
      ): Promise<osmosis.lockup.MsgLockTokensResponse>;

      /**
       * Calls BeginUnlockingAll.
       * @param request MsgBeginUnlockingAll message or plain object
       * @param callback Node-style callback called with the error, if any, and MsgBeginUnlockingAllResponse
       */
      public beginUnlockingAll(
        request: osmosis.lockup.IMsgBeginUnlockingAll,
        callback: osmosis.lockup.Msg.BeginUnlockingAllCallback
      ): void;

      /**
       * Calls BeginUnlockingAll.
       * @param request MsgBeginUnlockingAll message or plain object
       * @returns Promise
       */
      public beginUnlockingAll(
        request: osmosis.lockup.IMsgBeginUnlockingAll
      ): Promise<osmosis.lockup.MsgBeginUnlockingAllResponse>;

      /**
       * Calls BeginUnlocking.
       * @param request MsgBeginUnlocking message or plain object
       * @param callback Node-style callback called with the error, if any, and MsgBeginUnlockingResponse
       */
      public beginUnlocking(
        request: osmosis.lockup.IMsgBeginUnlocking,
        callback: osmosis.lockup.Msg.BeginUnlockingCallback
      ): void;

      /**
       * Calls BeginUnlocking.
       * @param request MsgBeginUnlocking message or plain object
       * @returns Promise
       */
      public beginUnlocking(
        request: osmosis.lockup.IMsgBeginUnlocking
      ): Promise<osmosis.lockup.MsgBeginUnlockingResponse>;

      /**
       * Calls ExtendLockup.
       * @param request MsgExtendLockup message or plain object
       * @param callback Node-style callback called with the error, if any, and MsgExtendLockupResponse
       */
      public extendLockup(
        request: osmosis.lockup.IMsgExtendLockup,
        callback: osmosis.lockup.Msg.ExtendLockupCallback
      ): void;

      /**
       * Calls ExtendLockup.
       * @param request MsgExtendLockup message or plain object
       * @returns Promise
       */
      public extendLockup(
        request: osmosis.lockup.IMsgExtendLockup
      ): Promise<osmosis.lockup.MsgExtendLockupResponse>;

      /**
       * Calls ForceUnlock.
       * @param request MsgForceUnlock message or plain object
       * @param callback Node-style callback called with the error, if any, and MsgForceUnlockResponse
       */
      public forceUnlock(
        request: osmosis.lockup.IMsgForceUnlock,
        callback: osmosis.lockup.Msg.ForceUnlockCallback
      ): void;

      /**
       * Calls ForceUnlock.
       * @param request MsgForceUnlock message or plain object
       * @returns Promise
       */
      public forceUnlock(
        request: osmosis.lockup.IMsgForceUnlock
      ): Promise<osmosis.lockup.MsgForceUnlockResponse>;
    }

    namespace Msg {
      /**
       * Callback as used by {@link osmosis.lockup.Msg#lockTokens}.
       * @param error Error, if any
       * @param [response] MsgLockTokensResponse
       */
      type LockTokensCallback = (
        error: Error | null,
        response?: osmosis.lockup.MsgLockTokensResponse
      ) => void;

      /**
       * Callback as used by {@link osmosis.lockup.Msg#beginUnlockingAll}.
       * @param error Error, if any
       * @param [response] MsgBeginUnlockingAllResponse
       */
      type BeginUnlockingAllCallback = (
        error: Error | null,
        response?: osmosis.lockup.MsgBeginUnlockingAllResponse
      ) => void;

      /**
       * Callback as used by {@link osmosis.lockup.Msg#beginUnlocking}.
       * @param error Error, if any
       * @param [response] MsgBeginUnlockingResponse
       */
      type BeginUnlockingCallback = (
        error: Error | null,
        response?: osmosis.lockup.MsgBeginUnlockingResponse
      ) => void;

      /**
       * Callback as used by {@link osmosis.lockup.Msg#extendLockup}.
       * @param error Error, if any
       * @param [response] MsgExtendLockupResponse
       */
      type ExtendLockupCallback = (
        error: Error | null,
        response?: osmosis.lockup.MsgExtendLockupResponse
      ) => void;

      /**
       * Callback as used by {@link osmosis.lockup.Msg#forceUnlock}.
       * @param error Error, if any
       * @param [response] MsgForceUnlockResponse
       */
      type ForceUnlockCallback = (
        error: Error | null,
        response?: osmosis.lockup.MsgForceUnlockResponse
      ) => void;
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
      public static create(
        properties?: osmosis.lockup.IMsgLockTokens
      ): osmosis.lockup.MsgLockTokens;

      /**
       * Encodes the specified MsgLockTokens message. Does not implicitly {@link osmosis.lockup.MsgLockTokens.verify|verify} messages.
       * @param m MsgLockTokens message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: osmosis.lockup.IMsgLockTokens,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a MsgLockTokens message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns MsgLockTokens
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): osmosis.lockup.MsgLockTokens;

      /**
       * Creates a MsgLockTokens message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns MsgLockTokens
       */
      public static fromObject(d: {
        [k: string]: any;
      }): osmosis.lockup.MsgLockTokens;

      /**
       * Creates a plain object from a MsgLockTokens message. Also converts values to other types if specified.
       * @param m MsgLockTokens
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: osmosis.lockup.MsgLockTokens,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this MsgLockTokens to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a MsgLockTokensResponse. */
    interface IMsgLockTokensResponse {
      /** MsgLockTokensResponse ID */
      ID?: Long | null;
    }

    /** Represents a MsgLockTokensResponse. */
    class MsgLockTokensResponse implements IMsgLockTokensResponse {
      /**
       * Constructs a new MsgLockTokensResponse.
       * @param [p] Properties to set
       */
      constructor(p?: osmosis.lockup.IMsgLockTokensResponse);

      /** MsgLockTokensResponse ID. */
      public ID: Long;

      /**
       * Creates a new MsgLockTokensResponse instance using the specified properties.
       * @param [properties] Properties to set
       * @returns MsgLockTokensResponse instance
       */
      public static create(
        properties?: osmosis.lockup.IMsgLockTokensResponse
      ): osmosis.lockup.MsgLockTokensResponse;

      /**
       * Encodes the specified MsgLockTokensResponse message. Does not implicitly {@link osmosis.lockup.MsgLockTokensResponse.verify|verify} messages.
       * @param m MsgLockTokensResponse message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: osmosis.lockup.IMsgLockTokensResponse,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a MsgLockTokensResponse message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns MsgLockTokensResponse
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): osmosis.lockup.MsgLockTokensResponse;

      /**
       * Creates a MsgLockTokensResponse message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns MsgLockTokensResponse
       */
      public static fromObject(d: {
        [k: string]: any;
      }): osmosis.lockup.MsgLockTokensResponse;

      /**
       * Creates a plain object from a MsgLockTokensResponse message. Also converts values to other types if specified.
       * @param m MsgLockTokensResponse
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: osmosis.lockup.MsgLockTokensResponse,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this MsgLockTokensResponse to JSON.
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
      public static create(
        properties?: osmosis.lockup.IMsgBeginUnlockingAll
      ): osmosis.lockup.MsgBeginUnlockingAll;

      /**
       * Encodes the specified MsgBeginUnlockingAll message. Does not implicitly {@link osmosis.lockup.MsgBeginUnlockingAll.verify|verify} messages.
       * @param m MsgBeginUnlockingAll message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: osmosis.lockup.IMsgBeginUnlockingAll,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a MsgBeginUnlockingAll message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns MsgBeginUnlockingAll
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): osmosis.lockup.MsgBeginUnlockingAll;

      /**
       * Creates a MsgBeginUnlockingAll message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns MsgBeginUnlockingAll
       */
      public static fromObject(d: {
        [k: string]: any;
      }): osmosis.lockup.MsgBeginUnlockingAll;

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

    /** Properties of a MsgBeginUnlockingAllResponse. */
    interface IMsgBeginUnlockingAllResponse {
      /** MsgBeginUnlockingAllResponse unlocks */
      unlocks?: osmosis.lockup.IPeriodLock[] | null;
    }

    /** Represents a MsgBeginUnlockingAllResponse. */
    class MsgBeginUnlockingAllResponse
      implements IMsgBeginUnlockingAllResponse
    {
      /**
       * Constructs a new MsgBeginUnlockingAllResponse.
       * @param [p] Properties to set
       */
      constructor(p?: osmosis.lockup.IMsgBeginUnlockingAllResponse);

      /** MsgBeginUnlockingAllResponse unlocks. */
      public unlocks: osmosis.lockup.IPeriodLock[];

      /**
       * Creates a new MsgBeginUnlockingAllResponse instance using the specified properties.
       * @param [properties] Properties to set
       * @returns MsgBeginUnlockingAllResponse instance
       */
      public static create(
        properties?: osmosis.lockup.IMsgBeginUnlockingAllResponse
      ): osmosis.lockup.MsgBeginUnlockingAllResponse;

      /**
       * Encodes the specified MsgBeginUnlockingAllResponse message. Does not implicitly {@link osmosis.lockup.MsgBeginUnlockingAllResponse.verify|verify} messages.
       * @param m MsgBeginUnlockingAllResponse message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: osmosis.lockup.IMsgBeginUnlockingAllResponse,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a MsgBeginUnlockingAllResponse message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns MsgBeginUnlockingAllResponse
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): osmosis.lockup.MsgBeginUnlockingAllResponse;

      /**
       * Creates a MsgBeginUnlockingAllResponse message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns MsgBeginUnlockingAllResponse
       */
      public static fromObject(d: {
        [k: string]: any;
      }): osmosis.lockup.MsgBeginUnlockingAllResponse;

      /**
       * Creates a plain object from a MsgBeginUnlockingAllResponse message. Also converts values to other types if specified.
       * @param m MsgBeginUnlockingAllResponse
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: osmosis.lockup.MsgBeginUnlockingAllResponse,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this MsgBeginUnlockingAllResponse to JSON.
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

      /** MsgBeginUnlocking coins */
      coins?: cosmos.base.v1beta1.ICoin[] | null;
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

      /** MsgBeginUnlocking coins. */
      public coins: cosmos.base.v1beta1.ICoin[];

      /**
       * Creates a new MsgBeginUnlocking instance using the specified properties.
       * @param [properties] Properties to set
       * @returns MsgBeginUnlocking instance
       */
      public static create(
        properties?: osmosis.lockup.IMsgBeginUnlocking
      ): osmosis.lockup.MsgBeginUnlocking;

      /**
       * Encodes the specified MsgBeginUnlocking message. Does not implicitly {@link osmosis.lockup.MsgBeginUnlocking.verify|verify} messages.
       * @param m MsgBeginUnlocking message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: osmosis.lockup.IMsgBeginUnlocking,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a MsgBeginUnlocking message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns MsgBeginUnlocking
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): osmosis.lockup.MsgBeginUnlocking;

      /**
       * Creates a MsgBeginUnlocking message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns MsgBeginUnlocking
       */
      public static fromObject(d: {
        [k: string]: any;
      }): osmosis.lockup.MsgBeginUnlocking;

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

    /** Properties of a MsgBeginUnlockingResponse. */
    interface IMsgBeginUnlockingResponse {
      /** MsgBeginUnlockingResponse success */
      success?: boolean | null;
    }

    /** Represents a MsgBeginUnlockingResponse. */
    class MsgBeginUnlockingResponse implements IMsgBeginUnlockingResponse {
      /**
       * Constructs a new MsgBeginUnlockingResponse.
       * @param [p] Properties to set
       */
      constructor(p?: osmosis.lockup.IMsgBeginUnlockingResponse);

      /** MsgBeginUnlockingResponse success. */
      public success: boolean;

      /**
       * Creates a new MsgBeginUnlockingResponse instance using the specified properties.
       * @param [properties] Properties to set
       * @returns MsgBeginUnlockingResponse instance
       */
      public static create(
        properties?: osmosis.lockup.IMsgBeginUnlockingResponse
      ): osmosis.lockup.MsgBeginUnlockingResponse;

      /**
       * Encodes the specified MsgBeginUnlockingResponse message. Does not implicitly {@link osmosis.lockup.MsgBeginUnlockingResponse.verify|verify} messages.
       * @param m MsgBeginUnlockingResponse message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: osmosis.lockup.IMsgBeginUnlockingResponse,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a MsgBeginUnlockingResponse message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns MsgBeginUnlockingResponse
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): osmosis.lockup.MsgBeginUnlockingResponse;

      /**
       * Creates a MsgBeginUnlockingResponse message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns MsgBeginUnlockingResponse
       */
      public static fromObject(d: {
        [k: string]: any;
      }): osmosis.lockup.MsgBeginUnlockingResponse;

      /**
       * Creates a plain object from a MsgBeginUnlockingResponse message. Also converts values to other types if specified.
       * @param m MsgBeginUnlockingResponse
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: osmosis.lockup.MsgBeginUnlockingResponse,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this MsgBeginUnlockingResponse to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a MsgExtendLockup. */
    interface IMsgExtendLockup {
      /** MsgExtendLockup owner */
      owner?: string | null;

      /** MsgExtendLockup ID */
      ID?: Long | null;

      /** MsgExtendLockup duration */
      duration?: google.protobuf.IDuration | null;
    }

    /** Represents a MsgExtendLockup. */
    class MsgExtendLockup implements IMsgExtendLockup {
      /**
       * Constructs a new MsgExtendLockup.
       * @param [p] Properties to set
       */
      constructor(p?: osmosis.lockup.IMsgExtendLockup);

      /** MsgExtendLockup owner. */
      public owner: string;

      /** MsgExtendLockup ID. */
      public ID: Long;

      /** MsgExtendLockup duration. */
      public duration?: google.protobuf.IDuration | null;

      /**
       * Creates a new MsgExtendLockup instance using the specified properties.
       * @param [properties] Properties to set
       * @returns MsgExtendLockup instance
       */
      public static create(
        properties?: osmosis.lockup.IMsgExtendLockup
      ): osmosis.lockup.MsgExtendLockup;

      /**
       * Encodes the specified MsgExtendLockup message. Does not implicitly {@link osmosis.lockup.MsgExtendLockup.verify|verify} messages.
       * @param m MsgExtendLockup message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: osmosis.lockup.IMsgExtendLockup,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a MsgExtendLockup message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns MsgExtendLockup
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): osmosis.lockup.MsgExtendLockup;

      /**
       * Creates a MsgExtendLockup message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns MsgExtendLockup
       */
      public static fromObject(d: {
        [k: string]: any;
      }): osmosis.lockup.MsgExtendLockup;

      /**
       * Creates a plain object from a MsgExtendLockup message. Also converts values to other types if specified.
       * @param m MsgExtendLockup
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: osmosis.lockup.MsgExtendLockup,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this MsgExtendLockup to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a MsgExtendLockupResponse. */
    interface IMsgExtendLockupResponse {
      /** MsgExtendLockupResponse success */
      success?: boolean | null;
    }

    /** Represents a MsgExtendLockupResponse. */
    class MsgExtendLockupResponse implements IMsgExtendLockupResponse {
      /**
       * Constructs a new MsgExtendLockupResponse.
       * @param [p] Properties to set
       */
      constructor(p?: osmosis.lockup.IMsgExtendLockupResponse);

      /** MsgExtendLockupResponse success. */
      public success: boolean;

      /**
       * Creates a new MsgExtendLockupResponse instance using the specified properties.
       * @param [properties] Properties to set
       * @returns MsgExtendLockupResponse instance
       */
      public static create(
        properties?: osmosis.lockup.IMsgExtendLockupResponse
      ): osmosis.lockup.MsgExtendLockupResponse;

      /**
       * Encodes the specified MsgExtendLockupResponse message. Does not implicitly {@link osmosis.lockup.MsgExtendLockupResponse.verify|verify} messages.
       * @param m MsgExtendLockupResponse message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: osmosis.lockup.IMsgExtendLockupResponse,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a MsgExtendLockupResponse message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns MsgExtendLockupResponse
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): osmosis.lockup.MsgExtendLockupResponse;

      /**
       * Creates a MsgExtendLockupResponse message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns MsgExtendLockupResponse
       */
      public static fromObject(d: {
        [k: string]: any;
      }): osmosis.lockup.MsgExtendLockupResponse;

      /**
       * Creates a plain object from a MsgExtendLockupResponse message. Also converts values to other types if specified.
       * @param m MsgExtendLockupResponse
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: osmosis.lockup.MsgExtendLockupResponse,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this MsgExtendLockupResponse to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a MsgForceUnlock. */
    interface IMsgForceUnlock {
      /** MsgForceUnlock owner */
      owner?: string | null;

      /** MsgForceUnlock ID */
      ID?: Long | null;

      /** MsgForceUnlock coins */
      coins?: cosmos.base.v1beta1.ICoin[] | null;
    }

    /** Represents a MsgForceUnlock. */
    class MsgForceUnlock implements IMsgForceUnlock {
      /**
       * Constructs a new MsgForceUnlock.
       * @param [p] Properties to set
       */
      constructor(p?: osmosis.lockup.IMsgForceUnlock);

      /** MsgForceUnlock owner. */
      public owner: string;

      /** MsgForceUnlock ID. */
      public ID: Long;

      /** MsgForceUnlock coins. */
      public coins: cosmos.base.v1beta1.ICoin[];

      /**
       * Creates a new MsgForceUnlock instance using the specified properties.
       * @param [properties] Properties to set
       * @returns MsgForceUnlock instance
       */
      public static create(
        properties?: osmosis.lockup.IMsgForceUnlock
      ): osmosis.lockup.MsgForceUnlock;

      /**
       * Encodes the specified MsgForceUnlock message. Does not implicitly {@link osmosis.lockup.MsgForceUnlock.verify|verify} messages.
       * @param m MsgForceUnlock message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: osmosis.lockup.IMsgForceUnlock,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a MsgForceUnlock message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns MsgForceUnlock
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): osmosis.lockup.MsgForceUnlock;

      /**
       * Creates a MsgForceUnlock message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns MsgForceUnlock
       */
      public static fromObject(d: {
        [k: string]: any;
      }): osmosis.lockup.MsgForceUnlock;

      /**
       * Creates a plain object from a MsgForceUnlock message. Also converts values to other types if specified.
       * @param m MsgForceUnlock
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: osmosis.lockup.MsgForceUnlock,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this MsgForceUnlock to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a MsgForceUnlockResponse. */
    interface IMsgForceUnlockResponse {
      /** MsgForceUnlockResponse success */
      success?: boolean | null;
    }

    /** Represents a MsgForceUnlockResponse. */
    class MsgForceUnlockResponse implements IMsgForceUnlockResponse {
      /**
       * Constructs a new MsgForceUnlockResponse.
       * @param [p] Properties to set
       */
      constructor(p?: osmosis.lockup.IMsgForceUnlockResponse);

      /** MsgForceUnlockResponse success. */
      public success: boolean;

      /**
       * Creates a new MsgForceUnlockResponse instance using the specified properties.
       * @param [properties] Properties to set
       * @returns MsgForceUnlockResponse instance
       */
      public static create(
        properties?: osmosis.lockup.IMsgForceUnlockResponse
      ): osmosis.lockup.MsgForceUnlockResponse;

      /**
       * Encodes the specified MsgForceUnlockResponse message. Does not implicitly {@link osmosis.lockup.MsgForceUnlockResponse.verify|verify} messages.
       * @param m MsgForceUnlockResponse message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: osmosis.lockup.IMsgForceUnlockResponse,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a MsgForceUnlockResponse message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns MsgForceUnlockResponse
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): osmosis.lockup.MsgForceUnlockResponse;

      /**
       * Creates a MsgForceUnlockResponse message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns MsgForceUnlockResponse
       */
      public static fromObject(d: {
        [k: string]: any;
      }): osmosis.lockup.MsgForceUnlockResponse;

      /**
       * Creates a plain object from a MsgForceUnlockResponse message. Also converts values to other types if specified.
       * @param m MsgForceUnlockResponse
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: osmosis.lockup.MsgForceUnlockResponse,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this MsgForceUnlockResponse to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }
  }

  /** Namespace incentives. */
  namespace incentives {
    /** Represents a Msg */
    class Msg extends $protobuf.rpc.Service {
      /**
       * Constructs a new Msg service.
       * @param rpcImpl RPC implementation
       * @param [requestDelimited=false] Whether requests are length-delimited
       * @param [responseDelimited=false] Whether responses are length-delimited
       */
      constructor(
        rpcImpl: $protobuf.RPCImpl,
        requestDelimited?: boolean,
        responseDelimited?: boolean
      );

      /**
       * Creates new Msg service using the specified rpc implementation.
       * @param rpcImpl RPC implementation
       * @param [requestDelimited=false] Whether requests are length-delimited
       * @param [responseDelimited=false] Whether responses are length-delimited
       * @returns RPC service. Useful where requests and/or responses are streamed.
       */
      public static create(
        rpcImpl: $protobuf.RPCImpl,
        requestDelimited?: boolean,
        responseDelimited?: boolean
      ): Msg;

      /**
       * Calls CreateGauge.
       * @param request MsgCreateGauge message or plain object
       * @param callback Node-style callback called with the error, if any, and MsgCreateGaugeResponse
       */
      public createGauge(
        request: osmosis.incentives.IMsgCreateGauge,
        callback: osmosis.incentives.Msg.CreateGaugeCallback
      ): void;

      /**
       * Calls CreateGauge.
       * @param request MsgCreateGauge message or plain object
       * @returns Promise
       */
      public createGauge(
        request: osmosis.incentives.IMsgCreateGauge
      ): Promise<osmosis.incentives.MsgCreateGaugeResponse>;

      /**
       * Calls AddToGauge.
       * @param request MsgAddToGauge message or plain object
       * @param callback Node-style callback called with the error, if any, and MsgAddToGaugeResponse
       */
      public addToGauge(
        request: osmosis.incentives.IMsgAddToGauge,
        callback: osmosis.incentives.Msg.AddToGaugeCallback
      ): void;

      /**
       * Calls AddToGauge.
       * @param request MsgAddToGauge message or plain object
       * @returns Promise
       */
      public addToGauge(
        request: osmosis.incentives.IMsgAddToGauge
      ): Promise<osmosis.incentives.MsgAddToGaugeResponse>;
    }

    namespace Msg {
      /**
       * Callback as used by {@link osmosis.incentives.Msg#createGauge}.
       * @param error Error, if any
       * @param [response] MsgCreateGaugeResponse
       */
      type CreateGaugeCallback = (
        error: Error | null,
        response?: osmosis.incentives.MsgCreateGaugeResponse
      ) => void;

      /**
       * Callback as used by {@link osmosis.incentives.Msg#addToGauge}.
       * @param error Error, if any
       * @param [response] MsgAddToGaugeResponse
       */
      type AddToGaugeCallback = (
        error: Error | null,
        response?: osmosis.incentives.MsgAddToGaugeResponse
      ) => void;
    }

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
      public static create(
        properties?: osmosis.incentives.IMsgCreateGauge
      ): osmosis.incentives.MsgCreateGauge;

      /**
       * Encodes the specified MsgCreateGauge message. Does not implicitly {@link osmosis.incentives.MsgCreateGauge.verify|verify} messages.
       * @param m MsgCreateGauge message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: osmosis.incentives.IMsgCreateGauge,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a MsgCreateGauge message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns MsgCreateGauge
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): osmosis.incentives.MsgCreateGauge;

      /**
       * Creates a MsgCreateGauge message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns MsgCreateGauge
       */
      public static fromObject(d: {
        [k: string]: any;
      }): osmosis.incentives.MsgCreateGauge;

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

    /** Properties of a MsgCreateGaugeResponse. */
    interface IMsgCreateGaugeResponse {}

    /** Represents a MsgCreateGaugeResponse. */
    class MsgCreateGaugeResponse implements IMsgCreateGaugeResponse {
      /**
       * Constructs a new MsgCreateGaugeResponse.
       * @param [p] Properties to set
       */
      constructor(p?: osmosis.incentives.IMsgCreateGaugeResponse);

      /**
       * Creates a new MsgCreateGaugeResponse instance using the specified properties.
       * @param [properties] Properties to set
       * @returns MsgCreateGaugeResponse instance
       */
      public static create(
        properties?: osmosis.incentives.IMsgCreateGaugeResponse
      ): osmosis.incentives.MsgCreateGaugeResponse;

      /**
       * Encodes the specified MsgCreateGaugeResponse message. Does not implicitly {@link osmosis.incentives.MsgCreateGaugeResponse.verify|verify} messages.
       * @param m MsgCreateGaugeResponse message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: osmosis.incentives.IMsgCreateGaugeResponse,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a MsgCreateGaugeResponse message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns MsgCreateGaugeResponse
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): osmosis.incentives.MsgCreateGaugeResponse;

      /**
       * Creates a MsgCreateGaugeResponse message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns MsgCreateGaugeResponse
       */
      public static fromObject(d: {
        [k: string]: any;
      }): osmosis.incentives.MsgCreateGaugeResponse;

      /**
       * Creates a plain object from a MsgCreateGaugeResponse message. Also converts values to other types if specified.
       * @param m MsgCreateGaugeResponse
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: osmosis.incentives.MsgCreateGaugeResponse,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this MsgCreateGaugeResponse to JSON.
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
      public static create(
        properties?: osmosis.incentives.IMsgAddToGauge
      ): osmosis.incentives.MsgAddToGauge;

      /**
       * Encodes the specified MsgAddToGauge message. Does not implicitly {@link osmosis.incentives.MsgAddToGauge.verify|verify} messages.
       * @param m MsgAddToGauge message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: osmosis.incentives.IMsgAddToGauge,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a MsgAddToGauge message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns MsgAddToGauge
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): osmosis.incentives.MsgAddToGauge;

      /**
       * Creates a MsgAddToGauge message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns MsgAddToGauge
       */
      public static fromObject(d: {
        [k: string]: any;
      }): osmosis.incentives.MsgAddToGauge;

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

    /** Properties of a MsgAddToGaugeResponse. */
    interface IMsgAddToGaugeResponse {}

    /** Represents a MsgAddToGaugeResponse. */
    class MsgAddToGaugeResponse implements IMsgAddToGaugeResponse {
      /**
       * Constructs a new MsgAddToGaugeResponse.
       * @param [p] Properties to set
       */
      constructor(p?: osmosis.incentives.IMsgAddToGaugeResponse);

      /**
       * Creates a new MsgAddToGaugeResponse instance using the specified properties.
       * @param [properties] Properties to set
       * @returns MsgAddToGaugeResponse instance
       */
      public static create(
        properties?: osmosis.incentives.IMsgAddToGaugeResponse
      ): osmosis.incentives.MsgAddToGaugeResponse;

      /**
       * Encodes the specified MsgAddToGaugeResponse message. Does not implicitly {@link osmosis.incentives.MsgAddToGaugeResponse.verify|verify} messages.
       * @param m MsgAddToGaugeResponse message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: osmosis.incentives.IMsgAddToGaugeResponse,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a MsgAddToGaugeResponse message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns MsgAddToGaugeResponse
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): osmosis.incentives.MsgAddToGaugeResponse;

      /**
       * Creates a MsgAddToGaugeResponse message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns MsgAddToGaugeResponse
       */
      public static fromObject(d: {
        [k: string]: any;
      }): osmosis.incentives.MsgAddToGaugeResponse;

      /**
       * Creates a plain object from a MsgAddToGaugeResponse message. Also converts values to other types if specified.
       * @param m MsgAddToGaugeResponse
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: osmosis.incentives.MsgAddToGaugeResponse,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this MsgAddToGaugeResponse to JSON.
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
      public static create(
        properties?: google.protobuf.IDuration
      ): google.protobuf.Duration;

      /**
       * Encodes the specified Duration message. Does not implicitly {@link google.protobuf.Duration.verify|verify} messages.
       * @param m Duration message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: google.protobuf.IDuration,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a Duration message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns Duration
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): google.protobuf.Duration;

      /**
       * Creates a Duration message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns Duration
       */
      public static fromObject(d: {
        [k: string]: any;
      }): google.protobuf.Duration;

      /**
       * Creates a plain object from a Duration message. Also converts values to other types if specified.
       * @param m Duration
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.protobuf.Duration,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

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
      public static create(
        properties?: google.protobuf.ITimestamp
      ): google.protobuf.Timestamp;

      /**
       * Encodes the specified Timestamp message. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
       * @param m Timestamp message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: google.protobuf.ITimestamp,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a Timestamp message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns Timestamp
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): google.protobuf.Timestamp;

      /**
       * Creates a Timestamp message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns Timestamp
       */
      public static fromObject(d: {
        [k: string]: any;
      }): google.protobuf.Timestamp;

      /**
       * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
       * @param m Timestamp
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.protobuf.Timestamp,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this Timestamp to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }
  }
}
