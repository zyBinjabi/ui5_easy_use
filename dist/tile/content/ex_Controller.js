
sap.ui.define([
    "sap/ui/core/mvc/Controller",

], (Controller) => {
    "use strict";

    return Controller.extend("${ez5.appName}.controller.controllerName", {
        onInit() {
            // ## Tiles ======================
            this.tile = new Tile(this)
            const jsonName = "navList"
            const callbackFilter = (el) => el.title !== "Home" && el.title !== "الصفحة الرئيسية"
            this.tile.setTile(jsonName, "navigation", callbackFilter)

        },

        press: function (evt) {
            this.tile.press(evt)
        }

    });
});