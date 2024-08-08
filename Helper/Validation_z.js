sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("practice.controller/Helper/Validation_z", {

        onInit: function () {
            // this._view = this.getView();
        },
        
        startValidation: function (fieldsName, rulesArrName, oPayload) {
            // fieldsName, rulesArrName, oPayload
            let rules = this.setRules(fieldsName, rulesArrName);
            let errs = this.validateFields(oPayload, rules);
            let setvalueStateValues = this.setvalueState(fieldsName, errs);
            let isErr = errs.length !==0
            return {isErr, setvalueStateValues}
        },

        setRules: function (fieldsName, rulesArrName) {
            const rules = {};

            fieldsName.forEach(Field => {
                rulesArrName.forEach(rulName => {
                    if (rulName.arr.includes(Field)) {
                        rules[Field] = rules[Field] === undefined ? rulName.name : rules[Field] + ',' + rulName.name;
                    }
                });
            });
            return rules;
        },

        validateFields: function (data, rules) {
            const errors = [];
            for (const key in data) {
                if (data.hasOwnProperty(key) && rules[key]) {
                    const ruleList = rules[key].split(',').map(item => item.trim());

                    ruleList.forEach(rule => {
                        const ruleDetails = this.getRuleDetails(rule);
                        if (ruleDetails.validationFunction && ruleDetails.validationFunction(data[key])) {
                            errors.push({ [key]: ruleDetails.errorMessage });
                        }
                    });
                }
            }
            return errors;
        },

        getRuleDetails: function (rule) {
            switch (rule) {
                case 'required':
                    return {
                        validationFunction: (value) => value === null || value === undefined || value === '',
                        errorMessage: "Required field!"
                    };
                case 'enText':
                    return {
                        validationFunction: (value) => !/^[a-zA-Z\s]*$/.test(value),
                        errorMessage: "Should be English!"
                    };
                // Add more cases for other rules as needed
                default:
                    return {
                        validationFunction: null,
                        errorMessage: ""
                    };
            }
        },

        setvalueState: function (fieldsName, errs) {
            let initialState = {};

            // Loop through each error
            errs.forEach(err => {
                // Loop through each key in the error object
                for (const key in err) {
                    if (err.hasOwnProperty(key)) {
                        // Initialize initialState[key] if it doesn't exist
                        if (!initialState[key]) {
                            initialState[key] = {};
                        }
                        // Set valueState and valueStateText for the key
                        initialState[key]['valueState'] = "Error";
                        initialState[key]['valueStateText'] = err[key];
                    }
                }
            });

            // Set valueState to "None" for fields not in errors
            fieldsName.forEach(field => {
                if (!initialState[field]) {
                    initialState[field] = {
                        valueState: "None",
                        valueStateText: ""
                    };
                }
            });

            return initialState;
        },

        // Placeholder function to match the usage in the class. Implement this method according to your needs.
        getObj: function () {
            // Implement this method to return the appropriate object structure.
            return {};
        }
    });
});
