#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer').default; // Adjusted import statement

const XMLi18nTranslator = require('./translate_i18n');

// Class for folder and file handling
class FolderManager {
    constructor(rootPath) {
        this.rootPath = rootPath;
    }

    // Method to get all folders in a directory
    getFolders() {
        return fs.readdirSync(this.rootPath).filter(file => {
            return fs.statSync(path.join(this.rootPath, file)).isDirectory();
        });
    }

    // Method to get all files in a given folder
    getFiles(folderPath) {
        return fs.readdirSync(folderPath).filter(file => {
            return fs.statSync(path.join(folderPath, file)).isFile();
        });
    }

    // Method to read and update a file's contents (append old + new content)
    updateFileContentFori18n(filePath) {
        if (fs.existsSync(filePath)) {
            const oldContent = fs.readFileSync(filePath, 'utf-8');

            const fileName = path.basename(filePath, path.extname(filePath));
            const mainFileName = fileName.split('.')[0]; // Splits by '.' and takes the first part

            let xMLi18nTranslator = new XMLi18nTranslator(oldContent, mainFileName)

            fs.writeFileSync(filePath, xMLi18nTranslator.xmlString, 'utf-8');
            console.log(`File updated: ${filePath}`);

            const i18nFilePath = path.join(this.rootPath, 'i18n', 'i18n.properties');
            this.updateFileContent(i18nFilePath, xMLi18nTranslator.generateI18nPropertiesX);

        } else {
            console.log(`File not found: ${filePath}`);
        }
    }

    updateFileContent(filePath, newContent) {
        if (fs.existsSync(filePath)) {
            const oldContent = fs.readFileSync(filePath, 'utf-8');
            const updatedContent = oldContent + '\n #------filePath\n' + newContent; // Append new content to old content
            fs.writeFileSync(filePath, updatedContent, 'utf-8');
            console.log(`File updated: ${filePath}`);
        } else {
            console.log(`File not found: ${filePath}`);
        }
    }
}

// Class for handling user interaction
class CLIManager {
    constructor(folderManager) {
        this.folderManager = folderManager;
    }

    // Method to display and select folder
    async selectFolder() {
        const folders = this.folderManager.getFolders();
        if (folders.length === 0) {
            console.log('No folders found.');
            return null;
        }

        const { selectedFolder } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedFolder',
                message: 'Select a folder:',
                choices: folders
            }
        ]);

        return path.join(this.folderManager.rootPath, selectedFolder);
    }

    // Method to update all files in the selected folder
    updateAllFiles(folderPath) {
        const files = this.folderManager.getFiles(folderPath);
        files.forEach(file => {
            const filePath = path.join(folderPath, file);
            this.folderManager.updateFileContentFori18n(filePath);
        });
    }

    // Method to update the i18n.properties file
    updateI18nFile(folderPath, newContent) {
        const i18nFilePath = path.join(folderPath, 'webapp', 'i18n', 'i18n.properties');
        this.folderManager.updateFileContent(i18nFilePath, newContent);
    }
}

// Main function to execute the CLI process
async function main() {
    var basePath = process.cwd();  // Get the current working directory
    var webappPath = path.join(basePath, 'webapp');  // Define the webapp path

    const rootPath = webappPath; // Replace with the desired directory path
    const folderManager = new FolderManager(rootPath);
    const cliManager = new CLIManager(folderManager);

    // Step 1: Select folder
    const selectedFolderPath = await cliManager.selectFolder();
    if (!selectedFolderPath) return;

    // Step 2: Prompt for new content to add
    // const { newContent } = await inquirer.prompt([
    //     {
    //         type: 'input',
    //         name: 'newContent',
    //         message: 'Enter the content you want to add to the files:'
    //     }
    // ]);

    // Step 3: Update all files in the selected folder
    cliManager.updateAllFiles(selectedFolderPath);

    // Step 4: Update the i18n.properties file specifically
    // cliManager.updateI18nFile(selectedFolderPath, newContent);
}

// main().catch(err => {
//     console.error(err);
// });

module.exports = main; // Export the main function
