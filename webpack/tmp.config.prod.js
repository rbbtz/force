// @ts-check

const path = require("path")
const webpack = require("webpack")
const LoadablePlugin = require("@loadable/webpack-plugin")
const { RetryChunkLoadPlugin } = require("webpack-retry-chunk-load-plugin")
const WebpackManifestPlugin = require("webpack-manifest-plugin")
const { HashedModuleIdsPlugin } = require("webpack")
const TerserPlugin = require("terser-webpack-plugin")
const { getEntrypoints } = require("./utils/getEntrypoints")
const { basePath } = require("./utils/env")
const { getCSSManifest } = require("./utils/getCSSManifest")
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer")

const clientCommonConfig = {
  parallelism: 1,
  mode: "none",
  performance: {
    hints: "warning",
  },
  devtool: "source-map",
  cache: false,
  stats: "normal", // or, `errors-only`
  entry: getEntrypoints(),
  output: {
    filename: "[name].22820.[contenthash].js",
    path: path.resolve(basePath, "public/assets"),
    publicPath: "/assets/",
    pathinfo: false,
  },
  module: {
    rules: [
      {
        test: /\.coffee$/,
        include: path.resolve(basePath, "src"),
        exclude: /(node_modules)/,
        use: ["coffee-loader"],
      },
      {
        test: /\.(jade|pug)$/,
        include: path.resolve(basePath, "src"),
        use: [
          {
            loader: "pug-loader",
            options: {
              doctype: "html",
              root: __dirname,
            },
          },
        ],
      },
      {
        test: /(\.(js|ts)x?$)/,
        include: path.resolve(basePath, "src"),
        exclude: /(node_modules)/,
        use: [
          {
            loader: "babel-loader",
          },
        ],
      },
      // ESM support. See: https://github.com/apollographql/react-apollo/issues/1737#issuecomment-371178602
      {
        type: "javascript/auto",
        test: /\.mjs$/,
        use: [],
      },
    ],
  },
  plugins: [
    new BundleAnalyzerPlugin(),
    new webpack.DefinePlugin({
      "process.env": { NODE_ENV: JSON.stringify("production") },
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production"),
    }),
    // Remove moment.js localization files
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    // Remove server-only modules from client bundles
    // Remove server side of relay network layer.
    new webpack.IgnorePlugin(/^react-relay-network-modern-ssr\/node8\/server/),
    // No matter what, we don't want the graphql-js package in client
    // bundles. This /may/ lead to a broken build when e.g. a reaction
    // module that's used on the client side imports something from
    // graphql-js, but that's better than silently including this.
    new webpack.IgnorePlugin(/^graphql(\/.*)?$/),
    new webpack.NamedModulesPlugin(),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery",
      jade: "jade/runtime.js",
      waypoints: "jquery-waypoints/waypoints.js",
    }),
    new LoadablePlugin(),

    /**
     * If something goes wrong while loading a dynmic split chunk (import())
     * retry the fetch once per second up to `maxRetries`.
     *
     * NOTE: Since this plugin patches the native loading mechanism from webpack
     * we (may) need to revist once we upgrade to Webpack 5.
     */
    new RetryChunkLoadPlugin({
      maxRetries: 5,
      cacheBust: `function() {
        return "cache-bust=" + Date.now();
      }`,
    }),
    new HashedModuleIdsPlugin(),
    new WebpackManifestPlugin({
      fileName: path.resolve(basePath, "manifest.json"),
      basePath: "/assets/",
      seed: getCSSManifest(),
    }),
    // new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
  resolve: {
    alias: {
      "jquery.ui.widget": "blueimp-file-upload/js/vendor/jquery.ui.widget.js",

      // The following packages need to be resolved to the host app (force) to get
      // around issues involving `yarn link` and multiple instances. A  similar
      // configuration has been setup for SSR in `src/index`, via `require-control`.
      "styled-components": require.resolve("styled-components"),
      react: require.resolve("react"),
    },
    extensions: [
      ".mjs",
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".json",
      ".jade",
      ".coffee",
    ],
    // Symlink issues should be fixed via `yarn --pnp`
    modules: [path.resolve(basePath, "src"), "node_modules"],
    symlinks: false,
  },
  optimization: {
    namedModules: false,
    namedChunks: false,
    nodeEnv: "production",
    flagIncludedChunks: true,
    occurrenceOrder: true,
    concatenateModules: false,
    // Extract webpack runtime code into it's own file
    runtimeChunk: {
      name: "runtime-manifest",
    },
    noEmitOnErrors: true,
    checkWasmTypes: true,
    minimize: true,
    splitChunks: {
      hidePathInfo: true,
      minSize: 30000,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      cacheGroups: {
        // Separate vendor libraries from `node_modules` into a `commons.js`
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "common",
          minChunks: 10,
          chunks: "initial",
        },
      },
    },
    minimizer: [
      new TerserPlugin({
        cache: false,
        parallel: false,
        sourceMap: true, // Must be set to true if using source-maps in production
      }),
    ],
  },
  externals: {
    // Don't bundle modules and consider them external
    redis: "redis",
    request: "request",
  },
  infrastructureLogging: {
    level: "verbose",
    debug: [/.*/],
  },
}

module.exports = clientCommonConfig
