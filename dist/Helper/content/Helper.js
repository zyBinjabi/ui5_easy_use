sap.ui.define([], function () {
  "use strict";

  return class Language {
    constructor(_componentJS) {
      this._componentJS = _componentJS
    }

    onInit() {
      // this._view = this.getView();
    }

    getAllKeys(obj, prefix = '') {
      return Object.entries(obj).flatMap(([key, value]) =>
        typeof value === 'object' && value !== null
          ? this.getAllKeys(value, `${prefix}${key}.`)
          : `${prefix}${key}`
      );
    }


  };
});

