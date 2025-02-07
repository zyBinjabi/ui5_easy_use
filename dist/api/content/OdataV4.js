sap.ui.define(["sap/m/MessageBox"], function (MessageBox) {
    "use strict";

    return class OdataV4 {
        constructor(_controllerJS) {
            this._controllerJS = _controllerJS
        }

        init() {
        }

        /* 
            ODATA V4 API Calls Blog Step -By- Step Guide
            https://community.sap.com/t5/technology-blogs-by-sap/implementing-crud-operations-in-odata-v4/ba-p/13572508
            @READ Operation: Fetch Data using List Binding with parameters
            @Mohammad Sohail(sohail9744): Example for GetCALL
            const filters = [
            new Filter("status", FilterOperator.EQ, "active"),
            new Filter("category", FilterOperator.EQ, "technology")
            ];
            
            const data = await GetCall(model, "MyEntitySet", 0, 10, filters);
            */

        async GET(
            model,
            entitySet,
            filters,
            select,
            expand,
            skip,
            top
        ) {
            const queryOptions = {};

            if (expand) queryOptions.$expand = expand;
            if (select) queryOptions.$select = select;

            const listBinding = model.bindList(
                entitySet,
                undefined,
                undefined,
                filters || undefined,
                queryOptions
            );

            try {
                const contexts = await listBinding.requestContexts(skip || 0, top || 100000000);
                const data = contexts.map(function (context) {
                    return context.getObject();
                });

                // Log the data to the console for verification
                console.log(` (entitySet: ${entitySet}) - Fetched Data: `, data);

                // Return the data if further processing is needed
                return data;
            } catch (error) {
                console.error("Error fetching data:", error);
                new sap.m.MessageBox.error(error.cause?.message || "An error occurred while fetching data.");

                // Rethrow the error to ensure the promise rejects
                throw error;
            }
        }

        async GETExtr(oModel, entitySet, oParameters ) {
            // Ensure the model is available
            if (!oModel) {
                throw new Error("OData model is not available.");
            }

            const oActionODataContextBinding = oModel.bindContext(`/${entitySet}(...)`);

            oParameters.forEach(element => {
                oActionODataContextBinding.setParameter(`${element.key}`, `${element.value}`);
            });


            try {
                await oActionODataContextBinding.execute();
                const jobData = oActionODataContextBinding.getBoundContext();
                let datas = jobData.getObject().value;

                console.log(`${entitySet} |-_-| Datas: `, datas)

                return datas
            } catch (error) {
                console.error("Failed to fetch roles Details", error);
            }
        }


        // CREATE Operation: Add a New Entry
        async POST(model, entitySet, newData) {
            const listBinding = model.bindList(entitySet);

            Object.keys(newData).forEach(key => {
                console.log(`Key: ${key}, Type: ${typeof newData[key]}`);
            });

            if (newData.DateOfJoining instanceof Date) {
                console.log("DateOfJoining is a Date object");
            } else {
                console.log("DateOfJoining is NOt a Date object");

            }

            try {
                return await listBinding.create(newData);
                new sap.m.MessageToast.show("Record created successfully!");
            } catch (error) {
                new sap.m.MessageBox.error(error?.message);
            }
        }

        // UPDATE Operation: Update an Entry by ID
        async PUT(model, entitySet, aFilter, updatedData) {
            try {
                let oBindList = model.bindList(entitySet);
                oBindList
                    .filter(aFilter)
                    .requestContexts()
                    .then(function (aContexts) {
                        const oContext = aContexts[0]; // The context of the entity to update
                        Object.entries(updatedData).forEach(function ([key, value]) {
                            oContext.setProperty(key, value);
                        });
                        new sap.m.MessageToast.show("Record Updated successfully!");
                    });
            } catch (error) {
                new sap.m.MessageBox.error(error?.message);
                console.error("Error updating entry in " + entitySet + ":", error);
            }
        }

        // DELETE Operation: Delete an Entry by ID
        async DELETE(model, entitySet, aFilter) {
            try {
                // Bind the list with the specified entity set and filters
                const oBindList = model.bindList(entitySet, undefined, undefined, aFilter);

                // Request the context for the filtered entry
                const aContexts = await oBindList.requestContexts();

                if (aContexts.length > 0) {
                    const oContext = aContexts[0];

                    // Perform the delete operation
                    await oContext.delete();
                    new sap.m.MessageToast.show("Record Deleted Successfully!");
                } else {
                    new sap.m.MessageToast.show("No matching record found.");
                }
            } catch (error) {
                new sap.m.MessageBox.error("Error deleting entry: " + error.message);
                console.error("Error deleting entry from " + entitySet + ":", error);
            }
        }

        // fetch POST CALL
        async FETCH_POST(url, newData) {
            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newData),
                });
                let res = await response.json();
                if (!response.ok) {
                    new sap.m.MessageBox.error(`Status ${res.error.code} - ${res.error.message}`);
                    return null;
                }
                return res;
            } catch (error) {
                new sap.m.MessageBox.error(error.message);
            }
        };

        // trigar

    };
});
