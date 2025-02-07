sap.ui.define(
    [
        "${ez5.appName}/${ez5.packageName}/form/FinalValidation",
        "${ez5.appName}/${ez5.packageName}/form/Helper",
    ],
    function (FinalValidation, HelperForm) {
        "use strict";

        return BaseController.extend("disclosureofform.controller.InformationForm", {
            onInit: function () {

                this.initialForm()
            },

            // ================================== # Form # ==================================
            initialForm: function () { // On Insert Form
                this.formModel = "formModel"
                this.helperFormModel = "helperFormModel"
                this.autoG = [
                    { fieldName: "EmployeeId", value: "", type: "text", rules: "required", visible: true, editable: true },
                    { fieldName: "EmployeeName", value: "", type: "text", rules: "required", visible: true, editable: false },
                    { fieldName: "Level", value: "", type: "text", rules: "required", visible: true, editable: true }
                ]

                this.helperForm = new HelperForm(this, this.autoG)
                this.formValues = this.helperForm.getValuesFromAutoG()
                this.helperFormValues = this.helperForm.extractVisibilityAndEditability()

                this.getView().setModel(new sap.ui.model.json.JSONModel(this.formValues), this.formModel);
                this.getView().setModel(new sap.ui.model.json.JSONModel(this.helperFormValues), this.helperFormModel);

                this.finalValidation = new FinalValidation(this, this.formModel, this.pageId, this.autoG) // defination the validation
                this.initialValidation()
            },


            initialValidation: function () {
                this.finalValidation = new FinalValidation(this, this.formModel, this.pageId, this.autoG) // defination the validation
            },

            handleMessagePopoverPress: function (oEvent) {
                this.finalValidation.handleMessagePopoverPress(oEvent);
            },

            onSubmit_: async function () {
                let data = this.getView().getModel(this.formModel).getData()
                console.log({ data })

                if (this.finalValidation.onSave(data)) { return false }
            },

        });
    }
);
