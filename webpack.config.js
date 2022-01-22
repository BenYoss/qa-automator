const path = require('path');

// absolute path of file tree.
const abs = path.resolve(__dirname, 'client');

module.exports = {
  entry: ['regenerator-runtime/runtime.js', path.join(abs, '/src/Index.jsx')],
  output: {
    filename: 'bundle.js',
    path: path.join(abs, '/dist'),
  },
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react'],
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|gif|wav|mp3|eot|ttf|woff|woff2)$/,
        exclude: /node_modules/,
        use: [
          'file-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
