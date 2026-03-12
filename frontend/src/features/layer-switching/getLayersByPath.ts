import type { OverlayLayerId } from "@/shared/types/layers";

export function getLayersByPath(pathname: string): OverlayLayerId[] {
  if (pathname === "/") {
    return ["objects"];
  }

  if (pathname === "/checkout") {
    return ["objects", "checkout"];
  }

  if (pathname === "/info") {
    return ["objects", "info"];
  }

  if (/^\/object\/[^/]+$/.test(pathname)) {
    return ["objects", "details"];
  }

  if (/^\/object\/[^/]+\/checkout$/.test(pathname)) {
    return ["objects", "details", "checkout"];
  }

  return ["objects"];
}
