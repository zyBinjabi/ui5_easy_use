// webpack.config.js
const path = require('path');
const JavaScriptObfuscator = require('webpack-obfuscator');

module.exports = {
    entry: './app/main.js', // Entry point for your application
    output: {
        filename: 'bundle.js', // The output bundled file name
        path: path.resolve(__dirname, 'dist'), // The output directory
    },
    mode: 'production', // Set to 'production' for minification and optimization
    target: 'node', // This ensures Webpack knows you're bundling for a Node.js environment
    module: {
        rules: [
            // If you have other file types (like JSON), you can add additional loaders here
        ],
    },
    plugins: [
        // Obfuscate the final bundle to make the code harder to understand
        new JavaScriptObfuscator({
            rotateStringArray: true, // Adds extra obfuscation (like string array manipulation)
        }, [])
    ],
};
