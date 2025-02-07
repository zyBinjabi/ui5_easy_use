const path = require('path');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { getContentPaths } = require('./webpack_helper.js');

// Define the `myPackageDir` pointing to your `mypackage` folder
const myPackageDir = path.resolve(__dirname, 'mypackage');

// Generate the dynamic patterns
const contentFolders = getContentPaths(myPackageDir);
console.log("contentFolders: ", contentFolders)

const patterns = contentFolders.map(folder => ({
    from: folder.path,
    to: `${folder.name}/content`,
    noErrorOnMissing: true,
}));

module.exports = {
    // Entry point for your application
    entry: './mypackage/main.js',

    // Output configuration
    output: {
        filename: 'bundle.js', // Name of the output file
        path: path.resolve(__dirname, 'dist'), // Directory for the output
        libraryTarget: 'commonjs2', // Ensures compatibility with Node.js
    },

    // Optimization settings
    optimization: {
        minimize: false, // Disable minification for easier debugging
    },

    // Mode configuration (set to 'production' for optimized builds)
    mode: 'production',

    // Target environment
    target: 'node', // Indicates the build is for a Node.js environment

    // Plugins configuration
    plugins: [
        // Copy static files to the output directory
        new CopyWebpackPlugin({
            patterns: patterns,
        }),
    ],
};
