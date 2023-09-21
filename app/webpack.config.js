const path = require('path')
const CompressionPlugin = require("compression-webpack-plugin");
const BrotliPlugin = require('brotli-webpack-plugin');

const config = {
      resolve: {
            extensions: [".ts", ".tsx", ".js"],
            alias: {
                  back: path.resolve(__dirname, "src/back"),
                  front: path.resolve(__dirname, "src/front"),
                  common: path.resolve(__dirname, "src/common"),
                  reactNative: path.resolve(__dirname, "node_modules/react-native-web"), // [IMPORTANT] 모든 react-native import를 react-native-web으로 바꿈
            },
      },
      module: {
            rules: [
                  {
                        test: /\.tsx?$/,
                        exclude: /node_modules\/(?!()\/).*/,
                        use: {
                              loader: 'babel-loader',
                              options: {
                                    presets: ['@babel/preset-react'],
                              },
                        },
                  },
            ],
      },
      plugins: [
            new CompressionPlugin(),
            new BrotliPlugin()
      ],
      // plugins: [HTMLWebpackPluginConfig],
      devServer: {
            open: true,
            historyApiFallback: true,
            contentBase: './',
            hot: true,
      },
      // devtool: (env.production ? false : 'inline-source-map')
}
// config.resolve.alias["@"] = path.resolve(__dirname, "node_modules/react-native-web")
module.exports = config
