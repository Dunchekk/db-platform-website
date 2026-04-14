import type { OverlayLayerId } from "@/shared/types/layers.types";

export function getLayersByPath(pathname: string): OverlayLayerId[] {
  if (pathname === "/about") {
    return ["about"];
  }

  if (pathname === "/") {
    return ["about", "objects"];
  }

  if (pathname === "/checkout") {
    return ["about", "objects", "checkout"];
  }

  if (pathname === "/info") {
    return ["about", "objects", "info"];
  }

  if (/^\/info\/[^/]+$/.test(pathname)) {
    return ["about", "objects", "info"];
  }

  if (/^\/object\/[^/]+$/.test(pathname)) {
    return ["about", "objects", "details"];
  }

  if (/^\/object\/[^/]+\/checkout$/.test(pathname)) {
    return ["about", "objects", "details", "checkout"];
  }

  return ["about", "objects"];
}
