/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "internal/model/models",
    "internal/utilities/GetUser_getNav_getTails_changeLanguage",
],
    function (UIComponent, models, GetUser_getNav_getTails_changeLanguage) {
        "use strict";


        return UIComponent.extend("internal.Component", {
            metadata: {
                manifest: "json"
            },
            _componentInitialized: null,

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: async function () {
                console.log("Component -> Start")


                // Call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // Set the device model
                this.setModel(models.createDeviceModel(), "device");
                this.getUser_getNav_getTails_changeLanguage = new GetUser_getNav_getTails_changeLanguage(this)

                this._componentInitialized = await new Promise(async (resolve, reject) => {
                    await this.getUser_getNav_getTails_changeLanguage.init()

                    if (!this.getUser_getNav_getTails_changeLanguage.userInfo) {
                        // Retrieve i18n texts for the error message and title
                        const oResourceBundle = this.getModel("i18n").getResourceBundle();
                        const sErrorMessage = oResourceBundle.getText("noUserDataErrorMessage");
                        const sErrorTitle = oResourceBundle.getText("errorTitle");

                        // Display an error message and stop the app
                        sap.m.MessageBox.error(sErrorMessage, {
                            title: sErrorTitle,
                            onClose: function () {
                                // Optional: Add any additional cleanup if necessary
                                resolve(false);  // Resolve with false to indicate initialization failure
                            }
                        });
                        return; // Stop further execution
                    }

                    this.userService = this.getUser_getNav_getTails_changeLanguage.userService

                    // Initialize the router (optional, you might delay this until everything is ready)
                    this.getRouter().initialize();

                    resolve();
                })
                // Attach routeMatched event for dynamic navigation
                this.getRouter().attachRouteMatched(this.getUser_getNav_getTails_changeLanguage._onRouteMatched, this.getUser_getNav_getTails_changeLanguage); // for insure the user have access (Rules)
                console.log("Component -> Finsh")

            },

            onBeforeRendering: function () {
                // console.log("Component -> onBeforeRendering-----------------------")
                // Manipulate the view elements before rendering
            },


            // Method to return the initialization promise ........
            getInitializationPromise: function () {
                return this._componentInitialized;
            },

            // Langeuge ........ 
            onChangeLanguage: function () {
                this.getUser_getNav_getTails_changeLanguage.onChangeLanguage()
            },


        });
    }
);