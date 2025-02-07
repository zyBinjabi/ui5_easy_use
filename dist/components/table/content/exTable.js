sap.ui.define(
  [
    "${ez5.appName}/${ez5.packageName}/table/TableHelper_",
  ],
  function (TableHelper_) {
    "use strict";

    return BaseController.extend("${ez5.appName}.controller.TablePage", {
      onInit: function () {

        this.initialTable()

      },

      // ================================== # On Functions # ==================================
      // ==================================  Intial Table
      initialTable: async function () {
        this.tableModel = "tableModel"
        this.tableId = "tableId"

        this.tableHelper_ = new TableHelper_(this,)
        this.tableHelper_.setTableId(this.tableId)

        await this.setTableData()

      },

      setTableData: async function () {
        this.setBusy(this.tableId, true)

        this.tabelData = [
          {
            Id: 1,
            "Name": "Zaid",
            "Age": 28,
            "Service": "0000000001"
          },
          {
            Id: 2,
            "Name": "yazan",
            "Age": 10,
            "Service": "0000000002"
          }
        ];

        this.getView().setModel(new sap.ui.model.json.JSONModel(this.tabelData), this.tableModel);
        this.setBusy(this.tableId, false)
      },

      onRefreshTable: async function () {
        await this.setTableData()
        sap.m.MessageToast.show("Refreshed successfully!");
      },

      // ================================== # Table FSG Functions 
      getDataXkeysAItems: function (ev) {
        let changeTextAItems = [{ oldtext: "Name", newtext: "Name 2" }]
        return this.tableHelper_.getDataXkeysAItems(ev, this.tableModel, changeTextAItems)
      },
      // ======

      handleSortButtonPressed: function (ev) {
        this.tableHelper_.handleSortButtonPressed(ev)
      },

      handleFilterButtonPressed: function (ev) {
        this.tableHelper_.handleFilterButtonPressed(ev)
      },

      handleGroupButtonPressed: function (ev) {
        this.tableHelper_.handleGroupButtonPressed(ev)

      },

      // ======
      onSearch: function (oEvent) {
        this.tableHelper_.onSearch(oEvent)
      },
      // ======

      handleActionPress: function (ev) {
        const oRow = ev.getParameter("row");
        const oItem = ev.getParameter("item");

        // Check if the row has the binding context for the required model
        const oBindingContext = oRow.getBindingContext(this.tableModel); // replace with your exact model name

        let sRowId;// Adjust property name as needed
        if (oBindingContext) {
          // Retrieve the property from the binding context, for example, 'Id'
          sRowId = oBindingContext.getProperty("Id"); // Adjust property name as needed
          console.log("Selected Row ID:", sRowId);
        } else {
          console.warn("Row does not have a binding context.");
        }
        var oRouter = UIComponent.getRouterFor(this);

        oRouter.navTo('RouteFormPage', {
          Id: sRowId
        })
      },

      // ================================== # Helper Functions # ==================================
      setBusy: function (id, status) {
        this.getView()?.byId(id)?.setBusy(status);
      },

    });
  }
);
