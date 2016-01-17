/* eslint-env node */
var webpack = require("webpack");
var path = require("path");
var DEBUG_BUILD = false;

module.exports = {
  entry: "./js/index.js",
  output: {
    path: path.join(__dirname, "public"),
    filename: "bundle.js"
  },
  module: {
    loaders: [
      { test: /\.js$/,
        exclude: [/node_modules\/.*/],
        loader: "babel",
        "query": {
          "presets": ["react", "es2015-loose"]
        },
      },
      {
        test: /\.less$/,
        loader: "style?singleton!css!autoprefixer!less"
      },
      {
        test: /\.(otf|ttf)$/,
        loader: "url-loader?limit=4096"
      },
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      // React in particular uses `process.env.NODE_ENV !==
      // "production"` to define development code
      "process.env": {
        NODE_ENV: JSON.stringify(DEBUG_BUILD ? "development" : "production")
      },

      "__DEV__": DEBUG_BUILD,
    })
  ],
};
