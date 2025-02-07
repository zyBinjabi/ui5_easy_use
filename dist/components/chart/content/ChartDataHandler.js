sap.ui.define([
    "sap/suite/ui/commons/ChartContainer",
    "sap/suite/ui/commons/ChartContainerContent",
    "sap/viz/ui5/controls/VizFrame",
    "sap/viz/ui5/data/FlattenedDataset",
    "sap/viz/ui5/controls/common/feeds/FeedItem",
    "sap/m/Label",
    "sap/m/Select",
    "sap/ui/core/Item"
], function (ChartContainer, ChartContainerContent, VizFrame, FlattenedDataset, FeedItem, Label, Select, Item) {
    "use strict";

    return class ChartDataHandler {
        /**
         * Constructor for ChartDataHandler.
         * @param {sap.ui.core.mvc.View} view - The view instance.
         */
        constructor(view) {
            this.view = view;
        }

        /**
         * Get the i18n resource bundle.
         * @returns {sap.base.i18n.ResourceBundle} The i18n resource bundle.
         */
        getI18n() {
            return this.view.getModel("i18n").getResourceBundle();
        }

        /**
         * Create a VizFrame instance with dynamic configuration.
         * @param {Object} config - Configuration object for the chart.
         * @returns {sap.viz.ui5.controls.VizFrame} The created VizFrame instance.
         */
        createVizFrame(config) {
            const { chartType, dataset, dimensions, measures, title, vizProperties } = config;

            // Validate required properties
            if (!chartType || !dataset || !dimensions || !measures) {
                throw new Error("Missing required configuration for VizFrame.");
            }

            const oVizFrame = new VizFrame({
                id: this.view.createId("idCustomChart"),
                height: config.height || "400px",
                width: config.width || "100%",
                vizType: chartType
            });

            const oDataset = new FlattenedDataset({
                data: dataset,
                dimensions: dimensions.map(dim => ({
                    name: dim.name,
                    value: `{${dim.value}}`
                })),
                measures: measures.map(measure => ({
                    name: measure.name,
                    value: `{${measure.value}}`
                }))
            });

            oVizFrame.setDataset(oDataset);
            oVizFrame.setVizProperties({
                title: { text: title },
                plotArea: { dataLabel: { visible: true } },
                legend: { visible: true },
                ...vizProperties // Allow custom viz properties to override defaults
            });

            const aFeeds = [
                ...dimensions.map(dim => new FeedItem({
                    uid: "categoryAxis",
                    type: "Dimension",
                    values: [dim.name]
                })),
                ...measures.map(measure => new FeedItem({
                    uid: "valueAxis",
                    type: "Measure",
                    values: [measure.name]
                }))
            ];

            aFeeds.forEach(feed => oVizFrame.addFeed(feed));
            return oVizFrame;
        }

        /**
         * Create a ChartContainerContent instance.
         * @param {sap.viz.ui5.controls.VizFrame} oVizFrame - The VizFrame instance.
         * @param {string} chartTitle - Title for the chart content.
         * @returns {sap.suite.ui.commons.ChartContainerContent} The created ChartContainerContent instance.
         */
        createChartContainerContent(oVizFrame, chartTitle) {
            return new ChartContainerContent({
                icon: "sap-icon://line-chart",
                title: chartTitle,
                content: [oVizFrame]
            });
        }

        /**
         * Create dimension selectors (label and dropdown).
         * @param {Object} selectorConfig - Configuration for the selectors.
         * @returns {Object} An object containing the label and select controls.
         */
        createDimensionSelectors(selectorConfig) {
            const { labelText, items, selectedKey, changeHandler } = selectorConfig;

            const oLabel = new Label({ text: labelText });
            const oSelect = new Select({
                items: items.map(item => new Item({ key: item.key, text: item.text })),
                selectedKey: selectedKey,
                change: changeHandler
            });

            return { oLabel, oSelect };
        }

        /**
         * Create a ChartContainer instance.
         * @param {sap.suite.ui.commons.ChartContainerContent} oChartContainerContent - The ChartContainerContent instance.
         * @param {Object} dimensionSelectors - Dimension selectors (label and dropdown).
         * @param {string} containerTitle - Title for the chart container.
         * @returns {sap.suite.ui.commons.ChartContainer} The created ChartContainer instance.
         */
        createChartContainer(oChartContainerContent, dimensionSelectors, containerTitle) {
            return new ChartContainer({
                showFullScreen: true,
                showPersonalization: false,
                autoAdjustHeight: false,
                title: containerTitle,
                class: "sapUiShadow sapUiRoundedBorder sapUiPageBackground",
                content: [oChartContainerContent],
                dimensionSelectors: [dimensionSelectors.oLabel, dimensionSelectors.oSelect]
            });
        }

        /**
         * Render the chart based on provided configurations.
         * @param {Object} chartConfig - Configuration for the chart.
         * @param {Object} selectorConfig - Configuration for the dimension selectors.
         */
        renderChart(xxId, chartConfig, selectorConfig) {
            const oVizFrame = this.createVizFrame(chartConfig);
            const oChartContainerContent = this.createChartContainerContent(oVizFrame, chartConfig.title);

            const dimensionSelectors = this.createDimensionSelectors(selectorConfig);
            const oChartContainer = this.createChartContainer(oChartContainerContent, dimensionSelectors, chartConfig.containerTitle);

            // Add the chart container to the target container in the view
            this.view.byId(xxId).addItem(oChartContainer);
        }
    };
});