import { ModuleOptions } from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import ReactRefreshTypeScript from "react-refresh-typescript";
import { BuildOptions } from "./types/types";

export function buildLoaders(options: BuildOptions): ModuleOptions["rules"] {
  const isDev = options.mode === "development";

  const styleOrExtract = isDev ? "style-loader" : MiniCssExtractPlugin.loader;

  const accetLoader = {
    test: /\.(png|jpg|jpeg|gif)$/i,
    type: "asset/resource",
  };

  const svgAssetLoader = {
    test: /\.svg$/i,
    issuer: /\.css$/i,
    type: "asset/resource",
  };

  const svgrLoader = {
    test: /\.svg$/i,
    issuer: /\.[jt]sx?$/,
    use: [{ loader: "@svgr/webpack", options: { icon: true } }],
  };

  const cssModuleLoader = {
    test: /\.module\.css$/i,
    use: [
      styleOrExtract,
      {
        loader: "css-loader",
        options: {
          modules: {
            localIdentName: isDev ? "[path][name]__[local]" : "[hash:base64:8]",
            namedExport: false,
          },
        },
      },
    ],
  };

  const cssLoader = {
    test: /\.css$/i,
    exclude: /\.module\.css$/i,
    use: [styleOrExtract, "css-loader"],
  };

  const tsLoader = {
    exclude: /node_modules/,
    test: /\.tsx?$/,
    use: [
      {
        loader: "ts-loader",
        options: {
          transpileOnly: true,
          getCustomTransformers: () => ({
            before: [isDev && ReactRefreshTypeScript()].filter(Boolean),
          }),
        },
      },
    ],
  };

  return [
    accetLoader,
    svgAssetLoader,
    cssModuleLoader,
    cssLoader,
    tsLoader,
    svgrLoader,
  ];
}
