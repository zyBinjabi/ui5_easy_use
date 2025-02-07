sap.ui.define([], function () {
    "use strict";

    return class Language {
        constructor(_controllerJS) {
            this._controllerJS = _controllerJS
        }

        async onInit() {
            //  ====================== ## oDataV4 ## ======================
            this.oDatav4 = new oDataV4(this)

        }

        // ================================== # GET # ==================================
        async GET() {
            const oModel = this.getOwnerComponent().getModel(); // Get the OData model
            const entitySet = "/DisclosureForms"; // Replace with your entity set
            const filters = []; // Add your filters if needed
            const select = "UserID,Status"; // Add fields to select if needed
            const expand = null; // Add $expand if needed

            try {
                const data = await this.oDatav4.GET(oModel, entitySet, filters, select, expand, 0, 50);
                console.log("Data received in controller:", data);
            } catch (error) {
                console.error("Error while fetching data:", error);
            }
        }

        // ================================== # Post # ==================================
        async Post() {
            // API Part (Post)
            const oModel = this.getOwnerComponent().getModel(); // Get the OData model
            const entitySet = "/DisclosureForms"; // Target entity set
            const sendData = {
                Status: "Created",
                IsActive: true
            }

            try {
                await this.oDatav4.POST(oModel, entitySet, sendData);

                // Show success message
                sap.m.MessageToast.show("Form submitted successfully!", {
                    duration: 3000, // Duration of the message in milliseconds
                    width: "20em",  // Optional: Adjust the width of the message toast
                    my: "center center", // Positioning on the screen
                    at: "center center" // Positioning on the screen
                });
            } catch (error) {
                console.error("Error while fetching data:", error);
            }
        }
    });
