class XMLi18nTranslator {
    constructor(xmlString, pageName = '', attributes = ["title", "text", 'tooltip', "label", "placeholder"]) {
        this.attributes = attributes;
        this.xmlString = xmlString;
        this.pageName = pageName;
        this.foundAttributes = [];

        // Find and replace attributes in the XMLa
        this.replaceAttributesWithI18n();
        this.generateI18nProperties();
    }

    // Method to replace attributes with i18n bindings in the XML string
    replaceAttributesWithI18n() {
        this.attributes.forEach(attr => {
            const regex = new RegExp(`${attr}="([^"]*)"`, 'g'); // Matches attributes in the format attr="value"
            let match;
            while ((match = regex.exec(this.xmlString)) !== null) {
                const value = match[1]; // The value of the matched attribute

                // Skip the attribute if it already contains i18n binding
                if (value.includes('{i18n>') || value.includes('{')) {
                    continue;
                }

                const i18nBinding = this.createI18nBinding(value); // Create the i18n binding for the value

                // Store the i18n binding in the found attributes
                this.foundAttributes.push({
                    word: attr,
                    value: value,
                    i18nBinding: i18nBinding
                });

                // Replace the original value with the i18n binding in the XML string
                this.xmlString = this.xmlString.replace(match[0], `${attr}="${i18nBinding}"`);
            }
        });

        return this.xmlString;
    }

    // Method to create i18n binding string
    createI18nBinding(value) {
        const sanitizeI18nName = (name) => {
            return name
                .toLowerCase()                          // Convert to lowercase
                .replace(/[^a-z0-9_]/g, '_')            // Replace non-alphanumeric characters with underscores
                .replace(/_{2,}/g, '_')                 // Replace multiple underscores with a single underscore
                .replace(/^_|_$/g, '')                  // Remove leading or trailing underscores
                .slice(0, 20);                          // Limit the result to 20 characters
        };

        // Use the sanitized and limited value for the binding key
        const sanitizedValue = sanitizeI18nName(value);

        return `{i18n>${this.pageName.toLowerCase()}_${sanitizedValue}}`;
    }


    generateI18nProperties() {
        this.generateI18nPropertiesX = this.foundAttributes.map(attr => {
            const sanitizedName = attr.i18nBinding.replace(/{i18n>|}/g, '');
            return `${sanitizedName}=${attr.value}`;
        }).join('\n');
    }

    // Method to display the final result
    displayResults() {
        console.log("Found Attributes:", this.foundAttributes);
        console.log("Updated XML String:\n", this.xmlString);
        console.log("\n# The i18n Properties Content:\n", this.generateI18nPropertiesX);
    }
}

// Example usage:



// Instantiate the XMLi18nTranslator class
// const translator = new XMLi18nTranslator(xmlString, 'Home');


// // Display the results and the generated i18n properties file content
// translator.displayResults();

// Export the class
module.exports = XMLi18nTranslator;


