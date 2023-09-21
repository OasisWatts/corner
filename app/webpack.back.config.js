const path = require("path")
const NodeExternals = require("webpack-node-externals")

const config = {
      node: {
            __filename: false,
            __dirname: false,
      },
      module: {
            rules: [
                  {
                        test: /\.tsx?$/,
                        use:
                        {
                              loader: 'babel-loader',
                              options: {
                                    presets: ['@babel/preset-react'],
                                    plugins: [
                                          [
                                                "@babel/plugin-proposal-decorators",
                                                {
                                                      "legacy": true
                                                }
                                          ]
                                    ]
                              },
                        },
                        exclude: /node_modules\/(?!()\/).*/,
                  },
            ],
      },
      resolve: {
            extensions: [".ts", ".tsx", ".js", "..."],
            alias: {
                  back: path.resolve(__dirname, "src/back"),
                  front: path.resolve(__dirname, "src/front"),
                  common: path.resolve(__dirname, "src/common"),
                  reactNative: path.resolve(__dirname, "node_modules/react-native-web")// [IMPORTANT] 모든 react-native import를 react-native-web으로 바꿈
            },
      },
      target: "node",
      externals: [NodeExternals()]
}
config.resolve.alias["react-native"] = path.resolve(__dirname, "node_modules/react-native-web")
const configMain = {
      name: "main",
      entry:
            // {
            // index: [
            //       "@babel/polyfill",
            path.resolve(__dirname, "src/back/main.ts")
      // ]
      // }
      ,
      output: {
            path: path.join(__dirname, "build"),
            filename: "main.js",
      },
      ...config,
}
const configProcess = {
      name: "web",
      entry: path.resolve(__dirname, "src/back/process.ts"),
      output: {
            path: path.join(__dirname, "build"),
            filename: "process.js",
      },
      ...config,
}
module.exports = [
      configMain, configProcess
]
