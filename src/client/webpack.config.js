const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const outputPath = path.resolve(__dirname, '../../dist/client');

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: {
    main: path.resolve(__dirname, "./index.ts") ,
  },
  output: {
    path: outputPath,
    filename: "bundle.js" // <--- Will be compiled to this single file
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      { 
        test: /\.tsx?$/,
        loader: "ts-loader"
      }
    ]
  },
  plugins: [
    new CopyPlugin({
        patterns: [
            {from: path.resolve(__dirname, "./index.html"), to: outputPath} 
        ]
    }), 
  ]
};