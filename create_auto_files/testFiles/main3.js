const readline = require('readline');
// // Sample XML string
const xmlString = `<mvc:View controllerName="practice.controller.Home"
    xmlns:mvc="sap.ui.core.mvc" displayBlock="true"
    xmlns="sap.m">
    <Page id="page_id_Home" title="Home">
        <content>
            <Button text="Upload" press="handleUploadPress" />
                        <Button text="dwonload"
                press="handleUploadPress" />

        </content>
    </Page>
</mvc:View>`;

// Helper function to extract tag, its attributes, and its content
function extractTags(xml, tagStack = []) {
    const tagRegex = /<([a-zA-Z0-9_:]+)([^>]*?)\/>|<([a-zA-Z0-9_:]+)([^>]*)>(.*?)<\/\3>/gs;
    const result = [];

    let match;
    while ((match = tagRegex.exec(xml)) !== null) {
        let tagName, attributes, openTag, closeTag, innerContent;

        // Case 1: Self-closing tag (e.g., <Button ... />)
        if (match[1]) {
            tagName = match[1];
            attributes = match[2].trim();
            openTag = `<${tagName}${attributes ? ' ' + attributes : ''} />`;

            result.push({
                tagName: tagName, // Store the current tag name
                [tagName]: {
                    open: openTag,
                    close: "",  // No closing tag for self-closing elements
                    content: "" // No content for self-closing elements
                }
            });
        }
        // Case 2: Regular opening and closing tag (e.g., <Page>...</Page>)
        else if (match[3]) {
            tagName = match[3];
            attributes = match[4].trim();
            innerContent = match[5].trim();

            openTag = `<${tagName}${attributes ? ' ' + attributes : ''}>`;
            closeTag = `</${tagName}>`;

            // Recursively parse inner content to handle nested tags
            const innerTags = extractTags(innerContent);

            result.push({
                tagName: tagName, // Store the current tag name
                [tagName]: {
                    open: openTag,
                    close: closeTag,
                    content: innerTags.length > 0 ? innerTags : innerContent  // Store inner tags or raw content
                }
            });
        }
    }
    return result;
}

function extractTagNames(parsedResult) {
    let tags = [];
    let tagObjects = [];  // To store the corresponding tag objects for reference

    function recursiveExtract(result, parentTag = "") {
        result.forEach((tag) => {
            const tagName = tag.tagName;
            const currentTag = parentTag ? `${parentTag} > ${tagName}` : tagName; // Properly build the full path tag name

            tags.push(currentTag);
            tagObjects.push(tag);  // Save the entire tag object for reference later

            const tagData = tag[Object.keys(tag)[1]]; // Get the tag data (e.g., "mvc:View", "Page")
            if (Array.isArray(tagData.content)) {
                recursiveExtract(tagData.content, currentTag); // Recursive call for nested tags with correct parent
            }
        });
    }

    recursiveExtract(parsedResult);
    return { tags, tagObjects };
}

// Function to display the selected tag's content
function displaySelectedTag(tagObject) {
    const tagData = tagObject[Object.keys(tagObject)[1]];
    console.log("\nSelected Tag Details:");

    console.log("Open Tag:", tagData.open);
    console.log("Close Tag:", tagData.close);
    if (Array.isArray(tagData.content) && tagData.content.length > 0) {
        console.log("Content: Contains nested tags.");
    } else if (tagData.content === "") {
        console.log("Content: Self-closing or empty.");
    } else {
        console.log("Content:", tagData.content);
    }


    // Call the function to insert the new content
    const insertPosition = findOpenTagPosition(xmlString, tagData.open)

    const newContent = '---------------------------------------';
    const updatedXMLString = insertAfterTag(xmlString, insertPosition, newContent);
    // Log the updated XML string
    console.log("\nUpdated XML String:\n", updatedXMLString);

}

function findOpenTagPosition(xmlString, openTag) {
    // Create a regex to find the opening tag
    const regex = new RegExp(`(${openTag}[^>]*>)`, 'g');

    // Find the index of the first match of the opening tag
    const match = regex.exec(xmlString);

    if (match) {
        console.log(`\nThe position of the opening tag:\n"${openTag}" is: ${match.index}`);
        return match.index; // Return the position if the tag is found
    } else {
        console.log(`\nThe position of the opening tag <${openTag}> not found.`);
        return false; // Return -1 if tag is not found
    }
}

// Function to insertAfterTag selected content
function insertAfterTag(xmlString, insertPosition, newContent) {
    if (insertPosition) {
        // Update the XML string with new content inserted
        const updatedXMLString = xmlString.slice(0, insertPosition) + `\n    ${newContent}\n` + xmlString.slice(insertPosition);
        return updatedXMLString;
    } else {
        console.log(`insertPosition: ${insertPosition}> not found.`);
        return xmlString; // Return original if tag is not found
    }
}
// Example parsed result
const parsedResult = extractTags(xmlString)
// console.log(JSON.stringify(parsedResult, null, 2));

// Extract tags and their corresponding objects
const { tags, tagObjects } = extractTagNames(parsedResult);
// console.log("tags, tagObjects", tags, tagObjects)

// Display available tags
console.log("Available Tags:");
tags.forEach((tag, index) => {
    console.log(`${index + 1} :  ${tag}`);
});

// Use readline to get user input (CLI)
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Select a tag by its number: ', (answer) => {
    const selectedIndex = parseInt(answer) - 1;  // Convert input to index (1-based to 0-based)
    if (selectedIndex >= 0 && selectedIndex < tags.length) {
        const selectedTagObject = tagObjects[selectedIndex];
        displaySelectedTag(selectedTagObject);  // Display the selected tag's details
    } else {
        console.log("Invalid selection.");
    }
    rl.close();
});



