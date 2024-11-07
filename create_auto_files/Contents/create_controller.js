// content.js
module.exports = (fileName, appId, isHelperFuns = false) => {
  let parent = "\"sap/ui/core/mvc/Controller\""
  let isInit = ""
  let isModelDfulate = ""
  let getMainObj = ""
  let startValidation = ""
  let oPayload_modify = ""
  let onMainSubmit = ""
  let setBusy = ""

  if (isHelperFuns) {
    parent = `"${appId}/controller/Helper/BaseController"`
    isInit = `BaseController.prototype.onInit.apply(this,[]);`

    isModelDfulate = ` 
         this.pageName = '${fileName}'
         this.mainFromModel = 'mainFormModel'
         this.mainFormErrModel = "mainFormErrModel"
         this.mainTableId = 'mainTableId'+ this.pageName
         this.mainFormId = 'mainFormId'+ this.pageName`

    getMainObj = `
    getMainObj: function () {
        return {}
      },`

    onMainSubmit = `
        onMainSubmit: async function (ev) {
        this.setBusy(this.mainFormId, true)

        let data = this.getView().getModel(this.mainFromModel).getData()

        let isErr = this.startValidation(data)
        if (isErr) {
          return false
        }

        data = this.oPayload_modify(data);

        if (this.getMode() == 'Create') {
          let res = await this.crud_z.post_record(this.mainEndPoint, data)
        } else {
          let res = await this.crud_z.update_record(this.mainEndPoint, data, data.Id)
        }

        this.setBusy(this.mainFormId, false)

        this.getView().setModel(new sap.ui.model.json.JSONModel(this.getMainObj()), this.mainFromModel)// Reset
      },`

    startValidation = `      
        startValidation: function (oPayload) {
        let fieldsName = Object.keys(this.getMainObj());
        let requiredList = fieldsName.filter(field => field);

        const rulesArrName = [
          { arr: requiredList, name: 'required' },
        ];

        let { isErr, setvalueStateValues } = this.validation_z.startValidation(fieldsName, rulesArrName, oPayload)
        console.log(setvalueStateValues)
        this.getView().setModel(new sap.ui.model.json.JSONModel(setvalueStateValues), this.mainFormErrModel);
        return isErr
      },`

    oPayload_modify = `
        oPayload_modify: function (oPayload) {
        oPayload = this.oPayload_modify_parent(oPayload)
        return oPayload
      },`

    setBusy = `
      setBusy: function (id, status) {
      this.getView().byId(id).setBusy(status);
      },`
  }


  let is

  return `sap.ui.define(
      [
          ${parent}
      ],
      function(BaseController) {
        "use strict";
    
        return BaseController.extend("${appId}.controller.${fileName}", {
          onInit: function() {
            ${isInit}

            ${isModelDfulate}
          },

      // ================================== # On Functions # ==================================
          ${onMainSubmit}

      // ================================== # Get Functions # ==================================
          ${getMainObj}

      // ================================== # Helper Functions # ==================================
          ${startValidation}

          ${oPayload_modify}

          ${setBusy}

        });
      }
    );
    `;
};
