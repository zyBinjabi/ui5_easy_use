sap.ui.define([], function () {
    "use strict";

    return class Auth {
        constructor(_componentJS) {
            this._componentJS = _componentJS
        }

        init(userInfo, navLists, rulesNavList) {
            this.userInfo = userInfo
            this.rules = this.userInfo['rules'] || ['normal']; // Stores the allowed roles
            this.navLists = this.getMergedNavItems(navLists) || []
            this.rulesNavList = rulesNavList || [];
        }


        /**
         * Get authorized pages based on navList and rulesNavList
         * @param {Array} navLists - Array of navigation objects containing title, key, roles, etc.
         * @param {Object} rulesNavList - Roles model containing roles for each page (key)
         * @returns {Array} - Array of authorized page keys
         */
        getAuthorizedPage() {
            const authorizedPages = [];
            const userRules = this.rules;
            const navLists = this.navLists;
            const rulesNavList = this.rulesNavList;

            if (!navLists || !rulesNavList || !rulesNavList.roles) {
                return [];
            }

            // Recursive function to check authorization for items and subitems
            const checkAuthorization = (navItems) => {
                navItems.forEach((navItem) => {
                    const pageKey = navItem.key;
                    const pageRoles = rulesNavList.roles[pageKey] || [];

                    // Check if any of the roles for this page match the user roles
                    const isAuthorized = pageRoles.some((role) => userRules.includes(role));

                    if (isAuthorized) {
                        authorizedPages.push(pageKey);
                    }

                    // If the item has subitems, check those as well
                    if (navItem.items && navItem.items.length > 0) {
                        checkAuthorization(navItem.items);
                    }
                });
            };

            // Start the recursive check
            checkAuthorization(navLists);

            return authorizedPages;
        }



        /**
         * Merge the keys from multiple navigation arrays (like 'navigation' and 'AdditionNavigation')
         * @param {...Object} navLists - Multiple navigation lists to extract keys from
         * @returns {Array} - Merged array of all keys
         */
        getMergedNavItems(...navLists) {
            if (!navLists) {
                return []
            }

            let mergedItems = [];

            // Iterate over each navList in navLists
            navLists.forEach(navList => {
                // Loop through each property in the navList
                Object.keys(navList).forEach(property => {
                    // Check if the current property is an array
                    if (Array.isArray(navList[property])) {
                        // Iterate over each item in the array
                        navList[property].forEach(item => {
                            // If the item has a 'key', add the item to the mergedItems array
                            if (item.key) {
                                mergedItems.push(item);
                            }
                        });
                    }
                });
            });

            return mergedItems;
        }

        // Route Access ........ 
        _onRouteMatched(oEvent) {
            var oRouteName = oEvent.getParameter("name");
            const isNavExist = this.authorizedPages.includes(oRouteName);
            // console.log("oRouteName: ", oRouteName)
            // console.log("authorizedPages: ", this.authorizedPages)
            // console.log("isNavExist: ", isNavExist)
            // Access control logic
            if (isNavExist) {
                // pass
            } else {
                this.redirectToHome();
            }
        }

        redirectToHome() {
            sap.m.MessageToast.show("Access Denied! You don't have permission to access this view!!!");
            this._componentJS.getRouter().navTo("RouteHome"); // Redirect to the home view
        }

        async getNavAndRulesData() {
            // const oNavListModel = this._componentJS.getModel("navList");
            const oRulesNavListModel = this._componentJS.getModel("rulesNavList");

            // console.log("oRulesNavListModel: ", oRulesNavListModel);

            // Similar promise setup as before for both models
            // const loadNavData = new Promise((resolve, reject) => {
            //     oNavListModel.attachEventOnce("requestCompleted", function () {
            //         const navLists = oNavListModel.getData();
            //         resolve(navLists);
            //     });
            // });

            const loadRulesNavData = new Promise((resolve, reject) => {
                oRulesNavListModel.attachEventOnce("requestCompleted", function () {
                    const rulesNavLists = oRulesNavListModel.getData();
                    resolve(rulesNavLists);
                });
            });

            // Returning the resolved data directly
            return await Promise.all([loadRulesNavData]);
        }

        async start(userInfo) {
            // console.log("userInfo: ", userInfo);
            const info = userInfo;
            // const [ rulesNavLists] = await this.getNavAndRulesData();

            const navLists = this._componentJS.getModel("navList").getData();
            const rulesNavLists = this._componentJS.getModel("rulesNavList").getData();

            // Initialize with the user rules, navLists, and rulesNavLists
            if (navLists && rulesNavLists) {
                this.init(info, navLists, rulesNavLists);
            } else {
                console.error("navLists or rulesNavLists is undefined.");
            }
            // await new Promise(resolve => setTimeout(resolve, 2000));

            // Now we can get the authorized page using the user rules
            this.authorizedPages = this.getAuthorizedPage();
            // console.log("this.authorizedPages: ", this.authorizedPages);
        }



        setFiteredNavList(modelsData, modelsJson, rules) {
            // Recursive function to filter navigation items and their subitems
            const filterNavigation = (navigation) => {
                return navigation
                    .map((item) => {
                        // Check if the current item is authorized
                        const isAuthorized = modelsData[1].data.roles[item.key]?.some((role) => rules.includes(role));

                        // Process subitems (if any)
                        let filteredSubitems = [];
                        if (item.items && item.items.length > 0) {
                            filteredSubitems = filterNavigation(item.items); // Filter subitems recursively
                        }

                        // Include the item if it's authorized or has authorized subitems
                        if (isAuthorized || filteredSubitems.length > 0) {
                            return {
                                ...item,
                                items: filteredSubitems // Include only the filtered subitems
                            };
                        }

                        return null; // Exclude unauthorized items
                    })
                    .filter((item) => item !== null); // Remove null values
            };

            // Filter the navigation list
            const filteredNavigation = filterNavigation(modelsData[0].data.navigation);

            // Update the model with the filtered navigation list
            this._componentJS.setModel(
                new sap.ui.model.json.JSONModel({ navigation: filteredNavigation }),
                modelsJson[0].modelName
            );
        }

    };
});
