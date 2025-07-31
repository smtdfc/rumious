const path = require('path');

const isProduction = process.env.NODE_ENV == "production";
module.exports = {
  entry: './src/index.tsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './public/dist'),
    clean: true
  },
  mode: isProduction ? "production" : "development",
  devtool: !isProduction && 'source-map',
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: path.join(__dirname, './node_modules/@rumious/webpack-loader/dist/index.js'),
            options: {
              configFile: './rumious.config.json'
            }
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          },
          
        ]
      },
      
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: [
        {
          loader: path.join(__dirname, './node_modules/@rumious/webpack-loader/dist/index.js'),
          options: {
            configFile: './rumious.config.json'
          }
        }]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      }
    ]
    
  },
  plugins: [],
  
};