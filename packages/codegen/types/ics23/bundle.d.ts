import * as _0 from "../confio/proofs";
export declare const ics23: {
    hashOpFromJSON(object: any): _0.HashOp;
    hashOpToJSON(object: _0.HashOp): string;
    lengthOpFromJSON(object: any): _0.LengthOp;
    lengthOpToJSON(object: _0.LengthOp): string;
    HashOp: typeof _0.HashOp;
    LengthOp: typeof _0.LengthOp;
    ExistenceProof: {
        encode(message: _0.ExistenceProof, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
        decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _0.ExistenceProof;
        fromJSON(object: any): _0.ExistenceProof;
        toJSON(message: _0.ExistenceProof): unknown;
        fromPartial(object: {
            key?: Uint8Array;
            value?: Uint8Array;
            leaf?: {
                hash?: _0.HashOp;
                prehashKey?: _0.HashOp;
                prehashValue?: _0.HashOp;
                length?: _0.LengthOp;
                prefix?: Uint8Array;
            };
            path?: {
                hash?: _0.HashOp;
                prefix?: Uint8Array;
                suffix?: Uint8Array;
            }[];
        }): _0.ExistenceProof;
    };
    NonExistenceProof: {
        encode(message: _0.NonExistenceProof, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
        decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _0.NonExistenceProof;
        fromJSON(object: any): _0.NonExistenceProof;
        toJSON(message: _0.NonExistenceProof): unknown;
        fromPartial(object: {
            key?: Uint8Array;
            left?: {
                key?: Uint8Array;
                value?: Uint8Array;
                leaf?: {
                    hash?: _0.HashOp;
                    prehashKey?: _0.HashOp;
                    prehashValue?: _0.HashOp;
                    length?: _0.LengthOp;
                    prefix?: Uint8Array;
                };
                path?: {
                    hash?: _0.HashOp;
                    prefix?: Uint8Array;
                    suffix?: Uint8Array;
                }[];
            };
            right?: {
                key?: Uint8Array;
                value?: Uint8Array;
                leaf?: {
                    hash?: _0.HashOp;
                    prehashKey?: _0.HashOp;
                    prehashValue?: _0.HashOp;
                    length?: _0.LengthOp;
                    prefix?: Uint8Array;
                };
                path?: {
                    hash?: _0.HashOp;
                    prefix?: Uint8Array;
                    suffix?: Uint8Array;
                }[];
            };
        }): _0.NonExistenceProof;
    };
    CommitmentProof: {
        encode(message: _0.CommitmentProof, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
        decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _0.CommitmentProof;
        fromJSON(object: any): _0.CommitmentProof;
        toJSON(message: _0.CommitmentProof): unknown;
        fromPartial(object: {
            exist?: {
                key?: Uint8Array;
                value?: Uint8Array;
                leaf?: {
                    hash?: _0.HashOp;
                    prehashKey?: _0.HashOp;
                    prehashValue?: _0.HashOp;
                    length?: _0.LengthOp;
                    prefix?: Uint8Array;
                };
                path?: {
                    hash?: _0.HashOp;
                    prefix?: Uint8Array;
                    suffix?: Uint8Array;
                }[];
            };
            nonexist?: {
                key?: Uint8Array;
                left?: {
                    key?: Uint8Array;
                    value?: Uint8Array;
                    leaf?: {
                        hash?: _0.HashOp;
                        prehashKey?: _0.HashOp;
                        prehashValue?: _0.HashOp;
                        length?: _0.LengthOp;
                        prefix?: Uint8Array;
                    };
                    path?: {
                        hash?: _0.HashOp;
                        prefix?: Uint8Array;
                        suffix?: Uint8Array;
                    }[];
                };
                right?: {
                    key?: Uint8Array;
                    value?: Uint8Array;
                    leaf?: {
                        hash?: _0.HashOp;
                        prehashKey?: _0.HashOp;
                        prehashValue?: _0.HashOp;
                        length?: _0.LengthOp;
                        prefix?: Uint8Array;
                    };
                    path?: {
                        hash?: _0.HashOp;
                        prefix?: Uint8Array;
                        suffix?: Uint8Array;
                    }[];
                };
            };
            batch?: {
                entries?: {
                    exist?: {
                        key?: Uint8Array;
                        value?: Uint8Array;
                        leaf?: {
                            hash?: _0.HashOp;
                            prehashKey?: _0.HashOp;
                            prehashValue?: _0.HashOp;
                            length?: _0.LengthOp;
                            prefix?: Uint8Array;
                        };
                        path?: {
                            hash?: _0.HashOp;
                            prefix?: Uint8Array;
                            suffix?: Uint8Array;
                        }[];
                    };
                    nonexist?: {
                        key?: Uint8Array;
                        left?: {
                            key?: Uint8Array;
                            value?: Uint8Array;
                            leaf?: {
                                hash?: _0.HashOp;
                                prehashKey?: _0.HashOp;
                                prehashValue?: _0.HashOp;
                                length?: _0.LengthOp;
                                prefix?: Uint8Array;
                            };
                            path?: {
                                hash?: _0.HashOp;
                                prefix?: Uint8Array;
                                suffix?: Uint8Array;
                            }[];
                        };
                        right?: {
                            key?: Uint8Array;
                            value?: Uint8Array;
                            leaf?: {
                                hash?: _0.HashOp;
                                prehashKey?: _0.HashOp;
                                prehashValue?: _0.HashOp;
                                length?: _0.LengthOp;
                                prefix?: Uint8Array;
                            };
                            path?: {
                                hash?: _0.HashOp;
                                prefix?: Uint8Array;
                                suffix?: Uint8Array;
                            }[];
                        };
                    };
                }[];
            };
            compressed?: {
                entries?: {
                    exist?: {
                        key?: Uint8Array;
                        value?: Uint8Array;
                        leaf?: {
                            hash?: _0.HashOp;
                            prehashKey?: _0.HashOp;
                            prehashValue?: _0.HashOp;
                            length?: _0.LengthOp;
                            prefix?: Uint8Array;
                        };
                        path?: number[];
                    };
                    nonexist?: {
                        key?: Uint8Array;
                        left?: {
                            key?: Uint8Array;
                            value?: Uint8Array;
                            leaf?: {
                                hash?: _0.HashOp;
                                prehashKey?: _0.HashOp;
                                prehashValue?: _0.HashOp;
                                length?: _0.LengthOp;
                                prefix?: Uint8Array;
                            };
                            path?: number[];
                        };
                        right?: {
                            key?: Uint8Array;
                            value?: Uint8Array;
                            leaf?: {
                                hash?: _0.HashOp;
                                prehashKey?: _0.HashOp;
                                prehashValue?: _0.HashOp;
                                length?: _0.LengthOp;
                                prefix?: Uint8Array;
                            };
                            path?: number[];
                        };
                    };
                }[];
                lookupInners?: {
                    hash?: _0.HashOp;
                    prefix?: Uint8Array;
                    suffix?: Uint8Array;
                }[];
            };
        }): _0.CommitmentProof;
    };
    LeafOp: {
        encode(message: _0.LeafOp, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
        decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _0.LeafOp;
        fromJSON(object: any): _0.LeafOp;
        toJSON(message: _0.LeafOp): unknown;
        fromPartial(object: {
            hash?: _0.HashOp;
            prehashKey?: _0.HashOp;
            prehashValue?: _0.HashOp;
            length?: _0.LengthOp;
            prefix?: Uint8Array;
        }): _0.LeafOp;
    };
    InnerOp: {
        encode(message: _0.InnerOp, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
        decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _0.InnerOp;
        fromJSON(object: any): _0.InnerOp;
        toJSON(message: _0.InnerOp): unknown;
        fromPartial(object: {
            hash?: _0.HashOp;
            prefix?: Uint8Array;
            suffix?: Uint8Array;
        }): _0.InnerOp;
    };
    ProofSpec: {
        encode(message: _0.ProofSpec, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
        decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _0.ProofSpec;
        fromJSON(object: any): _0.ProofSpec;
        toJSON(message: _0.ProofSpec): unknown;
        fromPartial(object: {
            leafSpec?: {
                hash?: _0.HashOp;
                prehashKey?: _0.HashOp;
                prehashValue?: _0.HashOp;
                length?: _0.LengthOp;
                prefix?: Uint8Array;
            };
            innerSpec?: {
                childOrder?: number[];
                childSize?: number;
                minPrefixLength?: number;
                maxPrefixLength?: number;
                emptyChild?: Uint8Array;
                hash?: _0.HashOp;
            };
            maxDepth?: number;
            minDepth?: number;
        }): _0.ProofSpec;
    };
    InnerSpec: {
        encode(message: _0.InnerSpec, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
        decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _0.InnerSpec;
        fromJSON(object: any): _0.InnerSpec;
        toJSON(message: _0.InnerSpec): unknown;
        fromPartial(object: {
            childOrder?: number[];
            childSize?: number;
            minPrefixLength?: number;
            maxPrefixLength?: number;
            emptyChild?: Uint8Array;
            hash?: _0.HashOp;
        }): _0.InnerSpec;
    };
    BatchProof: {
        encode(message: _0.BatchProof, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
        decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _0.BatchProof;
        fromJSON(object: any): _0.BatchProof;
        toJSON(message: _0.BatchProof): unknown;
        fromPartial(object: {
            entries?: {
                exist?: {
                    key?: Uint8Array;
                    value?: Uint8Array;
                    leaf?: {
                        hash?: _0.HashOp;
                        prehashKey?: _0.HashOp;
                        prehashValue?: _0.HashOp;
                        length?: _0.LengthOp;
                        prefix?: Uint8Array;
                    };
                    path?: {
                        hash?: _0.HashOp;
                        prefix?: Uint8Array;
                        suffix?: Uint8Array;
                    }[];
                };
                nonexist?: {
                    key?: Uint8Array;
                    left?: {
                        key?: Uint8Array;
                        value?: Uint8Array;
                        leaf?: {
                            hash?: _0.HashOp;
                            prehashKey?: _0.HashOp;
                            prehashValue?: _0.HashOp;
                            length?: _0.LengthOp;
                            prefix?: Uint8Array;
                        };
                        path?: {
                            hash?: _0.HashOp;
                            prefix?: Uint8Array;
                            suffix?: Uint8Array;
                        }[];
                    };
                    right?: {
                        key?: Uint8Array;
                        value?: Uint8Array;
                        leaf?: {
                            hash?: _0.HashOp;
                            prehashKey?: _0.HashOp;
                            prehashValue?: _0.HashOp;
                            length?: _0.LengthOp;
                            prefix?: Uint8Array;
                        };
                        path?: {
                            hash?: _0.HashOp;
                            prefix?: Uint8Array;
                            suffix?: Uint8Array;
                        }[];
                    };
                };
            }[];
        }): _0.BatchProof;
    };
    BatchEntry: {
        encode(message: _0.BatchEntry, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
        decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _0.BatchEntry;
        fromJSON(object: any): _0.BatchEntry;
        toJSON(message: _0.BatchEntry): unknown;
        fromPartial(object: {
            exist?: {
                key?: Uint8Array;
                value?: Uint8Array;
                leaf?: {
                    hash?: _0.HashOp;
                    prehashKey?: _0.HashOp;
                    prehashValue?: _0.HashOp;
                    length?: _0.LengthOp;
                    prefix?: Uint8Array;
                };
                path?: {
                    hash?: _0.HashOp;
                    prefix?: Uint8Array;
                    suffix?: Uint8Array;
                }[];
            };
            nonexist?: {
                key?: Uint8Array;
                left?: {
                    key?: Uint8Array;
                    value?: Uint8Array;
                    leaf?: {
                        hash?: _0.HashOp;
                        prehashKey?: _0.HashOp;
                        prehashValue?: _0.HashOp;
                        length?: _0.LengthOp;
                        prefix?: Uint8Array;
                    };
                    path?: {
                        hash?: _0.HashOp;
                        prefix?: Uint8Array;
                        suffix?: Uint8Array;
                    }[];
                };
                right?: {
                    key?: Uint8Array;
                    value?: Uint8Array;
                    leaf?: {
                        hash?: _0.HashOp;
                        prehashKey?: _0.HashOp;
                        prehashValue?: _0.HashOp;
                        length?: _0.LengthOp;
                        prefix?: Uint8Array;
                    };
                    path?: {
                        hash?: _0.HashOp;
                        prefix?: Uint8Array;
                        suffix?: Uint8Array;
                    }[];
                };
            };
        }): _0.BatchEntry;
    };
    CompressedBatchProof: {
        encode(message: _0.CompressedBatchProof, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
        decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _0.CompressedBatchProof;
        fromJSON(object: any): _0.CompressedBatchProof;
        toJSON(message: _0.CompressedBatchProof): unknown;
        fromPartial(object: {
            entries?: {
                exist?: {
                    key?: Uint8Array;
                    value?: Uint8Array;
                    leaf?: {
                        hash?: _0.HashOp;
                        prehashKey?: _0.HashOp;
                        prehashValue?: _0.HashOp;
                        length?: _0.LengthOp;
                        prefix?: Uint8Array;
                    };
                    path?: number[];
                };
                nonexist?: {
                    key?: Uint8Array;
                    left?: {
                        key?: Uint8Array;
                        value?: Uint8Array;
                        leaf?: {
                            hash?: _0.HashOp;
                            prehashKey?: _0.HashOp;
                            prehashValue?: _0.HashOp;
                            length?: _0.LengthOp;
                            prefix?: Uint8Array;
                        };
                        path?: number[];
                    };
                    right?: {
                        key?: Uint8Array;
                        value?: Uint8Array;
                        leaf?: {
                            hash?: _0.HashOp;
                            prehashKey?: _0.HashOp;
                            prehashValue?: _0.HashOp;
                            length?: _0.LengthOp;
                            prefix?: Uint8Array;
                        };
                        path?: number[];
                    };
                };
            }[];
            lookupInners?: {
                hash?: _0.HashOp;
                prefix?: Uint8Array;
                suffix?: Uint8Array;
            }[];
        }): _0.CompressedBatchProof;
    };
    CompressedBatchEntry: {
        encode(message: _0.CompressedBatchEntry, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
        decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _0.CompressedBatchEntry;
        fromJSON(object: any): _0.CompressedBatchEntry;
        toJSON(message: _0.CompressedBatchEntry): unknown;
        fromPartial(object: {
            exist?: {
                key?: Uint8Array;
                value?: Uint8Array;
                leaf?: {
                    hash?: _0.HashOp;
                    prehashKey?: _0.HashOp;
                    prehashValue?: _0.HashOp;
                    length?: _0.LengthOp;
                    prefix?: Uint8Array;
                };
                path?: number[];
            };
            nonexist?: {
                key?: Uint8Array;
                left?: {
                    key?: Uint8Array;
                    value?: Uint8Array;
                    leaf?: {
                        hash?: _0.HashOp;
                        prehashKey?: _0.HashOp;
                        prehashValue?: _0.HashOp;
                        length?: _0.LengthOp;
                        prefix?: Uint8Array;
                    };
                    path?: number[];
                };
                right?: {
                    key?: Uint8Array;
                    value?: Uint8Array;
                    leaf?: {
                        hash?: _0.HashOp;
                        prehashKey?: _0.HashOp;
                        prehashValue?: _0.HashOp;
                        length?: _0.LengthOp;
                        prefix?: Uint8Array;
                    };
                    path?: number[];
                };
            };
        }): _0.CompressedBatchEntry;
    };
    CompressedExistenceProof: {
        encode(message: _0.CompressedExistenceProof, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
        decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _0.CompressedExistenceProof;
        fromJSON(object: any): _0.CompressedExistenceProof;
        toJSON(message: _0.CompressedExistenceProof): unknown;
        fromPartial(object: {
            key?: Uint8Array;
            value?: Uint8Array;
            leaf?: {
                hash?: _0.HashOp;
                prehashKey?: _0.HashOp;
                prehashValue?: _0.HashOp;
                length?: _0.LengthOp;
                prefix?: Uint8Array;
            };
            path?: number[];
        }): _0.CompressedExistenceProof;
    };
    CompressedNonExistenceProof: {
        encode(message: _0.CompressedNonExistenceProof, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
        decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _0.CompressedNonExistenceProof;
        fromJSON(object: any): _0.CompressedNonExistenceProof;
        toJSON(message: _0.CompressedNonExistenceProof): unknown;
        fromPartial(object: {
            key?: Uint8Array;
            left?: {
                key?: Uint8Array;
                value?: Uint8Array;
                leaf?: {
                    hash?: _0.HashOp;
                    prehashKey?: _0.HashOp;
                    prehashValue?: _0.HashOp;
                    length?: _0.LengthOp;
                    prefix?: Uint8Array;
                };
                path?: number[];
            };
            right?: {
                key?: Uint8Array;
                value?: Uint8Array;
                leaf?: {
                    hash?: _0.HashOp;
                    prehashKey?: _0.HashOp;
                    prehashValue?: _0.HashOp;
                    length?: _0.LengthOp;
                    prefix?: Uint8Array;
                };
                path?: number[];
            };
        }): _0.CompressedNonExistenceProof;
    };
};
