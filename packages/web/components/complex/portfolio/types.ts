import { Time } from "lightweight-charts";

export type DataPoint = {
  value?: number;
  time?: Time;
};

export type AllocationOptions = "all" | "assets" | "available";
