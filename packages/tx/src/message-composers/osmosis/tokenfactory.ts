import {
  MsgBurn,
  MsgChangeAdmin,
  MsgCreateDenom,
  MsgMint,
  MsgSetDenomMetadata,
} from "@osmosis-labs/proto-codecs/build/codegen/osmosis/tokenfactory/v1beta1/tx";
import { MessageComposer } from "@osmosis-labs/proto-codecs/build/codegen/osmosis/tokenfactory/v1beta1/tx.registry";

export function makeMsgCreateDenom(value: MsgCreateDenom) {
  return MessageComposer.withTypeUrl.createDenom(value);
}

export function makeMsgSetDenomMetadata(value: MsgSetDenomMetadata) {
  return MessageComposer.withTypeUrl.setDenomMetadata(value);
}

export function makeMsgMint(value: MsgMint) {
  return MessageComposer.withTypeUrl.mint(value);
}

export function makeMsgBurn(value: MsgBurn) {
  return MessageComposer.withTypeUrl.burn(value);
}

export function makeMsgChangeAdmin(value: MsgChangeAdmin) {
  return MessageComposer.withTypeUrl.changeAdmin(value);
}
