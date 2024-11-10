const fs = require('fs');
const path = require('path');

class FileManager {
    constructor(basePath) {
        this.basePath = basePath;
    }

    // 1. Return the Paths of a current file
    getFilePath(filePath) {
        try {
            return { [path.basename(filePath)]: path.join(this.basePath, filePath) };
        } catch (error) {
            console.error(`Error reading file at ${filePath}:`, error);
            return null;
        }
    }

    // 2. Return the Paths of both JS (Controller) and XML (View) files
    getControllerAndViewPaths(xmlFilePath) {
        try {
            // Assuming the controller is in the same directory as the XML file
            const xmlFullPath = path.join(xmlFilePath, '');
            const controllerFullPath = this.getControllerFileName(xmlFilePath);

            return {
                [path.basename(xmlFullPath)]: xmlFullPath,
                [path.basename(controllerFullPath)]: controllerFullPath,
            };
        } catch (error) {
            console.error(`Error reading controller or view files:`, error);
            return null;
        }
    }

    // Helper function to derive the Controller file path from the XML file path
    getControllerFileName(xmlFilePath) {
        const baseDir = path.dirname(xmlFilePath).replace(/view$/, 'controller'); // Replace 'view' with 'controller'
        const fileName = path.basename(xmlFilePath, '.view.xml');
        return path.join(baseDir, `${fileName}.controller.js`);
    }


    // 3. Return all file Paths in a folder (without subfolders)
    getFolderFilesPaths(folderPath) {
        const fullPath = path.join(this.basePath, folderPath);
        const files = fs.readdirSync(fullPath);
        const Paths = {};

        files.forEach(file => {
            const filePath = path.join(fullPath, file);
            Paths[file] = filePath;
        });

        return Paths;
    }

    // 4. Return all file Paths in a folder, including subfolders
    getFolderPathsWithSubfolders(folderPath) {
        const fullPath = path.join(this.basePath, folderPath);
        const result = {};

        const readDirectory = (dirPath, parentObj) => {
            const items = fs.readdirSync(dirPath);
            items.forEach(item => {
                const itemPath = path.join(dirPath, item);
                if (this.isFile(itemPath)) {
                    parentObj[item] = itemPath;
                } else if (this.isDirectory(itemPath)) {
                    parentObj[item] = {};
                    readDirectory(itemPath, parentObj[item]);
                }
            });
        };

        readDirectory(fullPath, result);
        return result;
    }

    isFile(path) { return fs.lstatSync(path).isFile() }

    isDirectory(path) { return fs.lstatSync(path).isDirectory() }
}

// Example usage:
const fileManager = new FileManager('C:/Users/zybin/OneDrive/Desktop/UI5_Easy_Use/webapp/');

// 1. Get the content of a specific file
// console.log(fileManager.getFilePath('view/App.view.xml'));

// // 2. Get the Paths of the View and corresponding Controller
// console.log(fileManager.getControllerAndViewPaths('C:/Users/zybin/OneDrive/Desktop/UI5_Easy_Use/webapp/view/Home.view.xml'));

// // 3. Get all files' Paths in a specific folder
console.log(fileManager.getFolderFilesPaths(''));

// // 4. Get all files' Paths in a folder, including subfolders
// console.log(fileManager.getFolderPathsWithSubfolders(''));

module.exports = FileManager;
