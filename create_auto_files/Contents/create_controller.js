// content.js
module.exports = (fileName, appId) => {
  return `sap.ui.define(
      [
          "sap/ui/core/mvc/Controller"
      ],
      function(BaseController) {
        "use strict";
    
        return BaseController.extend("${appId}.controller.${fileName}", {
          onInit: function() {
          }
        });
      }
    );
    `;
};
