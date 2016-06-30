var webpack = require('webpack');
var plugins = [];
if (process.env.NODE_ENV !== 'local-lib-test') {
  plugins.push(
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
  );
}
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
          presets: ['es2015', 'stage-2'],
          plugins: ['typecheck', 'syntax-flow', 'transform-flow-strip-types']
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
  plugins
}
