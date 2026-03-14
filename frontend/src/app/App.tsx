import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router";

import { LayersStack } from "@/features/layer-switching/LayersStack";
import { getLayersByPath } from "@/features/layer-switching/getLayersByPath";
import { getPathByState } from "@/features/layer-switching/getPathByState";
import { useLayersStore } from "@/features/layer-switching/layers.store";
import Q_Circle from "@/components/Q_Circle/Q_Circle";
import Q_Cursor from "@/components/Q_Cursor/Q_Cursor";
import cls from "@/app/App.module.css";

export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const params = useParams();

  const setRouteState = useLayersStore((state) => state.setRouteState);
  const openedLayers = useLayersStore((state) => state.openedLayers);
  const activeObjectId = useLayersStore((state) => state.activeObjectId);

  const hasHydratedFromRouteRef = useRef(false);

  useLayoutEffect(() => {
    const routeObjectId = typeof params.id === "string" ? params.id : null;

    const prevActiveObjectId = useLayersStore.getState().activeObjectId;

    setRouteState({
      openedLayers: getLayersByPath(pathname),
      activeObjectId: routeObjectId ?? prevActiveObjectId,
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

  return (
    <div className={cls.wrapper}>
      <LayersStack />
      <Q_Circle />
      <Q_Cursor />
    </div>
  );
}
