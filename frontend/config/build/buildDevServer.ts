import type { Configuration as DevServerConfiguration } from "webpack-dev-server";
import type { BuildOptions } from "./types/types";

export function buildDevServer(options: BuildOptions): DevServerConfiguration {
  return {
    port: options.port ?? 8080,
    open: true,
    historyApiFallback: true, // если раздавать статику в nginx, надо делать проксирование на index.html
    hot: true,
    static: {
      directory: options.paths.public,
    },
  };
}
