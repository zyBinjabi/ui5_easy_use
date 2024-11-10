sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (
    Controller
) {
    "use strict";

    return Controller.extend("internal.utilities.UiTableFSG2", {
        constructor: function (currentController) {
            Controller.apply(this, currentController);

            this._currentController = currentController
            this.isDefaultGroup = false
            // this.tableId = this._currentController.mainTableId
            // Define your grouping functions
            this._currentController._mViewSettingsDialogs = {}
        },

        onInit: function () {
        },

        setTableId: function (tableId) {
            this.tableId = tableId
        },

        // ================================== # Tables Functions # ==================================
        getDataXkeysAItems: function (ev, mainTableModel = '', changeTextAItems = [], bindingPathsExtra = []) {
            // const data = this._currentController.getView()?.getModel((this._currentController.mainTableModel || mainTableModel))?.getData();

            // If mainTableModel has a value, use it; otherwise, default to 'mainTableModel'
            const modelName = mainTableModel || this._currentController.mainTableModel;

            // console.log("UiTableFSG2 -> modelName: ", modelName)
            // console.log("UiTableFSG2 ->  getDataXkeysAItems -> modelName:", modelName)
            const data = this._currentController.getView()?.getModel(modelName)?.getData();

            if (!data || data.length == 0) {
                return null
            }

            // Get the button that triggered the event
            var oButton = ev.getSource();
            var oParent = oButton.getParent();

            // Loop through the parent controls to find the table
            console.log("1- bindingPathsExtra:", bindingPathsExtra);
            var aBindingPaths = [...bindingPathsExtra];

            while (oParent) {
                // Check if the current parent is of type sap.ui.table.Table
                if (oParent instanceof sap.ui.table.Table) {
                    console.log("Table found:", oParent);

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
                    console.log("2- Binding paths:", aBindingPaths);
                    break; // Exit the loop once the table is found
                }
                // Move to the next parent
                oParent = oParent.getParent();
            }
            aBindingPaths = aBindingPaths.map(path => path.replace(/\s+/g, ''));

            console.log({ aBindingPaths })
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
        },

        // ---Sort---
        handleSortButtonPressed: function (ev) {
            const { data, xkeys, aItems } = this._currentController.getDataXkeysAItems(ev) ?? {};

            console.log("UiTableFSG2 -> handleSortButtonPressed -> data", data)
            console.log("UiTableFSG2 -> handleSortButtonPressed -> xkeys", xkeys)
            console.log("UiTableFSG2 -> handleSortButtonPressed -> aItems", aItems)

            if (!this._currentController._mViewSettingsDialogs['sort_sug']) {
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
                this._currentController._mViewSettingsDialogs['sort_sug'] = oViewSettingsDialog
            }

            this._currentController._mViewSettingsDialogs['sort_sug'].open();

        },

        handleSortDialogConfirm: function (ev) {
            var oTable = this._currentController.byId(this.tableId),
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
        },

        // ---Filter---
        handleFilterButtonPressed: function (ev) {
            const { data, xkeys, aItems } = this._currentController.getDataXkeysAItems(ev) ?? {};


            if (!this._currentController._mViewSettingsDialogs['filter_sug']) {
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
                this._currentController._mViewSettingsDialogs['filter_sug'] = oViewSettingsDialog;
            }

            // Open the dialog
            this._currentController._mViewSettingsDialogs['filter_sug'].open();

        },

        handleFilterDialogConfirm: function (ev) {
            var oTable = this._currentController.byId(this.tableId),
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


        },

        // ---Group---
        handleGroupButtonPressed: function (evx) {
            const { data, xkeys, aItems } = this._currentController.getDataXkeysAItems(evx) ?? {};

            if (!this._currentController._mViewSettingsDialogs['group_sug']) {
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

                this._currentController._mViewSettingsDialogs['group_sug'] = oViewSettingsDialog;
            }
            // Save the dialog reference for later use

            // Open the dialog
            this._currentController._mViewSettingsDialogs['group_sug'].open();

        },

        handleGroupDialogConfirm: function (ev, evx) {
            var oTable = this._currentController.byId(this.tableId),
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
        },

        generateGroupFunctions: function (ev) {
            const { data, xkeys, aItems } = this._currentController.getDataXkeysAItems(ev) ?? {};


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
        },

        applyDefaultGrouping: function (sDefaultGroupKey, evx) {
            this.isDefaultGroup = true
            const { data, xkeys, aItems } = this._currentController.getDataXkeysAItems(evx) ?? {};


            var oTable = this._currentController.byId(this.tableId),
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
        },

        // ------
        handleActionButtonPressed: function () {
            // Get the reference to the sap.m.Table
            var oTable = this._currentController.byId("mainTableIdOperTran");

            // Get the selected indices (selected row indices)
            var aSelectedIndices = oTable.getSelectedIndices();
            // console.log({ aSelectedIndices });

            if (aSelectedIndices.length === 0) {
                sap.m.MessageToast.show("No rows selected.");
                return;
            }

            // Extract the data for each selected index
            var aSelectedData = aSelectedIndices.map(function (iIndex) {
                // Get the context by index and retrieve the data object
                var oContext = oTable.getContextByIndex(iIndex);
                return oContext ? oContext.getObject() : null;
            }).filter(Boolean); // Remove any null values

            // Extract words from the 'OperTran' field for each selected row
            var aOperTranWords = aSelectedData.map(function (oData) {
                return oData.OperTran.split(/\s+/); // Split by any whitespace to get individual words
            });

            // console.log({ aOperTranWords });

            // Find the common words that exist in all selected rows' 'OperTran' fields
            var aCommonWords = aOperTranWords.reduce(function (commonWords, currentWords) {
                return commonWords.filter(function (word) {
                    return currentWords.includes(word);
                });
            });

            // console.log({ aCommonWords });

            // Display the common words
            if (aCommonWords.length > 0) {
                var sMessage = "Common words in selected rows: " + aCommonWords.join("|");
                sap.m.MessageToast.show(sMessage);
            } else {
                sap.m.MessageToast.show("No common words found in selected rows.");
            }

            return aCommonWords
        },

        // ------
        resetGroupDialog: function (ev) {
            this.groupReset = true;
        },

        onSearch: function (ev) {
            // Destructure data, xkeys, and aItems from the method's return value
            const { data, xkeys, aItems } = this._currentController.getDataXkeysAItems(ev) ?? {};

            // Get the search query from the event
            const sQuery = ev.getParameter("query");
            const oTable = this._currentController.byId(this.tableId);
            const oBinding = oTable.getBinding("rows");

            // Initialize an array to hold the filters
            const aFilters = [];

            // Check if the search query is not empty
            if (sQuery) {
                // Iterate over each field in xkeys
                xkeys.forEach(key => {
                    console.log({ key })
                    // Determine the type of the field value in 'data'
                    const value = data[0]?.[key]; // Get the first item in the data for reference
                    console.log({ value })

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
        },

        // Helper function to normalize Arabic text
        _normalizeArabic: function (str) {
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
        },

        // ================================== # xxx Functions # ==================================
        camelCaseToNormal: function (camelCaseStr) {
            return camelCaseStr.replace(/([a-z])([A-Z])/g, '$1 $2');
          },
        // ================================== # xxx Functions # ==================================
        updateItems: function (aItems, textMappings) {
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


    });
});

/* 
                            <table:Table
                                rows="{mainTableModel>/}"
                                selectionMode="MultiToggle"
                                paste="onPaste"
                                ariaLabelledBy="title"
                                id="mainTableIdOperTran">
                                <table:extension>
                                    <OverflowToolbar style="Clear">
                                        <Title text="Report" />
                                        <Switch
                                            id="mySwitch"
                                            state="true"
                                            customTextOn="In"
                                            customTextOff="out"
                                            change="onSwitchChange"
                                        />

                                        <ToolbarSpacer />
                                        <Button
                                            tooltip="Action"
                                            icon="sap-icon://action"
                                            press="handleActionButtonPressed"
                                            type='Accept'
                                        />
                                        <Button
                                            tooltip="Sort"
                                            icon="sap-icon://sort"
                                            press="handleSortButtonPressed"
                                        />
                                        <Button
                                            tooltip="Filter"
                                            icon="sap-icon://filter"
                                            press="handleFilterButtonPressed"
                                        />
                                        <Button
                                            tooltip="Group"
                                            icon="sap-icon://group-2"
                                            press="handleGroupButtonPressed"
                                        />


                                        <SearchField
                                            id="searchField"
                                            width="20%"
                                            placeholder="search"
                                            search="onSearch"
                                        />
                                    </OverflowToolbar>
                                </table:extension>
                                <table:columns>
                                    <table:Column width="40rem">
                                        <Label text="Product Name" />
                                        <table:template>
                                            <Text text="{mainTableModel>OperTran}" wrapping="false" />
                                        </table:template>
                                    </table:Column>
                                </table:columns>
                            </table:Table>
 */

/* 
      // ================================== # Table FSG Functions # ==================================
      getDataXkeysAItems: function () {
        const data = this.getView()?.getModel(this.mainTableModel)?.getData();
        console.log(data)
        if (data.length == 0) {
          return null
        }
        const xkeys = Object.keys(data[0]);
        var aItems = xkeys.map(el => ({ text: el, key: el }))
        return { data, xkeys, aItems }
      },
      // ======

      handleSortButtonPressed: function (ev) {
        this.uiTableFSG.handleSortButtonPressed(ev)
      },

      handleFilterButtonPressed: function (ev) {
        this.uiTableFSG.handleFilterButtonPressed(ev)
      },

      handleGroupButtonPressed: function (ev) {
        this.uiTableFSG.handleGroupButtonPressed(ev)

      },

      // ======
      onSearch: function (oEvent) {
        this.uiTableFSG.onSearch(oEvent)
      },

      // ======
      handleActionButtonPressed: function () {
        let aCommonWords = this.uiTableFSG.handleActionButtonPressed()
        console.log(aCommonWords)
        // Remove empty strings and extra commas from aCommonWords
        var sCommonWords = aCommonWords.filter(Boolean).join(" ").replace(/,+/g, '');
        console.log(aCommonWords)

        // this.getView().getModel(this.mainFormModel).setProperty('/text', aCommonWords)
        this.helperModelInstance.setProperty('/multiComboBox', aCommonWords)
      },
 */