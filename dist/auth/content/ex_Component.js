sap.ui.define([
    "${ez5.appName}/${ez5.packageName}/auth/UserFromShell",
    "${ez5.appName}/${ez5.packageName}/auth/GetUserSF",
    "${ez5.appName}/${ez5.packageName}/auth/Auth",
], (UserFromShell, GetUserSF, Auth) => {
    "use strict";


    return UIComponent.extend("${ez5.appName}.Component", {
        async init() {
            // ==========## Get User ##========== //
            // ## User Id And Rule
            this.userInfo = {}
            this.userFromShell = new UserFromShell(this)
            const { userId, rules } = await this.userFromShell.getUserIdAndRole();
            if (!userId) { return null }

            // ## User Info
            this.getUserSF = new GetUserSF(this);
            const userInfo = await this.getSlcUserInfo(userId)
            this.userInfo = userInfo[0]
            this.userInfo['rules'] = rules
            this.setModel(new sap.ui.model.json.JSONModel(this.userInfo), 'userModel')


            // ==========## RoleManager - AccessControl (auth) ##========== //
            // ## Auth
            this.auth = new Auth(this);
            await this.auth.start(this.userInfo, this.userInfo['rules']); // Set the user roles
            this.getRouter().attachRouteMatched(this.auth._onRouteMatched, this.auth); // for insure the user have access (Rules)

            // filter Nav List
            this.auth.setFiteredNavList(modelsData, modelsJson, this.userInfo.rules)

        },

        // ==========## Get User ##========== //
        async getSlcUserInfo(userId) {
            return await this.getUserSF.getSlcUsers(userId)
        },

        // ==========## Get User ##========== //
        async getAllUserInfo() {
            return await this.getUserSF.getAllUsers()
        },
    });
});