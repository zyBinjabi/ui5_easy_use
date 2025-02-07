sap.ui.define([
    "sap/ui/core/UIComponent",
    "${ez5.appName}/model/models",
    "${ez5.appName}/${ez5.packageName}/auth/Auth",
    "${ez5.appName}/${ez5.packageName}/i18n/Language",
    "${ez5.appName}/${ez5.packageName}/auth/GetUserSF",
    "${ez5.appName}/${ez5.packageName}/Helper/Env",
    "${ez5.appName}/${ez5.packageName}/auth/UserFromShell",
    "${ez5.appName}/${ez5.packageName}/initapp/LoadJson",
], (UIComponent, models, Auth, Language, GetUserSF, Env, UserFromShell, LoadJson) => {
    "use strict";


    return UIComponent.extend("${ez5.appName}.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        async init() {
            // ## call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // ## set the device model
            this.setModel(models.createDeviceModel(), "device");


            // ==========## Get Env ##========== //
            this.env = new Env(this) // Env
            this.env.init()


            // ==========## Get Models ##========== //
            const sNamespace = "${ez5.appName}"; // Replace with your application namespace
            const loadJson = new LoadJson(this, sNamespace)
            const { modelsJson, modelsData } = await loadJson.getModel(sNamespace)


            // ==========## Get User ##========== //
            // ## User Id And Rule
            this.userInfo = {}
            if (this.env.zVars.isProduction) {
                this.userFromShell = new UserFromShell(this)
                const { userId, rules } = await this.userFromShell.getUserIdAndRole();

                if (!userId) { return null }

                // ## User Info
                this.getUserSF = new GetUserSF(this);
                const userInfo = await this.getSlcUserInfo(userId)
                this.userInfo = userInfo[0]
                this.userInfo['rules'] = rules
            } else {
                this.userInfo = { userId: "20413", rules: ['normal', 'admin'] }
            }


            // ==========## RoleManager - AccessControl (auth) ##========== //
            // ## Auth
            this.auth = new Auth(this);
            await this.auth.start(this.userInfo, this.userInfo['rules']); // Set the user roles
            this.getRouter().attachRouteMatched(this.auth._onRouteMatched, this.auth); // for insure the user have access (Rules)

            // filter Nav List
            this.auth.setFiteredNavList(modelsData, modelsJson, ["normal"]) // for initial normal just

            // filter Nav List
            this.auth.setFiteredNavList(modelsData, modelsJson, this.userInfo.rules)


            // ==========## Language ##========== //
            this.language = new Language(this)
            await this.language.init()
            this.language.replaceModelsJson(modelsJson)

            // ## enable routing
            this.getRouter().initialize();
        },

        // ==========## Language ##========== //
        onChangeLanguage: function () { // ## Language ============
            return this.language.onChangeLanguage()
        },

        // ==========## Get User ##========== //
        getSlcUserInfo: async function (userId) {
            return await this.getUserSF.getSlcUsers(userId)
        },

        // ==========## Get User ##========== //
        getAllUserInfo: async function () {
            return await this.getUserSF.getAllUsers()
        },

    });
});