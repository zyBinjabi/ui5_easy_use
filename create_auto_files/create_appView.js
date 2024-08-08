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
                <ff:ShellBar title="${appId}" secondTitle="" showMenuButton="true" homeIcon="./image/main_logo.png" homeIconTooltip="Main Logo" menuButtonPressed="onMenuButtonPress" showNotifications="true" notificationsPressed="" notificationsNumber="4" id="idImage">
                    <ff:additionalContent>
                        <OverflowToolbarButton press="" tooltip="Light Mode" icon="sap-icon://light-mode" />
                        <OverflowToolbarButton press="" tooltip="Start tour to understand the functionality" icon="sap-icon://learning-assistant"/>
                    </ff:additionalContent>
                    <ff:profile>
                        <Avatar id='Avatar_id' initials="UI" />
                    </ff:profile>
                </ff:ShellBar>
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
