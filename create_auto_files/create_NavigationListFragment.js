// content.js
module.exports = (fileName, appId) => {
    let view = `<core:FragmentDefinition
                    xmlns="sap.tnt"
                    xmlns:core="sap.ui.core"
                    >
                    <NavigationListItem
                        text="{navList>title}"
                        icon="{navList>icon}"
                        enabled="{navList>enabled}"
                        expanded="{navList>expanded}"
                        items="{
                            path: 'items',
                            templateShareable: true
                        }"
                        key="{navList>key}"
                    >
                        <NavigationListItem
                            text="{navList>title}"
                            key="{navList>key}"
                            enabled="{navList>enabled}"
                        />
                    </NavigationListItem>
                    </core:FragmentDefinition>`
    return view;
};


