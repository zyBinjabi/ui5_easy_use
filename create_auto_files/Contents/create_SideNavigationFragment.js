// content.js
module.exports = (fileName, appId) => {
    let view = `<core:FragmentDefinition
    xmlns="sap.tnt"
    xmlns:core="sap.ui.core"
>
    <SideNavigation
        expanded="false"
        selectedKey="{/selectedKey}"
        itemSelect="onItemSelect"
    >
        <NavigationList items="{
                path: 'navList>/navigation'
            }">
            <NavigationListItem
                text="{navList>title}"
                icon="{navList>icon}"
                enabled="{navList>enabled}"
                expanded="{navList>expanded}"
                key="{navList>key}"
                items="{
                    path: 'navList>items',
                    templateShareable: true
                }"
            >
                <NavigationListItem
                    text="{navList>title}"
                    key="{navList>key}"
                    enabled="{navList>enabled}"
                />
            </NavigationListItem>
        </NavigationList>
    </SideNavigation>
</core:FragmentDefinition>`
    return view;
};


