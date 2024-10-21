const { table } = require('console');
const fs = require('fs');
const path = require('path');
const readline = require('readline');


class UI5CodeGenerator {
    constructor() {
        this.basePath = process.cwd();  // Get the current working directory
        this.webappPath = path.join(this.basePath, 'webapp');  // Define the webapp path
    }

    // Method to start the listing process from the first level
    start() {
        console.log('Listing first-level folders and files in:', this.webappPath);
        this.listFoldersAndFiles(this.webappPath, this.handleUserSelection.bind(this));
    }

    // Recursive method to list all files and folders and handle user input after listing
    listFoldersAndFiles(dirPath, callback) {
        fs.readdir(dirPath, (err, files) => {
            if (err) {
                console.error("Error reading directory:", err);
                return;
            }

            if (files.length === 0) {
                console.log('This folder is empty.');
                return;
            }

            // Display the files and folders
            console.log('\nContents of:', dirPath);
            files.forEach((file, index) => {
                console.log(`[${index}] ${file}`);
            });

            // Call the callback function (to handle user selection)
            callback(files, dirPath);
        });
    }

    // Method to handle user selection via CLI
    handleUserSelection(files, dirPath) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('\nSelect a file/folder by number (or type "exit" to quit): ', (answer) => {
            if (answer.toLowerCase() === 'exit') {
                rl.close();
                console.log('Exiting...');
                return;
            }

            const index = parseInt(answer);
            if (isNaN(index) || index < 0 || index >= files.length) {
                console.log('Invalid selection. Please try again.');
                rl.close();
                this.listFoldersAndFiles(dirPath, this.handleUserSelection.bind(this)); // Show the list again
                return;
            }

            const selectedFile = files[index];
            const selectedPath = path.join(dirPath, selectedFile);

            // Check if it's a file or directory
            fs.stat(selectedPath, (err, stats) => {
                if (err) {
                    console.error("Error getting stats:", err);
                    rl.close();
                    return;
                }

                if (stats.isDirectory()) {
                    console.log(`\nYou selected the folder: ${selectedFile}`);
                    rl.close();
                    // Recursively list contents of the selected folder
                    this.listFoldersAndFiles(selectedPath, this.handleUserSelection.bind(this));
                } else if (stats.isFile()) {
                    console.log(`\nYou selected the file: ${selectedFile}`);
                    // Read and display file contents
                    this.readFileContents(selectedPath, rl);
                }
            });
        });
    }

    // Method to read file contents
    readFileContents(filePath, rl) {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error("Error reading file:", err);
                rl.close();
                return;
            }

            console.log(`\nContents of ${filePath}:\n`);
            console.log(data);
            // Run the parser on the XML string
            const parsedResult = this.extractTags(data);

            // Output results for demonstration
            console.log(JSON.stringify(parsedResult, null, 2));
            rl.close();
        });
    }

    // Helper function to extract tag, its attributes, and its content
    extractTags(xml, tagStack = []) {
        const tagRegex = /<([a-zA-Z0-9_:]+)([^>]*?)\/>|<([a-zA-Z0-9_:]+)([^>]*)>(.*?)<\/\3>/gs;
        const result = [];

        let match;
        while ((match = tagRegex.exec(xml)) !== null) {
            // Case 1: Self-closing tag (e.g., <Button ... />)
            if (match[1]) {
                const tagName = match[1];
                const attributes = match[2].trim();
                const openTag = `<${tagName}${attributes ? ' ' + attributes : ''} />`;

                // Push tag name to stack for reference
                const currentPath = [...tagStack, tagName].join(' > ');

                result.push({
                    tagName: currentPath, // Store the current tag path for reference
                    [tagName]: {
                        open: openTag,
                        close: "",  // No closing tag for self-closing elements
                        content: "" // No content for self-closing elements
                    }
                });
            }
            // Case 2: Regular opening and closing tag (e.g., <Page>...</Page>)
            else if (match[3]) {
                const tagName = match[3];
                const attributes = match[4].trim();
                const innerContent = match[5].trim();

                const openTag = `<${tagName}${attributes ? ' ' + attributes : ''}>`;
                const closeTag = `</${tagName}>`;

                // Recursively parse the inner content, pushing the tagName onto the stack
                const currentPath = [...tagStack, tagName].join(' > ');
                const innerTags = this.extractTags(innerContent, [...tagStack, tagName]);

                result.push({
                    tagName: currentPath, // Store the current tag path for reference
                    [tagName]: {
                        open: openTag,
                        close: closeTag,
                        content: innerTags.length > 0 ? innerTags : innerContent
                    }
                });
            }
        }
        return result;
    }

}
// Example XML string
const xmlString = `<mvc:View controllerName="practice.controller.App"
    xmlns:html="http://www.w3.org/1999/xhtml"
    xmlns:mvc="sap.ui.core.mvc" displayBlock="true"
    xmlns="sap.m"
    xmlns:ff="sap.f"
    xmlns:core="sap.ui.core"
    xmlns:tnt="sap.tnt">
    <App id='App_id' visible="{=  {userModel >/isLoggedIn} === true }">
        <tnt:ToolPage id="toolPage">
            <tnt:header>
                <ff:ShellBar title="practice" secondTitle="" showMenuButton="true"
                    homeIcon="./image/main_logo.png" homeIconTooltip="Main Logo"
                    menuButtonPressed="onMenuButtonPress" showNotifications="true"
                    notificationsPressed="" notificationsNumber="4" id="idImage">
                    <ff:additionalContent>
                        <OverflowToolbarButton press="onToggleTheme" tooltip="Switch Theme"
                            icon="sap-icon://light-mode" id="themeToggleButton" />
                        <OverflowToolbarButton press=""
                            tooltip="Start tour to understand the functionality"
                            icon="sap-icon://learning-assistant" />
                    </ff:additionalContent>
                    <ff:profile>
                        <Avatar id='Avatar_id' initials="UI" press="onPressAvatar" />
                    </ff:profile>
                </ff:ShellBar>
            </tnt:header>

            <tnt:sideContent>
                <core:Fragment fragmentName="practice.fragment.mainFragment.SideNavigation"
                    type="XML" />
            </tnt:sideContent>

            <tnt:mainContents>
                <NavContainer id="app" />
            </tnt:mainContents>
        </tnt:ToolPage>
    </App>

    <App id='authId' visible="{=  {userModel >/isLoggedIn} === false }">
        <Page id="page_id_Login" title="Login">
            <content>
                <core:Fragment id="loginFragment" fragmentName="practice.fragment.auth.Login"
                    type="XML" />
            </content>
        </Page>
    </App>
</mvc:View>
    `;

// Create an instance of the UI5CodeGenerator class and start the process
const generator = new UI5CodeGenerator();
generator.start();


