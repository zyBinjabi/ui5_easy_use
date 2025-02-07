sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "ui5easyuseapplay/${ez5.packageName}/chart/ChartDataHandler",


  ],
  function (BaseController, ChartDataHandler) {
    "use strict";

    return BaseController.extend("ui5easyuseapplay.controller.ChartPage", {
      onInit: function () {
        // Initialize the ChartDataHandler
        const chartHandler = new ChartDataHandler(this.getView());

        // Create an ODataModel
        const oModel = new sap.ui.model.odata.v2.ODataModel({
          serviceUrl: "/path/to/your/odata/service/"
        });

        // Set the model to the view
        this.getView().setModel(oModel, "oDataModel");

        // Render the chart with dynamic data binding
        chartHandler.renderChart(
          {
            chartType: "column",
            dataset: "/RevenueData", // Path to the OData entity set
            dimensions: [{ name: "Year", value: "year" }],
            measures: [{ name: "Revenue", value: "revenue" }],
            title: "Revenue Over Years",
            containerTitle: "Revenue Chart"
          },
          {
            labelText: "Select Year",
            items: [
              { key: "2020", text: "2020" },
              { key: "2021", text: "2021" },
              { key: "2022", text: "2022" }
            ],
            selectedKey: "2022",
            changeHandler: function (oEvent) {
              console.log("Selected Year:", oEvent.getParameter("selectedItem").getKey());
            }
          }
        );
      },

      // ================================== # Get Functions # ==================================


      // ================================== # Helper Functions # ==================================
      setBusy: function (id, status) {
        this.getView()?.byId(id)?.setBusy(status);
      },

    });
  }
);
