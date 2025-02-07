sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/core/UIComponent",
        "${ez5.appName}/${ez5.packageName}/api/LocalStorage",
        "${ez5.appName}/${ez5.packageName}/components/form/FinalValidation",
        "${ez5.appName}/${ez5.packageName}/components/form/Helper",
        "${ez5.appName}/${ez5.packageName}/components/table/TableHelper_",
        "${ez5.appName}/${ez5.packageName}/components/chart/ChartDataHandler",

    ],
    function (Controller, UIComponent, LocalStorage, FinalValidation, HelperForm, TableHelper_, ChartDataHandler) {
        "use strict";

        return Controller.extend("disclosureofform.controller.Sample", {
            onInit: function () {
                // Initialize the LocalStorage class
                this.localStorage = new LocalStorage(this);
                this.localDataKey = 'localData'

                this.initialForm()
                this.initialTable()
                this.initialchart()
            },

            // ================================== ### Form ### ==================================
            initialForm: function () { // On Insert Form
                this.formId = "formId"
                this.formModel = "formModel"
                this.helperFormModel = "helperFormModel"
                this.autoG = [
                    { fieldName: "EmployeeId", value: "", type: "text", rules: "required|number", visible: true, editable: true },
                    { fieldName: "EmployeeName", value: "", type: "text", rules: "required|text|min-3|max-25", visible: true, editable: true },
                    { fieldName: "Email", value: "", type: "text", rules: "required|email", visible: true, editable: true },
                    { fieldName: "Country", value: "", type: "text", rules: "required", visible: true, editable: true }
                ]

                this.helperForm = new HelperForm(this, this.autoG)
                this.formValues = this.helperForm.getValuesFromAutoG()
                this.helperFormValues = this.helperForm.extractVisibilityAndEditability()

                this.getView().setModel(new sap.ui.model.json.JSONModel(this.formValues), this.formModel);
                this.getView().setModel(new sap.ui.model.json.JSONModel(this.helperFormValues), this.helperFormModel);

                this.finalValidation = new FinalValidation(this, this.formModel, this.pageId, this.autoG) // defination the validation
            },


            handleMessagePopoverPress: function (oEvent) {
                this.finalValidation.handleMessagePopoverPress(oEvent);
            },

            onSubmit_: async function () {


                // Get the data from the form model
                let data = this.getView().getModel(this.formModel).getData();
                console.log({ data });

                // Perform final validation
                if (this.finalValidation.onSave(data)) {
                    return false; // Stop execution if validation fails
                }

                // Show busy indicator while data is being processed
                this.setBusy(this.formId, true);

                this.localStorage.saveToLocalStorage(this.localDataKey, [data]);

                // Show success message box
                sap.m.MessageBox.success("Your submission was successful!", {
                    title: "Success", // Optional: Title of the message box
                    onClose: function () {
                        // Optional: Action to take when the message box is closed
                    }
                });

                this.setTimeoutZ() // for add delay :)

                this.initialForm() // to Reset the form data.
                this.onRefreshTable() // to Reset the form data.

                // Hide busy indicator after data is set
                this.setBusy(this.formId, false);

            },

            // ================================== ### Table ### ==================================
            // ==================================  Intial Table
            initialTable: async function () {
                this.tableModel = "tableModel"
                this.tableId = "tableId"

                this.tableHelper_ = new TableHelper_(this,)
                this.tableHelper_.setTableId(this.tableId)

                await this.setTableData()

            },

            setTableData: async function () {
                // Show busy indicator while data is being processed
                this.setBusy(this.tableId, true);

                // Fetch the Countriess array from the localData model
                const countries = this.getOwnerComponent().getModel("localData").getProperty("/Countries");

                // Sample raw data
                const rawData = [
                    {
                        Id: 1,
                        EmployeeId: '41273',
                        EmployeeName: "Zaid",
                        Email: "zaid@gmai.com",
                        Country: "0000000001"
                    },
                    {
                        Id: 2,
                        EmployeeId: '13241',
                        EmployeeName: "noor",
                        Email: "noor@gmai.com",
                        Country: "0000000002"
                    },
                    {
                        Id: 3,
                        EmployeeId: '52325',
                        EmployeeName: "mazen",
                        Email: "mazen@gmai.com",
                        Country: "0000000003"
                    },
                ];

                // Retrieve the formData from localStorage
                const savedFormData = this.localStorage.getFromLocalStorage(this.localDataKey)?.map(el => el[0]);

                // Check if savedFormData exists and is an array with items
                if (Array.isArray(savedFormData) && savedFormData.length !== 0) {
                    rawData.push(...savedFormData);
                }


                // Helper function to map country keys to names
                const formatCountry = (countryKey) => {
                    const country = countries.find(c => c.key === countryKey);
                    return country ? country.text : "Unknown"; // Default to "Unknown" if key not found
                };

                // Transform raw data to include formatted country names
                const formattedData = rawData.map(item => ({
                    ...item,
                    Country: formatCountry(item.Country) // Add a new field for the formatted country name
                }));

                // Set the transformed data into the table model
                this.getView().setModel(new sap.ui.model.json.JSONModel(formattedData), this.tableModel);

                this.setTimeoutZ() // for add delay :)

                // Hide busy indicator after data is set
                this.setBusy(this.tableId, false);
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
            handleFilterButtonPressed: function (ev) {
                this.tableHelper_.handleFilterButtonPressed(ev)
            },

            handleSortButtonPressed: function (ev) {
                this.tableHelper_.handleSortButtonPressed(ev)
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


            // ================================== ### On Functions ### ==================================
            // ==================================  Intial chart
            initialchart: async function () {
                // Initialize the ChartDataHandler
                const chartHandler = new ChartDataHandler(this.getView());

                // Create a JSONModel with sample data
                const oModel = new sap.ui.model.json.JSONModel();
                oModel.setData({
                    chartData: [
                        { year: "2020", revenue: 50 },
                        { year: "2021", revenue: 70 },
                        { year: "2022", revenue: 90 }
                    ]
                });

                // Set the model to the view
                this.getView().setModel(oModel, "chartModel");

                // Render the chart with dynamic data binding
                chartHandler.renderChart('targetContainer',
                    {

                        chartType: "column",
                        dataset: "{chartModel>/chartData}", // Bind data from the JSONModel
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

            setchartData: async function () {
                this.setBusy(this.chartId, true)

                this.getView().setModel(new sap.ui.model.json.JSONModel(this.chartData), this.chartModel);
                this.setBusy(this.chartId, false)
            },

            onRefreshchart: async function () {
                await this.setchartData()
                sap.m.MessageToast.show("Refreshed successfully!");
            },

            // ================================== ### Helper Functions ### ==================================
            setBusy: function (id, status) {
                this.getView()?.byId(id)?.setBusy(status);
            },

            setTimeoutZ: async function (ms = 1500) {
                const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
                return await delay(ms);
            },
        });
    }
);
