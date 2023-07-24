import { isArray, isDefined, isString } from "~/hooks/data/types";

// adapted from https://github.com/krisk/Fuse/tree/master/src/helpers
export default function get(obj: any, path: any) {
  const list: any[] = [];
  let arr = false;

  const deepGet = (obj: any, path: any, index: number) => {
    if (!isDefined(obj)) {
      return;
    }
    if (!path[index]) {
      // If there's no path left, we've arrived at the object we care about.
      list.push(obj);
    } else {
      let key = path[index];

      const value = obj[key];

      if (!isDefined(value)) {
        return;
      }

      // If we're at the last value in the path, and if it's a string/number/bool,
      // add it to the list
      if (isArray(value)) {
        arr = true;
        // Search each item in the array.
        for (let i = 0, len = value.length; i < len; i += 1) {
          deepGet(value[i], path, index + 1);
        }
      } else if (path.length) {
        // An object. Recurse further.
        deepGet(value, path, index + 1);
      } else {
        list.push(value);
      }
    }
  };

  // Backwards compatibility (since path used to be a string)
  deepGet(obj, isString(path) ? path.split(".") : path, 0);

  return arr ? list : list[0];
}
