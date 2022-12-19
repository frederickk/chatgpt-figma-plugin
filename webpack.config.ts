import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import HtmlWebpackInlineSourcePlugin from 'html-webpack-inline-source-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import {fileURLToPath} from 'url';
import type {Configuration} from 'webpack';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const mode = (process.env.NODE_ENV === 'production')
  ? 'production'
  : 'development';

const config: Configuration = {
  mode,
  entry: {
    code: path.join(__dirname, 'src/plugin/code'),
    ui: [
      path.join(__dirname, 'src/ui/ui'),
      path.join(__dirname, 'src/ui/ui.scss'),
    ],
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
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/ui/ui.njk'),
      filename: 'ui.html',
      chunks: ['ui'],
      inlineSource: '.(js|css)$',
      inject: 'body',
    }),
    // @ts-ignore
    new HtmlWebpackInlineSourcePlugin(HtmlWebpackPlugin),
    new MiniCssExtractPlugin({
      filename: '[name].min.css',
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
      new CssMinimizerPlugin(),
    ],
  },
  output: {
    path: path.join(__dirname, 'build'),
    publicPath: path.join(__dirname, 'build'),
    filename: '[name].js',
  },
  target: 'web',
};

export default config;
