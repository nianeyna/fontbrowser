//// not working with vs code debug
//import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';

// // eslint-disable-next-line @typescript-eslint/no-var-requires
// const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

export const plugins: NodePolyfillPlugin[] = [
  // new ForkTsCheckerWebpackPlugin({
  //   logger: 'webpack-infrastructure',
  // }),
  new NodePolyfillPlugin()
];
