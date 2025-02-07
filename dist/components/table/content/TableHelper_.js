sap.ui.define([], function () {
    "use strict";

    return class TableHelper_ {
        constructor(_controllerJS) {

            this._controllerJS = _controllerJS
            this.isDefaultGroup = false
            // this.tableId = this._controllerJS.mainTableId
            // Define your grouping functions
            this._controllerJS._mViewSettingsDialogs = {}
        }

        onInit() {
        }

        setTableId(tableId) {
            this.tableId = tableId
        }

        // ================================== # Tables Functions # ==================================
        getDataXkeysAItems(ev, mainTableModel = '', changeTextAItems = [], bindingPathsExtra = []) {
            // const data = this._controllerJS.getView()?.getModel((this._controllerJS.mainTableModel || mainTableModel))?.getData();

            // If mainTableModel has a value, use it; otherwise, default to 'mainTableModel'
            const modelName = mainTableModel || this._controllerJS.mainTableModel;

            // console.log("UiTableHelper -> modelName: ", modelName)
            // console.log("UiTableHelper ->  getDataXkeysAItems -> modelName:", modelName)
            const data = this._controllerJS.getView()?.getModel(modelName)?.getData();

            if (!data || data.length == 0) {
                return null
            }

            // Get the button that triggered the event
            var oButton = ev.getSource();
            var oParent = oButton.getParent();

            // Loop through the parent controls to find the table
            // console.log("1- bindingPathsExtra:", bindingPathsExtra);
            var aBindingPaths = [...bindingPathsExtra];

            while (oParent) {
                // Check if the current parent is of type sap.ui.table.Table
                if (oParent instanceof sap.ui.table.Table) {
                    // console.log("Table found:", oParent);

                    // Get the columns of the table
                    var aColumns = oParent.getColumns();


                    // Loop through the columns to get binding paths
                    aColumns.forEach(function (oColumn) {
                        var oTemplate = oColumn.getTemplate();
                        if (oTemplate && oTemplate.getBindingInfo("text")) {
                            // Get the binding path
                            var sPath = oTemplate.getBindingInfo("text").parts[0].path;
                            aBindingPaths.push(sPath);
                        }
                    });

                    // Log all binding paths
                    // console.log("2- Binding paths:", aBindingPaths);
                    break; // Exit the loop once the table is found
                }
                // Move to the next parent
                oParent = oParent.getParent();
            }
            aBindingPaths = aBindingPaths.map(path => path.replace(/\s+/g, ''));

            // console.log({ aBindingPaths })
            const xkeys = aBindingPaths; // Get Just Visable Fileds
            // const xkeys = Object.keys(data[0]); // Get All Fileds
            var aItems = xkeys.map(el => ({ text: this.camelCaseToNormal(el), key: el }))

            aItems.forEach(obj => {
                if (obj.hasOwnProperty('__metadata')) {
                    delete obj.__metadata;
                }
            });

            aItems = aItems.filter(obj => obj.text !== '__metadata' && obj.key !== '__metadata')

            if (changeTextAItems.length != 0) {
                aItems = this.updateItems(aItems, changeTextAItems)
            }

            return { data, xkeys, aItems }
        }

        // ---Sort---
        handleSortButtonPressed(ev) {
            const { data, xkeys, aItems } = this._controllerJS.getDataXkeysAItems(ev) ?? {};

            // console.log("UiTableHelper -> handleSortButtonPressed -> data", data)
            // console.log("UiTableHelper -> handleSortButtonPressed -> xkeys", xkeys)
            // console.log("UiTableHelper -> handleSortButtonPressed -> aItems", aItems)

            if (!this._controllerJS._mViewSettingsDialogs['sort_sug']) {
                // Get the dialog model data

                // Create the ViewSettingsDialog
                var oViewSettingsDialog = new sap.m.ViewSettingsDialog({
                    confirm: this.handleSortDialogConfirm.bind(this)
                });

                // Loop through the dialogModel data and create ViewSettingsItem for each entry
                aItems?.forEach(function (item, index) {
                    var oViewSettingsItem = new sap.m.ViewSettingsItem({
                        text: item.text,
                        key: item.key,
                        selected: true // Set the first item as selected (or adjust based on your logic)
                    });
                    oViewSettingsDialog.addSortItem(oViewSettingsItem);
                });
                this._controllerJS._mViewSettingsDialogs['sort_sug'] = oViewSettingsDialog
            }

            this._controllerJS._mViewSettingsDialogs['sort_sug'].open();

        }

        handleSortDialogConfirm(ev) {
            var oTable = this._controllerJS.byId(this.tableId),
                mParams = ev.getParameters(),
                oBinding = oTable ? oTable.getBinding("rows") : null, // For sap.ui.table.Table, binding is on "rows"
                sPath,
                bDescending,
                aSorters = [];

            if (mParams.sortItem) {
                sPath = mParams.sortItem.getKey();
                bDescending = mParams.sortDescending;
                aSorters.push(new sap.ui.model.Sorter(sPath, bDescending)); // sap.ui.model.Sorter is used for sorting
            }

            // Apply the selected sort settings
            if (oBinding) {
                oBinding.sort(aSorters);
            }

            // console.log({ oTable })
            // console.log({ mParams })
            // console.log({ oBinding })
            // console.log({ sPath })
            // console.log({ bDescending })
            // console.log({ aSorters })
        }

        // ---Filter---
        handleFilterButtonPressed(ev) {
            const { data, xkeys, aItems } = this._controllerJS.getDataXkeysAItems(ev) ?? {};


            if (!this._controllerJS._mViewSettingsDialogs['filter_sug']) {
                // Create the ViewSettingsDialog
                const oViewSettingsDialog = new sap.m.ViewSettingsDialog({
                    confirm: this.handleFilterDialogConfirm.bind(this)
                });


                aItems?.forEach(key => {
                    const oFilterItem = new sap.m.ViewSettingsFilterItem({
                        text: key.text,
                        key: key.key,
                        multiSelect: true
                    });

                    // Create a Set to ensure unique items
                    const uniqueItems = new Set(data.map(item => item[key.key]));

                    // Add unique ViewSettingsItems to the filter
                    uniqueItems?.forEach(value => {
                        oFilterItem.addItem(new sap.m.ViewSettingsItem({
                            text: value,
                            key: key.key
                        }));
                    });

                    oViewSettingsDialog.addFilterItem(oFilterItem);
                });

                // Save the dialog reference for later use
                this._controllerJS._mViewSettingsDialogs['filter_sug'] = oViewSettingsDialog;
            }

            // Open the dialog
            this._controllerJS._mViewSettingsDialogs['filter_sug'].open();

        }

        handleFilterDialogConfirm(ev) {
            var oTable = this._controllerJS.byId(this.tableId),
                mParams = ev.getParameters(),
                oBinding = oTable.getBinding("rows"),
                aFilters = [];

            mParams.filterItems.forEach(function (oItem) {
                var aSplit = oItem.getKey().split("___"),
                    sPath = aSplit[0],
                    sOperator = sap.ui.model.FilterOperator.EQ,
                    sValue1 = oItem.getText(),
                    oFilter = new sap.ui.model.Filter(sPath, sOperator, sValue1);
                // console.log("aSplit: ", aSplit, ", sPath: ", sPath, ", sOperator: ", sOperator, ", sValue1: ", sValue1, ", oBinding: ", oBinding);
                aFilters.push(oFilter);
            });

            if (oBinding) {
                oBinding.filter(aFilters);
            }

            // console.log({ oTable })
            // console.log({ mParams })
            // console.log({ oBinding })
            // console.log({ aFilters })


        }

        // ---Group---
        handleGroupButtonPressed(evx) {
            const { data, xkeys, aItems } = this._controllerJS.getDataXkeysAItems(evx) ?? {};

            if (!this._controllerJS._mViewSettingsDialogs['group_sug']) {
                // Define the array of items to be added

                // Wrapper function
                const wrapperFunction = (ev) => {
                    this.handleGroupDialogConfirm(ev, evx);
                };


                // Check if the dialog already exists
                // Create the ViewSettingsDialog
                const oViewSettingsDialog = new sap.m.ViewSettingsDialog({
                    // confirm: this.handleGroupDialogConfirm.bind(this),
                    confirm: wrapperFunction,
                    reset: this.resetGroupDialog.bind(this)
                });

                // Loop through the array and add ViewSettingsItem for each object
                aItems?.forEach(function (item) {
                    oViewSettingsDialog.addGroupItem(new sap.m.ViewSettingsItem({
                        text: item.text,
                        key: item.key
                    }));
                }.bind(this));  // Bind the loop to the current context (controller)


                // Set the default selected group item (e.g., the first item in aItems)
                if (aItems?.length > 0 && this?.isDefaultGroup) {
                    oViewSettingsDialog?.setSelectedGroupItem(aItems[0].key);  // Set the first item as default
                }

                this._controllerJS._mViewSettingsDialogs['group_sug'] = oViewSettingsDialog;
            }
            // Save the dialog reference for later use

            // Open the dialog
            this._controllerJS._mViewSettingsDialogs['group_sug'].open();

        }

        handleGroupDialogConfirm(ev, evx) {
            var oTable = this._controllerJS.byId(this.tableId),
                mParams = ev.getParameters(),
                oBinding = oTable.getBinding("rows"), // Use "rows" for sap.ui.table.Table
                sPath,
                bDescending,
                vGroup,
                aGroupers = [];

            // Ensure group functions are generated
            this.generateGroupFunctions(evx);

            if (mParams.groupItem) {
                sPath = mParams.groupItem.getKey();
                bDescending = mParams.groupDescending;
                vGroup = this.mGroupFunctions[sPath];

                if (typeof vGroup === 'function') {
                    aGroupers.push(new sap.ui.model.Sorter(sPath, bDescending, vGroup));
                    // Apply the selected group settings
                    oBinding.sort(aGroupers);
                } else {
                    console.error("Invalid group function for key: ", sPath);
                }
            } else if (this.groupReset) {
                oBinding.sort(); // Reset sorting
                this.groupReset = false;
            }

            // console.log("\nmParams: ", mParams, "\noBinding: ", oBinding, "\nsPath: ", sPath, "\nbDescending: ", bDescending, "\nvGroup: ", vGroup, "\naGroupers: ", aGroupers);
        }

        generateGroupFunctions(ev) {
            const { data, xkeys, aItems } = this._controllerJS.getDataXkeysAItems(ev) ?? {};


            this.mGroupFunctions = {};

            xkeys.forEach(key => {
                this.mGroupFunctions[key] = function (oContext) {
                    const data = oContext.getProperty();

                    if (data && data[key]) {
                        return {
                            key: data[key],
                            text: data[key]
                        };
                    } else {
                        console.error(`Invalid data for ${key}: `, data);
                        return {
                            key: "Unknown",
                            text: "Unknown"
                        };
                    }
                };
            });
        }

        applyDefaultGrouping(sDefaultGroupKey, evx) {
            this.isDefaultGroup = true
            const { data, xkeys, aItems } = this._controllerJS.getDataXkeysAItems(evx) ?? {};


            var oTable = this._controllerJS.byId(this.tableId),
                oBinding = oTable.getBinding("rows"), // Use "rows" for sap.ui.table.Table
                sDefaultGroupKey = sDefaultGroupKey ? sDefaultGroupKey : aItems[0].key, // Set the default group key
                bDescending = false, // Default to ascending
                vGroup,
                aGroupers = [];

            // Ensure group functions are generated
            this.generateGroupFunctions(evx);

            vGroup = this.mGroupFunctions[sDefaultGroupKey];

            if (typeof vGroup === 'function') {
                aGroupers.push(new sap.ui.model.Sorter(sDefaultGroupKey, bDescending, vGroup));
                // Apply the default group settings
                oBinding.sort(aGroupers);
                console.log("Default grouping applied with key:", sDefaultGroupKey);
            } else {
                console.error("Invalid group function for default key:", sDefaultGroupKey);
            }
        }

        // ------
        getSelectedRaws() {
            // Get the reference to the sap.m.Table
            var oTable = this._controllerJS.byId(this.tableId);

            // Get the selected indices (selected row indices)
            var aSelectedIndices = oTable.getSelectedIndices();
            // console.log({ aSelectedIndices });

            if (aSelectedIndices.length === 0) {
                // sap.m.MessageToast.show("No rows selected.");
                return [];
            }

            // Extract the data for each selected index
            var aSelectedData = aSelectedIndices.map(function (iIndex) {
                // Get the context by index and retrieve the data object
                var oContext = oTable.getContextByIndex(iIndex);
                return oContext ? oContext.getObject() : null;
            }).filter(Boolean); // Remove any null values

            // console.log({ aCommonWords });

            return aSelectedData
        }

        // ------
        resetGroupDialog(ev) {
            this.groupReset = true;
        }

        onSearch(ev) {
            // Destructure data, xkeys, and aItems from the method's return value
            const { data, xkeys, aItems } = this._controllerJS.getDataXkeysAItems(ev) ?? {};

            // Get the search query from the event
            const sQuery = ev.getParameter("query");
            const oTable = this._controllerJS.byId(this.tableId);
            const oBinding = oTable.getBinding("rows");

            // Initialize an array to hold the filters
            const aFilters = [];

            // Check if the search query is not empty
            if (sQuery) {
                // Iterate over each field in xkeys
                xkeys.forEach(key => {
                    // console.log({ key })
                    // Determine the type of the field value in 'data'
                    const value = data[0]?.[key]; // Get the first item in the data for reference
                    // console.log({ value })

                    if (typeof value === "string") {
                        // If it's a string, use the 'Contains' filter
                        const oFilter = new sap.ui.model.Filter(key, sap.ui.model.FilterOperator.Contains, sQuery);
                        aFilters.push(oFilter);
                    } else if (typeof value === "number") {
                        // If it's a number, use the 'EQ' filter for exact matches or convert query
                        const numberQuery = parseFloat(sQuery);
                        if (!isNaN(numberQuery)) {
                            const oFilter = new sap.ui.model.Filter(key, sap.ui.model.FilterOperator.EQ, numberQuery);
                            aFilters.push(oFilter);
                        }
                    } else if (value instanceof Date) {
                        // If it's a date, compare the date string
                        const dateQuery = new Date(sQuery);
                        if (!isNaN(dateQuery.getTime())) {  // Check if the date is valid
                            const oFilter = new sap.ui.model.Filter(key, sap.ui.model.FilterOperator.EQ, dateQuery);
                            aFilters.push(oFilter);
                        }
                    }

                    // Add more type checks here if needed (e.g., for booleans, dates, etc.)
                });

                // Combine filters using OR logic
                const oCombinedFilter = new sap.ui.model.Filter({
                    filters: aFilters,
                    and: false // Set to false to combine with OR logic
                });

                // Apply the combined filter to the table binding
                oBinding.filter(oCombinedFilter);
            } else {
                // If the query is empty, clear the filters
                oBinding.filter([]);
            }
        }

        // Helper function to normalize Arabic text
        _normalizeArabic(str) {
            if (!str) return '';

            // Normalize Arabic characters
            var arCharMap = {
                'أ': 'ا', 'إ': 'ا', 'آ': 'ا',
                'ى': 'ي', 'ئ': 'ي', 'ؤ': 'و',
                'ة': 'ه', 'گ': 'ك', 'پ': 'ب',
                'چ': 'ج', 'ژ': 'ز', 'ڤ': 'ف'
            };

            return str.replace(/[أإآىئؤةگپچژڤ]/g, function (match) {
                return arCharMap[match];
            }).normalize('NFD').replace(/[\u064B-\u065F\u0617-\u061A\u0640]/g, '');
        }

        // ================================== # xxx Functions # ==================================
        camelCaseToNormal(camelCaseStr) {
            return camelCaseStr.replace(/([a-z])([A-Z])/g, '$1 $2');
          }
        // ================================== # xxx Functions # ==================================
        updateItems(aItems, textMappings) {
            return aItems.map(item => {
                // Find the mapping for the current item's text (check all properties)
                const mapping = textMappings.find(mapping => Object.values(item).includes(mapping.oldtext));

                // If a mapping is found, create a new object with newtext; otherwise, keep the original item
                if (mapping) {
                    return {
                        ...item, // Spread the existing properties
                        text: mapping.newtext // Update the text property
                    };
                }

                // Return the original item if no mapping is found
                return item;
            });
        }


    };
});
