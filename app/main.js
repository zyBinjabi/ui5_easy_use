#!/usr/bin/env node


// Import inquirer dynamically (ES module support in Node.js)
async function loadInquirer() {
    const inquirer = await import('inquirer');
    return inquirer.default;
}

// CLIManager class to manage the CLI menu and selections based on configuration
class CLIManager {
    constructor(menuConfig, newConfig, defaultOptions) {
        this.inquirer = null;
        // Default options for every menu
        this.defaultOptions = defaultOptions;

        this.mergeConfig(menuConfig, newConfig);
        this.addDefaultOptionsToMenuConfig(menuConfig);

        this.menuConfig = menuConfig // Configuration object for menus
    }

    // Initialize inquirer and start the CLI with the main menu
    async initialize() {
        this.inquirer = await loadInquirer();
        this.showMenu(this.menuConfig, 'main');
    }

    // Display a menu based on a given key in the menu configuration
    showMenu(config, menuKey) {
        const menu = config[menuKey];
        if (!menu) {
            console.error(`Menu "${menuKey}" not found in configuration.`);
            return;
        }

        // Display the menu choices
        this.inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: menu.message,
                choices: menu.choices.map(choice => ({
                    name: choice.name,
                    value: choice.value
                }))
            }
        ]).then(answer => {
            // Handle exit action
            if (answer.action === 'exit') {
                console.log('Exiting the CLI...');
                process.exit(0);
            }

            // Handle back action to return to previous menu
            if (answer.action === 'back' && menu.parent) {
                this.showMenu(config, menu.parent);
                return;
            }

            // Execute custom handler if defined
            const selectedChoice = menu.choices.find(choice => choice.value === answer.action);
            if (selectedChoice && typeof selectedChoice.handler === 'function') {
                selectedChoice.handler();
            }

            // Navigate to submenu or return to main menu if no submenu specified
            if (selectedChoice && selectedChoice.submenu) {
                this.showMenu(config, selectedChoice.submenu);
            } else {
                this.showMenu(config, 'main');
            }
        }).catch(error => {
            console.error('An error occurred:', error);
        });
    }

    // Function to add new config properties to the existing config
    mergeConfig(existingConfig, newConfig) {
        Object.keys(newConfig).forEach(key => {
            if (!existingConfig[key]) {
                existingConfig[key] = newConfig[key];  // Add new config if it doesn't exist
            } else {
                // Merge choices if both configs have choices
                if (Array.isArray(existingConfig[key].choices) && Array.isArray(newConfig[key].choices)) {
                    existingConfig[key].choices.push(...newConfig[key].choices);
                }
                // Merge other properties if needed
                Object.assign(existingConfig[key], newConfig[key]);
            }
        });
    }

    // Function to add default options dynamically to all menus except "main"
    addDefaultOptionsToMenuConfig(config) {
        Object.keys(config).forEach(menuKey => {
            if (menuKey !== 'main') {  // Skip adding default options to "main"
                config[menuKey].choices.push(...this.defaultOptions);
            }
        });
    }
}

// Menu configuration object
const menuConfig = {
    main: {
        message: 'Select your main action:',
        choices: [
            { name: 'Create Init App', value: 'create_init_app', submenu: 'initAppMenu' },
            { name: 'Create View + Controller + Route', value: 'create_vcr', handler: () => console.log('Creating View + Controller + Route...') },
            { name: 'Add Utility', value: 'add_utility', handler: () => console.log('Adding utility...') },
            { name: 'Insert Components', value: 'insert_components', handler: () => console.log('Inserting components...') },
            { name: 'Translate_i18n', value: 'translate_i18n', handler: () => console.log('Translating i18n...') },
            { name: 'Exit', value: 'exit' }
        ]
    }
};

const newMenuConfig = {
    initAppMenu
}


const defaultOptions = [
    { name: 'Back', value: 'back' },
    { name: 'Exit', value: 'exit' }
];

// Initialize and start the CLI
const cli = new CLIManager(menuConfig, newMenuConfig, defaultOptions);
cli.initialize();
