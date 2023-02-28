import Long from "long";
import protobuf from "protobufjs/minimal";

protobuf.util.Long = Long;
protobuf.configure();

/** This dependency is manually moved to the build folder in the `build:proto` step & npm script. */
export * from "./generated/codecimpl";
