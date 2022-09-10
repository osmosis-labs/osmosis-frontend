import * as _m0 from "protobufjs/minimal";
import { DeepPartial } from "@osmonauts/helpers";
export interface Node {
    children: Child[];
}
export interface Child {
    index: Uint8Array;
    accumulation: string;
}
export interface Leaf {
    leaf: Child;
}
export declare const Node: {
    encode(message: Node, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Node;
    fromJSON(object: any): Node;
    toJSON(message: Node): unknown;
    fromPartial(object: DeepPartial<Node>): Node;
};
export declare const Child: {
    encode(message: Child, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Child;
    fromJSON(object: any): Child;
    toJSON(message: Child): unknown;
    fromPartial(object: DeepPartial<Child>): Child;
};
export declare const Leaf: {
    encode(message: Leaf, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Leaf;
    fromJSON(object: any): Leaf;
    toJSON(message: Leaf): unknown;
    fromPartial(object: DeepPartial<Leaf>): Leaf;
};
