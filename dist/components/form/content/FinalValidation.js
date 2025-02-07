sap.ui.define([
    "${ez5.appName}/${ez5.packageName}/components/form/Validation_",
    "${ez5.appName}/${ez5.packageName}/components/form/MessagePopoverHelper",
], function (Validation_, MessagePopoverHelper) {
    "use strict";

    return class FinalValidation {
        constructor(_controllerJS, modelName = "formModel", pageId = 'SampleId', autoG = [], messagePopoverBtnId = "messagePopoverBtnId_") {
            this._controllerJS = _controllerJS
            this.modelName = modelName
            this.pageId = pageId
            this.autoG = autoG;
            this.messagePopoverBtnId = messagePopoverBtnId

            this.onInit()
        }

        onInit() {
            // this._view = this.getView();
            this.messagePopoverHelper = new MessagePopoverHelper({ _controllerJS: this._controllerJS, messageHandlingPageId: this.pageId, messagePopoverBtnId: this.messagePopoverBtnId })
        }

        //===============================================## Main ## =======================================================================
        onSave(formData) {
            const mainFormModel = this._controllerJS.getView().getModel(this.modelName);
            // Attach property change listener
            mainFormModel.attachPropertyChange(this.onModelPropertyChange, this);

            this.messagePopoverHelper.openMessage()
            // Validate form data
            return this._validateForm(formData);
        }



        handleMessagePopoverPress(oEvent) {
            this.messagePopoverHelper.handleMessagePopoverPress(oEvent);
        }


        /**
         * Event handler for model property changes.
         * @param {sap.ui.base.Event} oEvent - The event object
         */
        onModelPropertyChange(oEvent) {
            const formData = this._controllerJS.getView().getModel(this.modelName).getData();
            this._validateForm(formData);
        }

        /**
         * Validates form data and updates the message popover.
         * @param {object} formData - The form data to validate
         */
        _validateForm(formData) {
            const rulesArrName = this.autoG
            this.validation_z = new Validation_(this._controllerJS, rulesArrName);
            const valueStates = this.validation_z.validate(formData);
            const isErr = this.validation_z.hasErrors(valueStates)
            console.log("valueStates", valueStates)
            console.log("isErr", isErr)

            // Update messages
            this.messagePopoverHelper.createMessagesForForm(this.modelName, valueStates);

            return isErr
        }

        extractRules(autoG) {
            return autoG.map(item => [item.fieldName, item.rules]);
        }



    };
});
