sap.ui.define([
    "sap/ui/core/mvc/Controller",
], function (Controller) {
    "use strict";

    return Controller.extend("${ez5.appName}.utilities.SetVisibleSlcView", {
        constructor: function (currentController, prefix = 'View', allFields = []) {
            this._currentController = currentController;
            this.prefix = prefix
            this.modelName = "/view"
            this.allFields = allFields
            // this.modelName = '/visbile' + this.prefix
        },

        onInit: async function () {
        },

        setVisbile: function (fieldsName, visible, editable, required) {
            let viewHelper = {}

            // Convert fieldsName to an array if it is not already one
            if (!Array.isArray(fieldsName)) {
                fieldsName = [fieldsName]; // Wrap it in an array
            }

            fieldsName.forEach(element => {
                viewHelper[element] = { visible: visible, editable: editable, required: required }
            })

            let oldView = this._currentController.helperModelInstance.getProperty(this.modelName)
            let newView = this.deepMerge(oldView, viewHelper)

            this._currentController.helperModelInstance.setProperty(this.modelName, newView)
        },

        deepMerge: function (target, source) {
            if (typeof target !== 'object' || target === null) {
                target = {};
            }

            if (typeof source !== 'object' || source === null) {
                return target;
            }

            for (let key in source) {
                if (typeof source[key] === 'object' && source[key] !== null && !(source[key] instanceof Array)) {
                    // Recursively merge only if the value is an object (not array or primitive)
                    if (!target[key]) {
                        target[key] = {};  // Ensure the key exists in the target
                    }
                    target[key] = this.deepMerge(target[key], source[key]);
                } else {
                    // Directly assign the value (scalar or array) from source to target
                    target[key] = source[key];
                }
            }

            return target;
        },


    });
});







