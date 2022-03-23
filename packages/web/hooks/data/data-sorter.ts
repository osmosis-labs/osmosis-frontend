import { Dec } from "@keplr-wallet/unit";
import { DataProcessor } from "./types";
import get from "./utils";

export type SortingData = string | Dec | { toDec(): Dec };

/** Sorts ascending a copy of an arbitrary list of objects via key paths. Key path example: `"attributes.color"` */
export class DataSorter<TData> implements DataProcessor<TData[]> {
  readonly _data: TData[];

  constructor(readonly data: TData[]) {
    this._data = [...data]; // we will use a copy of the data, since sort() mutates inplace.
  }

  /** Key is a path of arbitrary length. Example: `"attributes.color"` or `"attributes.color.shade"` */
  process(key: string) {
    this._data.sort((a: unknown, b: unknown) => {
      let aData: SortingData = get(a, key);
      let bData: SortingData = get(b, key);

      if (typeof aData === "string" && typeof bData === "string") {
        try {
          // attempt to create Dec's from numerical strings
          aData = new Dec(aData);
          bData = new Dec(bData);
        } catch {
          // not numerical strings
          return (aData as string).localeCompare(bData as string);
        }
      }

      if (!(aData instanceof Dec)) aData = aData.toDec();
      if (!(bData instanceof Dec)) bData = bData.toDec();

      if (aData.lt(bData)) return -1;
      if (aData.gt(bData)) return 1;
      return 0;
    });
    return this._data;
  }
}
