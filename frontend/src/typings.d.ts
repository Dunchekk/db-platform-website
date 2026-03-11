declare module "*.module.css" {
  const classNames: Record<string, string>;
  export default classNames;
}

declare module "*.png";
declare module "*.jpeg";
declare module "*.jpg";
declare module "*.gif";
declare module "*.svg" {
  import React from "react";
  const SVG: React.FC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}

declare const __PLATFORM__: "desktop" | "mobile";
