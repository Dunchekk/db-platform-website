import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router";

import { LayersStack } from "@/features/layer-switching/LayersStack";
import { getLayersByPath } from "@/features/layer-switching/getLayersByPath";
import { getPathByState } from "@/features/layer-switching/getPathByState";
import { useLayersStore } from "@/features/layer-switching/layers.store";

export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const params = useParams();

  const setRouteState = useLayersStore((state) => state.setRouteState);
  const openedLayers = useLayersStore((state) => state.openedLayers);
  const activeObjectId = useLayersStore((state) => state.activeObjectId);

  const hasHydratedFromRouteRef = useRef(false);

  useLayoutEffect(() => {
    const routeObjectId =
      typeof params.id === "string" ? params.id : null;

    setRouteState({
      openedLayers: getLayersByPath(pathname),
      activeObjectId: routeObjectId,
    });

    hasHydratedFromRouteRef.current = true;
  }, [pathname, params.id, setRouteState]);

  useEffect(() => {
    if (!hasHydratedFromRouteRef.current) return;

    const state = useLayersStore.getState();
    const nextPath = getPathByState({
      openedLayers: state.openedLayers,
      activeObjectId: state.activeObjectId,
    });

    if (nextPath !== pathname) {
      navigate(nextPath);
    }
  }, [openedLayers, activeObjectId, pathname, navigate]);

  return <LayersStack />;
}
