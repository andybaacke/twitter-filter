const packageJ = require('./package.json');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  cache: true,
  devtool: 'source-map',

  entry: {
    'ng4': [
      './src/main',
      'zone.js/dist/zone'
    ]
  },

  output: {
    filename: packageJ.name + '.[name].js',
    path: path.resolve('.tmp/app'),
    publicPath: '/'
  },

  resolve: {
    extensions: ['.js', '.ts'],
    modules: [
      path.resolve('./src'),
      'node_modules'
    ]
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: 'pre',
        loader: 'tslint-loader',
        options: {
          emitErrors: true,
          formatter: 'stylish',
          typeCheck: false
        }
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true
        }
      }
    ],

    noParse: [/zone\.js\/dist\/.+/]
  },

  plugins: [
    new webpack.ContextReplacementPlugin(
        /angular(\\|\/)core(\\|\/)@angular/,
        path.resolve(__dirname, '../src')
    )
  ]
};
