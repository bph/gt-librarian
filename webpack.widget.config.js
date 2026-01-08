const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/widget/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'chat-widget.js',
    path: path.resolve(__dirname, 'build/widget'),
  },
  externals: {
    // Don't bundle large dependencies that are already loaded
  },
};
