const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const args = process.argv.slice(2);
const isQuiet = args.some((argument) => argument === "--quiet");
const isCheck = args.some((argument) => argument === "--check");

isQuiet && console.log("👉 quiet mode");
isCheck && console.log("👉 check only");

const rootDir = "./";
const packagesDir = path.resolve(__dirname, rootDir, "packages");
const sortingKeys = ["dependencies", "devDependencies", "peerDependencies"];

const rootPackageFilePath = path.resolve(__dirname, rootDir, "package.json");
const packagesDirs = fs.readdirSync(path.resolve(__dirname, packagesDir));
const packagesFiles = packagesDirs
  .map((dir) => {
    const packageFilePath = path.resolve(
      __dirname,
      packagesDir,
      dir,
      "package.json"
    );
    const fireExist = fs.existsSync(packageFilePath);
    return fireExist ? packageFilePath : null;
  })
  .filter(Boolean);
const allPackageFilePath = [rootPackageFilePath, ...packagesFiles];
let allSorted = [];
allPackageFilePath.forEach((filePath) => {
  !isQuiet && console.group(`>> ${filePath}`);
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const jsonContent = JSON.parse(fileContent);
    let hasChanged = false;
    sortingKeys.forEach((key) => {
      const depsContent = jsonContent[key];
      if (depsContent) {
        const depsKeys = Object.keys(depsContent);
        const beforeSorted = JSON.stringify(depsKeys);
        depsKeys.sort();
        if (JSON.stringify(depsKeys) !== beforeSorted) {
          !isQuiet && console.log(`❌ [${key}] prepare to sort, passed.`);
          hasChanged = true;
          if (!isCheck) {
            const sortedDeps = {};
            depsKeys
              .sort()
              .forEach((key) => (sortedDeps[key] = depsContent[key]));
            jsonContent[key] = sortedDeps;
          }
        } else {
          !isQuiet && console.log(`✅ [${key}] already in order, passed.`);
        }
      } else {
        !isQuiet && console.log(`❔ [${key}] not found, skipped.`);
      }
    });
    if (hasChanged) {
      !isQuiet && console.log("🚫 not passed");
      if (!isCheck) {
        fs.writeFileSync(filePath, JSON.stringify(jsonContent));
        try {
          execSync(`prettier -w ${filePath}`);
        } catch (e) {
          console.warn("prettier not found, skipped");
        }
      }
      allSorted.push(filePath);
    } else {
      !isQuiet && console.log("🫡  passed");
    }
  } catch (e) {
    console.error("fs failed");
  }
  !isQuiet && console.groupEnd();
});
if (!allSorted.length) {
  console.log("👍 all sorted!");
} else {
  if (isCheck) {
    console.group("🚫 unsorted package.json:");
    allSorted.forEach((filePath) => console.log(filePath));
    console.groupEnd();
  } else {
    console.log("✅ all sorted!");
  }
}
