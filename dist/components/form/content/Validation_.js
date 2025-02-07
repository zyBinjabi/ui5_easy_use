sap.ui.define([], function () {
    "use strict";
    return class Validator {
        constructor(_controllerJS, autoG) {
            this._controllerJS = _controllerJS; // Array of rules [["fieldName", "rulesString"], ...]
            this.autoG = autoG; // Array of rules [["fieldName", "rulesString"], ...]
        }

        validate(inputData) {
            const valueStatus = {};
            // Loop through autoG and validate each field
            this.autoG.forEach(({ fieldName, rules, cMessage }) => {
                const fieldValue = inputData[fieldName];
                const ruleList = rules?.split("|");
                const customMessages = cMessage?.split("|");
                let valueState = "Success";
                let valueStateText = [];
                const ERROR_MESSAGES = {
                    REQUIRED: customMessages?.[0] || "Required field!",
                    MAX_LENGTH: length => customMessages?.[1] || `Max length: ${length}`,
                    MIN_LENGTH: length => customMessages?.[2] || `Min length: ${length}`,
                    INVALID_LANG: lang => customMessages?.[3] || `Only ${lang === "en" ? "English" : lang === "ar" ? "Arabic" : lang} characters are allowed!`,
                    MUST_BE_NUMBER: customMessages?.[4] || "Must be a number!",
                    MUST_BE_TEXT: customMessages?.[5] || "Must be a valid text!",
                    INVALID_PERCENTAGE: customMessages?.[6] || "Value must be between 5% and 100%!",
                    INVALID_EMAIL: customMessages?.[7] || "Invalid email format!"
                };
                ruleList?.forEach((rule, index) => {
                    let errorMessage = "";
                    if (rule.startsWith("required") && this.isRequiredInvalid(fieldValue)) {
                        errorMessage = ERROR_MESSAGES.REQUIRED;
                    } else if (rule.startsWith("max-") && this.isMaxLengthInvalid(fieldValue, rule)) {
                        const maxLength = rule.split("-")[1];
                        errorMessage = ERROR_MESSAGES.MAX_LENGTH(maxLength);
                    } else if (rule.startsWith("min-") && this.isMinLengthInvalid(fieldValue, rule)) {
                        const minLength = rule.split("-")[1];
                        errorMessage = ERROR_MESSAGES.MIN_LENGTH(minLength);
                    } else if (rule.startsWith("lang-") && this.isLangInvalid(fieldValue, rule)) {
                        const lang = rule.split("-")[1];
                        errorMessage = ERROR_MESSAGES.INVALID_LANG(lang);
                    } else if (rule === "number" && this.isNumberInvalid(fieldValue)) {
                        errorMessage = ERROR_MESSAGES.MUST_BE_NUMBER;
                    } else if (rule === "text" && this.isTextInvalid(fieldValue)) {
                        errorMessage = ERROR_MESSAGES.MUST_BE_TEXT;
                    } else if (rule === "percentage" && this.isPercentageInvalid(fieldValue)) {
                        errorMessage = ERROR_MESSAGES.INVALID_PERCENTAGE;
                    } else if (rule === "email" && this.isEmailInvalid(fieldValue)) {
                        errorMessage = ERROR_MESSAGES.INVALID_EMAIL;
                    }
                    if (errorMessage) {
                        valueState = "Error";
                        valueStateText.push(errorMessage);
                    }
                });
                valueStatus[fieldName] = {
                    valueState,
                    valueStateText: valueStateText.join(" - "),
                };
            });
            return valueStatus;
        }

        // New percentage validation method
        isPercentageInvalid(value) {
            const numericValue = typeof value === "string" ? parseFloat(value.replace('%', '')) : value;
            return isNaN(numericValue) || numericValue < 5 || numericValue > 100;
        }

        isRequiredInvalid(fieldValue) {
            return (
                fieldValue === undefined ||
                fieldValue === null ||
                (typeof fieldValue === "string" && fieldValue.trim() === "")
            );
        }

        isMaxLengthInvalid(fieldValue, rule) {
            const maxLength = parseInt(rule.split("-")[1]);
            return fieldValue && fieldValue.length > maxLength;
        }

        isMinLengthInvalid(fieldValue, rule) {
            const minLength = parseInt(rule.split("-")[1]);
            return fieldValue && fieldValue.length < minLength;
        }

        isLangInvalid(fieldValue, rule) {
            const lang = rule.split("-")[1];
            if (lang === "en") {
                return /[^a-zA-Z\s]/.test(fieldValue); // Checks for non-English characters
            } else if (lang === "ar") {
                return /[^\u0600-\u06FF\s]/.test(fieldValue); // Checks for non-Arabic characters
            }
            return false; // No invalid characters for unsupported or undefined languages
        }

        isNumberInvalid(fieldValue) {
            return isNaN(fieldValue);
        }

        isTextInvalid(fieldValue) {
            if (typeof fieldValue !== "string" || fieldValue.trim() === "") {
                return true; // Not a string or empty string
            }
            // Check for any characters other than English or Arabic letters and spaces
            if (/[^a-zA-Z\s\u0600-\u06FF]/.test(fieldValue)) {
                return true; // Invalid if it contains any numbers or special characters
            }
            return false; // Valid if it contains only valid characters
        }

        // Email validation method
        isEmailInvalid(fieldValue) {
            if (!fieldValue) return true; // Empty or undefined values are invalid
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return !emailRegex.test(fieldValue);
        }

        hasErrors(valueStatus) {
            return Object.values(valueStatus).some(status => status.valueState === "Error");
        }
    }
});

// const inputData = {
//     emailField: "invalid-email",
//     nameField: "John Doe"
// };

// const autoG = [
//     { fieldName: "emailField", rules: "required|email", cMessage: "Email is required|Please enter a valid email!" },
//     { fieldName: "nameField", rules: "required|min-3", cMessage: "Name is required|Name must be at least 3 characters long!" }
// ];

// const validator = new Validator(null, autoG);
// const validationResults = validator.validate(inputData);

// console.log(validationResults);