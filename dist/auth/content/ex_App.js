


sap.ui.define([

], () => {
  "use strict";

  return Controller.extend("${ez5.appName}.controller.controllerName", {

    onInit: function () {

      this.oMyAvatar = this.oView.byId("Avatar_id");
      this._oPopover = Fragment.load({
        id: this.oView.getId(),
        name: "${ez5.appName}.fragment.auth.Popover",
        controller: this
      }).then(function (oPopover) {
        this.oView.addDependent(oPopover);
        this._oPopover = oPopover;
      }.bind(this));

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


  });
});