// webpack.config.js
const path = require('path');
const JavaScriptObfuscator = require('webpack-obfuscator');

module.exports = {
    entry: './app/main.js', // Entry point for your application
    output: {
        filename: 'bundle.js', // Output bundled file name
        path: path.resolve(__dirname, 'dist'), // Output directory
    },
    mode: 'production', // Set to 'production' for minification and optimization
    target: 'node', // For Node.js environment
    plugins: [
        new JavaScriptObfuscator({
            rotateStringArray: true, // Adds extra obfuscation
        }, [])
    ],
};
