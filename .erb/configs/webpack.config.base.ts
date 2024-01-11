/**
 * Base webpack config used across other specific configs
 */

import webpack from 'webpack';
import path from 'path';
import webpackPaths from './webpack.paths';
import { dependencies as externals } from '../../release/app/package.json';

const configuration: webpack.Configuration = {
  externals: [...Object.keys(externals || {})],

  stats: 'errors-only',

  module: {
    rules: [
      {
        test: /\.worker\.ts$/, // ts结尾,这也很重要
        use: {
          loader: 'worker-loader',
          options: {
            chunkFilename: '[name]:[hash:8].js', // 打包后chunk的名称
            // inline: true, // 开启内联模式,免得爆缺少标签或者跨域的错误
          },
        },
      },
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        // include: path.resolve(
        //   __dirname,
        //   'node_modules/@starnote/*publish-github'
        // ),
        // include: path.resolve(__dirname, 'node_modules/quill-react-commercial'),
        use: {
          loader: 'ts-loader',
          options: {
            // Remove this line to enable type checking in webpack builds
            transpileOnly: true,
          },
        },
      },
    ],
  },

  output: {
    path: webpackPaths.srcPath,
    // https://github.com/webpack/webpack/issues/1114
    library: {
      type: 'commonjs2',
    },
    globalObject: 'this',
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [webpackPaths.srcPath, 'node_modules'],
    alias: {
      '@': webpackPaths.srcRendererPath,
    },
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),
  ],
};

export default configuration;
