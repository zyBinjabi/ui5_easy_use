// content.js
module.exports = (fileName, appId) => {
  return `sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "${appId}/Controller/Helper/CRUD_z",
    "${appId}/Controller/Helper/Validation_z",


  ],
  function (BaseController, JSONModel, CRUD_z, Validation_z) {
    "use strict";

    return BaseController.extend("${appId}.Helper.BaseController", {
      onInit: function () {
        this.crud_z = new CRUD_z(this)
        this.mainOModel = this.crud_z.oModel;

        this.validation_z = new Validation_z()

        this.helperModel = 'helperModel'
        this.getView().setModel(new sap.ui.model.json.JSONModel({}), this.helperModel)
        this.helpderModelInstase = this.getView().getModel(this.helperModel)
        this.setMode('Create')

      },

      setMode: function (mode) {
        this.helpderModelInstase.setProperty('/Mode', mode)
      },
      getMode: function () {
        return this.helpderModelInstase.getData().Mode
      },

      oPayload_modify_parent: function (oPayload) {
        const isEdit = this.getMode() == "Edit" ? true : false

        oPayload.Id = isEdit ? oPayload.Id : "0000000000"
        oPayload.CreatedDate = isEdit ? new Date(oPayload.CreatedDate) : new Date()
        oPayload.UpdatedDate = new Date()

        if ('__metadata' in oPayload) {
          delete oPayload['__metadata'];
        }

        return oPayload
      },
    });
  }
);
`;
};
