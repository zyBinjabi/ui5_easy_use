const fs = require('fs').promises;
const path = require('path');
const { exit } = require('process');

const getContent = require('./create_controller');
const getViewContent = require('./create_view'); // Import the function to get view content

const getAppViewContent = require('./create_appView');
const getAppControllerContent = require('./create_appController');
const getNavigationListFragmentContent = require('./create_NavigationListFragment');
const getSideNavigationFragmentContent = require('./create_SideNavigationFragment');

const { readJsonFile, updateAndWriteJsonFile } = require('./RWJSON');

class FileManager {
    constructor(fileName, isRoute) {
        this.fileName = fileName;
        this.isRoute = isRoute;

        this.controllerPath = path.join(__dirname, '../webapp/controller');
        this.viewPath = path.join(__dirname, '../webapp/view'); // Path for view directory
        this.fragmentPath = path.join(__dirname, '../webapp/fragment'); // Path for view directory
        this.mainFragmentPath = path.join(__dirname, '../webapp/fragment/mainFragment');
        this.ModelPath = path.join(__dirname, '../webapp/model'); // Path for view directory

        this.manifestPath = path.join(__dirname, '../webapp/manifest.json');
        this.navListPath = path.join(__dirname, '../webapp/model/navList.json');

        this.appPath = path.join(__dirname, '../webapp/view/App.view.xml');
        this.sideNavigationFragmentPath = path.join(__dirname, '../webapp/fragment/mainFragment/NavigationList.fragment.xml');
        this.navigationListFragmentPath = path.join(__dirname, '../webapp/fragment/mainFragment/SideNavigation.fragment.xml');
    }

    async getManifestJson(manifestPath) {
        try {
            return await readJsonFile(manifestPath);
        } catch (error) {
            throw error; // Throw the error to be caught by the caller
        }
    }

    async ensureDirectoryExists(directoryPath) {
        try {
            await fs.mkdir(directoryPath, { recursive: true });
        } catch (error) {
            console.error(`Error creating directory '${directoryPath}':`, error);
        }
    }

    async createFile(filePath, content, fileType, forceOverwrite = false) {
        try {
            const fileExists = await fs.stat(filePath).catch(() => false);

            if (fileExists && !forceOverwrite) {
                console.error(`${fileType} file '${filePath}' already exists. Skipping write operation.`);
            } else {
                await fs.writeFile(filePath, content);
                console.log(`${fileType} file '${filePath}' written successfully.`);
            }
        } catch (error) {
            console.error(`Error writing ${fileType} file '${filePath}':`, error);
        }
    }

    insertSpaces(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    async initApp(isForceOverWrite) {
        try {
            let manifestJson = await this.getManifestJson(this.manifestPath);
            const appId = manifestJson['sap.app']['id'];

            const appViewFilePath = path.join(this.viewPath, `App.view.xml`);
            const appControllerFilePath = path.join(this.controllerPath, `App.controller.js`);

            const sideNavigationFragmentFilePath = path.join(this.mainFragmentPath, `NavigationList.fragment.xml`);
            const navigationListFragmentFilePath = path.join(this.mainFragmentPath, `SideNavigation.fragment.xml`);

            await this.ensureDirectoryExists(this.viewPath);
            await this.ensureDirectoryExists(this.mainFragmentPath);

            const appViewContent = getAppViewContent("App", appId);
            const appControllerContent = getAppControllerContent("App", appId);

            const navigationListFragmentContentContent = getNavigationListFragmentContent("INIT", appId);
            const sideNavigationFragmentContentContent = getSideNavigationFragmentContent("INIT", appId);

            await this.createFile(appViewFilePath, appViewContent, 'View', isForceOverWrite);
            await this.createFile(appControllerFilePath, appControllerContent, 'Controller', isForceOverWrite);

            await this.createFile(sideNavigationFragmentFilePath, navigationListFragmentContentContent, 'Fragment');
            await this.createFile(navigationListFragmentFilePath, sideNavigationFragmentContentContent, 'Fragment');

            await this.createFile(this.navListPath, `{"navigation": []}`, 'Model');

            await updateAndWriteJsonFile("Home", this.manifestPath, this.navListPath);

        } catch (error) {
            console.error('Error in main function:', error);
        }

    }

    async main() {
        if (!this.fileName) {
            console.error('Please write the file name.');
            process.exit(1); // Exit the script with an error code
        }

        try {
            let manifestJson = await this.getManifestJson(this.manifestPath);
            const appId = manifestJson['sap.app']['id'];

            const controllerFilePath = path.join(this.controllerPath, `${this.fileName}.controller.js`);
            const viewFilePath = path.join(this.viewPath, `${this.fileName}.view.xml`); // Path for view file

            await this.ensureDirectoryExists(this.controllerPath);
            await this.ensureDirectoryExists(this.viewPath);

            // let fileNmaeWithSpace = this.insertSpaces(this.fileName);
            let fileNmaeWithSpace = this.fileName;

            const controllerContent = getContent(fileNmaeWithSpace, appId);
            const viewContent = getViewContent(fileNmaeWithSpace, appId);

            await this.createFile(controllerFilePath, controllerContent, 'Controller');
            await this.createFile(viewFilePath, viewContent, 'View');

            if (this.isRoute === "r") {
                await updateAndWriteJsonFile(fileNmaeWithSpace, this.manifestPath, this.navListPath);
            }
        } catch (error) {
            console.error('Error in main function:', error);
        }
    }
}

// Get the filename from command-line arguments or a function parameter
const args = process.argv.slice(2); // Remove the first two elements (node and script name)
const fileName = args[0];
const isRoute = args[1];
const fileManager = new FileManager(fileName, isRoute);
if (fileName == 'init') {
    let isForceOverWrite = isRoute === 'FOW' ? true : false
    fileManager.initApp(isForceOverWrite)
} else {
    fileManager.main();
}
