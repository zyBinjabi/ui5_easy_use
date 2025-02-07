const fs = require('fs');
const path = require('path');

/**
 * Function to loop through the `mypackage` folder and return paths with `content` folder.
 * @param {string} baseDir - The base directory to start searching.
 * @returns {Array} Array of paths to `content` folders inside `mypackage`.
 */
function getContentPaths(baseDir) {
    const result = [];

    function findContentFolders(currentDir) {
        // Read all items (files and directories) in the current directory
        const items = fs.readdirSync(currentDir, { withFileTypes: true });

        // Loop through each item
        items.forEach(item => {
            const itemPath = path.join(currentDir, item.name);

            if (item.isDirectory()) {
                const contentPath = path.join(itemPath, 'content');

                // Check if the `content` folder exists inside the current directory
                if (fs.existsSync(contentPath) && fs.statSync(contentPath).isDirectory()) {
                    result.push({
                        name: path.relative(baseDir, itemPath).replace(/\\/g, '/'),
                        path: contentPath,
                    });
                }

                // Recursively check subdirectories
                findContentFolders(itemPath);
            }
        });
    }

    // Start recursion from the base directory
    findContentFolders(baseDir);

    return result;
}


// Example usage
// const myPackageDir = path.resolve(__dirname, 'mypackage');
// const contentFolders = getContentPaths(myPackageDir);

// console.log('Content Folders:', contentFolders);

/**
 * Output example:
 * [
 *   { name: 'sharingFunctions', path: '/absolute/path/mypackage/sharingFunctions/content' },
 *   { name: 'pagemt', path: '/absolute/path/mypackage/pagemt/content' },
 *   { name: 'components', path: '/absolute/path/mypackage/components/content' }
 * ]
 */

module.exports = { getContentPaths };

