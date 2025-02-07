sap.ui.define([], function () {
    "use strict";

    return class Helper {
        constructor(_controllerJS, autoG) {
            this._controllerJS = _controllerJS
            this.autoG = autoG
        }

        init() {
        }

        getValuesFromAutoG() {
            return this.autoG.reduce((acc, field) => {
                acc[field.fieldName] = field.value;
                return acc;
            }, {});
        }

        extractVisibilityAndEditability(autoG = this.autoG) {
            return autoG.reduce((acc, field) => {
                console.log(field)
                acc[field.fieldName] = {
                    visible: field.visible,
                    editable: field.editable // Fix typo "editible" to "editable" if needed in data
                };
                return acc;
            }, {});
        }

    };
});
