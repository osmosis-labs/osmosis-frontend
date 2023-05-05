import { join } from "path";

export const protoDirs = [
  join(__dirname, "../.repos/ibc-go/proto"),
  join(__dirname, "../.repos/wasmd/proto"),
  join(__dirname, "../.repos/osmosis/proto"),
  join(__dirname, "../.repos/ics23/proto"),
  join(__dirname, "../proto-dependencies"),
];
