// sap.ui.define(["${ez5.appName}/${ez5.packageName}/api/OdataV4"], function (OdataV4) {
//     "use strict";

//     return class GetUserSF {
//         constructor(_controllerJS) {
//             this._controllerJS = _controllerJS

//             this.odataV4 = new OdataV4(_controllerJS)
//         }

//         async validatingUser(userId) {
//             // Get the OData model from the view
//             const oModel = this._controllerJS.getModel();

//             // Ensure the model is available
//             if (!oModel) {
//                 throw new Error("OData model is not available.");
//             }

//             // Bind the action context
//             const oActionODataContextBinding = oModel.bindContext("/sfUser(...)");

//             // Set the action parameter
//             oActionODataContextBinding.setParameter("userId", userId);

//             // Execute the action

//             try {
//                 await oActionODataContextBinding.execute();
//                 const jobData = oActionODataContextBinding.getBoundContext();
//                 // console.log("jobData Obj", jobData)

//                 let datas = jobData.getObject().value;
//                 console.log("Full User: ", datas)

//                 // console.log("Full User Info: ", data)


//                 // this.inspectNestedKeys(data);

//                 // const keysList = this.collectKeys(data);
//                 // console.log(keysList);

//                 const usersInfo = datas.map(data => ({
//                     userId: data?.userId,
//                     userEmail: data?.username,
//                     userLocation: data?.city,
//                     userName: data?.displayName,
//                     position: data?.title,
//                     payGrade: data?.payGrade,
//                     department: data?.division,
//                     section: data?.department,
//                     location: data?.city,
//                     managerName: data?.manager?.displayName,
//                     managerId: data?.manager?.userId,
//                     managerEmail: data?.manager?.username,
//                     nationality: data?.nationality,
//                     national_id: data?.nationalId?.d?.results[0]?.nationalId,
//                     hireDate: data?.hireDate,
//                     status: data?.satus
//                 }));

//                 return usersInfo
//             } catch (error) {
//                 console.error("Failed to fetch roles Details", error);
//             }
//         }

//         inspectNestedKeys(obj, parentKey = '') {
//             // If the value is null or undefined, print it explicitly
//             if (obj === null) {
//                 console.log(`Key: ${parentKey}, Value: null`);
//             } else if (obj === undefined) {
//                 console.log(`Key: ${parentKey}, Value: undefined`);
//             }
//             // If the value is an object and not an array, recursively inspect it
//             else if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
//                 Object.entries(obj).forEach(([key, value]) => {
//                     const fullKey = parentKey ? `${parentKey}.${key}` : key; // Create full key path
//                     this.inspectNestedKeys(value, fullKey); // Recursively inspect nested object
//                 });
//             }
//             // For non-object values, just print the key-value pair
//             else {
//                 console.log(`Key: ${parentKey}, Value: ${obj}`);
//             }
//         }

//         collectKeys(obj, parentKey = '', keys = []) {
//             if (obj === null || obj === undefined) {
//                 keys.push(parentKey);
//             } else if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
//                 Object.entries(obj).forEach(([key, value]) => {
//                     const fullKey = parentKey ? `${parentKey}.${key}` : key;
//                     this.collectKeys(value, fullKey, keys); // Recursively collect keys
//                 });
//             } else {
//                 keys.push(parentKey); // Collect key for non-object values
//             }
//             return keys;
//         }


//         init() {
//         }

//     };
// });

sap.ui.define(["${ez5.appName}/${ez5.packageName}/api/OdataV4"], function (OdataV4) {
    "use strict";

    return class GetUserSF {
        constructor(_controllerJS) {
            this._controllerJS = _controllerJS

            this.odataV4 = new OdataV4(_controllerJS)
        }


        async getAllUsers() {
            // Get the OData model from the view
            const oModel = this._controllerJS.getModel();

            const datas = await this.odataV4.GETExtr(oModel, "sfUserM", [])
            return datas[0]?.d?.results || datas

        }


        async getSlcUsers(userId) {
            // Get the OData model from the view
            const oModel = this._controllerJS.getModel();

            let datas = await this.odataV4.GETExtr(oModel, "sfUser", [{ key: "userId", value: userId }])
            datas = datas[0]?.d?.results || datas

            let perNationalId = await this.odataV4.GETExtr(oModel, "perNationalId", [{ key: "personIdExternal", value: userId }])
            perNationalId = perNationalId[0]?.d?.results || perNationalId

            const nationalId = perNationalId[0].nationalId

            const usersInfo = datas.map(data => ({
                userId: data?.userId,
                userEmail: data?.username,
                userLocation: data?.city,
                userName: data?.displayName,
                position: data?.title,
                payGrade: data?.payGrade,
                department: data?.division,
                section: data?.department,
                location: data?.city,
                managerName: data?.manager?.displayName,
                managerId: data?.manager?.userId,
                managerEmail: data?.manager?.username,
                nationality: data?.nationality,
                national_id: nationalId,
                hireDate: data?.hireDate,
                status: data?.satus,
                businessPhone: data?.businessPhone || data?.homePhone || data?.cellPhone
            }));

            return usersInfo
        }

        inspectNestedKeys(obj, parentKey = '') {
            // If the value is null or undefined, print it explicitly
            if (obj === null) {
                console.log(`Key: ${parentKey}, Value: null`);
            } else if (obj === undefined) {
                console.log(`Key: ${parentKey}, Value: undefined`);
            }
            // If the value is an object and not an array, recursively inspect it
            else if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
                Object.entries(obj).forEach(([key, value]) => {
                    const fullKey = parentKey ? `${parentKey}.${key}` : key; // Create full key path
                    this.inspectNestedKeys(value, fullKey); // Recursively inspect nested object
                });
            }
            // For non-object values, just print the key-value pair
            else {
                console.log(`Key: ${parentKey}, Value: ${obj}`);
            }
        }

        collectKeys(obj, parentKey = '', keys = []) {
            if (obj === null || obj === undefined) {
                keys.push(parentKey);
            } else if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
                Object.entries(obj).forEach(([key, value]) => {
                    const fullKey = parentKey ? `${parentKey}.${key}` : key;
                    this.collectKeys(value, fullKey, keys); // Recursively collect keys
                });
            } else {
                keys.push(parentKey); // Collect key for non-object values
            }
            return keys;
        }


        init() {
        }

    };
});
