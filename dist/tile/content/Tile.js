sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
    "use strict";

    return class Tile {
        constructor(_controllerJS) {
            this._controllerJS = _controllerJS
        }

        setTile(jsonName, jsonKey, callbackFilter = (el) => el.title !== "Home") {
            this.modelName = jsonName + "_tiles"

            // Get the model data
            const modelData = this._controllerJS.getOwnerComponent().getModel(jsonName).getData();
            // If jsonKey exists, get the value by key; otherwise, assign the whole data
            let tile = (jsonKey && jsonKey.trim()) ? modelData[jsonKey] : modelData;


            let data = tile
                .filter(callbackFilter) // Filter out elements with title "Home"
                .map(el => {
                    return {
                        title: el.title,
                        subtitle: "Focus Area Tracking",
                        footer: "Focus Area Tracking",
                        unit: "EUR",
                        kpivalue: 12,
                        scale: "k",
                        color: "Good",
                        trend: "Up",
                        route: el.key,
                        icon: el.icon
                    };
                });

            this._controllerJS.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(data), this.modelName)

        }

        press(evt) {
            var oTile = evt.getSource();
            var oBindingContext = oTile.getBindingContext(this.modelName);
            var sRoute = oBindingContext.getProperty("route");

            var oRouter = UIComponent.getRouterFor(this._controllerJS);
            oRouter.navTo(sRoute);
        }

    };
});
