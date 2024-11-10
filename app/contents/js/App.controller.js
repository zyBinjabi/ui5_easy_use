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
    Configuration) {
    "use strict";

    return Controller.extend("internal.controller.App", {
      onInit: async function () {
        console.log("App -> Start")
        this.oView = this.getView();
        this.oView?.byId('App_id').setBusy(true)

        // Wait for the Component's initialization promise to resolve
        await this.getOwnerComponent().getInitializationPromise();

        //-----------Toggle Theme Part---------
        this.isDarkMode = false;
        this.onToggleTheme();

        this.oMyAvatar = this.oView.byId("Avatar_id");
        this._oPopover = Fragment.load({
          id: this.oView.getId(),
          name: "internal.fragment.auth.Popover",
          controller: this
        }).then(function (oPopover) {
          this.oView.addDependent(oPopover);
          this._oPopover = oPopover;
        }.bind(this));


        this.oView?.byId('App_id').setBusy(false)
        console.log("App -> Finsh")

      },


      // onBeforeRendering: function () {
      //   console.log("App -> onBeforeRendering-----------------------")
      //   // Manipulate the view elements before rendering
      // },

      onAfterRendering: function () {
        this.onMenuButtonPress();
      },

      onMenuButtonPress: function () {
        var toolPage = this.byId('toolPage');
        if (toolPage) {
          toolPage.setSideExpanded(!toolPage.getSideExpanded());
        }
      },

      onToggleTheme: function () {
        if (!this.isDarkMode) {
          Configuration.setTheme("sap_horizon"); // Set to normal theme
          this?.byId("themeToggleButton")?.setTooltip("Switch to Dark Mode");
          this?.byId("themeToggleButton")?.setIcon("sap-icon://light-mode");
        } else {
          Configuration.setTheme("sap_horizon_dark"); // Set to dark theme
          this?.byId("themeToggleButton")?.setTooltip("Switch to Light Mode");
          this?.byId("themeToggleButton")?.setIcon("sap-icon://dark-mode");
        }
        this.isDarkMode = !this.isDarkMode;
      },

      onItemSelect: function (ev) {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo(ev.getParameter('item').getKey())

      },

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

      // -----------------For Fast Test Set Uset Id And Role-----------------------
      NewItempress: function (oEvent) {
        var oNewItem = this.byId("NewItemId");
        var sStoredUserId = localStorage.getItem("UserId");
        var sStoredUserRole = localStorage.getItem("UserRole");
        if (oNewItem) {
          oNewItem.setTitle(sStoredUserId + " - " + sStoredUserRole); // Set your desired title
        }

      },

      onNewItemSubmit: function (oEvent) {
        // Get the value from the Input field
        var oInput = this.byId("ChangingUserId");
        var sValue = oInput.getValue();

        // Store the value in local storage
        localStorage.setItem("UserId", sValue);

        // Optional: Log the value to confirm it was saved
        console.log("User ID saved:", sValue);
      },

      onNewItemSubmitRole: function (oEvent) {
        // Get the value from the Input field
        var oInput = this.byId("ChangingUserRole");
        var sValue = oInput.getValue();

        // Store the value in local storage
        localStorage.setItem("UserRole", sValue);

        // Optional: Log the value to confirm it was saved
        console.log("User Role saved:", sValue);
      },

      // Languse ... 
      onChangeLanguage: function () {
        let sNewLanguage = this.getOwnerComponent().onChangeLanguage();

        // Update button text and tooltip dynamically
        sap.ui.getCore().applyChanges();
        location.reload();

      },


    });
  }
); 