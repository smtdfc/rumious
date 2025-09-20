const path = require('path');

const isProduction = process.env.NODE_ENV == 'production';
module.exports = {
  entry: './src/index.tsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './public/dist'),
    clean: true,
  },
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? false : 'source-map',
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
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
          {
            loader: path.join(
              __dirname,
              './node_modules/@rumious/webpack-loader/dist/index.js',
            ),
            options: {
              configFile: './rumious.config.json',
            },
          },
        ],
      },

      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: [
          {
            loader: path.join(
              __dirname,
              './node_modules/@rumious/webpack-loader/dist/index.js',
            ),
            options: {
              configFile: './rumious.config.json',
            },
          },
        ],
      },
      {
        test: /\.css$/i, // CSS
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [],
  cache: {
    type: 'filesystem',
  },
};
