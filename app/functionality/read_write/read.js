const fs = require('fs');
const path = require('path');

class FileManager {
    constructor(basePath) {
        this.basePath = basePath;
    }

    // 1. Return the contents of a current file
    getFileContents(filePath) {
        try {
            const fullPath = path.join(this.basePath, filePath);
            return fs.readFileSync(fullPath, 'utf-8');
        } catch (error) {
            console.error(`Error reading file at ${filePath}:`, error);
            return null;
        }
    }

    // 2. Return the contents of both JS (Controller) and XML (View) files
    getControllerAndViewContents(xmlFilePath) {
        try {
            // Assuming the controller is in the same directory as the XML file
            const xmlFullPath = path.join(this.basePath, xmlFilePath);
            const controllerFileName = this.getControllerFileName(xmlFilePath);
            const controllerFullPath = path.join(this.basePath, controllerFileName);

            const xmlContents = fs.readFileSync(xmlFullPath, 'utf-8');
            const jsContents = fs.readFileSync(controllerFullPath, 'utf-8');

            return {
                xml: xmlContents,
                js: jsContents
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


    // 3. Return all file contents in a folder (without subfolders)
    getFolderFilesContents(folderPath) {
        const fullPath = path.join(this.basePath, folderPath);
        const files = fs.readdirSync(fullPath);

        const contents = {};
        files.forEach(file => {
            const filePath = path.join(fullPath, file);
            if (fs.lstatSync(filePath).isFile()) {
                contents[file] = fs.readFileSync(filePath, 'utf-8');
            }
        });

        return contents;
    }

    // 4. Return all file contents in a folder, including subfolders
    getFolderContentsWithSubfolders(folderPath) {
        const fullPath = path.join(this.basePath, folderPath);
        const result = {};

        const readDirectory = (dirPath, parentObj) => {
            const items = fs.readdirSync(dirPath);
            items.forEach(item => {
                const itemPath = path.join(dirPath, item);
                if (fs.lstatSync(itemPath).isFile()) {
                    parentObj[item] = fs.readFileSync(itemPath, 'utf-8');
                } else if (fs.lstatSync(itemPath).isDirectory()) {
                    parentObj[item] = {};
                    readDirectory(itemPath, parentObj[item]);
                }
            });
        };

        readDirectory(fullPath, result);
        return result;
    }
}

// Example usage:
const fileManager = new FileManager('C:/Users/zybin/OneDrive/Desktop/UI5_Easy_Use');

// 1. Get the content of a specific file
// console.log(fileManager.getFileContents('webapp/view/App.view.xml'));

// // 2. Get the contents of the View and corresponding Controller
// console.log(fileManager.getControllerAndViewContents('webapp/view/App.view.xml'));

// // 3. Get all files' contents in a specific folder
// console.log(fileManager.getFolderFilesContents('webapp/view'));

// // 4. Get all files' contents in a folder, including subfolders
// console.log(fileManager.getFolderContentsWithSubfolders('webapp/fragment'));

module.exports = FileManager;
