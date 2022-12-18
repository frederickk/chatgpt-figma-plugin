const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin =
  require('html-webpack-inline-source-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const webpack = require('webpack');

const baseConfig = require('./webpack.base.js');

const nodeConfig = {
  ...baseConfig,
  entry: {
    server: path.join(__dirname, 'src/server'),
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)?$/i,
        use: 'ts-loader',
        exclude: [/node_modules/],
      },
    ],
  },
  target: 'node',
};

const webConfig = {
  ...baseConfig,
  entry: {
    code: path.join(__dirname, 'src/code'),
    ui: [
      path.join(__dirname, 'src/ui'),
      path.join(__dirname, 'src/ui.scss'),
    ],
  },
  devServer: {
    compress: true,
    contentBase: path.join(__dirname, 'build'),
    hot: true,
    // open: true,
    open: ['ui.html'],
    port: 8080,
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)?$/i,
        use: 'ts-loader',
        exclude: [/node_modules/],
      },
      {
        test: /\.(sa|sc|c)ss$/i,
        use: [
          'extract-loader',
          'css-loader',
          'sass-loader'
        ],
        include: [],
      },
      {
        test: /\.(sa|sc|c)ss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        exclude: [],
      },
      {
        test: /\.(png|jpg|jpe?g|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf|svg)$/i,
        type: 'asset/inline',
      },
      {
        test: /\.njk$/,
        use: [{
          loader: 'simple-nunjucks-loader',
          options: {},
        }],
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/ui.njk'),
      filename: 'ui.html',
      chunks: ['ui'],
      inlineSource: '.(js|css)$',
      inject: 'body',
    }),
    new HtmlWebpackInlineSourcePlugin(HtmlWebpackPlugin),
    new MiniCssExtractPlugin({
      filename: '[name].min.css',
    }),
  ],
  target: 'web',
};

module.exports = [
  nodeConfig,
  webConfig,
];
