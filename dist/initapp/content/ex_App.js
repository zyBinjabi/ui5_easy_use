sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/tnt/ToolPage",
    "sap/ui/core/routing/Router",
    "sap/ui/core/Fragment",
    "sap/ui/core/Configuration",
  ],
  function (Controller,
    UIComponent,
    ToolPage,
    Router,
    Fragment,
    Configuration,
  ) {
    "use strict";

    return Controller.extend("${ez5.appName}.controller.App", {
      onInit: function () {
        const pageId = this.getView().getId();
        console.log("pageId :", pageId)
        this.isDarkMode = true;
        this.onToggleTheme();
        this.onMenuButtonPress();

        // this.oMyAvatar = this.oView.byId("Avatar_id");
        // this._oPopover = Fragment.load({
        //   id: this.oView.getId(),
        //   name: "${ez5.appName}.fragment.auth.Popover",
        //   controller: this
        // }).then(function (oPopover) {
        //   this.oView.addDependent(oPopover);
        //   this._oPopover = oPopover;
        // }.bind(this));

        // this.onInitXX()
      },

      onItemSelect: function (ev) {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo(ev.getParameter('item').getKey())
      },

      onToggleTheme: function () {
        if (this.isDarkMode) {
          Configuration.setTheme("sap_horizon"); // Set to normal theme
          this.byId("themeToggleButton").setTooltip("Switch to Dark Mode");
          this.byId("themeToggleButton").setIcon("sap-icon://light-mode");
        } else {
          Configuration.setTheme("sap_horizon_dark"); // Set to dark theme
          this.byId("themeToggleButton").setTooltip("Switch to Light Mode");
          this.byId("themeToggleButton").setIcon("sap-icon://dark-mode");
        }
        this.isDarkMode = !this.isDarkMode;
      },

      onMenuButtonPress: function () {
        var toolPage = this.byId('toolPage');
        if (toolPage) {
          toolPage.setSideExpanded(!toolPage.getSideExpanded());
        }
      },

      onChangeLanguage: function () {
        // Step 1: Get the new language (assuming you get it from somewhere)
        let sNewLanguage = this.getOwnerComponent().onChangeLanguage();


        // Optional Step 6: Trigger re-render of current view (if needed)
        // const oView = this.getView();
        // if (oView) {
        //   oView.invalidate();
        // }
      },


      // ====================== for dev eara (Production = false) ======================
      onInitXX: function () {
        // Create a new JSONModel and load the navList.json file
        var oJSONModel = new sap.ui.model.json.JSONModel();
        oJSONModel.loadData("model/navList.json");

        // Attach the loaded event to process the data once the JSON is loaded
        oJSONModel.attachRequestCompleted(function () {
          // After the JSON model is loaded, we can access the data
          var oData = oJSONModel.getData(); // Get the raw data from the JSON model

          console.log("oData: ", oData)


          // Set the OData model to the view (alias 'odata')
          this.getView().setModel(oData, "navList");
        }, this); // "this" refers to the controller context
      },



      // ====================== for dev eara (Production = false) ======================
      onPressAvatar: function (oEvent) {
        var oEventSource = oEvent.getSource(),
          bActive = this.oMyAvatar.getActive();

        this.oMyAvatar.setActive(!bActive);

        if (bActive) {
          this._oPopover.close();
        } else {
          this._oPopover.openBy(oEventSource);
        }
      },

      onPopoverClose: function () {
        this.oMyAvatar.setActive(false);
      },

      onListItemPress: function () {
        this.oMyAvatar.setActive(false);
        this._oPopover.close();
      },

    });
  }
); 