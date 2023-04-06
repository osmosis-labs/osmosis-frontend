import * as fs from "fs";

describe("Localization JSON files", () => {
  it("should have the same keys", () => {
    const localizationObjs = getJSONsAsObjs();

    localizationObjs.forEach(([fileName1, obj], i) => {
      // compare the first object's keys to the rest of the objects
      localizationObjs.forEach(([fileName2, obj2], j) => {
        if (i !== j) {
          // check if the keys are the same
          if (!deepEqual_onlyObjects(obj, obj2)) {
            throw new Error(
              `Localization files do not have the same keys. Check the console for more details. Files ${fileName1} and ${fileName2}`
            );
          }
        }
      });
    });
  });
});

/** Get all JSONs in `readPath` dir, return as list of unknown objects with their filename. */
function getJSONsAsObjs(
  readPath = `${process.cwd()}/localizations/`
): [string, object][] {
  const fileNames = fs
    .readdirSync(readPath)
    .filter((file) => file.match(/\.json$/));

  const contents: [string, object][] = [];

  fileNames.forEach((fileName: string) => {
    let typeName = fileName.match(/(^.*?)\.json/);
    if (typeName) {
      const obj = JSON.parse(
        fs.readFileSync(readPath + fileName, "utf8").toString()
      );
      contents.push([fileName, obj]);
    }
  });
  return contents;
}

// recursive object key check
function deepEqual_onlyObjects(
  obj1: any,
  obj2: any,
  curKeyPath: string[] = []
) {
  // Check if both inputs are objects and not null
  if (
    typeof obj1 !== "object" ||
    obj1 === null ||
    typeof obj2 !== "object" ||
    obj2 === null
  ) {
    return true; // don't care about non-objects
  }

  // Get the keys of both objects
  const obj1Keys = Object.keys(obj1);
  const obj2Keys = Object.keys(obj2);

  // Check if the number of keys is the same
  if (obj1Keys.length !== obj2Keys.length) {
    console.error(
      "not equal",
      obj1Keys.length,
      obj2Keys.length,
      " -- path:",
      curKeyPath.join(".")
    );
    return false;
  }

  // Iterate through the keys of the first object
  for (let key of obj1Keys) {
    // Check if the key exists in the second object
    if (!obj2Keys.includes(key)) {
      console.error("not included in obj2:", curKeyPath.concat(key).join("."));
      return false;
    }

    // Recursively compare the values of the key in both objects
    curKeyPath.push(key);
    const eq = deepEqual_onlyObjects(obj1[key], obj2[key], curKeyPath);
    curKeyPath.pop();
    if (!eq) {
      return false;
    }
  }

  return true;
}
