// content.js
module.exports = (fileName, appId) => {
    let view = `<SideNavigation
            xmlns="sap.tnt"
            xmlns:core="sap.ui.core"
            expanded="false"
            selectedKey="{/selectedKey}"
            itemSelect="onItemSelect"
        >
            <NavigationList items="{
                path: 'navList>/navigation'
            }">
                <core:Fragment
                    fragmentName="${appId}.fragment.mainFragment.NavigationList"
                    type="XML"
                />
            </NavigationList>
        </SideNavigation>`
    return view;
};


