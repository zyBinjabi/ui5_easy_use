sap.ui.define([], function () {
    "use strict";

    return class Language {
        constructor(_componentJS) {
            this._componentJS = _componentJS
        }


        async init() {
            // Check if there is a saved language preference in localStorage
            const savedLanguage = localStorage.getItem("selectedLanguage");
            if (savedLanguage) {
                // Set the language to the saved preference
                sap.ui.getCore().getConfiguration().setLanguage(savedLanguage);
                sap.ui.getCore().getConfiguration().setFormatLocale(savedLanguage);
            } else {
                // If no language is saved, set to default (e.g., English)
                sap.ui.getCore().getConfiguration().setLanguage("en_US");
                sap.ui.getCore().getConfiguration().setFormatLocale("en_US");
            }


            // Create the i18n model
            const oI18nModel = new sap.ui.model.resource.ResourceModel({
                bundleName: "${ez5.appName}.i18n.i18n",
                supportedLocales: ["en_US", "ar"], // Add your supported locales
                fallbackLocale: "en_US"
            });

            // Set the i18n model globally
            this._componentJS.setModel(oI18nModel, "i18n");

            // Apply changes and notify the view
            sap.ui.getCore().applyChanges();
        }

        setSelectedLanguage() {
            var oModel = this._componentJS.getModel("i18n");
            var sCurrentLanguage = oModel.getResourceBundle().sLocale; // Get current language

            // Toggle language
            this.sNewLanguage = sCurrentLanguage === "ar" ? "en_US" : "ar";
        }

        getSelectedLanguage() {
            return this.sNewLanguage
        }

        onChangeLanguage() {
            this.setSelectedLanguage()

            var sNewLanguage = this.getSelectedLanguage();

            this.setLanguageToModelAndResuource(sNewLanguage)

            return sNewLanguage;
        }

        setLanguageToModelAndResuource(sNewLanguage) {
            // Save the language preference to localStorage
            localStorage.setItem("selectedLanguage", sNewLanguage);


            // Step 2: Set the new language and format locale
            sap.ui.getCore().getConfiguration().setLanguage(sNewLanguage);
            sap.ui.getCore().getConfiguration().setFormatLocale(sNewLanguage);

            // Step 3: Refresh i18n model (reloading resource bundle)
            const oI18nModel = this._componentJS.getModel("i18n");
            if (oI18nModel) {
                oI18nModel.refresh(true); // Force the refresh of the i18n model to reload texts
            }

            // Step 4: Notify UI5 to refresh the UI components after locale change
            sap.ui.getCore().getEventBus().publish("sap.ui", "localeChanged", { newLanguage: sNewLanguage });

            // Step 5: Apply changes without reloading the page
            sap.ui.getCore().applyChanges();
        }

        replaceModelsJson(modelsJson) {
            // Wait for the i18n model to load and get the current language

            // Load i18n model for internationalization
            var oI18nModel = this._componentJS.getModel("i18n");
            var sCurrentLanguage = oI18nModel.getResourceBundle().sLocale; // Get current language
            // console.log("replaceModelsJson -> sCurrentLanguage: ", sCurrentLanguage)

            // Replace i18n keys with actual text in all modelsJson
            modelsJson.forEach(model => {
                var oModel = this._componentJS.getModel(model.modelName); // Get the model by name
                this.replaceI18nKeys(oModel, oI18nModel);
            });

        }

        replaceI18nKeys(oModel, oI18nModel) {
            const data = oModel.getData(); // Get the data from the model

            const replaceKeys = function (obj) {
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        const value = obj[key];

                        // If the key starts with 'i18n_', replace it with i18n model text
                        if (typeof value === 'string' && value.startsWith('i18n_')) {
                            // console.log("typeof value: ", typeof value)
                            const i18nKey = value; // The key in the i18n model
                            const translatedValue = oI18nModel.getProperty(i18nKey); // Get translation

                            // Replace with the translated text if available, otherwise keep the original value
                            obj[key] = translatedValue || value;
                        }

                        // If the value is an object or array, call recursively
                        else if (typeof value === 'object') {
                            replaceKeys(value);
                        }
                    }
                }
            };

            replaceKeys(data); // Start replacing in the top-level object
            oModel.refresh(); // Refresh the model to apply changes

        }

        // Helper function to wait for the i18n model to load
        waitForI18nModelToLoad() {
            return new Promise((resolve, reject) => {
                const oI18nModel = this._componentJS.getModel("i18n");
                if (oI18nModel) {
                    // Check if the model data is already loaded
                    const oResourceBundle = oI18nModel.getResourceBundle();
                    if (oResourceBundle) {
                        // Immediately resolve if the resource bundle is available (i.e., model is loaded)
                        resolve();
                    } else {
                        // Attach completion and failure events to resolve or reject when loading completes
                        oI18nModel.attachRequestCompleted(resolve);
                        oI18nModel.attachRequestFailed(reject);
                    }
                } else {
                    reject("i18n model is not available");
                }
            });
        }


    };
});
