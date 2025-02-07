// content.js
module.exports = (fileName, appId) => {
    return `<mvc:View controllerName="${appId}.controller.App"
    xmlns:html="http://www.w3.org/1999/xhtml"
    xmlns:mvc="sap.ui.core.mvc" displayBlock="true"
    xmlns="sap.m"
    xmlns:ff="sap.f"
    xmlns:core="sap.ui.core"
    xmlns:tnt="sap.tnt">
    <App id='App_id'>
        <tnt:ToolPage id="toolPage">
            <tnt:header>
                <tnt:ToolHeader>
                    <Button
                        icon="sap-icon://menu"
                        press="onMenuButtonPress"
                    />
                    <Title text="${appId} - UI5 Easy Use" />
                    <!-- Add space between elements -->
                    <ToolbarSpacer />

                    <OverflowToolbarButton
                        icon="sap-icon://light-mode"
                        press="onToggleTheme"
                        id="themeToggleButton"
                    />
                </tnt:ToolHeader>
            </tnt:header>
                
            <tnt:sideContent>
                <core:Fragment fragmentName="${appId}.fragment.mainFragment.SideNavigation" type="XML" />
            </tnt:sideContent>
    
            <tnt:mainContents>
                <NavContainer id="app" />
            </tnt:mainContents>
        </tnt:ToolPage>
    </App>
    </mvc:View>
    `;
};
