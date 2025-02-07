sap.ui.define(["${ez5.appName}/${ez5.packageName}/language/Language",], (Language) => {
    "use strict";


    return UIComponent.extend("${ez5.appName}.Component", {
        async init() {
            // ==========## Language ##========== //
            this.language = new Language(this)
            await this.language.init()
            this.language.replaceModelsJson(modelsJson)
        },

        // ==========## Language ##========== //
        onChangeLanguage: function () { // ## Language ============
            return this.language.onChangeLanguage()
        },

    });
});