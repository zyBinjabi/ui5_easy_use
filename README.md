
# **ui5_easy_use** 🚀
A streamlined tool to quickly set up and expand SAP UI5 applications with navigation, theming, modular page generation, and localization support.

---

## **Installation** 🔧
To install and initialize `ui5_easy_use`, follow these steps:

***Note:***  
The `ui5_easy_use` package requires an existing SAPUI5/OpenUI5 project as a prerequisite. Ensure that you have a UI5 project set up before proceeding with the installation.

--- 
1. **Install the package** 📥  
   ```bash
   npm install ui5_easy_use
   ```
2. **Enable custom CLI commands** ⚙️  
   Run the following command to add the `ez5` script to your `package.json`:  
   ```bash
   node node_modules/ui5_easy_use/auto_add_json.js
   ```

---

## **Usage** 🛠️
After installation, use the `npm run ez5` command to interactively select your desired action:  
###### [View Old Features](#old-features)
```bash
npm run ez5
```
This will display the following options:
```
Select your main action: (Use arrow keys)
❯ ## Create Init App 🌟
  ## Add Page 📄
  ## Translate_i18n 🌐
  ## Exit ❌
```

---

### **1. Create Init App** 🌟
```bash
## Create Init App 🌟 ##
```
- **Description**: Initializes a fresh SAP UI5 application with essential features and utilities for rapid development.
- **Features**:
  - **Navigation** 🗺️:
    - Side Navigation for intuitive app structure.
    - Header Navigation for quick access to key sections.
    - Pre-configured routing for seamless navigation between pages.
  - **Theme Support** 🎨:
    - Built-in Dark Theme support for enhanced user experience.
  - **Authentication** 🔒:
    - REST-based access control with customizable rules (default roles: `['normal', 'admin']`) configured in `Component.js` and extended in `webapp/model/rulesNavList.json`.  
      Example rule in `rulesNavList.json`:
      ```json
      {
        "RouteHome": ["normal", "admin"]
      }
      ```
  - **Localization** 🌍:
    - Language-switching functionality to support multilingual applications.
  - **Sample Components** 🧩:
    - **Form**: A simple form with built-in validation.
    - **Table**: A feature-rich table with sorting, grouping, filtering, and search capabilities out of the box.
  - **Utilities** 🛠️:
    - Pre-packaged utility files included in `webapp/ez5` for streamlined development.
    - Includes all files from this package for easy integration.
  - **Developer Tools** 💻:
    - Tailored tools for simplified navigation and efficient app management.
- **Important**: This option is intended for **fresh projects only**. It will overwrite the following files:
  - `App` - View and Controller
  - `Home` - View and Controller
  - `Component` - The file itself.
  - `manifest` - Route and Target configurations.
- **Usage**: Select this option to set up the initial structure of your SAP UI5 application.

---

### **2. Add Page** 📄
```bash
## Add Page 📄 ##
```
- **Description**: Adds a new page to an existing SAP UI5 application.
- **Features**:
  - Generates the View and Controller for the new page.
  - Adds the new page to the Side Navigation.
  - Sets up Routing for the page.
  - Allows setting roles for the page (default: `normal`). Customize roles in `rulesNavList.json`.
- **Important**: This option requires the application to be initialized using `## Create Init App 🌟 ##`.
- **Usage**: Select this option to create a new page in your application.

---

### **3. Translate_i18n** 🌐
```bash
## Translate_i18n 🌐 ##
```
- **Description**: Automates the process of binding text, titles, and tiles to the `i18n` model for localization support.
- **Features**:
  - Simplifies internationalization by integrating `i18n` across the application.
  - Ensures consistent localization for text, titles, and tiles.
- **Usage**: Select this option to bind text and titles to the `i18n` model for easy translation.

---

### **4. Exit** ❌
```bash
## Exit ❌ ##
```
- **Description**: Exits the interactive menu.

---

## **Command Summary** 📋
| Command                                           | Description                                                                                   |
|---------------------------------------------------|-----------------------------------------------------------------------------------------------|
| `npm install ui5_easy_use` 📥                     | Installs the `ui5_easy_use` package.                                                          |
| `node node_modules/ui5_easy_use/auto_add_json.js` ⚙️ | Adds the `ez5` command to `package.json` for easier command-line usage.                       |
| `npm run ez5` 🛠️                                  | Displays an interactive menu to select actions like initializing the app, adding pages, etc.  |

---

### **Key Features** ✨
- **Effortless App Initialization** 🌟: Sets up a UI5 app with essential navigation, theming, and structure.
- **Modular Page Creation** 📄: Quickly add new pages with View, Controller, navigation, routing, and i18n binding in place.
- **CLI Convenience** ⚡: Use straightforward commands to manage the app structure without manual setup.
- **i18n Integration** 🌐: Automatically binds text, titles, and tiles to the `i18n` model for localization support.

With `ui5_easy_use`, creating a fully-featured UI5 application has never been simpler!

---

### **Keywords** 🔍
SAP UI5 app generator, SAP Fiori development tool, UI5 application scaffolding, SAP UI5 CLI commands, UI5 MVC generator, SAP UI5 page creation, SAP UI5 navigation setup, SAP UI5 routing configuration, SAP UI5 theming support, SAP UI5 localization, SAP UI5 i18n integration, SAP UI5 dark theme, SAP UI5 authentication, SAP UI5 modular app, SAP UI5 quick start, SAP UI5 developer tools, SAP UI5 automation, SAP UI5 utility library, SAP UI5 side navigation, SAP UI5 header navigation, SAP UI5 routing and navigation, SAP UI5 sample components, SAP UI5 table features, SAP UI5 form validation, SAP UI5 REST API integration, SAP UI5 role-based access, SAP UI5 multilingual support, SAP UI5 webapp utilities

---

---

---

## **Old Features Documentation** {#old-features} 📜
Here’s the documentation for the **old features** of `ui5_easy_use`, focusing on the two commands (`init` and creating a new page):

---

### **Initialize the Application** 🌟
```bash
npm run c-mvc init FOW-HLP
```
- **Description**: Initializes the application structure with essential features.
- **Includes**:
  - Side Navigation 🗺️
  - Header Navigation 🗂️
  - Dark Theme Support 🎨
  - Initial Routing for seamless navigation between pages 🛣️
  - And much more!
> **Important:** The following files will be overwritten (Force Overwrite - **FOW**):
>
> - `App` - View and Controller
> - `Home` - View and Controller

---

### **Create a New Page Named "Home"** 📄
```bash
npm run c-mvc Home r
```
- **Description**: Creates a new page in the application.
- **Features**:
  - Generates the View and Controller for the new page.
  - Adds the new page to the Side Navigation.
  - Sets up Routing for the page.
You can replace `"Home"` with any page name of your choice. The `"r"` flag specifies that the page should be included in the routing.

---

This version retains only the old features and their descriptions, as requested.

---

### **Explanation of Changes** 🔄
1. **Interactive Menu** 🛠️:
   - Added an interactive menu (`npm run ez5`) for users to select their desired action.
   - Options include `Create Init App 🌟`, `Add Page 📄`, `Translate_i18n 🌐`, and `Exit ❌`.
2. **Clear Descriptions** 📝:
   - Each option in the menu includes a clear description of its purpose and features.
   - Important notes are highlighted to ensure users understand when and how to use each option.
3. **Improved User Experience** 😊:
   - The interactive menu makes it easier for users to navigate and choose the appropriate action without memorizing commands.
4. **Consistency** 🔗:
   - Unified the naming convention (`ez5`) for all commands to make them easier to remember and use.

---

### **Icons Used** 🎨
- 🌟: Create Init App
- 📄: Add Page
- 🌐: Translate_i18n
- ❌: Exit
- 🛠️: Usage / CLI Commands
- 📥: Install
- ⚙️: Configuration / Setup
- 📋: Summary
- ✨: Key Features
- 🔍: Keywords
- 📜: Old Features Documentation
- 🔄: Explanation of Changes

---
