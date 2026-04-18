import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin, { Configuration } from "mini-css-extract-plugin";
import { BuildOptions } from "./types/types";
// import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import { DefinePlugin } from "webpack";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import ReactRefrashWebpackPluguin from "@pmmmwh/react-refresh-webpack-plugin";
import path from "path";

export function buildPlugins(params: BuildOptions): Configuration["plugins"] {
  const isDev = params.mode === "development";
  const isProd = params.mode === "production";

  const plugins: Configuration["plugins"] = [
    new HtmlWebpackPlugin({
      template: params.paths.html,
      favicon: path.resolve(params.paths.public, "favicon.svg"),
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(params.paths.public, "404.html"),
      filename: "404.html",
      inject: false,
    }),
    new DefinePlugin({
      __PLATFORM__: JSON.stringify(params.platform),
      __API_URL__: JSON.stringify(
        process.env.BACK_API_URL ?? "http://localhost:5000"
      ),
    }), // подменяет глобальные переменные на значения которые мы задаем при сборке
  ];

  if (isProd) {
    plugins.push(
      new MiniCssExtractPlugin({
        filename: "css/[name].[contenthash:8].css",
        chunkFilename: "css/[name].[contenthash:8].css",
      })
    );
  }

  if (isDev) {
    plugins.push(
      new ForkTsCheckerWebpackPlugin(), // выносим проверку типов в отдельный процесс
      new ReactRefrashWebpackPluguin()
    );
  }

  if (params.analyzer) {
    // plugins.push(new BundleAnalyzerPlugin());
  }

  return plugins;
}
