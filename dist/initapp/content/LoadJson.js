sap.ui.define([], function () {
    "use strict";

    return class LoadJson {
        constructor(_controllerJS, sNamespace) {
            this._controllerJS = _controllerJS
            this.sNamespace = sNamespace
        }

        init() {
        }

        async loadModelsJson(modelsJson) {
            try {
                // Load data for all modelsJson asynchronously and return the data
                const modelsData = await Promise.all(
                    modelsJson.map(async (model) => {
                        const oModel = await this.loadAndSetModel(model.modelName, model.modelPath);
                        return { modelName: model.modelName, data: oModel.getData() }; // Return the model's name and its data
                    })
                );
                return modelsData; // Return all loaded models' data
            } catch (error) {
                console.error("Error loading JSON data:", error);
                return null; // Return null or handle error as needed
            }
        }

        // Helper function to load and set the JSON model
        async loadAndSetModel(modelName, modelPath) {
            var oModel = new sap.ui.model.json.JSONModel();
            await this.loadJSONData(oModel, modelPath);
            this._controllerJS.setModel(oModel, modelName); // Set the model to the view
            return oModel; // Return the loaded JSONModel
        }

        loadJSONData(oModel, sPath) {
            return new Promise((resolve, reject) => {
                oModel.loadData(sPath);
                oModel.attachRequestCompleted(() => resolve(oModel));
                oModel.attachRequestFailed((error) => reject(error));
            });
        }

        async getModel() {
            const modelsJson = [
                { modelName: "navList", modelPath: sap.ui.require.toUrl(`${this.sNamespace}/model/navList.json`) },
                { modelName: "rulesNavList", modelPath: sap.ui.require.toUrl(`${this.sNamespace}/model/rulesNavList.json`) },
                { modelName: "localData", modelPath: sap.ui.require.toUrl(`${this.sNamespace}/model/localData.json`) }
            ];

            // ## loade models (ex navList.json)
            let modelsData;
            try {
                modelsData = await this.loadModelsJson(modelsJson);
            } catch (error) {
                console.error("Failed to load models:", error);
            }
            return { modelsJson, modelsData }
        }
    };
});
