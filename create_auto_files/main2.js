#!/usr/bin/env node

// Import inquirer dynamically (ES module support in Node.js)
async function startCLI() {
    const inquirer = await import('inquirer');

    // Initial prompt to let the user select a main category
    inquirer.default.prompt([
        {
            type: 'list',
            name: 'mainAction',
            message: 'Select your main action:',
            choices: [
                { name: 'Create Init App', value: 'create_init_app' },
                { name: 'Create View + Controller + Route', value: 'create_vcr' },
                { name: 'Add Utility', value: 'add_utility' },
                { name: 'Insert Components', value: 'insert_components' },
                { name: 'Translate_i18n', value: 'translate_i18n' }
            ]
        }
    ]).then(answer => {
        // Handle the first selection
        handleMainSelection(answer.mainAction);
    }).catch(error => {
        console.error('An error occurred:', error);
    });

    // Function to handle the main action selected
    function handleMainSelection(mainAction) {
        switch (mainAction) {
            case 'create_init_app':
                console.log('You selected Create Init App');
                // Perform some action...
                break;
            case 'create_vcr':
                console.log('You selected Create View + Controller + Route');
                // Perform some action...
                break;
            case 'add_utility':
                console.log('You selected Add Utility');
                // Perform some action...
                break;
            case 'insert_components':
                // If the user selects 'Insert Components', show a nested choice
                inquirer.default.prompt([
                    {
                        type: 'list',
                        name: 'componentType',
                        message: 'Which component do you want to insert?',
                        choices: [
                            { name: 'Table', value: 'table' },
                            { name: 'Form', value: 'form' }
                        ]
                    }
                ]).then(nestedAnswer => {
                    handleComponentSelection(nestedAnswer.componentType);
                }).catch(error => {
                    console.error('An error occurred:', error);
                });
                break;
            case 'translate_i18n':
                const mainX = require('./fastT.js');

                // Call the function
                mainX().catch(err => {
                    console.error(err);
                });

                console.log('You selected Translate_i18n');
                // Perform some action...
                break;
            default:
                console.log('Invalid action selected.');
        }
    }

    // Function to handle the nested component selection
    function handleComponentSelection(componentType) {
        switch (componentType) {
            case 'table':
                console.log('You selected to insert a Table');
                // Perform action for table...
                break;
            case 'form':
                console.log('You selected to insert a Form');
                // Perform action for form...
                break;
            default:
                console.log('Invalid component selected.');
        }
    }
}

// Start the CLI
startCLI();
