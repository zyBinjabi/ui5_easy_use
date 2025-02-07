sap.ui.define(["${ez5.appName}/${ez5.packageName}/api/OdataV4"], function (OdataV4) {
    "use strict";

    return class UserFromShell {
        constructor(_componentJS) {
            this._componentJS = _componentJS
            this.odataV4 = new OdataV4()
        }


        // User (Auth - Rules) Section ........
        getUserIdFromUshell() {
            let userEmail = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("UserInfo")
                ? sap.ushell.Container.getService("UserInfo").getEmail()
                : null;
            return userEmail?.includes('@') ? userEmail.split('@')[0] : userEmail;
        }

        async getUserIdAndRole() {
            const userId = this._componentJS.env.zVars.isProduction
                ? this.getUserIdFromUshell() || null
                : this._componentJS.env.zVars.userId;

            const rules = this._componentJS.env.zVars.isProduction
                ? await this.getUserRules(userId) // Properly await the function call
                : this._componentJS.env.zVars.rules;

            console.log("isProduction: ", this._componentJS.env.zVars.isProduction)
            console.log("userId: ", userId)
            console.log("rules: ", rules)

            return { userId, rules };
        }

        async getUserRules(userId) {
            const oModel = this._componentJS.getModel(); // Get the OData model
            const entitySet = "/Access_UserSet"; // Replace with your entity set
            const filters = []; // Add your filters if needed
            const select = ""; // Add fields to select if needed
            const expand = null; // Add $expand if needed


            // Initialize default user roles
            let userRoles = new Set(["normal"]);

            // // Initialize CRUD service

            try {
                // Fetch Access_UserSet for the current user and appId
                const accessUserSet = await this.odataV4.GET(oModel, entitySet, filters, select, expand, 0, 50);

                const accessUser = accessUserSet?.find(el =>
                    el.appId === "4" && el.userId === userId
                );

                // Add roles based on accessUser permissions
                if (accessUser) {
                    if (accessUser.admin) userRoles.add("admin");
                    if (accessUser.report) userRoles.add("report");
                }
            } catch (error) {
                console.error("Error fetching user access permissions:", error);
            }

            return Array.from(userRoles);
        }





    };
});
