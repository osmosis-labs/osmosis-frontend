const fs = require("fs");
const path = require("path");

// Get all JSON files in the current directory
const jsonFiles = fs
  .readdirSync(process.cwd())
  .filter((file) => path.extname(file) === ".json");

// Function to remove a key from an object
function removeKey(obj, keyPath) {
  const keys = keyPath.split(".");
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    current = current[keys[i]];
    if (current === undefined) return;
  }
  delete current[keys[keys.length - 1]];
}

// Process all JSON files
jsonFiles.forEach((file) => {
  const filePath = path.join(process.cwd(), file);
  const obj = JSON.parse(fs.readFileSync(filePath, "utf8"));
  removeKey(obj, process.argv[2]);
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2));
});
