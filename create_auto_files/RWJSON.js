const fs = require('fs');
const path = require('path');
const { exit } = require('process');

const filePathManifest = path.join(__dirname, 'data.json');
const filePathManifest2 = '/home/user/projects/nested_view_proj/webapp/manifest.json'

function readJsonFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      try {
        const jsonData = JSON.parse(data);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    });
  });
}

function writeJsonFile(filePath, data) {
  return new Promise((resolve, reject) => {
    const jsonContent = JSON.stringify(data, null, 2);
    fs.writeFile(filePath, jsonContent, 'utf8', (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve('Data updated successfully! On JSON FILE...');
    });
  });
}

function updateModel(viewName, jsonData ) {
  let models = jsonData["sap.ui5"].models;

  // Check if the name already exists in the routes array
  const existingModel = models["navList"] !== undefined
  if (existingModel) {
    console.log("Model name already exists. Aborting update.");
    return jsonData; // Return the unchanged data
  }

  models["navList"] = {
    "type": "sap.ui.model.json.JSONModel",
    "uri": "model/navList.json"
  };
  return jsonData;
}

function updateRouting(viewName, jsonData ) {
  let routing = jsonData["sap.ui5"].routing;
  let routes = routing.routes;

  // Check if the name already exists in the routes array
  const existingRoute = routes.find(route => route.name === "Route" + viewName);
  if (existingRoute) {
    console.log("Route name already exists. Aborting update.");
    return jsonData; // Return the unchanged data
  }

  routes.push({
    "name": "Route" + viewName,
    "pattern": "Route" + viewName,
    "target": ["Target" + viewName]
  });

  routing.targets["Target" + viewName] = {
    "viewType": "XML",
    "transition": "slide",
    "clearControlAggregation": false,
    "viewId": viewName,
    "viewName": viewName
  };
  return jsonData;
}

function updateNavList(viewName, jsonData ) {
  let navigation = jsonData["navigation"];

  // Check if the name already exists in the routes array
  const existingNav = navigation.find(Nav => Nav.title === viewName);
  if (existingNav) {
    console.log("navigation Title already exists. Aborting update.");
    return jsonData; // Return the unchanged data
  }

  navigation.push({
    "title": viewName,
    "icon": "sap-icon://e-care",
    "key": "Route" + viewName
  },);

  return jsonData;
}

async function updateAndWriteJsonFile(viewName, manifestPath, filePathNav) {
  try {
    if (viewName == "Home"){
      let jsonDataModel = await readJsonFile(manifestPath);
      jsonDataModel = await updateModel(viewName, jsonDataModel );
      const returnValueModel = await writeJsonFile(manifestPath, jsonDataModel);  
    }

    let jsonDataRoute = await readJsonFile(manifestPath);
    jsonDataRoute = await updateRouting(viewName, jsonDataRoute);
    const returnValueRute = await writeJsonFile(manifestPath, jsonDataRoute);

    let jsonDataNav = await readJsonFile(filePathNav);
    jsonDataNav = await updateNavList(viewName, jsonDataNav );
    const returnValueNav = await writeJsonFile(filePathNav, jsonDataNav);

    console.log('Finsh!....');

    return returnValueRute
  } catch (error) {
    console.error(error);
  }
}

// Usage
// const returnValue = updateAndWriteJsonFile(filePathManifest2, 'Home232');

module.exports = {
  readJsonFile,
  updateAndWriteJsonFile
};