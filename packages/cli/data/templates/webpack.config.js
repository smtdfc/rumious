const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

/** @type {import('webpack').Configuration} */
module.exports = {
  entry: './src/index.tsx',
  
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './public/dist'),
    clean: true
  },
  
  mode: isProduction ? 'production' : 'development',
  
  devtool: isProduction ? false : 'source-map',
  
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {}
  },
  
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
        {
          loader: 'rumious-webpack-supporter/dist/loader/index.js'
        },
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        }]
      },
      
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: [
        {
          loader: 'rumious-webpack-supporter/dist/loader/index.js'
        }]
      },
      
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      }
    ]
  },
  
  plugins: [],
  
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  }
};