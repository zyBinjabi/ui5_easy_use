# ui5_easy_use
A streamlined tool to quickly set up and expand SAP UI5 applications with navigation, theming, and modular page generation.
 
## Installation
To install and initialize `ui5_easy_use`, follow these steps:

1. **Install the package**  
   ```bash
   npm install ui5_easy_use

2. **Enable custom CLI commands**  
   ```bash
   node node_modules/ui5_easy_use/auto_add_json.js

3. **Initialize the application**  
   ```bash
   npm run c-mvc init FOW-HLP

4. **Create a new page named "Home"**  
   ```bash
   npm run c-mvc Home r


# Quick Start Guide
After installation, you can easily set up the app structure and generate additional pages as needed.

## 1. Initialize the Application Structure
    npm run c-mvc init FOW-HLP
This command will set up:
Side Navigation
Header Navigation
Dark Theme Support
Initial Routing for seamless navigation between pages
And much more!
> **Important:** The following files will be overwritten (Force Overwrite - **FOW**):
> 
> - `App` - View and Controller
> - `Home` - View and Controller


## 2. Generate a New Page with Routing
    npm run c-mvc About r
This command creates a new page in the application. It will:
Generate the View and Controller for the new page.
Add the new page to the Side Navigation.
Set up Routing for the page.
You can replace "About" with any page name of your choice. The "r" flag specifies that the page should be included in the routing.


# Command Summary

| Command                                           | Description                                                                               |
|---------------------------------------------------|-------------------------------------------------------------------------------------------|
| `npm install ui5_easy_use`                        | Installs the `ui5_easy_use` package.                                                      |
| `node node_modules/ui5_easy_use/auto_add_json.js` | Adds the `c-mvc` command to `package.json` for easier command-line usage.                 |
| `npm run c-mvc init FOW-HLP`                      | Initializes the app structure with navigation, theming, and basic routing.                |
| `npm run c-mvc <PageName> r`                      | Creates a new page with the specified name and adds it to routing and navigation.         |



### Features
Effortless App Initialization: Sets up a UI5 app with essential navigation, theming, and structure.
Modular Page Creation: Quickly add new pages with View, Controller, navigation, and routing in place.
CLI Convenience: Use straightforward commands to manage the app structure without manual setup.
With ui5_easy_use, creating a fully-featured UI5 application has never been simpler!


### Keywords
SAP UI5 app generator, UI5 application scaffolding, SAP Fiori development tool, UI5 easy setup, SAP UI5 page creation CLI, UI5 MVC generator, SAP UI5 CLI commands, UI5 app navigation setup, SAP Fiori CLI utility, UI5 theming and routing, Quick start SAP UI5 development, SAP UI5 modular app






