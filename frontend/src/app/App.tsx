import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";

import { LayersStack } from "@/features/layer-switching/LayersStack";
import { getLayersByPath } from "@/features/layer-switching/getLayersByPath";
import { getPathByState } from "@/features/layer-switching/getPathByState";
import { useLayersStore } from "@/features/layer-switching/layers.store";
import Q_Circle from "@/components/Q_Circle/Q_Circle";
import Q_Cursor from "@/components/Q_Cursor/Q_Cursor";
import cls from "@/app/App.module.css";
import { isInfoSectionId, type InfoSectionId } from "@/shared/types/info.types";
import Q_CardButton from "@/components/Q_CardButton/Q_CardButton";
import { check } from "@/shared/api/auth";
import { useAuth } from "@/features/auth/auth.store";
import Q_Loader from "@/components/Q_Loader/Q_Loader";
import { getItems } from "@/shared/api/objects";
import { useObjects } from "@/features/objects/objects.store";

export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const params = useParams<{ id?: string; section?: string }>();

  const setRouteState = useLayersStore((state) => state.setRouteState);
  const openedLayers = useLayersStore((state) => state.openedLayers);
  const activeObjectId = useLayersStore((state) => state.activeObjectId);

  const hasHydratedFromRouteRef = useRef(false);

  useLayoutEffect(() => {
    const routeObjectId = typeof params.id === "string" ? params.id : null;
    const routeInfoSectionRaw =
      typeof params.section === "string" ? params.section : null;
    const routeInfoSection: InfoSectionId | null =
      routeInfoSectionRaw && isInfoSectionId(routeInfoSectionRaw)
        ? routeInfoSectionRaw
        : null;

    const prevActiveObjectId = useLayersStore.getState().activeObjectId;

    setRouteState({
      openedLayers: getLayersByPath(pathname),
      activeObjectId: routeObjectId ?? prevActiveObjectId,
      activeInfoSection: routeInfoSection,
    });

    hasHydratedFromRouteRef.current = true;
  }, [pathname, params.id, params.section, setRouteState]);

  const [loading, setLoading] = useState<boolean>(false);
  const setIsAuth = useAuth((state) => state.setIsAuth);
  const setObjects = useObjects((state) => state.setObjects);

  useEffect(() => {
    check()
      .then(() => {
        setIsAuth(true);
      })
      .finally(() => {
        setLoading(false);
      });
  });

  useEffect(() => {
    getItems()
      .then((data) => {
        setObjects(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [setObjects]);

  useEffect(() => {
    if (!hasHydratedFromRouteRef.current) return;

    const state = useLayersStore.getState();
    const nextPath = getPathByState({
      openedLayers: state.openedLayers,
      activeObjectId: state.activeObjectId,
      activeInfoSection: state.activeInfoSection,
    });

    if (nextPath !== pathname) {
      navigate(nextPath);
    }
  }, [openedLayers, activeObjectId, pathname, navigate]);

  return (
    <div className={cls.wrapper}>
      <LayersStack />
      <Q_Circle />
      {openedLayers.includes("objects") && <Q_CardButton />}
      <Q_Cursor />
      {loading ? <Q_Loader /> : null}
    </div>
  );
}
