import { useEffect, useRef } from "react";

import { hideBootLoader } from "@/app/providers/boot-loader/bootLoader";
import { useAuth } from "@/features/auth/auth.store";
import { useObjects } from "@/features/objects/objects.store";

const BootLoaderOnReady = (): null => {
  const hasHiddenRef = useRef(false); // если loader уже скрывали, второй раз не пытаться;
  const isAuthChecked = useAuth((state) => state.isAuthChecked);
  const isObjectsReady = useObjects((state) => state.isObjectsReady);
  const pathname = window.location.pathname;

  useEffect(() => {
    if (
      (hasHiddenRef.current || !isAuthChecked || !isObjectsReady) &&
      !pathname.startsWith("/admin")
    )
      return;

    hasHiddenRef.current = true;
    hideBootLoader();
  }, [isAuthChecked, isObjectsReady, pathname]);

  return null;
};

// boot loader существует в index.html до старта приложения
// один раз скрывается и удаляетсяж

export default BootLoaderOnReady;
