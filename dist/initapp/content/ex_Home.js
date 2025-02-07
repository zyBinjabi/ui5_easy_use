sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "${ez5.appName}/${ez5.packageName}/tile/Tile"
], (Controller, Tile) => {
    "use strict";

    return Controller.extend("${ez5.appName}.controller.Home", {
        async onInit() {

            // ## Tiles ======================
            this.tile = new Tile(this)
            const jsonName = "navList"
            const callbackFilter = (el) => el.title !== "Home" && el.title !== "الصفحة الرئيسية"
            this.tile.setTile(jsonName, "navigation", callbackFilter)


        },

        press: function (evt) { // ## Tiles ============
            this.tile.press(evt)
        },

    });
});