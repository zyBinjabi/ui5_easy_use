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

    getFoldersAndFiles(currentPath) {
        // Check if the path is a directory or file
        if (fs.statSync(currentPath).isFile()) {
            return [{ name: path.basename(currentPath), isDirectory: false }];
        }

        // If it's a directory, read its contents
        return fs.readdirSync(currentPath).map(file => {
            const filePath = path.join(currentPath, file);
            const isDirectory = fs.statSync(filePath).isDirectory();
            return {
                name: file,
                isDirectory
            };
        });

    }

    async selectFolderOrFile(currentPath) {
        const items = this.getFoldersAndFiles(currentPath);

        if (items.length === 0) {
            console.log('No files or folders found.');
            return null;
        }

        const { selectedItem } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedItem',
                message: `Select a folder or file from: ${currentPath}`,
                choices: [...items.map(item => item.name), 'Go Back', 'Exit']
            }
        ]);

        if (selectedItem === 'Exit') {
            return null;
        } else if (selectedItem === 'Go Back') {
            const parentPath = path.dirname(currentPath);
            if (parentPath === currentPath) {
                console.log('You are at the root directory.');
                return null;
            }
            return this.selectFolderOrFile(parentPath); // Recursive call to go back
        } else {
            const selectedPath = path.join(currentPath, selectedItem);
            const isDirectory = items.find(item => item.name === selectedItem).isDirectory;

            if (isDirectory) {
                return this.selectFolderOrFile(selectedPath); // Recursive call for subfolder
            } else {
                console.log(`Selected file: ${selectedPath}`);
                return selectedPath; // File selected, stop recursion
            }
        }
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

            const i18nFilePath = path.join("/home/user/projects/internal/webapp/", 'i18n', 'i18n.properties');
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
        // const folders = this.folderManager.getFolders();
        // if (folders.length === 0) {
        //     console.log('No folders found.');
        //     return null;
        // }

        // const { selectedFolder } = await inquirer.prompt([
        //     {
        //         type: 'list',
        //         name: 'selectedFolder',
        //         message: 'Select a folder:',
        //         choices: folders
        //     }
        // ]);

        // return path.join(this.folderManager.rootPath, selectedFolder);
        return await this.folderManager.selectFolderOrFile(this.folderManager.rootPath)
    }

    // Method to update all files in the selected folder
    updateAllFilesX(folderPath) {
        const files = this.folderManager.getFiles(folderPath);
        files.forEach(file => {
            const filePath = path.join(folderPath, file);
            this.folderManager.updateFileContentFori18n(filePath);
        });
    }


    updateAllFiles(folderPath) {
        const items = this.folderManager.getFoldersAndFiles(folderPath);

        items.forEach(item => {
            const itemPath = path.join(folderPath, item.name);

            if (item.isDirectory) {
                // Recursively update files in subfolders
                this.updateAllFiles(itemPath); // Recursive call for subfolders
            } else {
                // Update file content if it's a file
                this.folderManager.updateFileContentFori18n(folderPath);
            }
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
    // var webappPath = path.join(basePath, 'webapp', 'fragment');  // Define the webapp path

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
