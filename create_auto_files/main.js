const fs = require('fs').promises;
const path = require('path');
const { exit } = require('process');

const getContent = require('./Contents/create_controller');
const getViewContent = require('./Contents/create_view');

const getAppViewContent = require('./Contents/create_appView');
const getAppControllerContent = require('./Contents/create_appController');
const getNavigationListFragmentContent = require('./Contents/create_NavigationListFragment');
const getSideNavigationFragmentContent = require('./Contents/create_SideNavigationFragment');

const getCreate_base_controller = require('./Contents/Helper/create_base_controller');
const getCeate_crud_z = require('./Contents/Helper/create_crud_z');
const getCreate_validation_z = require('./Contents/Helper/create_validation_z');

const { readJsonFile, updateAndWriteJsonFile } = require('./RWJSON');

class FileManager {
    constructor(fileName, isRoute) {
        this.fileName = fileName;
        this.isRoute = isRoute;

        // Use a configurable base path or environment variable
        const basePath = process.cwd(); // Assuming you want to use the current working directory
        this.webapp = path.join(basePath, 'webapp');

        this.manifestPath = path.join(basePath, 'webapp/manifest.json');
        this.ModelPath = path.join(basePath, 'webapp/model');
        this.controllerPath = path.join(basePath, 'webapp/controller');
        this.helperPath = path.join(basePath, 'webapp/controller/Helper');
        this.viewPath = path.join(basePath, 'webapp/view');
        this.fragmentPath = path.join(basePath, 'webapp/fragment');
        this.mainFragmentPath = path.join(basePath, 'webapp/fragment/mainFragment');

        this.navListPath = path.join(basePath, 'webapp/model/navList.json');

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

    async createFile(filePath, content, fileType = 'File Type', forceOverwrite = false) {
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

    async initApp(isForceOverWrite, isHelperFuns) {
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

            if (isHelperFuns) {
                const baseControllerPath = path.join(this.helperPath, `BaseController.js`);
                const createCrudPath = path.join(this.helperPath, `CRUD_z.js`);
                const createValidationPath = path.join(this.helperPath, `Validation_z.js`);

                await this.ensureDirectoryExists(this.helperPath);

                const base_controllerContent = getCreate_base_controller("INIT", appId);
                const crud_zContent = getCeate_crud_z("INIT", appId);
                const validation_zContent = getCreate_validation_z("INIT", appId);

                await this.createFile(baseControllerPath, base_controllerContent, 'Controller/Helper', isForceOverWrite);
                await this.createFile(createCrudPath, crud_zContent, 'Controller/Helper', isForceOverWrite);
                await this.createFile(createValidationPath, validation_zContent, 'Controller/Helper', isForceOverWrite);

            }

        } catch (error) {
            console.error('Error in main function:', error);
        }

    }

    async main(isForceOverWrite, isHelperFuns) {
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

            const controllerContent = getContent(fileNmaeWithSpace, appId, isHelperFuns);
            const viewContent = getViewContent(fileNmaeWithSpace, appId);

            await this.createFile(controllerFilePath, controllerContent, 'Controller', isForceOverWrite);
            await this.createFile(viewFilePath, viewContent, 'View', isForceOverWrite);

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

const fileManager = new FileManager(fileName.split('-')[0], isRoute);
if (fileName == 'init') {
    // Split the route by the hyphen ('-')
    let [spl0, spl1] = isRoute.split('-');// FOW-HLP

    let isForceOverWrite = spl0 === 'FOW' ? true : false
    let isHelperFuns = spl1 === 'HLP' ? true : false

    fileManager.initApp(isForceOverWrite, isHelperFuns)
} else {
    let [spl0, spl1, spl2] = fileName.split('-'); // PageName-FOW-HLP

    let isForceOverWrite = spl1 === 'FOW' ? true : false
    let isHelperFuns = spl2 === 'HLP' ? true : false

    fileManager.main(isForceOverWrite, isHelperFuns);
}
