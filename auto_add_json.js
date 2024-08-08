const fs = require('fs');
const path = require('path');

const projectPackageJsonPath = path.resolve(process.cwd(), 'package.json');
const packageJson = require(projectPackageJsonPath);

// Add your custom script
packageJson.scripts = packageJson.scripts || {};
packageJson.scripts['c-mvc'] = "node node_modules/ui5_easy_use/create_auto_files/main.js";

// Write the updated package.json back to the project
fs.writeFileSync(projectPackageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('c-mvc script has been added to package.json');
