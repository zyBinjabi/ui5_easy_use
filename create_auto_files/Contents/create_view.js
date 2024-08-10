// content.js
module.exports = (fileName, appId) => {
    return `<mvc:View controllerName="${appId}.controller.${fileName}"
    xmlns:mvc="sap.ui.core.mvc" displayBlock="true"
    xmlns="sap.m">
    <Page id="page_id_${fileName}" title="${fileName}">
        <content >
        </content>
    </Page>
</mvc:View>`;
};
