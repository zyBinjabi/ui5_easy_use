// content.js
module.exports = (fileName, appId) => {
    return `sap.ui.define(
        [
          "sap/ui/core/mvc/Controller",
          "sap/ui/core/UIComponent",
          "sap/tnt/ToolPage",
          "sap/ui/core/routing/Router",
          "sap/ui/core/Fragment"
      
      
        ],
        function (Controller,
        UIComponent,
        ToolPage,
        Router,
        Fragment) {
          "use strict";
      
          return Controller.extend("${appId}.controller.App", {
            onInit: function () {
            },
      
            onClickLight: function (ev) {
              // ReusedHooks.onClickLight());
            },
      
            onMenuButtonPress: function () {
              var toolPage = this.byId('toolPage');
              if (toolPage) {
                toolPage.setSideExpanded(!toolPage.getSideExpanded());
              }
            },
      
            onItemSelect: function (ev) {
              var oRouter = UIComponent.getRouterFor(this);
              oRouter.navTo(ev.getParameter('item').getKey()) 
      
            },
      
            openNotification: function (oEvent) {
              var oButton = oEvent.getParameter("button");
              var oView = this.getView();
              var _pPopover;
      
              // create popover
              if (!_pPopover && oView) {
                _pPopover = Fragment.load({
                  id: oView.getId(),
                  name: "practice.fragment.notification",
                  controller: this
                }).then(function (oPopover) {
                  oView.addDependent(oPopover);
                  return oPopover;
                });
              }
      
              _pPopover.then(function (oPopover) {
                oPopover.openBy(oButton);
              });
            }
          });
        }
      ); `;
};
