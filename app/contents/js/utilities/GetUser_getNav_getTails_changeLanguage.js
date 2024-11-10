/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "internal/utilities/UserService",
    "internal/utilities/CRUD_z",
],
    function (UIComponent, UserService, CRUD_z) {
        "use strict";

        return UIComponent.extend("internal.utilities.GetUser_getNav_getTails_changeLanguage", {

            constructor: function (currentController) {
                this._currentController = currentController;
            },

            init: async function () {
                // Create a promise to signal when the component is fully initialized
                await new Promise(async (resolve, reject) => {
                    try {
                        await this.waitForNavListModel()// Save the navList Data - and set the rulse to -> Normal.
                        this.setNavBaseInUserRules() // for intial nav with out exrea tails and navslist, for better uesr experince.

                        // Async tasks (e.g., fetching user data - auth) - and rules
                        let userData = await this.getUserData()

                        this._currentController.setModel(new sap.ui.model.json.JSONModel(userData), 'userDataModel');

                        // back the Full NavList Data
                        this._currentController.setModel(new sap.ui.model.json.JSONModel(this.navListDataWithNormaRules), 'navList');

                        // Other initialization tasks (e.g., setting language, etc.)
                        this.setNavBaseInUserRules();
                        this.setLanguageFromLcalStorage();
                        this.updateAllModelsBaseInLanguage();

                        // Resolve the promise once everything is done
                        resolve();
                    } catch (error) {
                        console.error('Component initialization failed:', error);
                        reject(error); // Reject in case of failure
                    }
                });

            },

            // User (Auth - Rules) Section ........
            getUserIdAndRole: async function () {
                // Retrieve UserId and UserRole from local storage or assign default values
                let sStoredUserId = localStorage.getItem("UserId") || "22225";
                this.userRules = await this.getUserRules(sStoredUserId)

                // Set default values in local storage if not present
                localStorage.setItem("UserId", sStoredUserId);

                // Convert Set to array, update userRules, and cache roles in local storage
                localStorage.setItem("UserRole", this.userRules.join(","));

                return [sStoredUserId, this.userRules];
            },

            getUserData: async function () {
                const [userId, userRoles] = await this.getUserIdAndRole();

                // Initialize userService only if not already present
                if (!this.userService) {
                    this.userService = new UserService(this._currentController, userId);
                }

                // Fetch user info and set up access control if not already done
                if (!this.userInfo) {
                    try {
                        this.userInfo = await this.userService.getUserInfo();
                    } catch (error) {
                        console.error("Error fetching user data or access permissions:", error);
                    }
                }

                if (!this.userInfo) {
                    return false
                }

                return {
                    userInfo: this.userInfo,
                    roles: userRoles
                };
            },

            getUserRules: async function (sStoredUserId) {
                // Initialize default user roles
                let userRoles = new Set(["Normal"]);

                // Initialize CRUD service
                const crudService = new CRUD_z(this._currentController, "ZACCOMODATION_APPS_SRV", true);

                try {
                    // Fetch Access_UserSet for the current user and appId
                    const accessUserSet = await crudService.get_record("Access_UserSet", "", {});
                    const accessUser = accessUserSet?.results.find(el =>
                        el.appId === "3" && el.userId === sStoredUserId
                    );

                    // Add roles based on accessUser permissions
                    if (accessUser) {
                        if (accessUser.admin) userRoles.add("Settings");
                        if (accessUser.report) userRoles.add("Report");
                    }
                } catch (error) {
                    console.error("Error fetching user access permissions:", error);
                }

                return Array.from(userRoles);
            },

            // Filter Nav and Tiels Base in Rules ........
            filterNavigationByRole: function (navigationItems, userRoles) {
                return navigationItems.filter(item => {
                    // Check if the current item has roles
                    if (item.roles) {
                        // Check if any of the user roles match the item's roles
                        const hasRole = userRoles.some(role => item.roles.includes(role));
                        if (hasRole) {
                            // If there are subitems (e.g., for Settings), filter them too
                            if (item.items) {
                                item.items = this.filterNavigationByRole(item.items, userRoles);
                            }
                            return true;
                        }
                    }
                    return false;
                });
            },

            // Route Access ........ 
            _onRouteMatched: async function (oEvent) {
                var oRouteName = oEvent.getParameter("name");

                // Ensure the model is available
                var oModelNavList = this._currentController.getModel("navList");
                if (!oModelNavList) {
                    console.error("Navigation model is not available.");
                    return;
                }

                let oModelNavListData = oModelNavList.getData();
                var allRouteNew = [...oModelNavListData.navigation, ...oModelNavListData.navigationAddtion];

                // Find the object with the matching key
                let foundItem = this.findItem(allRouteNew, oRouteName);

                // Access control logic
                if (foundItem) {
                    // Check if the user's role is allowed
                    if (!this.userRules.some(role => foundItem.roles.includes(role))) {
                        this.redirectToHome();
                    }
                } else {
                    sap.m.MessageToast.show("Access Denied! You don't have permission to access this view.");
                    this.redirectToHome();
                }
            },

            redirectToHome: function () {
                this._currentController.getRouter().navTo("RouteHome"); // Redirect to the home view
                sap.m.MessageToast.show("Access Denied! You don't have permission to access this view.");
            },

            findItem: function (navD, oRouteName) {
                // First, check if the key exists in the top-level array
                let foundItem = navD.find(item => item.key === oRouteName);
                // If not found at the top level, check inside the "items" array of each object, if it exists
                if (!foundItem) {
                    navD.forEach(item => {
                        if (item.items && Array.isArray(item.items)) {
                            const subItem = item.items.find(sub => sub.key === oRouteName);
                            if (subItem) {
                                foundItem = subItem;
                            }
                        }
                    });
                }

                return foundItem;
            },

            // Langeuge ........ 
            setLanguageFromLcalStorage: function () {
                // Retrieve UserId and UserRole from local storage or assign default values
                let sNewLanguage = localStorage.getItem("currentLanguage") || "en";
                this.setLanguageToModelAndResuource(sNewLanguage)
                return sNewLanguage;
            },

            setLanguageToModelAndResuource: function (sNewLanguage) {
                // Set new language
                sap.ui.getCore().getConfiguration().setLanguage(sNewLanguage);

                // Reload i18n model
                var i18nModel = new sap.ui.model.resource.ResourceModel({
                    bundleName: "internal.i18n.i18n",  // Adjust the bundle path
                    bundleLocale: sNewLanguage
                });
                this._currentController.setModel(i18nModel, "i18n");
            },

            onChangeLanguage: function () {
                var oModel = this._currentController.getModel("i18n");
                var sCurrentLanguage = oModel.getResourceBundle().sLocale; // Get current language
                // console.log({ sCurrentLanguage });

                // Toggle language
                var sNewLanguage = sCurrentLanguage === "ar" ? "en" : "ar";

                localStorage.setItem("currentLanguage", sNewLanguage);
                this.setLanguageToModelAndResuource(sNewLanguage)
                this.updateAllModelsBaseInLanguage();

                return sNewLanguage;
            },

            updateAllModelsBaseInLanguage: function () {
                // Get the i18n model
                var i18nModel = this._currentController.getModel("i18n");
                var oResourceBundle = i18nModel.getResourceBundle();
                // console.log("Component -> oResourceBundle", oResourceBundle)

                // Load the navigation JSON model----------------------------------------------------------------------
                var navModel = this._currentController.getModel("navList");
                var navData = navModel.getData(); // Directly get the data
                // console.log("Component -> navData", navData);

                if (navData && navData.navigation) {
                    // Replace i18n placeholders with actual values for main navigation items
                    navData.navigation.forEach(function (navItem) {
                        // console.log("Component -> navItem", navItem);
                        navItem.title = oResourceBundle.getText(navItem.title2.replace("{i18n>", "").replace("}", ""));

                        // Check if there are nested items and update their titles as well
                        if (navItem.items && Array.isArray(navItem.items)) {
                            navItem.items.forEach(function (subItem) {
                                // console.log("Component -> subItem", subItem);
                                subItem.title = oResourceBundle.getText(subItem.title2.replace("{i18n>", "").replace("}", ""));
                            });
                        }
                    });

                    // console.log("Component -> navModel updated", navData);
                    // Set the updated model
                    navModel.setData(navData);
                    this._currentController.setModel(navModel, "navList");
                } else {
                    console.error("No navigation data found in the navList model");
                }


                // Load the texts JSON model----------------------------------------------------------------------
                var localData = this._currentController.getModel("localData");
                var localDataGet = localData.getData();

                if (localDataGet) {
                    // Iterate over each property in localDataGet
                    Object.keys(localDataGet).forEach(function (categoryKey) {
                        var categoryArray = localDataGet[categoryKey];

                        // Check if the category is an array and process each item
                        if (Array.isArray(categoryArray)) {
                            categoryArray.forEach(function (textItem) {
                                if (textItem.text2) {
                                    // Replace i18n placeholder and update the 'text' property
                                    textItem.text = oResourceBundle.getText(textItem.text2.replace("{i18n>", "").replace("}", ""));
                                }
                            });
                        }
                    });

                    // Set the updated model data
                    localData.setData(localDataGet);
                    this._currentController.setModel(localData, "localData");
                } else {
                    console.error("No data found in the localData model");
                }

                this.setTails()
            },

            // Initail Tails all in project here For Translate it base in selected Language.
            setTails: function () {
                const navList = this._currentController.getModel("navList").getData().navigation

                //  For Home Page ..
                let filteredNavData = this.filterNavigationByRole(navList, this.userRules);
                let dataHome = filteredNavData
                    .filter(el => el.title !== "Home") // Filter out elements with title "Home"
                    .map(el => {
                        return {
                            title: el.title,
                            route: el.key,
                            icon: el.icon,
                            subtitle: "Focus Area Tracking",
                            footer: "Focus Area Tracking",
                            unit: "EUR",
                            kpivalue: 12,
                            scale: "k",
                            color: "Good",
                            trend: "Up"
                        };
                    });
                this._currentController.setModel(new sap.ui.model.json.JSONModel(dataHome), 'tilesHome')

                //  For Settings Page ..
                if (this.userRules.includes('Settings')) {
                    let dataSettings = navList
                        .filter(el => el.title2 === "navSettings")[0]?.items.map(el => {
                            return {
                                title: el.title, subtitle: "Focus Area Tracking", footer: "Focus Area Tracking",
                                unit: "EUR", kpivalue: 12, scale: "k", color: "Good", trend: "Up", route: el.key, icon: el.icon
                            };
                        });
                    this._currentController.setModel(new sap.ui.model.json.JSONModel(dataSettings), 'tilesSettings')
                }
            },

            // Re Set navlist data base on User Rules.
            setNavBaseInUserRules: function () {
                //-----------Nav Part---------
                var oModelNavList = this._currentController.getModel("navList");
                var oModelNavListData = oModelNavList.getData();

                // console.log("Component -> setNavBaseInUserRules -> oModelNavListData", oModelNavListData)
                // If the data is already loaded in the model
                if (oModelNavListData) {
                    let filteredNavData = this.filterNavigationByRole(oModelNavListData.navigation, this.userRules);
                    let filteredNavDataAddtion = this.filterNavigationByRole(oModelNavListData.navigationAddtion, this.userRules);

                    oModelNavListData.navigation = filteredNavData
                    oModelNavListData.navigationAddtion = filteredNavDataAddtion

                    oModelNavList.setData(oModelNavListData);
                    this._currentController.setModel(new sap.ui.model.json.JSONModel({ isShowAllRequest: false }), "isShowAllRequest");
                }
            },

            waitForNavListModel: async function () {
                var navListModel = this._currentController.getModel("navList");

                if (navListModel.pSequentialImportCompleted) {
                    try {
                        // Wait for the promise to complete
                        await navListModel.pSequentialImportCompleted;
                        // Now, you can safely access the model data
                        var navListData = navListModel.getData();
                        this.userRules = ["Normal"];
                        // Create a deep copy of navListData
                        this.navListDataWithNormaRules = JSON.parse(JSON.stringify(navListData));
                    } catch (error) {
                        console.error("Error loading navList model:", error);
                    }
                } else {
                    // Handle case where pSequentialImportCompleted doesn't exist
                    console.error("navListModel.pSequentialImportCompleted is not defined");
                }
            },

        });
    }
);


x = `

# How to use it 
Note Need flow some definations :->
models name for [navList -> fo navigatons |--| localData -> for any contest data if need and for can change the language]

in Commponet.js ->
        # import it 
            "pathProject/utilities/GetUser_getNav_getTails_changeLanguage",

        # call tha function: on init
            this.getUser_getNav_getTails_changeLanguage = new GetUser_getNav_getTails_changeLanguage(this)
            this._componentInitialized = await new Promise(async (resolve, reject) => {
                await this.getUser_getNav_getTails_changeLanguage.init()
                // Initialize the router (optional, you might delay this until everything is ready)
                this.getRouter().initialize();      
                // Attach routeMatched event for dynamic navigation
                this.getRouter().attachRouteMatched(this.getUser_getNav_getTails_changeLanguage._onRouteMatched, this.getUser_getNav_getTails_changeLanguage); // for insure the user have access (Rules)
                resolve();
            })

        # createing those function:
            // Method to return the initialization promise ........
            getInitializationPromise: function () {
                return this._componentInitialized;
            },

            // Langeuge ........ 
            onChangeLanguage: function () {
                this.getUser_getNav_getTails_changeLanguage.onChangeLanguage()
            },


in App.js ->
         # call tha function: on init
            // Wait for the Component's initialization promise to resolve
            await this.getOwnerComponent().getInitializationPromise();

        # createing those function:
            // Languse ... 
            onChangeLanguage: function () {
            let sNewLanguage = this.getOwnerComponent().onChangeLanguage();

            // Update button text and tooltip dynamically
            this.updateButtonText(sNewLanguage);
            },

            updateButtonText: function (sLanguage) {
            var sButtonText = sLanguage === "ar" ? "Change to English" : "Change to Arabic";
            var oButton = this.oView.byId("languageChangeButton"); // Assuming you give an ID to your button
            oButton.setText(sButtonText);

            // Optionally update tooltip if needed
            var sTooltipText = sLanguage === "ar" ? "تغيير إلى الإنجليزية" : "Change to Arabic";
            oButton.setTooltip(sTooltipText);
            },
`
