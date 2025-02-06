const fs = require("fs");
const path = require("path");

// Verify we're in the localizations directory
const currentDir = path.basename(process.cwd());
if (currentDir !== "localizations") {
  throw new Error("This script must be run from the localizations directory");
}

// Get all JSON files in the current directory
const jsonFiles = fs
  .readdirSync(process.cwd())
  .filter((file) => path.extname(file) === ".json");

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

// Process all JSON files
jsonFiles.forEach((file) => {
  const filePath = path.join(process.cwd(), file);
  const obj = JSON.parse(fs.readFileSync(filePath, "utf8"));
  removeKey(obj, process.argv[2]);
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2) + "\n");
});
