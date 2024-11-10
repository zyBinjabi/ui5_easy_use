const initAppMenu = {
    message: 'Select an initialization option:',
    parent: 'main',  // Allows navigating back to the main menu
    choices: [
        { name: 'Full Features (Full Project)', value: 'full', handler: () => console.log('Initializing full project...') },
        { name: 'With SAP', value: 'with_sap', handler: () => console.log('Initializing with SAP...') },
        { name: 'Base Selection + Init', value: 'default', handler: () => console.log('Initializing with base selection...') },
    ]
}




module.exports = initAppMenu;
