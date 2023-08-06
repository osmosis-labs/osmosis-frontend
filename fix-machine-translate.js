const fs = require("fs");
const path = require("path");

const directoryPath = "packages/web/localizations";

function fixJsonFiles(directory) {
  const allFiles = fs.readdirSync(directory);

  const files = allFiles.filter((file) => path.extname(file) === ".json");

  files.forEach((file) => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      fixJsonFiles(filePath);
    } else if (stats.isFile() && file.endsWith(".json")) {
      try {
        fixJsonFile(filePath);
      } catch (error) {
        console.log(`Error fixing JSON file: ${filePath}`);
        console.error(error);
      }
    }
  });
}

function fixJsonFile(file) {
  const filePath = path.resolve(file);
  const data = fs.readFileSync(filePath);
  const jsonData = JSON.parse(data);

  const fixedData = nestKeys(jsonData);

  fs.writeFileSync(filePath, JSON.stringify(fixedData, null, 2));
  console.log(`Fixed JSON file: ${filePath}`);
}

function nestKeys(data) {
  const fixedData = {};

  for (const key in data) {
    if (key.includes(".")) {
      const nestedKeys = key.split(".");
      let nestedData = fixedData;

      for (let i = 0; i < nestedKeys.length - 1; i++) {
        const nestedKey = nestedKeys[i];
        if (!nestedData.hasOwnProperty(nestedKey)) {
          nestedData[nestedKey] = {};
        }
        nestedData = nestedData[nestedKey];
      }

      nestedData[nestedKeys[nestedKeys.length - 1]] = data[key];
    } else {
      fixedData[key] = data[key];
    }
  }

  return fixedData;
}

// Fix JSON files in the specified directory
fixJsonFiles(directoryPath);
