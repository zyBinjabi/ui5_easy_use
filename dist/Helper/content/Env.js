sap.ui.define([], function () {
    "use strict";

    return class Env {
        constructor(_componentJS) {
            this._componentJS = _componentJS
        }

        init() {
            this.zVars = {
                isProduction: false,
                userId: "30464",
                rules: ['normal', 'admin']
            }

            this._currentController?.setModel(new sap.ui.model.json.JSONModel(this.env), 'env')
        }

    };
});






