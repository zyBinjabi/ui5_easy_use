
const { XMLParser } = require('./XMLParser');
// const { XMLModifier } = require('./XMLModifier');


/**
* Class to modify and update XML structures.
*/
class XMLModifier {
  constructor(tags, xml) {
    this.tags = tags; // Array of tag names in the destination XML
    this.xml = xml; // Raw destination XML string
    this.dependencies = new Set(); // Track existing dependencies
    this.updateDependencies();
  }

  /**
  * Update the dependency list from the existing XML.
  */
  updateDependencies() {
    const dependencyRegex = /xmlns:([a-zA-Z0-9_]+)="([^"]+)"/g;
    let match;
    while ((match = dependencyRegex.exec(this.xml)) !== null) {
      this.dependencies.add(`${match[1]}="${match[2]}"`);
    }
  }

  /**
  * Insert a tag and its contents into the destination XML.
  * @param {Object} sourceTag - The tag object to insert.
  * @param {string} targetTag - The name of the target tag in the destination XML.
  */
  insertTag(sourceTag, targetTag) {
    const targetIndex = this.tags.indexOf(targetTag);

    if (targetIndex === -1) {
      console.error(`Target tag "${targetTag}" not found.`);
      return;
    }

    const serializedTag = this.serializeTag(sourceTag);

    // Insert the new tag content at the correct location
    const parts = this.xml.split(new RegExp(`(
<${targetTag}[^>]*>)`));
    if (parts.length > 1) {
      parts.splice(2, 0, serializedTag);
      this.xml = parts.join("");
    } else {
      console.error(`Failed to find target tag "${targetTag}" in the XML.`);
    }
  }

  /**
  * Ensure that dependencies from the source are added to the destination XML.
  * @param {Array} dependencies - Array of dependency strings (e.g., `xmlns:tnt="sap.tnt"`).
  */
  ensureDependencies(dependencies) {
    const dependencySet = new Set(dependencies);
    dependencySet.forEach((dependency) => {
      if (!this.dependencies.has(dependency)) {
        this.xml = this.xml.replace(
/
          < zdependencies[^>] *>/,
            (match) => `${match}\n ${dependency}`
        );
        this.dependencies.add(dependency);
      }
    });
  }

  /**
  * Serialize a tag object back to XML format.
  * @param {Object} tag - The tag object to serialize.
  * @returns {string} Serialized XML string.
  */
  serializeTag(tag) {
    const attributes = tag.attributes ? ` ${tag.attributes}` : "";
    if (tag.isSelfClosing) {
      return `
<${tag.name}${attributes} />`;
    }
    const children = tag.children.map(this.serializeTag.bind(this)).join("\n");
    const content = tag.content || children;
    return `
<${tag.name}${attributes}>${content}</${tag.name}>`;
  }
}

class XMLManager {
  constructor(sourceParser, destinationParser) {
    this.sourceParser = sourceParser;
    this.destinationParser = destinationParser;
  }

  /**
  * Inserts a source tag with its children into the destination XML at a given position.
  * Ensures no duplicate elements are inserted.
  * @param {Object} sourceTag - The source tag object from sourceParser.
  * @param {number} destinationClosingTagPosition - The position in the destination XML where the
  sourceTag should be inserted.
  * @returns {string} The updated destination XML string.
  */
  setTagWithChilds(sourceTag, destinationClosingTagPosition) {
    if (!sourceTag || destinationClosingTagPosition === -1) {
      return this.destinationParser.xml; // Return unchanged if invalid input
    }

    let destinationXML = this.destinationParser.xml;

    // Prevent duplicate insertions
    if (destinationXML.includes(`
<${sourceTag.name}`)) {
      return destinationXML; // If tag already exists, return unchanged XML
    }

    // Convert source tag to string
    const sourceTagString = this.convertTagToString(sourceTag);

    // Insert sourceTag **before** the closing tag of the target container
    const updatedXML =
      destinationXML.slice(0, destinationClosingTagPosition) +
      `\n        ${sourceTagString}\n    ` + // Proper indentation for readability
      destinationXML.slice(destinationClosingTagPosition);

    this.updateXML(updatedXML); // auto update destination xml 

    return updatedXML;
  }

  /**
   * Converts a tag object and its children back to an XML string.
   * @param {Object} tag - The tag object.
   * @returns {string} XML string representation of the tag.
   */
  convertTagToString(tag) {
    if (tag.isSelfClosing) {
      return `
<${tag.name} ${tag.attributes}/>`;
    }

    const childrenString = tag.children
      .map(this.convertTagToString.bind(this))
      .join("\n "); // Ensure proper spacing

    return `
<${tag.name}>
    ${childrenString}
</${tag.name}>`;
  }

  updateXML(newXml) {
    this.destinationParser.xml = newXml
  }

  mergeNamespaces(zdependencies) {
    let destinationXML = this.destinationParser.xml;

    const namespaceRegex = /
      <\w+[^>] *\s(xmlns: [a - zA - Z0 - 9] *=.*?) >/s;
    const match = destinationXML.match(namespaceRegex);

    if (match) {
      const existingNamespaces = match[1]; // Capture existing xmlns attributes
      let mergedNamespaces = existingNamespaces + "\n " + zdependencies;

      // Convert namespaces to a Set to remove duplicates
      const namespaceSet = new Map();
      mergedNamespaces.split(/\s+/).forEach(ns => {
        const matchNs = ns.match(/(xmlns:[a-zA-Z0-9]*|xmlns)="[^"]*"/);
        if (matchNs) {
          namespaceSet.set(matchNs[1], ns); // Keep only the last occurrence
        }
      });

      // Construct unique namespaces string
      const uniqueNamespaces = Array.from(namespaceSet.values()).join("\n ");

      return destinationXML.replace(existingNamespaces, uniqueNamespaces);
    }

    return destinationXML; // Return unchanged if no match found
  }


}


// Example Usage:

// Source XML (user selects a tag from this)
const sourceXML = `
<zdependencies xmlns="sap.m"
    xmlns:core="sap.ui.core"
    xmlns:f="sap.f"
/>

<tnt:ToolHeader>
    <OverflowToolbarButton
        press="onChangeLanguage"
        tooltip="{i18n>app_change_to_arabic}"
        icon="sap-icon://world"
        id="languageChangeButton"
    />
</tnt:ToolHeader>
`;

// Destination XML (user selects where to insert the new tag)
const destinationXML = `
<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core xmlns:core=" sap.ui.core"">
    <Page>
        <content>
            <VBox>
                <Text text="Example" />
            </VBox>
        </content>
    </Page>
</mvc:View>
`;

const sourceParser = new XMLParser(sourceXML);
const destinationParser = new XMLParser(destinationXML);
const xmlManager = new XMLManager(sourceParser, destinationParser);

// const sourcetage = sourceParser.getTagByName("zdependencies").attributes
// const destinationtage = destinationParser.getTagByName("mvc:View > Page > content > VBox")
// console.log("sourcetage: ", sourcetage)
// console.log("destinationtage: ", destinationtage)

const sourceTag = sourceParser.getTagByName("tnt:ToolHeader");
const destinationClosingTagPosition = destinationParser.getClosingTagPosition("mvc:View > Page >content");

const updatedDestinationXML = xmlManager.setTagWithChilds(sourceTag, destinationClosingTagPosition);
console.log({ updatedDestinationXML });


const zdependencies = sourceParser.getTagByName("zdependencies").attributes
console.log("zdependencies: ", zdependencies)

const mergeNamespaces = xmlManager.mergeNamespaces(zdependencies);
console.log({ mergeNamespaces });


// const sourcClosingTagPosition = sourceParser.getClosingTagPosition("zdependencies")
// const destinationClosingTagPosition = destinationParser.getClosingTagPosition("mvc:View > Page >content > VBox")
// console.log("sourcClosingTagPosition: ", sourcClosingTagPosition)
// console.log("destinationClosingTagPosition: ", destinationClosingTagPosition)

// setTagWithChilds(sourcetage, destinationClosingTagPosition,)

// const sourceParser = new XMLParser(sourceXML);
// const sourceTag = sourceParser.getTagByName("newTag");

// if (sourceTag) {
// const destinationParser = new XMLParser(destinationXML);
// const modifier = new XMLModifier(destinationParser.parsedTags.map(tag => tag.name),destinationXML);

// // Ensure dependencies
// modifier.ensureDependencies(["xmlns:tnt=\"sap.tnt\""]);

// // Insert the selected tag into the destination XML
// modifier.insertTag(sourceTag, "targetTag");

// console.log("Updated Destination XML:");
// console.log(modifier.xml);
// }

module.exports = { XMLModifier };