import { Dec } from "@keplr-wallet/unit";

import { DataProcessor } from "./types";
import get from "./utils";

export type SortingData = string | Dec | { toDec(): Dec } | undefined;

/** Sorts ascending a copy of an arbitrary list of objects via key paths. Key path example: `"attributes.color"` */
export class DataSorter<TData> implements DataProcessor<TData[]> {
  readonly _data: TData[];

  constructor(readonly data: TData[]) {
    this._data = [...data]; // we will use a copy of the data, since sort() mutates inplace.
  }

  /** If `data` is a list of objects, key is a path of arbitrary length into the respective objects. Example: `"attributes.color"` or `"attributes.color.shade"`.
   *
   *  If `data` is a list of sortable raw values, leave `key` blank.
   */
  process(key: string = "") {
    this._data.sort((a: unknown, b: unknown) => {
      let aData: SortingData = get(a, key);
      let bData: SortingData = get(b, key);

      if (aData === undefined || bData === undefined) return 0;
      if (typeof aData !== typeof bData) return 0;

      try {
        // attempt to create Dec's from numerical strings
        if (typeof aData === "string") {
          aData = new Dec(aData);
        }
        if (typeof bData === "string") {
          bData = new Dec(bData);
        }
        // attempt to use boolean
        if (typeof aData === "boolean") {
          aData = new Dec(aData ? 1 : 0);
        }
        if (typeof bData === "boolean") {
          bData = new Dec(bData ? 1 : 0);
        }
        // attempt to use raw number
        if (typeof aData === "number") {
          aData = new Dec(aData);
        }
        if (typeof bData === "number") {
          bData = new Dec(bData);
        }
      } catch {
        // not numerical
        return aData.toString().localeCompare(bData.toString());
      }

      try {
        // typeof === "object"
        if (!(aData instanceof Dec)) aData = aData.toDec();
        if (!(bData instanceof Dec)) bData = bData.toDec();
      } catch {
        console.error("Sort unsuccessful of", aData, bData);
        return 0;
      }

      if (aData.lt(bData)) return -1;
      if (aData.gt(bData)) return 1;
      return 0;
    });
    return this._data;
  }
}
