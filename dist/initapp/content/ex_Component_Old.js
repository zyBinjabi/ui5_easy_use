sap.ui.define([
    "${ez5.appName}/${ez5.packageName}/Env",
    "${ez5.appName}/${ez5.packageName}/initapp/LoadJson",
], (Env, LoadJson) => {
    "use strict";


    return UIComponent.extend("${ez5.appName}.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        async init() {
            // ==========## Get Env ##========== //
            this.env = new Env(this) // Env
            this.env.init()


            // ==========## Get Models ##========== //
            const sNamespace = "${ez5.appName}"; // Replace with your application namespace
            const loadJson = new LoadJson(this, sNamespace)
            const { modelsJson, modelsData } = loadJson.getModel(sNamespace)
        },

    });
});