/* eslint-disable import/no-extraneous-dependencies */
import fs from "fs";
import { glob } from "glob";
// Start of Selection
import path from "path";
// Add prettier import at the top with other imports
import prettier from "prettier";

import { omittedKeyPaths } from "./omitted-keys.mjs";

// Get all localization JSON objs in the current directory
const localizationJsonFilepaths = fs
  .readdirSync(process.cwd())
  .filter((file) => path.extname(file) === ".json");
const localizationObjs = [];
localizationJsonFilepaths.forEach((fileName) => {
  let typeName = fileName.match(/(^.*?)\.json/);
  if (typeName) {
    const obj = JSON.parse(
      fs.readFileSync(process.cwd() + "/" + fileName, "utf8").toString()
    );
    localizationObjs.push([fileName, obj]);
  }
});

// Get all source file contents
const sourceFilePaths = (
  await glob("**/*.ts?(x)", { cwd: "..", absolute: true })
).filter(
  (relativePath) =>
    !relativePath.includes("node_modules") &&
    !relativePath.includes(".d.") &&
    !relativePath.includes("dist") &&
    !relativePath.includes("build") &&
    !relativePath.includes(".next") &&
    !relativePath.includes("__tests__")
);
const sourceFileContents = [];
sourceFilePaths.forEach((tsxFile) => {
  const contents = fs.readFileSync(tsxFile, "utf8");
  sourceFileContents.push(contents);
});
console.log("Reading", sourceFileContents.length, "source files");

// Remove all keys not found in source from localization JSON objs
///////////

// recursively get list of object keys into keys array
function objectKeys(obj1, keys = [], curKeyPath = []) {
  // Skip omitted keys
  if (omittedKeyPaths.includes(curKeyPath.join("."))) return;

  // Check if both inputs are objects and not null
  if (typeof obj1 !== "object" || obj1 === null) {
    keys.push(curKeyPath.join("."));
    return; // don't care about non-objects
  }

  // Get the keys of both objects
  const obj1Keys = Object.keys(obj1);

  // Iterate through the keys of the first object
  for (let key of obj1Keys) {
    // Recursively compare the values of the key in both objects
    curKeyPath.push(key);
    objectKeys(obj1[key], keys, curKeyPath);
    curKeyPath.pop();
  }
}

// Function to remove a key from an object
function removeKey(obj, keyPath) {
  const keys = keyPath.split(".");
  let current = obj;
  const stack = [];
  for (let i = 0; i < keys.length - 1; i++) {
    stack.push(current);
    current = current[keys[i]];
    if (current === undefined) return;
  }
  delete current[keys[keys.length - 1]];

  // Remove empty parent objects
  for (let i = keys.length - 2; i >= 0; i--) {
    const parent = stack.pop();
    if (Object.keys(parent[keys[i]]).length === 0) {
      delete parent[keys[i]];
    } else {
      break;
    }
  }
}

// check if all keys are found in the file contents somewhere
let removeCount = 0;
localizationObjs.forEach(([, obj]) => {
  const keys = [];
  objectKeys(obj, keys);
  keys.forEach((key) => {
    const includesKeyInString = sourceFileContents.some((content) =>
      content.includes(key)
    );

    if (!includesKeyInString) {
      removeCount++;
      removeKey(obj, key);
    }
  });
});
console.log("Removed", removeCount, "keys");

// Write the updated JS objects back to the files as stringified JSON
localizationObjs.forEach(([fileName, obj]) => {
  const filePath = path.join(process.cwd(), fileName);
  const jsonString = JSON.stringify(obj, null, 2);
  // No need to resolve config since it's just JSON
  const formattedJson = prettier.format(jsonString, { parser: "json" });
  fs.writeFileSync(filePath, formattedJson);
});
