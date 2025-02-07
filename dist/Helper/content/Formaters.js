sap.ui.define([], function () {
    "use strict";

    return class Language {
        constructor(_controllerJS) {
            this._controllerJS = _controllerJS
        }

        init() {
        }

        convertODataDate(odataDateString) {
            // Extract the timestamp from the OData date string
            if (!odataDateString) { return new Date('2000/1/1') }
            var timestamp = parseInt(odataDateString.match(/\d+/)[0], 10);
            // Create a new JavaScript Date object using the extracted timestamp
            var dateObject = new Date(timestamp);
            // Format the date to only show the date part (e.g., "Sun Jan 17 2021")
            return dateObject.toDateString();
        }

        replaceOrgWithExt(fields) {
            return fields.map(field => {
                // Replace 'Org' with 'Ext' in the field name
                const newFieldName = field.fieldName.replace('Org', 'Ext');
                // Return the updated object with the new field name
                return {
                    ...field,
                    fieldName: newFieldName
                };
            });
        }

        replaceExtWithOrg(fields) {
            return fields.map(field => {
                // Replace 'Org' with 'Ext' in the field name
                const newFieldName = field.fieldName.replace('Ext', 'Org');
                // Return the updated object with the new field name
                return {
                    ...field,
                    fieldName: newFieldName
                };
            });
        }

        convertValuesToStrings(obj) {
            const result = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    result[key] = String(obj[key]);
                }
            }
            return result;
        }

        convertToJson(str) {
            // Step 1: Escape the inner quotes by replacing them with escaped versions
            let cleanedStr = str.replace(/"({[^}]*})"/g, function (match) {
                return match.replace(/"/g, '\\"'); // Escapes the inner double quotes
            });
            console.log("cleanedStr: ", cleanedStr)

            const result = {};

            // Iterate over the keys in the cleanedStr object
            for (const key in cleanedStr) {
                if (cleanedStr.hasOwnProperty(key)) {
                    // Parse the string value into a JSON object and assign it to the key
                    result[key] = JSON.parse(cleanedStr[key]);
                }
            }

            return result;

            // Step 2: Parse the cleaned string into a JSON object
            return JSON.parse(cleanedStr);
        }

        filterObjectByKeys(obj, keysArray) {
            // console.log("filterObjectByKeys -> obj: ", obj)
            // console.log("filterObjectByKeys -> keysArray: ", keysArray)

            return Object.keys(obj)
                ?.filter((key) => keysArray?.includes(key)) // Check if the key exists in the array
                ?.reduce((result, key) => {
                    result[key] = obj[key]; // Add the key-value pair to the result
                    return result;
                }, {});
        }

        transformObject(inputObj) {
            const transformedObj = {};

            for (const [key, value] of Object.entries(inputObj)) {
                const newValue = Object.entries(value).reduce((acc, [subKey, subValue]) => {
                    acc[subKey] = subValue; // Keep subKey as-is
                    return acc;
                }, {});

                // Replace Ans9 with Ans1 and stringify the value
                transformedObj[key.replace("Ans9", "Ans1")] = JSON.stringify(newValue);
            }

            return transformedObj;
        }

        transformAnsObject(inputObj) {
            const transformedObj = {};

            for (const [key, value] of Object.entries(inputObj)) {
                const serializedValue = JSON.stringify(value); // Convert the nested object to a JSON string
                transformedObj[key] = serializedValue; // Assign the serialized value to the same key
            }

            return transformedObj;
        }

        transStrDataToJson(data) {
            return data.map(item =>
                Object.keys(item).reduce((acc, key) => {
                    acc[key] = key.match(/^Ans(\d+)$/) ? JSON.parse(item[key]) : item[key];
                    return acc;
                }, {})
            );
        }

        async enrichUsersWithInfo(array, getUserInfoCallback) {
            for (const item of array) {
                const userId = item.UserID;
                const userInfo = await getUserInfoCallback.bind(this._controllerJS)(userId); // Assuming this returns an object

                // Modify the item object directly
                Object.assign(item, userInfo); // This will add/merge the userInfo into the item
            }
            return array;
        }

        getYearsList(startYear) {
            const currentYear = new Date().getFullYear();
            let years = [];

            for (let year = startYear; year <= currentYear; year++) {
                years.push(year);
            }

            return years;
        }

        transformFields(selectedSecondformData) {
            return Object.entries(selectedSecondformData).reduce((acc, [key, value]) => {
                // Extract QNumber, Type (Org or Ext), and field number
                const match = key.match(/(Q\d+)(Org|Ext(\d+))Field(\d+)/);

                if (match) {
                    const [_, qNumber, type, extNum, fieldNum] = match;

                    const AnsNumber = qNumber?.replace("Q", "Ans");

                    // Initialize the QNumber group if it doesn't exist
                    if (!acc[AnsNumber]) {
                        acc[AnsNumber] = {};
                    }

                    // Determine the type group (Org or ExtX)
                    const typeGroup = type === "Org" ? "Org" : `Ext${extNum}`;

                    // Initialize the type group if it doesn't exist
                    if (!acc[AnsNumber][typeGroup]) {
                        acc[AnsNumber][typeGroup] = {};
                    }

                    // Add the field to the appropriate group with its field number (e.g., Q1, Q2)
                    acc[AnsNumber][typeGroup][`Q${fieldNum}`] = value;
                }

                return acc;
            }, {});
        }

        getQuestionData(obj) {
            const result = {
                Q1: 0,
                Q2: 0,
                Q3: 0,
                Q4: 0,
                Q5: 0,
                Q6: 0,
                Q7: 0,
                Q8: 0,
                Q9: 0,
            };

            // Iterate through Ans1 to Ans9 keys
            for (let i = 1; i <= 9; i++) {
                const ansKey = `Ans${i}`;
                const ansValue = obj[ansKey];

                // If the Ans value is not null or undefined, set corresponding Q key to 1
                if (ansValue !== null && ansValue !== undefined) {
                    result[`Q${i}`] = 1;
                }
            }

            return result;
        }


        getAnsKeys(obj) {
            return Object.keys(obj).filter(key => /^Ans\d+$/.test(key));
        }

        groupByYearAndMonth(obj) {
            const result = {};

            Object.keys(obj).forEach(key => {
                const item = obj[key];
                const createdAt = new Date(item.createdAt);
                const year = createdAt.getFullYear();
                const month = createdAt.toLocaleString('default', { month: 'long' });

                if (!result[year]) {
                    result[year] = [];
                }

                // Check if month already exists for that year
                const existingMonth = result[year].find(monthObj => monthObj.Month === month);
                if (existingMonth) {
                    existingMonth.numberSubmitted += 1;  // Increment submission count for the existing month
                } else {
                    result[year].push({ Month: month, numberSubmitted: 1 });
                }
            });

            return result;
        }

        formatValue(q4Value, localData) {
            // Find the matching entry in JobNature where the key matches q4Value
            const jobNatureEntry = localData.JobNature.find(entry => entry.key === q4Value);

            // Return the corresponding text if found, otherwise return the original value
            return jobNatureEntry ? jobNatureEntry.text : q4Value;
        }
    };
});
