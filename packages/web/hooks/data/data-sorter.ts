import { DataProcessor } from "./types";
import get from "./utils";

/** Sorts ascending a copy of an arbitrary list of objects via key paths. Key path example: `"attributes.color"` */
export class DataSorter<TData> implements DataProcessor<TData[]> {
  readonly _data: TData[];

  constructor(readonly data: TData[]) {
    this._data = [...data]; // we will use a copy of the data, since sort() mutates inplace.
  }

  /** Key is a path of arbitrary length. Example: `"attributes.color"` or `"attributes.color.shade"` */
  process(key: string) {
    this._data.sort((a: any, b: any) => {
      let aData: string | string[] | number = get(a, key);
      let bData: string | string[] | number = get(b, key);

      // try to sort numerically
      if (typeof aData === "string" && typeof bData === "string") {
        const aDataNumerical = parseFloat(aData);
        const bDataNumerical = parseFloat(bData);

        if (aDataNumerical !== NaN && bDataNumerical !== NaN) {
          aData = aDataNumerical;
          bData = bDataNumerical;
        }
      }
      console.log({ aData, bData });

      if (aData < bData) return -1;
      if (aData > bData) return 1;
      return 0;
    });
    return this._data;
  }
}
