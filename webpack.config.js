'use strict';

/**
* Webpack Configuration File
*
* This is a configuration file for Webpack module bundler. You should customize
* it to fit your project.
*
* To start the development server run:
*
*   webpack-dev-server --hot --progress --colors --inline
*
* To precompile assets for production run:
*
*   NODE_ENV=production webpack -p
*
* @link https://gist.github.com/xpepermint/bf25cc695571a73f4ec0
*/

/**
* Module dependencies.
*/

var webpack = require('webpack');
var path = require('path');
var argv = require('minimist')(process.argv.slice(2));

var BowerWebpackPlugin = require('bower-webpack-plugin');
var CompressionPlugin = require('compression-webpack-plugin');
var I18nPlugin = require('i18n-webpack-plugin');
var HashPlugin = require('hash-webpack-plugin');

/**
* Configuration section.
*/

var settings = {
  // Development environment indicator.
  isDevelopment: process.env.NODE_ENV !== 'production',
  // Assets source path.
  srcPath: path.join(__dirname, 'client'),
  // Assets build path.
  buildPath: path.join(__dirname, 'build'),
  // Assets server public address.
  publicPath: 'http://' + (argv.host || 'localhost') + ':' + (argv.port || 8080) + '/',
  // I18n plugin translation root path.
  localeRootPath: path.join(__dirname, 'locales'),
  // List of available locales. Leave the list empty if none. Make sure that
  // I18n files exist before running this script.
  locales: ['en']
};

function buildConfig(options) {

  var outputPath = options.locale
    ? path.join(options.buildPath, options.locale)
    : options.buildPath;

  var outputFileName = options.isDevelopment
    ? '[name].js'
    : '[name].[hash].js';
  outputFileName = options.locale
    ? options.locale + '.' + outputFileName
    : outputFileName;

  return {

    // Capture timing information for each module.
    profile: options.isDevelopment,

    // Switch loaders to debug mode.
    debug: options.isDevelopment,

    // Assets source files.
    entry: {
      // The `index` will be our main bundle.
      index: [
        path.join(options.srcPath, 'index')
      ]
    },

    // Assets build destination.
    output: {
      path: outputPath,
      filename: outputFileName,
      publicPath: options.publicPath
    },

    // Content manipulation.
    module: {
      loaders: [
        // Transpiling ES6 javascript to ES5, enabling ReactJS hot reloading
        // for live JSX editing.
        { test: /\.js(x)?$/, loaders: ['react-hot', 'babel'], include: options.srcPath },
        // Adding support for CSS files.
        { test: /\.css$/, loaders: ['style', 'css'] },
        // Compiling Stylus stylesheets.
        { test: /\.styl$/, loaders: ['style', 'css', 'stylus'] },
        // Adding support for JSON files.
        { test: /\.json$/, loaders: ['json'] },
        // Adding support for Text files.
        { test: /\.txt$/, loaders: ['raw'] },
        // Adding support for fonts.
        { test: /\.woff|\.woff2$/, loaders: ['url?limit=10000'] },
        { test: /\.ttf|\.eot$/, loaders: ['file'] },
        // Adding support for images.
        { test: /\.(png|jpg)$/, loaders: ['url?limit=10000'] }
      ]
    },

    // Additional functions.
    plugins: [
      // Preventing emitting phase in case of an error (recommended for hot-reload).
      options.isDevelopment
        ? new webpack.NoErrorsPlugin()
        : null,
      // Adding code minification.
      options.isDevelopment
        ? null
        : new webpack.optimize.UglifyJsPlugin(),
      // Creating additional gzipped file for each bundle.
      options.isDevelopment
        ? null
        : new CompressionPlugin(),
      // Removing duplicated code.
      options.isDevelopment
        ? null
        : new webpack.optimize.DedupePlugin(),
      // Creating a hash file holding the assets fingerprint.
      options.isDevelopment
        ? null
        : new HashPlugin({ path: outputPath }),
      // Enabling access to bower components.
      new BowerWebpackPlugin(),
      // Enabling I18n translations.
      options.locale
        ? new I18nPlugin(require(path.join(options.localeRootPath, options.locale + '.json')))
        : null
    ].filter(Boolean),

    // Resolving paths.
    resolve: {
      // Search paths.
      root: [options.srcPath],
      // Defining extensions that can be required without extension (e.g. `require(name)`).
      extensions: ['', '.js', '.jsx']
    },

    // Loading external libraries.
    externals: {}
  };
};

/**
* Public Interface.
*/

module.exports = (function(options) {

  // Bulding configuration without support for I18n.
  if (options.locales.length === 0) {
    options.locale = null;
    return buildConfig(options);
  }

  // Bulding an array of localized configurations.
  return settings.locales.map(function(locale) {
    options.locale = locale;
    return buildConfig(options);
  });

})(settings);
