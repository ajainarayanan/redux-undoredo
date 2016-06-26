var webpack = require('webpack');

module.exports = {
  context: __dirname + '/src',
  entry: {
    'redux-undoredo': './redux-undoredo.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'stage-2']
        }
      }
    ]
  },
  output: {
    filename: './[name].js',
    path: __dirname + '/dist',
    library: 'reduxUndoredo',
    libraryTarget: 'umd'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_console: false,
        dead_code: true
      },
      output: {
        comments: false
      }
    })
  ]
}
