sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/layout/form/Form",
    "sap/ui/layout/form/FormElement",
    "sap/m/Input"

], function (Controller, Form, FormElement, Input) {
    "use strict";

    return Controller.extend("disclosureofform.utilities.AddElementsInForm", {
        constructor: function (currentController) {
            this._currentController = currentController;
        },

        onInit: async function () {
        },

        // ================================== # Helper Functions # ==================================
        addMoreAnswer:async function (oEvent) {
            // set oForm, oFormElement, oButton -> OSource
            const { oForm, oFormElement, oButton } = this.getFormHierarchy(oEvent);

            const { aTargetInputsOrg, aTargetInputsExt, oFormContainer } = this.getFieldsOfForm(oForm)

            // console.log({ aTargetInputsOrg })
            // console.log({ aTargetInputsExt })
            // console.log({ oFormContainer })

            const lenOfExtraFields = (aTargetInputsExt.length / aTargetInputsOrg.length)

            const aInputDetails = this.getInputDetails(aTargetInputsOrg)
            // console.log({ aInputDetails })

            const applyReplaceToArrayOfObjects = this.applyReplaceToArrayOfObjects(aInputDetails, lenOfExtraFields + 1) // Change the Models Name 
            // console.log({ applyReplaceToArrayOfObjects })

            oFormContainer[0].removeFormElement(oFormElement) // Remove the Button

            await this._addElementsToContainer(oFormContainer[0], applyReplaceToArrayOfObjects); // Add New Fields

            oFormContainer[0].addFormElement(oFormElement) // Add the Button

            const {
                aTargetInputsOrg: aTargetInputsOrgAfterAdding,
                aTargetInputsExt: aTargetInputsExtAfterAdding,
                oFormContainer: oFormContainerAfterAdding
            } = this.getFieldsOfForm(oForm);

            // set Last Fields -> OSource
            const LastFields = aTargetInputsExtAfterAdding.slice(-aTargetInputsOrgAfterAdding.length)

            LastFields.forEach(el => {
                const oField = el.field;

                let { sModelName, sPath } = this.getModelAndPath(oField.mBindingInfos, "value");

                // To Add a property
                this.updateModelProperty("add", sModelName, sPath, '');
            });
        },

        removeLastAnswer: function (oEvent) {
            // set oForm, oFormElement, oButton -> OSource
            const { oForm, oFormElement, oButton } = this.getFormHierarchy(oEvent);

            // set aTargetInputsOrg, aTargetInputsExt, oFormContainer -> OSource
            const { aTargetInputsOrg, aTargetInputsExt, oFormContainer } = this.getFieldsOfForm(oForm)


            // set Last Fields -> OSource
            const LastFields = aTargetInputsExt.slice(-aTargetInputsOrg.length)

            // set oBinding First Field On Last Fields -> mBindingInfos
            // set id Emty Element -> Id
            const oBindingFirstFieldOnLastFieldsDetails = this.getBindingDetails(LastFields[0]?.field);
            const idEmtyElement = this.getIdofFields(oBindingFirstFieldOnLastFieldsDetails);

            LastFields.forEach(el => {
                const oField = el.field;
                const oFormElement = oField.getParent();
                const oFormContainer = oFormElement.getParent(); // Assuming this is how you get the FormContainer

                let { sModelName, sPath } = this.getModelAndPath(oField.mBindingInfos, "value");

                // To delete a property
                this.updateModelProperty("delete", sModelName, sPath);

                // Unbind property and aggregation bindings for the field
                oField.mBindingInfos && Object.keys(oField.mBindingInfos).forEach(property => {
                    // Unbind each property that has a binding
                    oField.unbindProperty(property);
                });

                // Remove the FormElement from the container and destroy it
                oFormContainer.removeFormElement(oFormElement);
                oFormElement.destroy();
            });

            let emtyField = sap.ui.getCore().byId(idEmtyElement);
            oFormContainer[0].removeFormElement(emtyField) // Remove the Button
            emtyField.destroy();
        },

        getFieldsOfForm: function (oForm) {
            const inputTypes = [sap.m.Input, sap.m.DatePicker];

            // Check if the Form is found
            if (oForm) {
                const aFormContainers = oForm.getFormContainers();
                const oFormContainer = [];
                const aTargetInputsOrg = [];
                const aTargetInputsExt = [];

                // Loop through FormElements to find input fields without 'visible' property
                aFormContainers.forEach((oFormContainerIn) => {
                    oFormContainer.push(oFormContainerIn)

                    oFormContainerIn.getFormElements().forEach((oFormElement) => {
                        oFormElement.getFields().forEach((oField) => {
                            if (inputTypes.some(type => oField instanceof type)) {
                                // Get the binding path of the 'value' property
                                const sBindingPath = oField.getBindingPath("value");

                                // Get the label text from the FormElement
                                const sLabel = oFormElement.getLabel();

                                // Check if the path contains "Org"
                                if (sBindingPath && sBindingPath.includes("Org")) {
                                    // Push both label and field into the result array
                                    aTargetInputsOrg.push({ label: sLabel, field: oField });  // Collect the input with its label
                                } else {
                                    aTargetInputsExt.push({ label: sLabel, field: oField });  // Collect the input with its label
                                }
                            }
                        });
                    });
                });
                return { aTargetInputsOrg, aTargetInputsExt, oFormContainer };
            } else {
                console.warn("Parent Form not found.");
            }
        },

        replaceOrgWithExt: function (str, number) {
            // Regular expression to match 'Org' only if it follows 'Q' followed by a number and other characters like 'Field1'
            return str.replace(/(Q\d+)(Org)(Field\d*)/g, `$1Ext${number}$3`);
        },

        applyReplaceToArrayOfObjects: function (arr, number) {
            // Loop through each object in the array
            return arr.map(obj => {
                // Loop through all keys in the object
                for (let key in obj) {
                    if (typeof obj[key] === 'string') {
                        // Apply the replace function to string values
                        obj[key] = this.replaceOrgWithExt(obj[key], number);
                    }
                }
                // obj.label = obj.label + " - " + number
                obj.label = obj.label
                return obj;
            });
        },

        getIdofFields: function (field) {
            return field.value.split('>/')[1].replace(/}/g, '') + "_id"
        },

        _createFormElement2: function (fields) {
            let oFormElementList = []

            let idEmtyElement = this.getIdofFields(fields[0])
            oFormElementList.push(new FormElement({ id: idEmtyElement, label: '', fields: [] }))

            // fields.forEach(field => {
            //     const oFormElement = new FormElement({
            //         label: field.label,
            //         fields: [
            //             new Input({
            //                 value: field.value,
            //                 valueState: field.valueState,
            //                 valueStateText: field.valueStateText,
            //                 enabled: field.enabled,
            //                 required: field.required
            //             })
            //         ]
            //     });
            //     oFormElementList.push(oFormElement)
            // });

            fields.forEach(field => {
                // Convert type to the correct module path if not already in that format
                const fieldType = field.type.replace(/\./g, "/").replace(/\.js$/, ""); // e.g., "sap.m.Input" -> "sap/m/Input"

                sap.ui.require([fieldType], ControlType => {
                    const oControl = new ControlType({
                        value: field.value,
                        valueState: field.valueState,
                        valueStateText: field.valueStateText,
                        enabled: field.enabled,
                        required: field.required,
                        placeholder: field.placeholder || "Enter value" // Default placeholder if none provided
                    });

                    // Create FormElement with dynamically created control
                    const oFormElement = new FormElement({
                        label: field.label,
                        fields: [oControl]
                    });

                    oFormElementList.push(oFormElement);
                });
            });

            // console.log({ oFormElementList })

            return oFormElementList
        },

        _createFormElement:async function (fields) {
            let oFormElementList = [];

            // Push an empty FormElement if needed
            let idEmptyElement = this.getIdofFields(fields[0]);
            oFormElementList.push(new FormElement({ id: idEmptyElement, label: '', fields: [] }));

            // Load all control types and create FormElements
            let loadPromises = fields.map(field => {
                return new Promise(resolve => {
                    const fieldType = field.type.replace(/\./g, "/").replace(/\.js$/, ""); // e.g., "sap.m.Input" -> "sap/m/Input"
                    sap.ui.require([fieldType], ControlType => {
                        const oControl = new ControlType({
                            value: field.value,
                            valueState: field.valueState,
                            valueStateText: field.valueStateText,
                            enabled: field.enabled,
                            required: field.required,
                            placeholder: field.placeholder || "Enter value" // Default placeholder if none provided
                        });

                        // Create FormElement with the dynamically created control
                        const oFormElement = new FormElement({
                            label: field.label,
                            fields: [oControl]
                        });

                        resolve(oFormElement);
                    });
                });
            });

            // Wait for all FormElements to be created and then return the list
            return Promise.all(loadPromises).then(formElements => {
                oFormElementList = oFormElementList.concat(formElements);
                // console.log({ oFormElementList });
                return oFormElementList;
            });
        },

        _addElementsToContainer:async function (oFormContainer, fields) {
            // Create dynamic form elements
            const dynamicFormElements =await this._createFormElement(fields);
 
            dynamicFormElements.forEach(oFormElement => {
                oFormContainer.addFormElement(oFormElement);
            });
        },

        // ================================== # Helper Functions # ==================================
        getFormHierarchy: function (ev) {
            let oForm = null;
            let oFormElement = null;
            let oButton = ev.getSource();

            // Traverse up the control hierarchy to find the Form and FormElement
            while (oButton) {
                // Check if the current parent is a FormElement and store it if so
                if (oButton instanceof sap.ui.layout.form.FormElement) {
                    oFormElement = oButton;
                }

                // Check if the current parent is a Form and store it, then break the loop
                if (oButton instanceof sap.ui.layout.form.Form) {
                    oForm = oButton;
                    break;
                }

                // Move up the hierarchy
                oButton = oButton.getParent();
            }

            // Return an object containing oForm, oFormElement, and the last oButton
            return { oForm, oFormElement, oButton };
        },

        getInputDetails: function (aTargetInputsOrg) {
            return aTargetInputsOrg.map(el => {
                const label = el.label
                const oField = el.field

                const oFieldDetails = this.getBindingDetails(oField);


                // oFieldDetails.enabled = oField.getEnabled();
                oFieldDetails.label = label;

                return oFieldDetails;
            });
        },

        getBindingDetails2: function (oField, dynamicProperties = ['enabled', 'required']) {
            const oBindingInfo = oField.mBindingInfos;
            // console.log({ oBindingInfo })
            const oFieldDetails = {};
            // Iterate over each binding in mBindingInfos dynamically
            for (const property in oBindingInfo) {
                const { sModelName, sPath } = this.getModelAndPath(oBindingInfo, property);

                if (sModelName && sPath) {
                    // Check if the property is in the list of dynamic properties
                    if (dynamicProperties.includes(property)) {
                        // Add the dynamic binding string for specified properties (e.g., enabled/required)
                        oFieldDetails[property] = `{= ${sModelName ? "${" + sModelName + ">" : ""}${sPath}} === 1 ? true : false }`;
                    } else {
                        // Standard binding string in the format "{modelName>path}" or "{path}" for default model
                        oFieldDetails[property] = `{${sModelName ? sModelName + ">" : ""}${sPath}}`;
                    }
                } else {
                    // If no model or path exists, set the property to null
                    oFieldDetails[property] = null;
                }
            }
            return oFieldDetails;
        },

        getBindingDetails: function (oField, dynamicProperties = ['enabled', 'required']) {
            const oBindingInfo = oField.mBindingInfos;
            // console.log({ oBindingInfo });
            const oFieldDetails = {};

            // Add placeholder if it exists
            oFieldDetails.placeholder = oField.getPlaceholder ? oField.getPlaceholder() : null;

            // Add field type (e.g., sap.m.Input, sap.m.DatePicker, etc.)
            oFieldDetails.type = oField.getMetadata().getName();

            // Iterate over each binding in mBindingInfos dynamically
            for (const property in oBindingInfo) {
                const { sModelName, sPath } = this.getModelAndPath(oBindingInfo, property);

                if (sModelName && sPath) {
                    // Check if the property is in the list of dynamic properties
                    if (dynamicProperties.includes(property)) {
                        // Add the dynamic binding string for specified properties (e.g., enabled/required)
                        oFieldDetails[property] = `{= ${sModelName ? "${" + sModelName + ">" : ""}${sPath}} === 1 ? true : false }`;
                    } else {
                        // Standard binding string in the format "{modelName>path}" or "{path}" for default model
                        oFieldDetails[property] = `{${sModelName ? sModelName + ">" : ""}${sPath}}`;
                    }
                } else {
                    // If no model or path exists, set the property to null
                    oFieldDetails[property] = null;
                }
            }
            return oFieldDetails;
        },

        getModelAndPath: function (oBindingInfo, property) {
            const bindingParts = oBindingInfo[property].parts && oBindingInfo[property].parts[0];

            if (bindingParts) {
                const sModelName = bindingParts.model || ""; // Empty string for default model
                const sPath = bindingParts.path;
                return { sModelName, sPath };
            }

            return { sModelName: null, sPath: null };
        },

        updateModelProperty: function (action, sModelName, sPath, value = '') {
            const oModel = this._currentController.getView().getModel(sModelName);
            if (!oModel) return;
            
            // Remove leading '/' if present
            sPath = sPath.replace(/^\//, '');
            
            // Get the current data from the model
            const data = oModel.getData();
            
            if (action === "delete") {
                // Delete the property from the data object if it exists
                if (data && data[sPath] !== undefined) {
                    delete data[sPath];
                }
            } else if (action === "add") {
                // Add or update the property in the data object
                data[sPath] = value;
            }
            
            // Set the modified data back to the model
            oModel.setData(data);
        },
        
        // ================================== # Helper Functions # ==================================
        
    });
});







